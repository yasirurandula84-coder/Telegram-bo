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

// --- Language Dictionary (භාෂා පරිවර්තන එකතුව - Premium Emojis සමග) ---
const langs = {
    si: {
        welcome: "<tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji> <b>ආයුබෝවන්! සාදරයෙන් පිළිගනිමු.</b> <tg-emoji emoji-id=\"5431376038628160877\">👑</tg-emoji>\n\nමම ඔබේ වීඩියෝ ලබා දෙන ස්වයංක්‍රීය බොට් එකයි. <tg-emoji emoji-id=\"5370835848520631631\">🎬</tg-emoji>\n\n<tg-emoji emoji-id=\"5406899432098627038\">👉</tg-emoji> <b>වීඩියෝ ලබා ගැනීමට අපේ ප්‍රධාන චැනල් එකේ ඇති ලින්ක් එකක් භාවිතා කර බොට් වෙත පැමිණෙන්න.</b> <tg-emoji emoji-id=\"5370835848520631629\">💎</tg-emoji>",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language / භාෂාව",
        subRequired: "<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> <b>ඔබ තවමත් අපේ ප්‍රධාන චැනල් එක Join වී නැත!</b> <tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji>\n\nමෙම වීඩියෝව ලබා ගැනීමට නම් මුලින්ම අපේ චැනල් එකට Join වී සිටිය යුතුය. <tg-emoji emoji-id=\"5427009714846171570\">🔒</tg-emoji>\n\n<tg-emoji emoji-id=\"5406899432098627038\">👇</tg-emoji> පහත බොත්තම ඔබා චැනල් එකට Join වී, පසුව <b>\"🔄 Check Subscription\"</b> ඔබන්න.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Subscription",
        linkExpired: "<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> <b>සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.</b>",
        warningText: "<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> <b>අවධානයට:</b>\nමෙම අන්තර්ගතය <b>විනාඩි 30 කින්</b> ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත! <tg-emoji emoji-id=\"5469731513291418723\">⏳</tg-emoji>",
        protectedNote: "\n\n<tg-emoji emoji-id=\"5427009714846171570\">🔒</tg-emoji> <i>(මෙම අන්තර්ගතය ෆෝවර්ඩ් කිරීමට හෝ ඩවුන්ලෝඩ් කිරීමට නොහැකි වේ.)</i>",
        clickBtnText: "<tg-emoji emoji-id=\"5431376038628160877\">🔓</tg-emoji> <b>අන්තර්ගතය ලබා ගැනීමට පහත බොත්තම ඔබන්න:</b> <tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji>",
        viewsCount: "📊 මෙතෙක් නැරඹුම් වාර:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ වීඩියෝව ලබා ගන්නේ කෙසේද? (Guide)",
        systemError: "<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> පද්ධතියේ දෝෂයක් සිදු විය.",
        notSubbedAlert: "❌ ඔබ තවමත් චැනල් එකට Join වී නැත!",
        subSuccess: "<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> ස්තූතියි! දැන් ඔබට අන්තර්ගතය ලබාගත හැක.",
        guideContent: "📖 <b>අන්තර්ගතයක් ලබාගන්නේ කෙසේද? (පියවර)</b> <tg-emoji emoji-id=\"5431376038628160877\">💡</tg-emoji>\n\n1️⃣ මුලින්ම <b>\"▶️ Watch Ad & Get Content\"</b> බොත්තම ඔබන්න. <tg-emoji emoji-id=\"5406899432098627038\">👉</tg-emoji>\n2️⃣ විවෘත වන පිටුවේ ඇති දැන්වීම මත ක්ලික් කර තත්පර 5ක් රැඳී සිටින්න. <tg-emoji emoji-id=\"5469731513291418723\">⏱️</tg-emoji>\n3️⃣ කාලය අවසන් වූ පසු මතුවන <b>\"🚀 වීඩියෝව ලබා ගන්න\"</b> බොත්තම ඔබන්න. <tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji>\n4️⃣ එවිට ස්වයංක්‍රීයව බොට් වෙත පැමිණ ඔබට අවශ්‍ය අන්තර්ගතය ලැබෙනු ඇත! <tg-emoji emoji-id=\"5370835848520631631\">🎬</tg-emoji>",
        supportMsg: "<tg-emoji emoji-id=\"5370835848520631629\">📞</tg-emoji> ගැටළු සඳහා අපගේ ප්‍රධාන චැනල් එක හා සම්බන්ධ වන්න.",
        langSelect: "🌐 <b>කරුණාකර ඔබේ භාෂාව තෝරන්න / Please select your language:</b> <tg-emoji emoji-id=\"5469731513291418723\">✨</tg-emoji>",
        
        // Mini App Dictionary (SI)
        appTitle: "වීඩියෝව සූදානම් වෙමින් පවතී",
        appInstruction: "පහත බොත්තම ඔබා දැන්වීම නරඹා, තත්පර <span class=\"text-sky-400 font-semibold\">5ක්</span> රැඳී සිටින්න.",
        appAdBtn: "🔗 දැන්වීම විවෘත කරන්න",
        appAdBtnWatching: "⏳ දැන්වීම නරඹමින් පවතී...",
        appAdBtnAgain: "🔗 නැවත දැන්වීම විවෘත කරන්න",
        appStatusWatching: "දැන්වීම නරඹමින් පවතී...",
        appStatusWarning: "⚠️ කරුණාකර දැන්වීම සම්පූර්ණයෙන්ම තත්පර 5ක් නරඹන්න!",
        appStatusWait: "තත්පර කිහිපයක් රැඳී සිටින්න...",
        appSuccessMsg: "✔ නැරඹීම සාර්ථකයි! දැන් වීඩියෝව ලබාගත හැක.",
        appGetVideoBtn: "🚀 වීඩියෝව ලබා ගන්න",
        
        // Age Verification SI
        ageTitle: "වයස තහවුරු කිරීම අවශ්‍යයි",
        ageDesc: "මෙම Mini App එක තුළ වැඩිහිටි අන්තර්ගතයන් අඩංගු වේ. ඇතුළු වීමට ඔබේ වයස අවුරුදු 18 හෝ ඊට වැඩි විය යුතුය.",
        ageUnderBtn: "මගේ වයස 18ට අඩුයි",
        ageOverBtn: "මගේ වයස 18ට වැඩි හෝ සමානයි"
    },
    en: {
        welcome: "<tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji> <b>Hello! Welcome.</b> <tg-emoji emoji-id=\"5431376038628160877\">👑</tg-emoji>\n\nI am your automated bot that provides videos and movies. <tg-emoji emoji-id=\"5370835848520631631\">🎬</tg-emoji>\n\n<tg-emoji emoji-id=\"5406899432098627038\">👉</tg-emoji> <b>Please use a link from our main channel to access content through the bot.</b> <tg-emoji emoji-id=\"5370835848520631629\">💎</tg-emoji>",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language",
        subRequired: "<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> <b>You haven't joined our main channel yet!</b> <tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji>\n\nYou must join our channel first to get this video. <tg-emoji emoji-id=\"5427009714846171570\">🔒</tg-emoji>\n\n<tg-emoji emoji-id=\"5406899432098627038\">👇</tg-emoji> Click the button below to join the channel, then click <b>\"🔄 Check Subscription\"</b>.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Subscription",
        linkExpired: "<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> <b>Sorry, this link has expired or is invalid.</b>",
        warningText: "<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> <b>Attention:</b>\nThis content will automatically disappear from your chat in <b>30 minutes</b>! <tg-emoji emoji-id=\"5469731513291418723\">⏳</tg-emoji>",
        protectedNote: "\n\n<tg-emoji emoji-id=\"5427009714846171570\">🔒</tg-emoji> <i>(This content is protected against forwarding or downloading)</i>",
        clickBtnText: "<tg-emoji emoji-id=\"5431376038628160877\">🔓</tg-emoji> <b>Click the button below to get the content:</b> <tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji>",
        viewsCount: "📊 Total Views so far:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ How to get video? (Guide)",
        systemError: "<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> A system error occurred.",
        notSubbedAlert: "❌ You have not joined the channel yet!",
        subSuccess: "<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> Thank you! You can now access the content.",
        guideContent: "📖 <b>How to get content? (Steps)</b> <tg-emoji emoji-id=\"5431376038628160877\">💡</tg-emoji>\n\n1️⃣ First click the <b>\"▶ Watch Ad & Get Content\"</b> button. <tg-emoji emoji-id=\"5406899432098627038\">👉</tg-emoji>\n2️⃣ Click on the ad on the opened page and wait for 5 seconds. <tg-emoji emoji-id=\"5469731513291418723\">⏱️</tg-emoji>\n3️⃣ Once time is up, click the <b>\"🚀 Get Video\"</b> button that appears. <tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji>\n4️⃣ Then you will automatically be redirected to the bot to receive your content! <tg-emoji emoji-id=\"5370835848520631631\">🎬</tg-emoji>",
        supportMsg: "<tg-emoji emoji-id=\"5370835848520631629\">📞</tg-emoji> For inquiries, please contact our main channel.",
        langSelect: "🌐 <b>Please select your language / කරුණාකර ඔබේ භාෂාව තෝරන්න:</b> <tg-emoji emoji-id=\"5469731513291418723\">✨</tg-emoji>",
        
        // Mini App Dictionary (EN)
        appTitle: "Video is getting ready",
        appInstruction: "Click the button below, view the ad, and wait for <span class=\"text-sky-400 font-semibold\">5 seconds</span>.",
        appAdBtn: "🔗 Open Ad",
        appAdBtnWatching: "⏳ Watching Ad...",
        appAdBtnAgain: "🔗 Open Ad Again",
        appStatusWatching: "Watching ad...",
        appStatusWarning: "⚠️ Please watch the ad completely for 5 seconds!",
        appStatusWait: "Please wait a few seconds...",
        appSuccessMsg: "✔ Watching successful! You can now get the video.",
        appGetVideoBtn: "🚀 Get Video",
        
        // Age Verification EN
        ageTitle: "Age Verification Required",
        ageDesc: "This mini app contains adult content. You must be at least 18 years old to enter.",
        ageUnderBtn: "I am under 18",
        ageOverBtn: "I am 18 or older"
    }
};

// Helper to get user language safely
async function getUserLang(userId) {
    if (!userId) return 'si';
    try {
        const user = await UserModel.findOne({ userId: userId.toString() });
        return (user && user.language) ? user.language : 'si';
    } catch (e) {
        return 'si';
    }
}

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
      console.log('MongoDB Connected Successfully!');
      UserModel.updateMany({ status: { $exists: false } }, {$set: { status: 'active' } }).catch(() => {});
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schema for Files
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgId: { type: Number },      
    fileMsgIds: { type: [Number] },   
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    protectContent: { type: Boolean, default: false }
});

const FileModel = mongoose.model('File', fileSchema);

// Mongoose Schema for Users
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' },
    language: { type: String, default: 'si' }
});
const UserModel = mongoose.model('User', userSchema);

// Mongoose Schema for Settings
const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Boolean, default: false }
});
const SettingModel = mongoose.model('Setting', settingSchema);

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
        return true;
    }
}

// Bot Start & Handlers
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        await UserModel.updateOne(
            { userId: userIdStr }, 
            { $setOnInsert: { joinedAt: new Date() },$set: { status: 'active' } }, 
            { upsert: true }
        );
    } catch (err) {}

    const lang = await getUserLang(userId);
    const t = langs[lang];

    if (!payload) {
        return ctx.reply(t.welcome, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
                    [
                        { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
                        { text: t.supportBtn, callback_data: "support_info", style: "primary" }
                    ],
                    [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
                ]
            }
        });
    }

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.reply(t.subRequired, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: t.joinChannel, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
                    [{ text: t.checkSub, callback_data: `check_sub_${payload}`, style: "success" }]
                ]
            }
        });
    }

    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOneAndUpdate({ token }, { $inc: { views: 1 } }, { new: true });
            
            if (!fileDoc) {
                return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });
            }

            let msgIdsArray = fileDoc.fileMsgId ? [fileDoc.fileMsgId] : (fileDoc.fileMsgIds || []);
            const isProtected = fileDoc.protectContent === true;
            let sentVideoIds = [];

            for (let id of msgIdsArray) {
                try {
                    const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, id, { protect_content: isProtected });
                    sentVideoIds.push(sentMsg.message_id);
                    await new Promise(r => setTimeout(r, 400));
                } catch (e) {
                    console.error("Error copying message:", e.message);
                }
            }

            if (sentVideoIds.length === 0) {
                return ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> <b>සමාවන්න, මෙම වීඩියෝව Database එකෙන් මකා දමා ඇත හෝ ලබා ගත නොහැක.</b>", { parse_mode: 'HTML' });
            }

            let warningText = t.warningText + (isProtected ? t.protectedNote : "");
            const warningMsg = await ctx.reply(warningText, { parse_mode: 'HTML' });

            setTimeout(async () => {
                try {
                    for (let msgId of sentVideoIds) await ctx.telegram.deleteMessage(ctx.chat.id, msgId).catch(() => {});
                    await ctx.telegram.deleteMessage(ctx.chat.id, warningMsg.message_id).catch(() => {});
                } catch (e) {}
            }, 30 * 60 * 1000);
            return;
        }

        const fileDoc = await FileModel.findOneAndUpdate({ token: payload }, { $inc: { clicks: 1 } }, { new: true });
        if (!fileDoc) return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });

        const hostUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${hostUrl}/miniapp?token=${payload}&uid=${userId}`;

        await ctx.reply(
            `${t.clickBtnText}\n\n<tg-emoji emoji-id=\"5469731513291418723\">📊</tg-emoji> <b>නැරඹුම් වාර (Views):</b> <code>${fileDoc.views}</code>`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.watchAdText, web_app: { url: miniAppUrl }, style: "success" }],
                        [{ text: t.guideText, callback_data: "how_to_use", style: "primary" }]
                    ]
                }
            }
        );
    } catch (error) {
        console.error("Start command error:", error);
        ctx.reply(t.systemError, { parse_mode: 'HTML' });
    }
});

bot.action('how_to_use', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    await ctx.reply(langs[lang].guideContent, { parse_mode: 'HTML' });
});

bot.action('support_info', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    await ctx.answerCbQuery();
    await ctx.reply(langs[lang].supportMsg, { parse_mode: 'HTML' });
});

bot.action('change_language', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    await ctx.reply(langs[lang].langSelect, {
        parse_mode: 'HTML',
        reply_markup: { 
            inline_keyboard: [
                [
                    { text: "🇱🇰 සිංහල", callback_data: "set_lang_si", style: "success" }, 
                    { text: "🇬🇧 English", callback_data: "set_lang_en", style: "primary" }
                ]
            ] 
        }
    });
});

bot.action('set_lang_si', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'si' } }, { upsert: true });
    await ctx.answerCbQuery("සිංහල භාෂාව තෝරන ලදී.");
    await ctx.editMessageText("<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>භාෂාව සිංහල ලෙස වෙනස් කරන ලදී.</b>\n\nමූලික මෙනුව වෙත යාමට /start ටයිප් කරන්න.", { parse_mode: 'HTML' });
});

bot.action('set_lang_en', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'en' } }, { upsert: true });
    await ctx.answerCbQuery("Language set to English.");
    await ctx.editMessageText("<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>Language changed to English.</b>\n\nType /start to go to the main menu.", { parse_mode: 'HTML' });
});

// Express App setup for Render
const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/miniapp', async (req, res) => {
    const token = req.query.token || '';
    const userId = req.query.uid || '';
    
    try {
        const user = await UserModel.findOne({ userId: userId.toString() });
        const lang = (user && user.language) ? user.language : 'si';
        const t = langs[lang] || langs.si;

        const warningText = lang === 'en' 
            ? "❌ Please watch the ad properly for at least 5 seconds!" 
            : "❌ නිවැරදිව තත්පර 5ක් දැන්වීම නරඹන්න!";

        const instructionText = lang === 'en'
            ? "Please watch and complete both (02) ads below to get the video."
            : "වීඩියෝව ලබා ගැනීමට පහත දැක්වෙන දැන්වීම් **දෙක (02)** නරඹා සම්පූර්ණ කරන්න.";

        const totalUsers = await UserModel.countDocuments({});

        const allFiles = await FileModel.find({});
        let totalViews = 0;
        allFiles.forEach(file => {
            totalViews += file.views || 0;
        });

        const now = new Date();
        const sriLankaOffset = 5.5 * 60 * 60 * 1000;
        const slTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + sriLankaOffset);
        const currentHour = slTime.getHours();

        const AD_LINK_1 = process.env.AD_LINK_1 || "https://www.profitableratecpmnetwork.com/default1"; 
        const AD_LINK_2 = process.env.AD_LINK_2 || "https://www.profitableratecpmnetwork.com/default2"; 
        const AD_LINK_3 = process.env.AD_LINK_3 || "https://www.profitableratecpmnetwork.com/default3"; 

        let adLink1 = AD_LINK_1;
        let adLink2 = AD_LINK_2;

        if (currentHour >= 0 && currentHour < 8) {
            adLink1 = AD_LINK_1;
            adLink2 = AD_LINK_2;
        } else if (currentHour >= 8 && currentHour < 16) {
            adLink1 = AD_LINK_2;
            adLink2 = AD_LINK_3;
        } else {
            adLink1 = AD_LINK_3;
            adLink2 = AD_LINK_1;
        }

        res.send(`
            <!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Unlocker</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px rgba(14, 165, 233, 0.3); }
            50% { box-shadow: 0 0 30px rgba(14, 165, 233, 0.6); }
        }
        .glow-effect { animation: pulse-glow 2s infinite; }
        
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner-ring { animation: spin-slow 1.5s linear infinite; }

        @keyframes success-glow {
            0%, 100% { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
            50% { border-color: rgba(16, 185, 129, 0.8); box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
        }
        .success-card { animation: success-glow 2s infinite; }
    </style>
</head>
<body class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-5 select-none font-sans">
    
    <div id="age-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md hidden">
        <div class="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-7 text-center shadow-2xl relative overflow-hidden">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-2xl font-black shadow-inner">
                18+
            </div>
            <h2 class="text-xl font-extrabold text-slate-100 mb-2">${t.ageTitle}</h2>
            <p class="text-slate-400 text-xs mb-6 leading-relaxed">
                ${t.ageDesc}
            </p>
            <div class="flex flex-col gap-3">
                <button
                    onclick="handleAgeVerify(true)"
                    class="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-rose-900/30 text-sm"
                >
                    ${t.ageOverBtn}
                </button>
                <button
                    onclick="handleAgeVerify(false)"
                    class="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition-all text-sm"
                >
                    ${t.ageUnderBtn}
                </button>
            </div>
        </div>
    </div>

    <div id="main-card" class="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-7 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden transition-all duration-500">
        
        <div class="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>

        <div id="warning-banner" class="hidden mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-semibold animate-pulse">
            ${warningText}
        </div>

        <div class="flex items-center justify-center gap-2 mb-5">
            <div id="step-1-dot" class="flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/30">1</div>
            <div class="w-6 h-0.5 bg-slate-700"></div>
            <div id="step-2-dot" class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">2</div>
            <div class="w-6 h-0.5 bg-slate-700"></div>
            <div id="step-3-dot" class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">3</div>
        </div>

        <div class="inline-flex items-center justify-center w-16 h-16 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-3xl mb-4 shadow-inner relative">
            🎬
            <div class="absolute inset-0 border-2 border-sky-400/40 rounded-2xl spinner-ring pointer-events-none"></div>
        </div>
        
        <h1 class="text-xl font-extrabold tracking-tight mb-2 text-slate-100">${t.appTitle}</h1>
        <p id="instruction-text" class="text-slate-400 text-xs mb-6 leading-relaxed">
            ${instructionText}
        </p>

        <div class="mb-3" id="ad-box-1">
            <a href="${adLink1}" target="_blank" id="ad-btn-1" onclick="openAd(1)" class="glow-effect flex items-center justify-between w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg text-sm">
                <span>⭐ Watch Ad 1</span>
                <span id="ad-status-1" class="text-xs bg-white/20 px-2.5 py-1 rounded-xl">Pending</span>
            </a>
        </div>

        <div class="mb-5" id="ad-box-2">
            <a href="${adLink2}" target="_blank" id="ad-btn-2" onclick="openAd(2)" class="flex items-center justify-between w-full bg-slate-800 text-slate-500 font-bold py-3.5 px-4 rounded-2xl transition-all text-sm pointer-events-none border border-slate-700/50">
                <span>⭐ Watch Ad 2</span>
                <span id="ad-status-2" class="text-xs bg-slate-700 px-2.5 py-1 rounded-xl text-slate-400">Locked</span>
            </a>
        </div>

        <div id="timer-box" class="my-5 hidden">
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center bg-slate-800/80 border border-sky-500/30 rounded-full mb-3 shadow-inner">
                <div id="countdown" class="text-3xl font-black text-sky-400">5</div>
            </div>
            <p id="status-text" class="text-xs text-slate-400 font-medium">${t.appStatusWait || "Connecting..."}</p>
            
            <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div id="progress-bar" class="bg-sky-500 h-full w-full transition-all duration-1000"></div>
            </div>
        </div>

        <div id="success-box" class="hidden">
            <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
                <p class="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    ${t.appSuccessMsg}
                </p>
            </div>
            <button onclick="getVideo()" id="unlock-btn" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/30 text-sm">
                ${t.appGetVideoBtn}
            </button>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-around text-center">
            <div>
                <p class="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Users</p>
                <p class="text-sm font-extrabold text-sky-400 mt-0.5">👥 ${totalUsers.toLocaleString()}</p>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div>
                <p class="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Views</p>
                <p class="text-sm font-extrabold text-emerald-400 mt-0.5">👁 ${totalViews.toLocaleString()}</p>
            </div>
        </div>

    </div>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            const isVerified = localStorage.getItem('age_verified');
            if (isVerified !== 'true') {
                document.getElementById('age-modal').classList.remove('hidden');
            }
        });

        function handleAgeVerify(allowed) {
            if (allowed) {
                localStorage.setItem('age_verified', 'true');
                document.getElementById('age-modal').classList.add('hidden');
            } else {
                alert('You must be 18 or older to access this content.');
                if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.close();
                } else {
                    window.location.href = 'https://t.me';
                }
            }
        }

        let currentActiveAd = 0;
        let leaveTime = 0;
        let ad1Completed = false;
        let ad2Completed = false;
        let finalTimerStarted = false;

        function openAd(adNumber) {
            if (adNumber === 2 && !ad1Completed) return;
            currentActiveAd = adNumber;
            leaveTime = Date.now();
            
            document.getElementById('warning-banner').classList.add('hidden');

            const btn = document.getElementById('ad-btn-' + adNumber);
            const status = document.getElementById('ad-status-' + adNumber);

            btn.className = "flex items-center justify-between w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg text-sm";
            status.innerHTML = '<span class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span> Checking...';
        }

        document.addEventListener('visibilitychange', () => {
            if (currentActiveAd === 0) return;

            if (document.hidden) {
                leaveTime = Date.now();
            } else {
                const timeSpent = (Date.now() - leaveTime) / 1000;
                const adNum = currentActiveAd;
                currentActiveAd = 0;

                const btn = document.getElementById('ad-btn-' + adNum);
                const status = document.getElementById('ad-status-' + adNum);
                const warningBanner = document.getElementById('warning-banner');

                if (timeSpent < 5) {
                    warningBanner.classList.remove('hidden');
                    btn.className = "glow-effect flex items-center justify-between w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg text-sm";
                    status.innerText = "❌ Failed";
                    status.className = "text-xs bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-xl";
                } else {
                    warningBanner.classList.add('hidden');
                    btn.className = "flex items-center justify-between w-full bg-slate-800 text-emerald-400 font-bold py-3.5 px-4 rounded-2xl text-sm border border-emerald-500/30 pointer-events-none";
                    status.innerText = "✓ Verified";
                    status.className = "text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl";

                    if (adNum === 1) {
                        ad1Completed = true;
                        document.getElementById('step-1-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold";
                        document.getElementById('step-2-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/30";

                        const ad2Btn = document.getElementById('ad-btn-2');
                        ad2Btn.className = "glow-effect flex items-center justify-between w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg text-sm";
                        document.getElementById('ad-status-2').innerText = "Pending";
                        document.getElementById('ad-status-2').className = "text-xs bg-white/20 px-2.5 py-1 rounded-xl";
                    } else if (adNum === 2) {
                        ad2Completed = true;
                        document.getElementById('step-2-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold";
                        document.getElementById('step-3-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/30";

                        document.getElementById('ad-box-1').style.display = 'none';
                        document.getElementById('ad-box-2').style.display = 'none';
                        
                        startFinalCountdown();
                    }
                }
            }
        });

        function startFinalCountdown() {
            if (finalTimerStarted) return;
            finalTimerStarted = true;

            let timeLeft = 5;
            const timerBox = document.getElementById('timer-box');
            const countdownEl = document.getElementById('countdown');
            const successBox = document.getElementById('success-box');
            const statusText = document.getElementById('status-text');
            const progressBar = document.getElementById('progress-bar');
            const mainCard = document.getElementById('main-card');

            timerBox.classList.remove('hidden');
            statusText.innerText = "${t.appStatusWait || 'Connecting...'}";

            const timer = setInterval(() => {
                timeLeft--;
                countdownEl.innerText = timeLeft;
                progressBar.style.width = (timeLeft / 5) * 100 + "%";

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timerBox.classList.add('hidden');
                    successBox.classList.remove('hidden');
                    mainCard.classList.add('success-card');
                }
            }, 1000);
        }

        function getVideo() {
            const botUsername = "${process.env.BOT_USERNAME || 'wallokaya_bot'}";
            const telegramUrl = "https://t.me/" + botUsername + "?start=getvideo_" + "${token}";
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.openTelegramLink(telegramUrl);
                
                setTimeout(() => {
                    window.Telegram.WebApp.close();
                }, 400);
            } else {
                window.location.href = telegramUrl;
            }
        }
    </script>
</body>
</html>
        `);
    } catch (err) {
        console.error("MiniApp Error:", err);
        res.send(`<!DOCTYPE html><html><body style="background:#09090b;color:white;text-align:center;padding-top:50px;"><h2>System Error. Please try again.</h2></body></html>`);
    }
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

bot.use(async (ctx, next) => {
    try {
        const setting = await SettingModel.findOne({ key: 'maintenance_mode' });
        if (setting && setting.value === true) {
            const userId = ctx.from ? ctx.from.id.toString() : '';
            const ADMIN_ID = process.env.ADMIN_ID;
            
            if (ADMIN_ID && userId === ADMIN_ID) {
                return next();
            }

            if (ctx.callbackQuery) {
                return ctx.answerCbQuery("🛠️ Bot is under maintenance!", { show_alert: true });
            }
            return ctx.reply("<tg-emoji emoji-id=\"5368324170671202869\">🛠️</tg-emoji> <b>බොට් නඩත්තු කටයුතු සිදු කරමින් පවතී!</b>\n\nකරුණාකර මද වේලාවකින් නැවත උත්සාහ කරන්න.", { parse_mode: 'HTML' });
        }
    } catch (err) {
        console.error("Maintenance check error:", err);
    }
    return next();
});

bot.command('maintenance', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.", { parse_mode: 'HTML' });
    }

    try {
        let setting = await SettingModel.findOne({ key: 'maintenance_mode' });
        if (!setting) {
            setting = await SettingModel.create({ key: 'maintenance_mode', value: true });
        } else {
            setting.value = !setting.value;
            await setting.save();
        }

        const statusText = setting.value ? "<tg-emoji emoji-id=\"5370835848520631628\">🔴</tg-emoji> <b>සක්‍රීය කරන ලදී (Enabled)</b>" : "<tg-emoji emoji-id=\"5427009714846171570\">🟢</tg-emoji> <b>අක්‍රීය කරන ලදී (Disabled)</b>";
        await ctx.reply(`🛠 <b>Maintenance Mode Status:</b>\n\n${statusText}`, { parse_mode: 'HTML' });
    } catch (error) {
        console.error("Maintenance toggle error:", error);
        await ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> දෝෂයක් ඇති විය.", { parse_mode: 'HTML' });
    }
});

// Language Command
bot.command('language', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];

    await ctx.reply(t.langSelect, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🇱🇰 සිංහල", callback_data: "set_lang_si", style: "success" },
                    { text: "🇬🇧 English", callback_data: "set_lang_en", style: "primary" }
                ]
            ]
        }
    });
});

bot.action('set_lang_si', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'si' } }, { upsert: true });
    await ctx.answerCbQuery("සිංහල භාෂාව තෝරන ලදී.");
    await ctx.editMessageText("<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>භාෂාව සිංහල ලෙස වෙනස් කරන ලදී.</b>\n\nමූලික මෙනුව වෙත යාමට /start ටයිප් කරන්න.", { parse_mode: 'HTML' });
});

bot.action('set_lang_en', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'en' } }, { upsert: true });
    await ctx.answerCbQuery("Language set to English.");
    await ctx.editMessageText("<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>Language changed to English.</b>\n\nType /start to go to the main menu.", { parse_mode: 'HTML' });
});

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        await UserModel.updateOne(
            { userId: userIdStr }, 
            { $setOnInsert: { joinedAt: new Date() },$set: { status: 'active' } }, 
            { upsert: true }
        );
    } catch (err) {
        console.error("User save error:", err);
    }

    const lang = await getUserLang(userId);
    const t = langs[lang];

    if (!payload) {
        return ctx.reply(
            t.welcome,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
                        [
                            { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
                            { text: t.supportBtn, callback_data: "support_info", style: "primary" }
                        ],
                        [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
                    ]
                }
            }
        );
    }

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.reply(
            t.subRequired,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.joinChannel, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
                        [{ text: t.checkSub, callback_data: `check_sub_${payload}`, style: "success" }]
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
                return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });
            }

            let sentVideoIds = [];
            let msgIdsArray = [];
            if (fileDoc.fileMsgId) {
                msgIdsArray = [fileDoc.fileMsgId];
            } else if (fileDoc.fileMsgIds && Array.isArray(fileDoc.fileMsgIds)) {
                msgIdsArray = fileDoc.fileMsgIds;
            }

            const isProtected = fileDoc.protectContent === true;

            for (let i = 0; i < msgIdsArray.length; i++) {
                try {
                    const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, msgIdsArray[i], {
                        protect_content: isProtected
                    });
                    sentVideoIds.push(sentMsg.message_id);
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (copyErr) {
                    console.error(`Copy Message Error for ID ${msgIdsArray[i]}:`, copyErr.message);
                    return ctx.reply(`⚠ Error: ${copyErr.message}`);
                }
            }

            let warningText = t.warningText;
            if (isProtected) {
                warningText += t.protectedNote;
            }

            const warningMsg = await ctx.reply(warningText, { parse_mode: 'HTML' });

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

        const fileDoc = await FileModel.findOneAndUpdate(
            { token: payload }, 
            { $inc: { clicks: 1 } }, 
            { new: true }
        );

        if (!fileDoc) {
            return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}&uid=${userId}`;

        await ctx.reply(
            `${t.clickBtnText}\n\n` +
            `<tg-emoji emoji-id=\"5469731513291418723\">📊</tg-emoji> <b>නැරඹුම් වාර (Views):</b> <code>${fileDoc.views}</code>\n\n` +
            (lang === 'si' ? "<tg-emoji emoji-id=\"5406899432098627038\">👉</tg-emoji> මෙම බොත්තම එබූ විට විවෘත වන පිටුවෙන් දැන්වීම බලා තත්පර 5ක් රැඳී සිට අන්තර්ගතය ලබා ගන්න." : "Click the button below, view the ad on the page, wait 5 seconds, and get your content."),
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.watchAdText, web_app: { url: miniAppUrl }, style: "success" }],
                        [{ text: t.guideText, callback_data: "how_to_use", style: "primary" }]
                    ]
                }
            }
        );

    } catch (error) {
        console.error(error);
        ctx.reply(t.systemError, { parse_mode: 'HTML' });
    }
});

// Admin Stats Command
bot.command('stats', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.", { parse_mode: 'HTML' });
    }

    try {
        const totalUsers = await UserModel.countDocuments({});
        const activeUsers = await UserModel.countDocuments({ status: 'active' });
        const blockedUsers = await UserModel.countDocuments({ status: 'blocked' });

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
            `<tg-emoji emoji-id=\"5469731513291418723\">📊</tg-emoji> <b>බොට් හි සංඛ්‍යාලේඛන (Analytics Dashboard)</b> <tg-emoji emoji-id=\"5431376038628160877\">📈</tg-emoji>\n\n` +
            `<tg-emoji emoji-id=\"5370835848520631629\">👥</tg-emoji> මුළු යුසර්ස්ලා (Total Users): <code>${totalUsers}</code>\n` +
            `<tg-emoji emoji-id=\"5427009714846171570\">🟢</tg-emoji> සක්‍රීය පරිශීලකයන් (Active): <code>${activeUsers}</code>\n` +
            `<tg-emoji emoji-id=\"5370835848520631628\">🔴</tg-emoji> බ්ලොක් කළ අය (Blocked): <code>${blockedUsers}</code>\n` +
            `<tg-emoji emoji-id=\"5469731513291418723\">📅</tg-emoji> මෙම මාසයේ අලුත් යුසර්ස්ලා: <code>${monthlyUsers}</code>\n` +
            `<tg-emoji emoji-id=\"5370835848520631631\">📁</tg-emoji> ගබඩා කර ඇති අන්තර්ගතයන්: <code>${totalFiles}</code>\n` +
            `<tg-emoji emoji-id=\"5406899432098627038\">🔗</tg-emoji> මුළු ලින්ක් ක්ලික්ස් (Total Clicks): <code>${totalClicks}</code>\n` +
            `<tg-emoji emoji-id=\"5370835848520631627\">👁️</tg-emoji> මුළු නැරඹුම් (Total Views): <code>${totalViews}</code>\n` +
            `<tg-emoji emoji-id=\"5431376038628160877\">📈</tg-emoji> ඇඩ් සාර්ථකත්ව අනුපාතය (Conversion): <code>${conversionRate}%</code>`,
            { parse_mode: 'HTML' }
        );

    } catch (error) {
        console.error("Stats error:", error);
        await ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> සංඛ්‍යාලේඛන ලබාගැනීමේදී දෝෂයක් ඇති විය.", { parse_mode: 'HTML' });
    }
});

// Admin Broadcast Command (Optimized & Non-Blocking)
bot.command('broadcast', async (ctx) => {
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    const repliedMessage = ctx.message.reply_to_message;
    if (!repliedMessage) {
        return ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> කරුණාකර ඔබ බ්‍රෝඩ්කාස්ට් කිරීමට අවශ්‍ය පෝස්ට් එකට <b>Reply</b> කර <code>/broadcast</code> ලෙස යවන්න.", { parse_mode: 'HTML' });
    }

    await ctx.reply("<tg-emoji emoji-id=\"5370835848520631627\">🚀</tg-emoji> <b>පෝස්ට් බ්‍රෝඩ්කාස්ට් කිරීම ආරම්භ කරන ලදී... කරුණාකර රැඳී සිටින්න.</b>", { parse_mode: 'HTML' });

    setImmediate(async () => {
        try {
            const users = await UserModel.find({ status: { $ne: 'blocked' } });
            let successCount = 0;
            let blockedCount = 0;
            let failedCount = 0;

            for (const user of users) {
                try {
                    await ctx.telegram.copyMessage(user.userId, ctx.chat.id, repliedMessage.message_id);
                    successCount++;

                    if (user.status !== 'active') {
                        await UserModel.updateOne({ userId: user.userId }, { status: 'active' });
                    }
                } catch (error) {
                    if (error.response && error.response.error_code === 403) {
                        blockedCount++;
                        await UserModel.updateOne({ userId: user.userId }, { status: 'blocked' });
                    } else if (error.response && error.response.error_code === 429) {
                        const retryAfter = error.response.parameters?.retry_after || 5;
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                        failedCount++;
                    } else {
                        failedCount++;
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 70));
            }

            await ctx.reply(
                `<tg-emoji emoji-id=\"5469731513291418723\">📊</tg-emoji> <b>පෝස්ට් බ්‍රෝඩ්කාස්ට් වාර්තාව:</b>\n\n` +
                `<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> සාර්ථකයි (Active): <code>${successCount}</code>\n` +
                `<tg-emoji emoji-id=\"5370835848520631628\">🔴</tg-emoji> බ්ලොක් කර ඇත (Blocked): <code>${blockedCount}</code>\n` +
                `<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> අනෙකුත් දෝෂ: <code>${failedCount}</code>`,
                { parse_mode: 'HTML' }
            );
        } catch (err) {
            console.error("Broadcast Execution Error:", err);
            await ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> බ්‍රෝඩ්කාස්ට් කිරීමේදී දෝෂයක් ඇති විය.", { parse_mode: 'HTML' });
        }
    });
});

// Check Subscription Action
bot.action(/^check_sub_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const payload = ctx.match[1];
    const lang = await getUserLang(userId);
    const t = langs[lang];

    const isSubscribed = await checkUserSubscription(ctx, userId);
    if (!isSubscribed) {
        return ctx.answerCbQuery(t.notSubbedAlert, { show_alert: true });
    }

    await ctx.answerCbQuery(t.subSuccess);
    
    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOneAndUpdate(
                { token: token }, 
                { $inc: { views: 1 } }, 
                { new: true }
            );

            if (!fileDoc) {
                return ctx.editMessageText(t.linkExpired, { parse_mode: 'HTML' });
            }

            await ctx.deleteMessage();

            let sentVideoIds = [];
            let msgIdsArray = [];
            if (fileDoc.fileMsgId) {
                msgIdsArray = [fileDoc.fileMsgId];
            } else if (fileDoc.fileMsgIds && Array.isArray(fileDoc.fileMsgIds)) {
                msgIdsArray = fileDoc.fileMsgIds;
            }

            const isProtected = fileDoc.protectContent === true;

            for (let i = 0; i < msgIdsArray.length; i++) {
                try {
                    const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, msgIdsArray[i], {
                        protect_content: isProtected
                    });
                    sentVideoIds.push(sentMsg.message_id);
                    await new Promise(resolve => setTimeout(resolve, 400));
                } catch (copyErr) {
                    console.error(`Copy Message Error for ID ${msgIdsArray[i]}:`, copyErr.message);
                }
            }

            let warningText = t.warningText;
            if (isProtected) {
                warningText += t.protectedNote;
            }

            const warningMsg = await ctx.reply(warningText, { parse_mode: 'HTML' });

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
            return ctx.editMessageText(t.linkExpired, { parse_mode: 'HTML' });
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}&uid=${userId}`;

        await ctx.editMessageText(
            `${t.clickBtnText}\n\n<tg-emoji emoji-id=\"5469731513291418723\">📊</tg-emoji> <b>නැරඹුම් වාර (Views):</b> <code>${fileDoc.views}</code>`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.watchAdText, web_app: { url: miniAppUrl }, style: "success" }],
                        [{ text: t.guideText, callback_data: "how_to_use", style: "primary" }]
                    ]
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
});

bot.action('change_language', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];

    await ctx.reply(t.langSelect, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🇱🇰 සිංහල", callback_data: "set_lang_si", style: "success" },
                    { text: "🇬🇧 English", callback_data: "set_lang_en", style: "primary" }
                ]
            ]
        }
    });
});

bot.action('how_to_use', async (ctx) => {
    try {
        await ctx.answerCbQuery();
        const userId = ctx.from.id.toString();
        const lang = await getUserLang(userId);
        const t = langs[lang];

        await ctx.reply(t.guideContent, { parse_mode: 'HTML' });
    } catch (error) {
        console.error(error);
    }
});

bot.action('support_info', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];
    await ctx.answerCbQuery();
    await ctx.reply(t.supportMsg, { parse_mode: 'HTML' });
});

// --- Upload Workflow Actions & Cancel Feature ---

const pendingUploads = new Map();

// Cancel Command
bot.command('cancel', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> දැනට ක්‍රියාත්මක වන අප්‌ලෝඩ් කිරීමක් හෝ සකස් කිරීමක් නොමැත.", { parse_mode: 'HTML' });
    }

    pendingUploads.delete(userId);
    await ctx.reply("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> <b>අප්‌ලෝඩ් කිරීම සාර්ථකව අවලංගු (Cancel) කරන ලදී. සියලු දත්ත මකා දමන ලදී.</b>", { parse_mode: 'HTML' });
});

// Cancel Action Button
bot.action('cancel_upload', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    
    if (pending) {
        pendingUploads.delete(userId);
        await ctx.answerCbQuery("අප්‌ලෝඩ් කිරීම අවලංගු කරන ලදී.");
        await ctx.editMessageText("<tg-emoji emoji-id=\"5370835848520631628\">❌</tg-emoji> <b>අප්‌ලෝඩ් කිරීම සාර්ථකව අවලංගු (Cancel) කරන ලදී.</b>", { parse_mode: 'HTML' });
    } else {
        await ctx.answerCbQuery("ක්‍රියාකාරී අප්‌ලෝඩ් එකක් හමු නොවීය.");
    }
});

bot.action('toggle_spoiler_yes', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.hasSpoiler = true;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔒 Thumbnail එක Blur කිරීමට සකසන ලදී.");
    await promptProtectContent(ctx);
});

bot.action('toggle_spoiler_no', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.hasSpoiler = false;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔓 Thumbnail එක Blur නොකිරීමට සකසන ලදී.");
    await promptProtectContent(ctx);
});

async function promptProtectContent(ctx) {
    await ctx.editMessageText(
        "<tg-emoji emoji-id=\"5427009714846171570\">🛡️</tg-emoji> <b>Protect Content (Download / Forward Restriction):</b>\n\n" +
        "මෙම අන්තර්ගතය යූසර්ස්ලාට <b>Forward සහ Download කිරීමට නොහැකි වන සේ</b> ආරක්ෂා (Block) කරන්න ඕනේද?",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 ඔව් (Yes)", callback_data: "toggle_protect_yes", style: "success" },
                        { text: "🔓 නැහැ (No)", callback_data: "toggle_protect_no", style: "primary" }
                    ],
                    [{ text: "❌ අප්‌ලෝඩ් එක Cancel කරන්න", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
}

bot.action('toggle_protect_yes', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.protectContent = true;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔒 Forward & Download බ්ලොක් කිරීමට සකසන ලදී.");
    await ctx.editMessageText(
        "<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>සැකසීම් සාර්ථකයි!</b>\n\n" +
        "🔒 Blur Mode: <code>ON</code>\n" +
        "🛡️ Protect Content: <code>ON (Block)</code>\n\n" +
        "දැන් අදාළ වීඩියෝව, ඡායාරූපය හෝ ලේඛනය එවන්න. අවසන් වූ පසු <code>/done</code> ටයිප් කරන්න, නැතහොත් අවලංගු කිරීමට /cancel භාවිතා කරන්න.",
        { parse_mode: 'HTML' }
    );
});

bot.action('toggle_protect_no', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.protectContent = false;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔓 Forward & Download කිරීමට ඉඩ හරින ලදී.");
    await ctx.editMessageText(
        "<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>සැකසීම් සාර්ථකයි!</b>\n\n" +
        "🔒 Blur Mode: <code>ස්ථාපිතයි</code>\n" +
        "🛡️ Protect Content: <code>OFF (Allow)</code>\n\n" +
        "දැන් අදාළ වීඩියෝව, ඡායාරූපය හෝ ලේඛනය එවන්න. අවසන් වූ පසු <code>/done</code> ටයිප් කරන්න, නැතහොත් අවලංගු කිරීමට /cancel භාවිතා කරන්න.",
        { parse_mode: 'HTML' }
    );
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (pending && pending.photoFileId && pending.hasSpoiler !== undefined) {
        try {
            const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
            pending.videoMsgIds.push(forwarded.message_id);
            pendingUploads.set(userId, pending);

            await ctx.reply(
                `<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> ඡායාරූපය එකතු විය! (මුළු ගණන: <code>${pending.videoMsgIds.length}</code>). තවත් ඇත්නම් එවන්න, නැතහොත් /done ටයිප් කරන්න.`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "❌ අප්‌ලෝඩ් එක Cancel කරන්න", callback_data: "cancel_upload", style: "danger" }]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
        return;
    }

    const photo = ctx.message.photo;
    const largestPhoto = photo[photo.length - 1].file_id;

    pendingUploads.set(userId, {
        photoFileId: largestPhoto,
        caption: "",
        videoMsgIds: [],
        hasSpoiler: true,
        protectContent: false
    });

    await ctx.reply(
        "<tg-emoji emoji-id=\"5370835848520631631\">📸</tg-emoji> <b>Thumbnail එක ලැබුණා!</b>\n\n" +
        "දැන් තෝරන්න මේකේ Thumbnail එක <b>Blur (Spoiler)</b> කරන්න ඕනේද නැද්ද කියලා:",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 Blur කරන්න", callback_data: "toggle_spoiler_yes", style: "success" },
                        { text: "🔓 එපා", callback_data: "toggle_spoiler_no", style: "primary" }
                    ],
                    [{ text: "❌ සම්පූර්ණයෙන්ම Cancel කරන්න", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
});

bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ADMIN_ID && userId !== ADMIN_ID) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> මුලින්ම Thumbnail එකක් එවන්න.", { parse_mode: 'HTML' });
    }

    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
        pending.videoMsgIds.push(forwarded.message_id);
        pendingUploads.set(userId, pending);

        await ctx.reply(
            `<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> අන්තර්ගතය එකතු විය! (මුළු ගණන: <code>${pending.videoMsgIds.length}</code>). තවත් ඇත්නම් එවන්න, නැතහොත් <code>/done</code> ටයිප් කරන්න.`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "❌ අප්‌ලෝඩ් එක Cancel කරන්න", callback_data: "cancel_upload", style: "danger" }]
                    ]
                }
            }
        );
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
        return ctx.reply("<tg-emoji emoji-id=\"5368324170671202869\">⚠️</tg-emoji> කරුණාකර මුලින්ම Thumbnail එකක් සහ අන්තර්ගතයක් (වීඩියෝ/ፎටෝ) එකක් හෝ කිහිපයක් එවන්න.", { parse_mode: 'HTML' });
    }

    try {
        const token = Math.random().toString(36).substring(2, 10);

        await FileModel.create({
            token: token,
            fileMsgIds: pending.videoMsgIds,
            views: 0,
            clicks: 0,
            protectContent: pending.protectContent
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        await ctx.reply(`<tg-emoji emoji-id=\"5427009714846171570\">✅</tg-emoji> <b>සාර්ථකව ගබඩා විය!</b> (ගොනු ගණන: <code>${pending.videoMsgIds.length}</code>)\n\n<tg-emoji emoji-id=\"5370835848520631627\">🚀</tg-emoji> ප්‍රධාන චැනල් එකට පෝස්ට් යවන ලදී!`, { parse_mode: 'HTML' });

        const buttonText = pending.videoMsgIds.length > 1 ? "▶️ View Full Collection" : "▶️ View Content";
        const headerText = pending.videoMsgIds.length > 1 
            ? "<tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji> <b>දැන් නිකුත් වූ විශේෂ කලෙක්ෂන් එක!</b> <tg-emoji emoji-id=\"5431376038628160877\">🔥</tg-emoji>" 
            : "<tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji> <b>දැන් නිකුත් වූ විශේෂ අන්තර්ගතය!</b> <tg-emoji emoji-id=\"5370835848520631627\">🔥</tg-emoji>";

        await ctx.telegram.sendPhoto(MAIN_CHANNEL_ID, pending.photoFileId, {
            caption: `${headerText}\n\n` +
                     `<tg-emoji emoji-id=\"5469731513291418723\">✨</tg-emoji> <b>${pending.caption}</b>\n\n` +
                     `<tg-emoji emoji-id=\"5370835848520631631\">📁</tg-emoji> <b>අන්තර්ගතය:</b> ගොනු <code>${pending.videoMsgIds.length}</code> ක් ඇතුළත් වේ.\n\n` +
                     `<tg-emoji emoji-id=\"5406899432098627038\">👇</tg-emoji> <b>නරඹන්න පහත බොත්තම ක්ලික් කරන්න:</b>`,
            parse_mode: 'HTML',
            has_spoiler: pending.hasSpoiler,
            reply_markup: {
                inline_keyboard: [
                    [{ text: buttonText, url: shareLink, style: "success" }],
                    [{ text: "📢 Join Backup Channel", url: `https://t.me/+bCed3QPGYqQ3MWY9`, style: "primary" }]
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
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    try {
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Start the bot / බොට් ආරම්භ කරන්න' },
            { command: 'language', description: 'Change language / භාෂාව මාරු කරන්න' },
            { command: 'cancel', description: 'Cancel current upload / අප්‌ලෝඩ් කිරීම අවලංගු කරන්න' },
            { command: 'stats', description: 'Bot Statistics (Admin only)' },
            { command: 'maintenance', description: 'Toggle Maintenance (Admin only)' }
        ]);
        console.log("Bot commands menu set successfully!");
    } catch (err) {
        console.error("Failed to set bot commands:", err);
    }

    bot.launch();
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
