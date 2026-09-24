const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || "@wal_lokaya1"; 
const MONGO_URI = process.env.MONGO_URI;

const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL || "@wal_lokaya1"; 
const AD_LINK = process.env.AD_LINK || "https://www.profitableratecpmnetwork.com/g7p33na9?key=d6d0cdc4f9da3f0a448d3a891515c3ac"; 

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schema for Files (පරණ සහ අලුත් දෙකම සපෝට් කරයි)
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgId: { type: Number },      // පරණ වීඩියෝ සඳහා
    fileMsgIds: { type: [Number] },   // අලුත් වීඩියෝ සඳහා
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 } 
});
const FileModel = mongoose.model('File', fileSchema);

// Mongoose Schema for Users
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now }
});
const UserModel = mongoose.model('User', userSchema);

// Express App setup for Render
const app = express();
app.use(express.urlencoded({ extended: true }));

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
        <body class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none">
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h1 class="text-xl font-bold mb-2">🎬 වීඩියෝව සූදානම් වෙමින් පවතී</h1>
                <p id="instruction-text" class="text-slate-400 text-xs mb-6">කරුණාකර පහත දැක්වෙන දැන්වීම නරඹා තත්පර 5ක් රැඳී සිටින්න.</p>

                <div class="mb-4">
                    <a href="${AD_LINK}" target="_blank" id="ad-link-btn" onclick="openAd()" class="inline-block w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm mb-3">
                        🔗 දැන්වීම විවෘත කරන්න (Click Here)
                    </a>
                </div>

                <div id="timer-box" class="my-4 hidden">
                    <div id="countdown" class="text-4xl font-extrabold text-sky-400 animate-pulse">5</div>
                    <p id="status-text" class="text-xs text-slate-500 mt-2">තත්පර කිහිපයක් රැඳී සිටින්න...</p>
                </div>

                <div id="success-box" class="hidden">
                    <p class="text-green-400 font-semibold mb-4 text-sm">✔ දැන්වීම නැරඹීම සාර්ථකයි!</p>
                    <button onclick="getVideo()" id="unlock-btn" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm">
                        🚀 වීඩියෝව ලබා ගන්න
                    </button>
                </div>
            </div>

            <script>
                let adClicked = false;
                let leaveTime = 0;
                let timerStarted = false;

                function openAd() {
                    adClicked = true;
                    leaveTime = Date.now();
                    const adBtn = document.getElementById('ad-link-btn');
                    adBtn.innerText = "⏳ දැන්වීම නරඹමින් පවතී...";
                    adBtn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
                    adBtn.classList.add('bg-amber-600', 'text-white');
                }

                document.addEventListener('visibilitychange', () => {
                    if (!adClicked || timerStarted) return;

                    if (document.hidden) {
                        leaveTime = Date.now();
                    } else {
                        const timeSpent = (Date.now() - leaveTime) / 1000;
                        const statusText = document.getElementById('status-text');
                        const timerBox = document.getElementById('timer-box');
                        const adBtn = document.getElementById('ad-link-btn');

                        if (timeSpent < 5) {
                            timerBox.classList.remove('hidden');
                            statusText.innerText = "⚠️ කරුණාකර දැන්වීම සම්පූර්ණයෙන්ම තත්පර 5ක් නරඹන්න!";
                            statusText.className = "text-xs text-red-400 mt-2 font-semibold";
                            adBtn.innerText = "🔗 නැවත දැන්වීම විවෘත කරන්න";
                            adBtn.classList.remove('bg-amber-600');
                            adBtn.classList.add('bg-sky-600');
                            adClicked = false;
                        } else {
                            timerBox.classList.remove('hidden');
                            adBtn.style.display = 'none';
                            startCountdown();
                        }
                    }
                });

                function startCountdown() {
                    if (timerStarted) return;
                    timerStarted = true;

                    let timeLeft = 5;
                    const countdownEl = document.getElementById('countdown');
                    const timerBox = document.getElementById('timer-box');
                    const successBox = document.getElementById('success-box');
                    const statusText = document.getElementById('status-text');

                    statusText.innerText = "තත්පර කිහිපයක් රැඳී සිටින්න...";
                    statusText.className = "text-xs text-slate-500 mt-2";

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

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        await UserModel.updateOne(
            { userId: userIdStr }, 
            { $setOnInsert: { joinedAt: new Date() },$set: { userId: userIdStr } }, 
            { upsert: true }
        );
    } catch (err) {
        console.error("User save error:", err);
    }

    if (!payload) {
        return ctx.reply(
            `👋 **ආයුබෝවන්! සාදරයෙන් පිළිගනිමු.**\n\n` +
            `මම ඔබේ වීඩියෝ සහ චිත්‍රපට ලබා දෙන ස්වයංක්‍රීය බොට් (File Store Bot) එකයි.\n\n` +
            `👇 වීඩියෝ ලබා ගැනීමට අපේ ප්‍රධාන චැනල් එකේ ඇති ලින්ක් එකක් භාවිතා කර බොට් වෙත පැමිණෙන්න.`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📢 Our Channel", url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
                        [{ text: "ℹ️ How to Use", callback_data: "how_to_use" }, { text: "📞 Support / Help", callback_data: "support_info" }]
                    ]
                }
            }
        );
    }

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
                { token: token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.reply("❌ සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
            }

            let sentVideoIds = [];
            
            // පරණ සහ අලුත් දෙவර්ගයම හැන්ඩ්ල් කිරීමට (Backward Compatible)
            let msgIdsArray = [];
            if (fileDoc.fileMsgIds && Array.isArray(fileDoc.fileMsgIds)) {
                msgIdsArray = fileDoc.fileMsgIds;
            } else if (fileDoc.fileMsgId) {
                msgIdsArray = [fileDoc.fileMsgId];
            }

            for (let i = 0; i < msgIdsArray.length; i++) {
                try {
                    const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, msgIdsArray[i]);
                    sentVideoIds.push(sentMsg.message_id);
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (copyErr) {
                    console.error(`Copy Message Error for ID ${msgIdsArray[i]}:`, copyErr.message);
                    return ctx.reply("⚠️ සමාවන්න, මෙම වීඩියෝව ලබාගැනීමේදී දෝෂයක් ඇත.");
                }
            }
            
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝ කලෙක්ෂන් එක **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `💾 අවශ්‍ය නම් දැන්ම ඉහත වීඩියෝ **Save** කර සුරක්ෂිත කරගන්න.`,
                { parse_mode: 'Markdown' }
            );

            setTimeout(async () => {
                try {
                    for (let msgId of sentVideoIds) {
                        await ctx.telegram.deleteMessage(ctx.chat.id, msgId).catch(() => {});
                    }
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id).catch(() => {});
                } catch (err) {}
            }, 30 * 60 * 1000);

            return;
        }


        // මෙතැනදී යූසර් මුලින්ම ලින්ක් එක ක්ලික් කරන විට Clicks 1 කින් වැඩි වේ
        const fileDoc = await FileModel.findOneAndUpdate(
            { token: payload }, 
            { $inc: { clicks: 1 } }, 
            { new: true }
        );

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

// Admin Stats Command
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
        let totalClicks = 0;

        files.forEach(file => {
            totalViews += file.views;
            totalClicks += file.clicks || 0;
        });

        const conversionRate = totalClicks > 0 ? ((totalViews / totalClicks) * 100).toFixed(1) : 0;

        await ctx.reply(
            `📊 **බොට් හි සංඛ්‍යාලේඛන (Analytics Dashboard)**\n\n` +
            `👥 මුළු යුසර්ස්ලා (Total Users): **${totalUsers}**\n` +
            `📅 මෙම මාසයේ අලුත් යුසර්ස්ලා (This Month): **${monthlyUsers}**\n` +
            `📁 ගබඩා කර ඇති වීඩියෝ කලෙක්ෂන්: **${totalFiles}**\n` +
            `🔗 මුළු ලින්ක් ක්ලික්ස් (Total Clicks): **${totalClicks}**\n` +
            `👁️ මුළු වීඩියෝ නැරඹුම් (Total Views): **${totalViews}**\n` +
            `📈 ඇඩ් සාර්ථකත්ව අනුපාතය (Conversion): **${conversionRate}%**`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error("Stats error:", error);
        await ctx.reply("❌ සංඛ්‍යාලේඛන ලබාගැනීමේදී දෝෂයක් ඇති විය.");
    }
});

// Broadcast Command
bot.command('broadcast', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.");
    }

    const repliedMessage = ctx.message.reply_to_message;
    if (!repliedMessage) {
        return ctx.reply("⚠️ පින්තූරයකට හෝ වීඩියෝවකට Reply කර `/broadcast` ලෙස ටයිප් කරන්න.", { parse_mode: 'Markdown' });
    }

    try {
        const users = await UserModel.find({});
        let successCount = 0;
        let failCount = 0;

        await ctx.reply(`📢 බ්‍රෝඩ්කාස්ට් කිරීම ආරම්භ විය... (මුළු යුසර්ස්ලා: ${users.length})`);

        for (const user of users) {
            try {
                await ctx.telegram.copyMessage(user.userId, ctx.chat.id, repliedMessage.message_id);
                successCount++;
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (err) {
                failCount++;
            }
        }

        await ctx.reply(`✅ **බ්‍රෝඩ්කාස්ට් අවසන්!**\n\n🎯 සාර්ථකයි: ${successCount}\n❌ අසාර්ථකයි: ${failCount}`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error("Broadcast error:", error);
    }
});

// Check Subscription Action
bot.action(/^check_sub_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const payload = ctx.match[1];

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.answerCbQuery("❌ ඔබ තවමත් චැනල් එකට Join වී නැත!", { show_alert: true });
    }

    await ctx.answerCbQuery("✅ ස්තූතියි! දැන් ඔබට වීඩියෝව ලබාගත හැක.");
    
    try {
                if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOneAndUpdate(
                { token: token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.editMessageText("❌ සමාවන්න, මෙම ගොනුව හමුවී නැත.");
            }

            await ctx.deleteMessage();

            let sentVideoIds = [];
            
            // පරණ සහ අලුත් දෙවර්ගයම මෙතනත් හැන්ඩ්ල් කරයි
            let msgIdsArray = [];
            if (fileDoc.fileMsgIds && Array.isArray(fileDoc.fileMsgIds)) {
                msgIdsArray = fileDoc.fileMsgIds;
            } else if (fileDoc.fileMsgId) {
                msgIdsArray = [fileDoc.fileMsgId];
            }

            for (let i = 0; i < msgIdsArray.length; i++) {
                try {
                    const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, msgIdsArray[i]);
                    sentVideoIds.push(sentMsg.message_id);
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (copyErr) {
                    console.error(`Copy Message Error for ID ${msgIdsArray[i]}:`, copyErr.message);
                }
            }
            
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝ කලෙක්ෂන් එක **විනාඩි 30 කින්** ස්වයංක්‍රීයව මැකී යනු ඇත!`,
                { parse_mode: 'Markdown' }
            );

            setTimeout(async () => {
                try {
                    for (let msgId of sentVideoIds) {
                        await ctx.telegram.deleteMessage(ctx.chat.id, msgId).catch(() => {});
                    }
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id).catch(() => {});
                } catch (err) {}
            }, 30 * 60 * 1000);

            return;
        }


        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.editMessageText("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත.");
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

bot.action('support_info', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(`📞 ගැටළු සඳහා අපගේ ප්‍රධාන චැනල් එක හා සම්බන්ධ වන්න.`);
});

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

    await ctx.reply("📸 Thumbnail එක ලැබුණා! දැන් වීඩියෝ එක හෝ කිහිපයක් එවන්න. අවසන් වූ පසු `/done` ටයිප් කරන්න.");
});

bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("⚠️ මුලින්ම Thumbnail එකක් එවන්න.");
    }

    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
        pending.videoMsgIds.push(forwarded.message_id);
        pendingUploads.set(userId, pending);

        await ctx.reply(`✅ වීඩියෝව එකතු විය! (මුළු ගණන: ${pending.videoMsgIds.length}). තවත් ඇත්නම් එවන්න, නැතහොත් `/done` ටයිප් කරන්න.`);
    } catch (error) {
        console.error(error);
    }
});

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
            views: 0,
            clicks: 0
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        await ctx.reply(`✅ **සාර්ථකව ගබඩා විය!** (වීඩියෝ ගණන: ${pending.videoMsgIds.length})\n\n🚀 ප්‍රධාන චැනල් එකට පෝස්ට් යවන ලදී!`, { parse_mode: 'Markdown' });

        const buttonText = pending.videoMsgIds.length > 1 ? "▶️ Watch Full Collection" : "▶️ Watch Full Video";

        await ctx.telegram.sendPhoto(MAIN_CHANNEL_ID, pending.photoFileId, {
            caption: pending.caption,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { 
                            text: buttonText, 
                            url: shareLink
                            // මෙහි තිබූ style කියන property එක ඉවත් කරන ලදී (Telegram මඟින් URL බටන් වල පාට වෙනස් කිරීමට ඉඩ නොදෙන බැවින්)
                        }
                    ]
                ]
            }
        });

        pendingUploads.delete(userId);
    } catch (error) {
        console.error(error);
        ctx.reply("ප්‍රධාන චැනල් එකට පෝස්ට් කිරීමේදී දෝෂයක් ඇති විය.");
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    bot.launch();
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
