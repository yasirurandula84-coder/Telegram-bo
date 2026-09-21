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


// Mongoose Schema for Files (Collection සඳහා Array එකක් ලෙස)
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgIds: { type: [Number], required: true }, // වීඩියෝ කිහිපයක ID එකතු කිරීමට
    views: { type: Number, default: 0 }
});
const FileModel = mongoose.model('File', fileSchema);

// Mongoose Schema for Users (joinedAt සමඟ මාසිකව යුසර්ස්ලා ගණන් කිරීමට)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now }
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

// /start command & User Saving for Broadcast
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    // යුසර් බොට් එකට එන සෑම අවස්ථාවකම ඩේටාබේස් එකේ සේව් වීම
    try {
        await UserModel.updateOne(
            { userId: userIdStr }, 
            { $setOnInsert: { joinedAt: new Date() }, $set: { userId: userIdStr } }, 
            { upsert: true }
        );
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
            
            const fileDoc = await FileModel.findOneAndUpdate(
                { token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.reply("❌ සමාවන්න, මෙම ගොනුව හමුවී නැත හෝ කල් ඉකුත් වී ඇත.");
            }

            // වීඩියෝව යැවීම
                        // කලෙක්ෂන් එකේ ඇති සියලුම වීඩියෝ එකින් එක පිළිවෙළට යැවීම
            for (let i = 0; i < fileDoc.fileMsgIds.length; i++) {
                await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgIds[i]);
                // වීඩියෝ අතර කුඩා පරතරයක් තබා පිළිවෙළට යැවීමට
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝ කලෙක්ෂන් එක **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `💾 අවශ්‍ය නම් දැන්ම ඉහත වීඩියෝ **Save** කර සුරක්ෂිත කරගන්න.`,
                { parse_mode: 'Markdown' }
            );

            // විනාඩි 30 කට පසු මැකීමට සෙටප් කිරීම (අවශ්‍ය නම් කලෙක්ෂන් එකේ මැසේජ් හැම එකක්ම ඩිලීට් වන ලෙස හෝ වෝනිං මැසේජ් එක ඩිලීට් වන ලෙස තබාගත හැක)
            setTimeout(async () => {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id);
                } catch (err) {}
            }, 30 * 60 * 1000);

            return;

        }
      
        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

        await ctx.reply(
            `🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n` +
            `📊 මෙතෙක් නැරඹුම් වාර: ${fileDoc.views} ක්\n\n` +
            `මෙම බොත්තම එබූ විට විවෘත වන පිටුවෙන් දැන්වීම බලා තත්පර 5ක් රැඳී සිට වීඩියෝව ලබා ගන්න.`,
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
        await ctx.reply("❌ සංඛ්‍යාලේඛන ලබාගැනීමේදී දෝෂයක් ඇති විය.");
    }
});

// --- ADMIN BROADCAST COMMAND (/broadcast) ---
bot.command('broadcast', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.");
    }

    // බැලිය යුතුයි මැසේජ් එකට ෆොටෝ එකක්, වීඩියෝ එකක් හෝ කැප්ෂන් එකක් තියෙනවද කියලා
    const repliedMessage = ctx.message.reply_to_message;

    if (!repliedMessage) {
        return ctx.reply(
            "⚠️ **පින්තූරයක් හෝ වීඩියෝවක් බ්‍රෝඩ්කාස්ට් කරන්නේ ಹೇಗೆ?**\n\n" +
            "1️⃣ මුලින්ම ඔබට යවන්න අවශ්‍ය **Photo එක හෝ Video එක** චැට් එකට එවන්න (කැප්ෂන් එකත් සමඟ).\n" +
            "2️⃣ ඊටපස්සේ ඒ ෆොටෝ එකට හෝ වීඩියෝවට **Reply** කරලා `/broadcast` කියලා ටයිප් කරලා එවන්න.",
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const users = await UserModel.find({});
        let successCount = 0;
        let failCount = 0;

        await ctx.reply(`📢 මීਡੀයා බ්‍රෝඩ්කාස්ට් කිරීම ආරම්භ විය... (මුළු යුසර්ස්ලා: ${users.length})`);

        for (const user of users) {
            try {
                // රිප්ளை කළ මැසේජ් එක ෆොටෝ එකක්, වීඩියෝ එකක් හෝ වෙනත් දෙයක්ද කියලා බලලා යුසර්ට කොපි කිරීම
                await ctx.telegram.copyMessage(user.userId, ctx.chat.id, repliedMessage.message_id);
                successCount++;
                await new Promise(resolve => setTimeout(resolve, 50)); // Telegram flood limit එක මඟහරවා ගැනීමට
            } catch (err) {
                failCount++;
            }
        }

        await ctx.reply(`✅ **බ්‍රෝඩ්කාස්ට් අවසන්!**\n\n🎯 සාර්ථකව යැවුණු ගණන: ${successCount}\n❌ අසාර්ථක වූ ගණන: ${failCount}`, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("Broadcast error:", error);
        await ctx.reply("❌ බ්‍රෝඩ්කාස්ට් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});
// Check Subscription Button Action
bot.action(/^check_sub_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const payload = ctx.match[1];

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.answerCbQuery("❌ ඔබ තවමත් චැනල් එකට Join වී නැත! කරුණාකර මුලින්ම Join වන්න.", { show_alert: true });
    }

    await ctx.answerCbQuery("✅ ස්තූතියි! දැන් ඔබට වීඩියෝව ලබාගත හැක.");
    
    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOneAndUpdate(
                { token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.editMessageText("❌ සමාවන්න, මෙම ගොනුව හමුවී නැත හෝ කල් ඉකුත් වී ඇත.");
            }

            await ctx.deleteMessage();

                        // කලෙක්ෂන් එකේ ඇති සියලුම වීඩියෝ එකින් එක පිළිවෙළට යැවීම
            for (let i = 0; i < fileDoc.fileMsgIds.length; i++) {
                await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgIds[i]);
                // වීඩියෝ අතර කුඩා පරතරයක් තබා පිළිවෙළට යැවීමට
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝ කලෙක්ෂන් එක **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `💾 අවශ්‍ය නම් දැන්ම ඉහත වීඩියෝ **Save** කර සුරක්ෂිත කරගන්න.`,
                { parse_mode: 'Markdown' }
            );

            // විනාඩි 30 කට පසු මැකීමට සෙටප් කිරීම (අවශ්‍ය නම් කලෙක්ෂන් එකේ මැසේජ් හැම එකක්ම ඩිලීට් වන ලෙස හෝ වෝනිං මැසේජ් එක ඩිලීට් වන ලෙස තබාගත හැක)
            setTimeout(async () => {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id);
                } catch (err) {}
            }, 30 * 60 * 1000);

            return;

        }

        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.editMessageText("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
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

// Admin Upload & Auto-Post Section
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
        caption: caption,
        videoMsgIds: [] 
    });

    await ctx.reply("📸 Thumbnail එක ලැබුණා! දැන් මේකට අදාළ **වීඩියෝව (හෝ වීඩියෝ කිහිපයක්)** එකින් එක එවන්න. සියල්ල එවා අවසන් වූ පසු **/done** කමාන්ඩ් එක එවන්න.");
});

// වීඩියෝ එකතු කරගැනීම
bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("⚠️ කරුණාකර මුලින්ම Thumbnail එකක් (Photo එකක්) එවන්න.");
    }

    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
        pending.videoMsgIds.push(forwarded.message_id);
        pendingUploads.set(userId, pending);

        await ctx.reply(`✅ වීඩියෝව එකතු විය! (මුළු ගණන: ${pending.videoMsgIds.length}). තවත් ඇත්නම් එවන්න, නැතහොත් **/done** ටයිප් කරන්න.`);
    } catch (error) {
        console.error(error);
        ctx.reply("වීඩියෝව සේව් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});

// /done කමාන්ඩ් එක මඟින් පෝස්ට් එක ප්‍රධාන චැනල් එකට යැවීම
bot.command('done', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (!pending || pending.videoMsgIds.length === 0) {
        return ctx.reply("⚠️ කරුණාකර මුලින්ම Thumbnail එකක් සහ වීඩියෝවක් හෝ කිහිපයක් එවන්න.");
    }

    try {
        const token = Math.random().toString(36).substring(2, 10);

        await FileModel.create({
            token: token,
            fileMsgIds: pending.videoMsgIds,
            views: 0
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        await ctx.reply(
            `✅ **සාර්ථකව ගබඩා විය!** (වීඩියෝ ගණන: ${pending.videoMsgIds.length})\n\n` +
            `🚀 **ප්‍රධාන චැනල් එකට පෝස්ට් එක යවන ලදී!**`, 
            { parse_mode: 'Markdown' }
        );

        // වීඩියෝ ගණන 1කට වඩා වැඩියි නම් "Watch Full Collection", නැතහොත් "Watch Full Video" ලෙස බටන් එක හැදීම
        const buttonText = pending.videoMsgIds.length > 1 ? "▶️ Watch Full Collection" : "▶️ Watch Full Video";

        await ctx.telegram.sendPhoto(MAIN_CHANNEL_ID, pending.photoFileId, {
            caption: pending.caption,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: buttonText, url: shareLink }]
                ]
            }
        });

        pendingUploads.delete(userId);

    } catch (error) {
        console.error(error);
        ctx.reply("ප්‍රධාන චැනල් එකට පෝස්ට් කිරීමේදී දෝෂයක් ඇති විය.");
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
