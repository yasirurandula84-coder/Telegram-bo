const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || "@wal_lokaya1"; // ස්වයංක්‍රීයව පෝස්ට් වැටෙන ප්‍රධාන චැනල් එක
const MONGO_URI = process.env.MONGO_URI;

// අනිවාර්යයෙන් join වී සිටිය යුතු චැනල් එක
const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL || "@wal_lokaya1"; 

// ඔබේ Adsterra Smart Link එක
const AD_LINK = process.env.AD_LINK || "https://www.profitableratecpmnetwork.com/g7p33na9?key=d6d0cdc4f9da3f0a448d3a891515c3ac"; 

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schema for Files
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgId: { type: Number, required: true },
    views: { type: Number, default: 0 }
});
const FileModel = mongoose.model('File', fileSchema);

// Mongoose Schema for Users (Limit සහ Share විස්තර සමඟ)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now },
    downloadsToday: { type: Number, default: 0 },
    lastDownloadDate: { type: String, default: "" },
    shareCount: { type: Number, default: 0 }, 
    currentLimit: { type: Number, default: 10 } // මුල් ලිමිට් එක වීඩියෝ 10යි
});
const UserModel = mongoose.model('User', userSchema);

// Express App setup for Render
const app = express();
app.use(express.urlencoded({ extended: true }));

// Mini App HTML Page Endpoint
app.get('/miniapp', (req, res) => {
    const token = req.query.token || '';
    
    res.send(`
        <!DOCTYPE html>
        <html lang="si">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Video Unlocker</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://telegram.org/js/telegram-web-app.js"></script>
        </head>
        <body class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h1 class="text-xl font-bold mb-2">🎬 වීඩියෝව සූදානම් වෙමින් පවතී</h1>
                <p class="text-slate-400 text-xs mb-6">කරුණාකර පහත දැක්වෙන දැන්වීම නරඹා තත්පර 5ක් රැඳී සිටින්න.</p>

                <div class="mb-4">
                    <a href="${AD_LINK}" target="_blank" id="ad-link-btn" onclick="startTimer()" class="inline-block w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm mb-3">
                        🔗 දැන්වීම විවෘත කරන්න (Click Here)
                    </a>
                </div>

                <div id="timer-box" class="my-4 hidden">
                    <div id="countdown" class="text-4xl font-extrabold text-sky-400 animate-pulse">5</div>
                    <p class="text-xs text-slate-500 mt-2">තත්පර කිහිපයක් රැඳී සිටින්න...</p>
                </div>

                <div id="success-box" class="hidden">
                    <p class="text-green-400 font-semibold mb-4 text-sm">✔ දැන්වීම නැරඹීම සාර්ථකයි!</p>
                    <button onclick="getVideo()" id="unlock-btn" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm">
                        🚀 වීඩියෝව ලබා ගන්න
                    </button>
                </div>
            </div>

            <script>
                let timerStarted = false;

                function startTimer() {
                    if (timerStarted) return;
                    timerStarted = true;

                    const adBtn = document.getElementById('ad-link-btn');
                    adBtn.innerText = "✅ දැන්වීම විවෘත විය";
                    adBtn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
                    adBtn.classList.add('bg-slate-800', 'text-slate-400');

                    const timerBox = document.getElementById('timer-box');
                    timerBox.classList.remove('hidden');

                    let timeLeft = 5;
                    const countdownEl = document.getElementById('countdown');
                    const successBox = document.getElementById('success-box');

                    const timer = setInterval(() => {
                        timeLeft--;
                        countdownEl.innerText = timeLeft;
                        if (timeLeft <= 0) {
                            clearInterval(timer);
                            timerBox.classList.add('hidden');
                            successBox.classList.remove('hidden');
                        }
                    }, 1000);
                }

                function getVideo() {
                    const botUsername = "${process.env.BOT_USERNAME || 'wallokaya_bot'}";
                    window.location.href = "https://t.me/" + botUsername + "?start=getvideo_" + "${token}";
                    
                    if (window.Telegram && window.Telegram.WebApp) {
                        setTimeout(() => {
                            window.Telegram.WebApp.close();
                        }, 400);
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Helper Function: යුසර් චැනල් එකට join වෙලාද කියලා චෙක් කිරීමට
async function checkUserSubscription(ctx, userId) {
    if (!REQUIRED_CHANNEL) return true;
    try {
        const chatMember = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, userId);
        const status = chatMember.status;
        if (status === 'creator' || status === 'administrator' || status === 'member') {
            return true;
        }
        return false;
    } catch (error) {
        console.error("F-Sub Check Error:", error);
        return true;
    }
}

// Helper Function: දිනකට අදාළ Limit එක රීසෙට් සහ චෙක් කිරීම
async function checkAndUpdateLimit(userIdStr) {
    const todayStr = new Date().toISOString().split('T')[0];
    let user = await UserModel.findOne({ userId: userIdStr });

    if (!user) {
        user = await UserModel.create({ userId: userIdStr, lastDownloadDate: todayStr, downloadsToday: 0, currentLimit: 10 });
    }

    // දවස වෙනස් වී ඇත්නම් ඩවුන්ලෝඩ් ගණන 0 කිරීම
    if (user.lastDownloadDate !== todayStr) {
        user.downloadsToday = 0;
        user.shareCount = 0;
        user.currentLimit = 10;
        user.lastDownloadDate = todayStr;
        await user.save();
    }

    return user;
}

// /start command & User Saving for Broadcast
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        await checkAndUpdateLimit(userIdStr);
    } catch (err) {
        console.error("User save error:", err);
    }

    if (!payload) {
        return ctx.reply("ආයුබෝවන්! මම File Store Bot එකයි. වීඩියෝ ලබා ගැනීමට නිවැරදි ලින්ක් එකක් භාවිතා කරන්න.");
    }

    // චැනල් එකට join වෙලාද බලනවා
    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.reply(
            `⚠️ **ඔබ තවමත් අපේ ප්‍රධාන චැනල් එක Join වී නැත!**\n\n` +
            `මෙම වීඩියෝව ලබා ගැනීමට නම් මුලින්ම අපේ චැනල් එකට Join වී සිටිය යුතුය.\n\n` +
            `👇 පහත බොත්තම ඔබා චැනල් එකට Join වී, පසුව **"🔄 Check Subscription"** ඔබන්න.`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📢 Join Channel", url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
                        [{ text: "🔄 Check Subscription", callback_data: `check_sub_${payload}` }]
                    ]
                }
            }
        );
    }

    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            
            // ඩේලි ලිමිට් එක පරීක්ෂා කිරීම
            let user = await checkAndUpdateLimit(userIdStr);

            if (user.downloadsToday >= user.currentLimit) {
                // ඉල්ලූ පරිදි 18+ ටෙක්ස්ට් එක සහ චැනල් ලින්ක් එක සමඟ ශෙයාර් මැසේජ් එක හැදීම
                let shareText = `🔥 ලෝකයේ වෙනත් කිසිම තැනක නැති සුපිරිම අලුත්ම 18+ වීඩියෝ එකතු වන අපේ චැනල් එකට දැන්ම එකතු වෙන්න! 👇\n\nhttps://t.me/wal_lokaya1`;
                let encodedText = encodeURIComponent(shareText);
                let nextGoal = user.currentLimit === 10 ? 2 : (user.currentLimit === 30 ? 4 : 0);

                if (nextGoal === 0) {
                    return ctx.reply(`❌ ඔබ අද දින ලබාගත හැකි උපරිම වීඩියෝ සීමාව (වීඩියෝ 50) බාගත කර අවසන්! කරුණාකර හෙට නැවත පැමිණෙන්න.`);
                }

                return ctx.reply(
                    `⚠️ **ඔබේ අද දින වීඩියෝ බාගත කිරීමේ සීමාව (Limit: ${user.currentLimit}) ඉක්මවා ඇත!**\n\n` +
                    `තවත් වීඩියෝ බාගත කර ගැනීමට නම්, පහත බොත්තම ඔබා මෙම පණිවිඩය වෙනත් Telegram ගෲප් **${nextGoal} කට** ශෙයාර් කරන්න (Forward කරන්න).\n\n` +
                    `📊 ශෙයාර් කළ පසු **"🔄 Check Share Status"** ඔබන්න.`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "📤 Share to Groups", url: `https://t.me/share/url?url=${encodedText}` }],
                                [{ text: "🔄 Check Share Status", callback_data: "check_share_status" }]
                            ]
                        }
                    }
                );
            }

            const fileDoc = await FileModel.findOneAndUpdate(
                { token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.reply("❌ සමාවන්න, මෙම ගොනුව හමුවී නැත හෝ කල් ඉකුත් වී ඇත.");
            }

            // ඩවුන්ලෝඩ් ගණන වැඩි කිරීම
            user.downloadsToday += 1;
            await user.save();

            // වීඩියෝව යැවීම
            const sentVideo = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgId);
            
            // විනාඩි 30කින් මැකෙන බවට දැනුම්දෙන පණිවිඩය
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝව **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `📊 අද ඔබ බාගත් ගණන: **${user.downloadsToday} /${user.currentLimit}**`,
                { parse_mode: 'Markdown' }
            );

            // විනාඩි 30 කට පසු මැකීමට සෙටප් කිරීම
            setTimeout(async () => {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, sentVideo.message_id);
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id);
                } catch (err) {
                    console.error("Auto delete error:", err);
                }
            }, 30 * 60 * 1000);

            return;
        }

        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        let user = await checkAndUpdateLimit(userIdStr);
        if (user.downloadsToday >= user.currentLimit) {
            let shareText = `🔥 ලෝකයේ වෙනත් කිසිම තැනක නැති සුපිරිම අලුත්ම 18+ වීඩියෝ එකතු වන අපේ චැනල් එකට දැන්ම එකතු වෙන්න! 👇\n\nhttps://t.me/wal_lokaya1`;
            let encodedText = encodeURIComponent(shareText);
            let nextGoal = user.currentLimit === 10 ? 2 : 4;

            return ctx.reply(
                `⚠️ **ඔබේ දිනපතා වීඩියෝ බාගත කිරීමේ සීමාව (Limit: ${user.currentLimit}) අවසන්!**\n\n` +
                `තවත් වීඩියෝ බාගැනීමට පහත බොත්තම ඔබා ගෲප් **${nextGoal} කට** ශෙයාර් කර ස්ටේටස් එක චෙක් කරන්න.`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📤 Share to Groups", url: `https://t.me/share/url?url=${encodedText}` }],
                            [{ text: "🔄 Check Share Status", callback_data: "check_share_status" }]
                        ]
                    }
                }
            );
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

      await ctx.editMessageText(
            `🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n` +
            `📊 මෙතෙක් නැරඹුම් වාර: ${fileDoc.views} ක්`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "▶️ Watch Ad & Get Video", web_app: { url: miniAppUrl } }],
                        [{ text: "❓ වීඩියෝව ලබා ගන්නේ කෙසේද? (Guide)", callback_data: "how_to_use" }]
                    ]
                }
            }
        );
    } catch (error) {
        console.error(error);
        ctx.reply("පද්ධතියේ දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

// --- CHECK SHARE STATUS ACTION ---
bot.action('check_share_status', async (ctx) => {
    const userIdStr = ctx.from.id.toString();
    let user = await UserModel.findOne({ userId: userIdStr });

    if (!user) {
        return ctx.answerCbQuery("❌ දත්ත හමුවී නැත.", { show_alert: true });
    }

    user.shareCount += 2; // ශෙයාර් බටන් එක ක්ලික් කර ආපසු පැමිණීම පරීක්ෂා කිරීම

    if (user.currentLimit === 10 && user.shareCount >= 2) {
        user.currentLimit = 30; 
        await user.save();
        return ctx.answerCbQuery("🎉 සුභ පැතුම්! දැන් ඔබට වීඩියෝ 30ක් දක්වා බාගත හැක.", { show_alert: true });
    } else if (user.currentLimit === 30 && user.shareCount >= 4) {
        user.currentLimit = 50; 
        await user.save();
        return ctx.answerCbQuery("🚀 සුභ පැතුම්! ඔබේ උපරිම සීමාව වීඩියෝ 50 දක්වා වැඩි විය!", { show_alert: true });
    } else {
        return ctx.answerCbQuery("⚠️ තවම අවශ්‍ය ප්‍රමාණයට ගෲප් වෙත ශෙයාර් කර නැත. කරුණාකර තවත් ගෲප් වෙත ශෙයාර් කර නැවත උත්සාහ කරන්න.", { show_alert: true });
    }
});

// --- ADMIN STATS COMMAND (/stats) ---
bot.command('stats', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.");
    }

    try {
        const totalUsers = await UserModel.countDocuments({});
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyUsers = await UserModel.countDocuments({
            joinedAt: { $gte: startOfMonth }
        });

        const totalFiles = await FileModel.countDocuments({});
        const files = await FileModel.find({});
        let totalViews = 0;
        files.forEach(file => {
            totalViews += file.views;
        });

        await ctx.reply(
            `📊 **බොට් හි සංඛ්‍යාලේඛන (Bot Statistics)**\n\n` +
            `👥 මුළු යුසර්ස්ලා (Total Users): **${totalUsers}**\n` +
            `📅 මෙම මාසයේ අලුත් යුසර්ස්ලා (This Month): **${monthlyUsers}**\n` +
            `📁 ගබඩා කර ඇති වීඩියෝ ගණන: **${totalFiles}**\n` +
            `👁️ මුළු වීඩියෝ නැරඹුම් වාර (Total Views): **${totalViews}**`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error("Stats error:", error);
        ctx.reply("❌ සංඛ්‍යාලේඛන ලබාගැනීමේදී දෝෂයක් ඇති විය.");
    }
});

// --- ADMIN BROADCAST COMMAND (/broadcast) ---
bot.command('broadcast', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.");
    }

    const broadcastText = ctx.message.text.replace('/broadcast', '').trim();

    if (!broadcastText) {
        return ctx.reply("⚠️ කරුණාකර යැවිය යුතු පණිවිඩය සමඟ විධානය භාවිතා කරන්න.\n\nඋදාහරණයක් ලෙස:\n`/broadcast 🔥 අලුත් වීඩියෝවක් නරඹන්න පහත ලින්ක් එකට යන්න!`", { parse_mode: 'Markdown' });
    }

    try {
        const users = await UserModel.find({});
        let successCount = 0;
        let failCount = 0;

        await ctx.reply(`📢 බ්‍රෝඩ්කාස්ට් කිරීම ආරම්භ විය... (මුළු යුසර්ස්ලා: ${users.length})`);

        for (const user of users) {
            try {
                await ctx.telegram.sendMessage(user.userId, broadcastText, { parse_mode: 'Markdown' });
                successCount++;
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (err) {
                failCount++;
            }
        }

        await ctx.reply(`✅ **බ්‍රෝඩ්කාස්ට් අවසන්!**\n\n🎯 සාර්ථකව යැවුණු ගණන: ${successCount}\n❌ අසාර්ථක වූ ගණන: ${failCount}`, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("Broadcast error:", error);
        ctx.reply("❌ බ්‍රෝඩ්කාස්ට් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});

// Check Subscription Button Action
bot.action(/^check_sub_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.match[1];

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.answerCbQuery("❌ ඔබ තවමත් චැනල් එකට Join වී නැත! කරුණාකර මුලින්ම Join වන්න.", { show_alert: true });
    }

    await ctx.answerCbQuery("✅ ස්තූතියි! දැන් ඔබට වීඩියෝව ලබාගත හැක.");
    
    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            let user = await checkAndUpdateLimit(userIdStr);

            if (user.downloadsToday >= user.currentLimit) {
                let shareText = `🔥 ලෝකයේ වෙනත් කිසිම තැනක නැති සුපිරිම අලුත්ම 18+ වීඩියෝ එකතු වන අපේ චැනල් එකට දැන්ම එකතු වෙන්න! 👇\n\nhttps://t.me/wal_lokaya1`;
                let encodedText = encodeURIComponent(shareText);
                let nextGoal = user.currentLimit === 10 ? 2 : 4;

                await ctx.deleteMessage();
                return ctx.reply(
                    `⚠️ **ඔබේ දිනපතා වීඩියෝ බාගත කිරීමේ සීමාව (Limit: ${user.currentLimit}) අවසන්!**\n\n` +
                    `තවත් වීඩියෝ බාගැනීමට පහත බොත්තම ඔබා ගෲප් **${nextGoal} කට** ශෙයාර් කරන්න.`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "📤 Share to Groups", url: `https://t.me/share/url?url=${encodedText}` }],
                                [{ text: "🔄 Check Share Status", callback_data: "check_share_status" }]
                            ]
                        }
                    }
                );
            }

            const fileDoc = await FileModel.findOneAndUpdate(
                { token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.editMessageText("❌ සමාවන්න, මෙම ගොනුව හමුවී නැත හෝ කල් ඉකුත් වී ඇත.");
            }

            user.downloadsToday += 1;
            await user.save();

            await ctx.deleteMessage();

            const sentVideo = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgId);
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝව **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `📊 අද බාගත් ගණන: **${user.downloadsToday} /${user.currentLimit}**`,
                { parse_mode: 'Markdown' }
            );

            setTimeout(async () => {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, sentVideo.message_id);
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id);
                } catch (err) {
                    console.error("Auto delete error:", err);
                }
            }, 30 * 60 * 1000);

            return;
        }

        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.editMessageText("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        let user = await checkAndUpdateLimit(userIdStr);
        if (user.downloadsToday >= user.currentLimit) {
            let shareText = `🔥 ලෝකයේ වෙනත් කිසිම තැනක නැති සුපිරිම අලුත්ම 18+ වීඩියෝ එකතු වන අපේ චැනල් එකට දැන්ම එකතු වෙන්න! 👇\n\nhttps://t.me/wal_lokaya1`;
            let encodedText = encodeURIComponent(shareText);
            let nextGoal = user.currentLimit === 10 ? 2 : 4;

            return ctx.editMessageText(
                `⚠️ **ඔබේ දිනපතා වීඩියෝ බාගත කිරීමේ සීමාව (Limit: ${user.currentLimit}) අවසන්!**\n\n` +
                `තවත් වීඩියෝ බාගැනීමට පහත බොත්තම ඔබා ගෲප් **${nextGoal} කට** ශෙයාර් කරන්න.`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📤 Share to Groups", url: `https://t.me/share/url?url=${encodedText}` }],
                            [{ text: "🔄 Check Share Status", callback_data: "check_share_status" }]
                        ]
                    }
                }
            );
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

        await ctx.editMessageText(
            `🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n` +
            `📊 අද බාගත කළ වාර: ${user.downloadsToday} /${user.currentLimit}`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "▶️ Watch Ad & Get Video", web_app: { url: miniAppUrl } }],
                        [{ text: "❓ වීඩියෝව ලබා ගන්නේ කෙසේද? (Guide)", callback_data: "how_to_use" }]
                    ]
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
});

// Guide Action
bot.action('how_to_use', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        await ctx.reply(
            `📖 **වීඩියෝවක් ලබාගන්නේ කෙසේද? (පියවර)**\n\n` +
            `1️⃣ මුලින්ම **"▶️ Watch Ad & Get Video"** බොත්තම ඔබන්න.\n` +
            `2️⃣ විවෘත වන පිටුවේ ඇති දැන්වීම මත ක්ලික් කර තත්පර 5ක් රැඳී සිටින්න.\n` +
            `3️⃣ කාලය අවසන් වූ පසු මතුවන **"🚀 වීඩියෝව ලබා ගන්න"** බොත්තම ඔබන්න.\n` +
            `4️⃣ එවිට ස්වයංක්‍රීයව බොට් වෙත පැමිණ ඔබට අවශ්‍ය වීඩියෝව ලැබෙනු ඇත!`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error(error);
    }
});

// --- Admin Upload & Auto-Post Section ---
const pendingUploads = new Map();

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const photo = ctx.message.photo;
    const largestPhoto = photo[photo.length - 1].file_id;
    const caption = ctx.message.caption || "🔥 නව වීඩියෝවක් නරඹන්න!";

    pendingUploads.set(userId, {
        photoFileId: largestPhoto,
        caption: caption
    });

    await ctx.reply("📸 Thumbnail එක ලැබුණා! දැන් මේකට අදාළ **වීඩියෝව (Video file එක)** එවන්න.");
});

bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ සමාවන්න! මෙම බොට් හරහා වීඩියෝ ගබඩා කිරීමට අවසර ඇත්තේ ඇඩ්මින්ට පමණි.");
    }

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("⚠️ කරුණාකර මුලින්ම Thumbnail එකක් (Photo එකක්) එවන්න.");
    }

    const message = ctx.message;
    const msgId = message.message_id;
    
    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, msgId);
        const dbMsgId = forwarded.message_id;
        const token = Math.random().toString(36).substring(2, 10);

        await FileModel.create({
            token: token,
            fileMsgId: dbMsgId,
            views: 0
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        await ctx.reply(
            `✅ **වීඩියෝව සාර්ථකව ගබඩා විය!**\n\n` +
            `🚀 **ප්‍රධාන චැනල් එකට ස්වයංක්‍රීයව පෝස්ට් එක යවන ලදී!**\n\n` +
            `🔗 **Direct Share Link:**\n\`${shareLink}\``, 
            { parse_mode: 'Markdown' }
        );

        await ctx.telegram.sendPhoto(MAIN_CHANNEL_ID, pending.photoFileId, {
            caption: pending.caption,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "▶️ Watch Full Video", url: shareLink }]
                ]
            }
        });

        pendingUploads.delete(userId);

    } catch (error) {
        console.error(error);
        ctx.reply("වීඩියෝව සේව් කරගැනීමේදී සහ ඔටෝ පෝස්ට් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});

// Telegram bot launch & Express Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    bot.launch();
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
