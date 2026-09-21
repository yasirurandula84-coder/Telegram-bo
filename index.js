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

// Mongoose Schema for Users (Referral සහ Limit විස්තර සමඟ)
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now },
    downloadsToday: { type: Number, default: 0 },
    lastDownloadDate: { type: String, default: "" },
    referredBy: { type: String, default: null }, // ක කාගේ ලින්ක් එකෙන් ආවාද
    referralCount: { type: Number, default: 0 },   // රෙෆර් කළ සංඛ්‍යාව
    extraLimit: { type: Number, default: 0 }     // රෙෆරල් නිසා ලැබුණු අමතර ලිමිට් එක
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
        user = await UserModel.create({ userId: userIdStr, lastDownloadDate: todayStr, downloadsToday: 0 });
    }

    if (user.lastDownloadDate !== todayStr) {
        user.downloadsToday = 0;
        user.lastDownloadDate = todayStr;
        await user.save();
    }

    return user;
}

// /start command & Referral System & User Saving
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        let user = await UserModel.findOne({ userId: userIdStr });
        if (!user) {
            // අලුත් යුසර් කෙනෙක්
            let referrerId = null;
            if (payload && payload.startsWith("ref_")) {
                referrerId = payload.replace("ref_", "");
                // තමන්ගේම ලින්ක් එකෙන් තමන් රෙෆර් වීම වැළැක්වීම
                if (referrerId === userIdStr) {
                    referrerId = null;
                }
            }

            user = await UserModel.create({
                userId: userIdStr,
                joinedAt: new Date(),
                downloadsToday: 0,
                lastDownloadDate: new Date().toISOString().split('T')[0],
                referredBy: referrerId,
                referralCount: 0,
                extraLimit: 0
            });

            // රෙෆරර් (Referrer) කෙනෙක් සිටී නම් සහ ඔහු F-Sub කර ඇත්නම් ඌට ලකුණු/ලිමිට් එක දීම
            if (referrerId) {
                let referrerUser = await UserModel.findOne({ userId: referrerId });
                if (referrerUser) {
                    referrerUser.referralCount += 1;
                    referrerUser.extraLimit += 5; // එක් අයෙකුට වීඩියෝ 5ක් බැගින් අමතර ලිමිට් එක වැඩිවේ
                    await referrerUser.save();

                    try {
                        await ctx.telegram.sendMessage(
                            referrerId,
                            `🎉 **සුභ පැතුම්!**\n\nඔබේ රෙෆරල් ලින්ක් එක හරහා අලුත් යුසර් කෙනෙක් බොට් එකට එකතු විය!\n` +
                            `🎁 ඔබට අමතරව **වීඩියෝ 5ක** බාගත කිරීමේ වරප්‍රසාදයක් හිමි විය!`,
                            { parse_mode: 'Markdown' }
                        );
                    } catch (e) {}
                }
            }
        } else {
            await checkAndUpdateLimit(userIdStr);
        }
    } catch (err) {
        console.error("User save / Referral error:", err);
    }

    if (!payload) {
        const botUsername = ctx.botInfo.username;
        const myRefLink = `https://t.me/${botUsername}?start=ref_${userIdStr}`;
        return ctx.reply(
            `ආයුබෝවන්! මම File Store Bot එකයි. වීඩියෝ ලබා ගැනීමට නිවැරදි ලින්ක් එකක් භාවිතා කරන්න.\n\n` +
            `🔗 **ඔබේ රෙෆරල් ලින්ක් එක:**\n\`${myRefLink}\``,
            { parse_mode: 'Markdown' }
        );
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
            let user = await checkAndUpdateLimit(userIdStr);

            let totalLimit = 20 + (user.extraLimit || 0); // සාමාන්‍ය 20 + රෙෆරල් වලින් ලැබුණු අමතර ලිමිට් එක

            if (user.downloadsToday >= totalLimit) {
                const botUsername = ctx.botInfo.username;
                const myRefLink = `https://t.me/${botUsername}?start=ref_${userIdStr}`;

                return ctx.reply(
                    `⚠️ **අද දින ඔබේ වීඩියෝ බාගත කිරීමේ සීමාව (${totalLimit} ක්) අවසන් වී ඇත!**\n\n` +
                    `🚀 තවත් වීඩියෝ බාගත කර ගැනීමට අවශ්‍ය නම්, පහත ඔබේ **Referral Link** එක යහළුවන්ට හෝ ගෲප් වලට ශෙයාර් කරන්න.\n` +
                    `👤 **එක් අයෙක් මෙම ලින්ක් එකෙන් බොට් එකට Join වන විට ඔබට තවත් වීඩියෝ 5ක් බැගින් බාගත හැක!**\n\n` +
                    `🔗 **Your Referral Link:**\n\`${myRefLink}\`\n\n` +
                    `📊 මේ දක්වා ඔබ රෙෆර් කළ ගණන: **${user.referralCount}**\n` +
                    `🎁 ඔබට ලැබී ඇති අමතර සීමාව: **වීඩියෝ ${user.extraLimit} කි**`,
                    { parse_mode: 'Markdown' }
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

            user.downloadsToday += 1;
            await user.save();

            // වීඩියෝව යැවීම
            const sentVideo = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgId);
            
            const warningMsg = await ctx.reply(
                `⚠️ **අවධානයට:**\n` +
                `මෙම වීඩියෝව **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!\n\n` +
                `📊 අද ඔබ බාගත් ගණන: **${user.downloadsToday} /${totalLimit}**`,
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

        // සාමාන්‍ය ලින්ක් එකකින් පැමිණි විට (getvideo නොමැතිව)
        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        let user = await checkAndUpdateLimit(userIdStr);
        let totalLimit = 20 + (user.extraLimit || 0);

        if (user.downloadsToday >= totalLimit) {
            const botUsername = ctx.botInfo.username;
            const myRefLink = `https://t.me/${botUsername}?start=ref_${userIdStr}`;

            return ctx.reply(
                `⚠️ **අද දින ඔබේ වීඩියෝ බාගත කිරීමේ සීමාව (${totalLimit} ක්) අවසන් වී ඇත!**\n\n` +
                `🔗 **Your Referral Link:**\n\`${myRefLink}\`\n\n` +
                `👤 මෙම ලින්ක් එකෙන් එක් අයෙක් එකතු වන විට ඔබට **වීඩියෝ 5ක්** බැගින් වැඩිවේ.`,
                { parse_mode: 'Markdown' }
            );
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

        await ctx.reply(
            `🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n` +
            `📊 මෙතෙක් නැරඹුම් වාර: ${fileDoc.views} ක්\n` +
            `📊 අද බාගත කළ වාර: ${user.downloadsToday} /${totalLimit}`,
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
            let totalLimit = 20 + (user.extraLimit || 0);

            if (user.downloadsToday >= totalLimit) {
                const botUsername = ctx.botInfo.username;
                const myRefLink = `https://t.me/${botUsername}?start=ref_${userIdStr}`;

                await ctx.deleteMessage();
                return ctx.reply(
                    `⚠️ **අද දින ඔබේ වීඩියෝ බාගත කිරීමේ සීමාව (${totalLimit} ක්) අවසන් වී ඇත!**\n\n` +
                    `🔗 **Your Referral Link:**\n\`${myRefLink}\`\n\n` +
                    `👤 මෙම ලින්ක් එකෙන් එක් අයෙක් එකතු වන විට ඔබට **වීඩියෝ 5ක්** බැගින් වැඩිවේ.`,
                    { parse_mode: 'Markdown' }
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
                `📊 අද බාගත් ගණන: **${user.downloadsToday} /${totalLimit}**`,
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
        let totalLimit = 20 + (user.extraLimit || 0);

        if (user.downloadsToday >= totalLimit) {
            const botUsername = ctx.botInfo.username;
            const myRefLink = `https://t.me/${botUsername}?start=ref_${userIdStr}`;

            return ctx.editMessageText(
                `⚠️ **අද දින ඔබේ වීඩියෝ බාගත කිරීමේ සීමාව (${totalLimit} ක්) අවසන් වී ඇත!**\n\n` +
                `🔗 **Your Referral Link:**\n\`${myRefLink}\``,
                { parse_mode: 'Markdown' }
            );
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

        await ctx.editMessageText(
            `🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n` +
            `📊 මෙතෙක් නැරඹුම් වාර: ${fileDoc.views} ක්\n` +
            `📊 අද බාගත කළ වාර: ${user.downloadsToday} /${totalLimit}`,
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
