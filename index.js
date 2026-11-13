const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MAIN_CHANNEL_ID = process.env.MAIN_CHANNEL_ID || "@wal_lokaya1"; 
const VIP_CHANNEL_ID = process.env.VIP_CHANNEL_ID || "-100XXXXXXXXXX"; 
const CHAT_GROUP_ID = process.env.CHAT_GROUP_ID; 
const MONGO_URI = process.env.MONGO_URI;

const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL || "@wal_lokaya1"; 
const CHAT_GROUP_LINK = 'https://t.me/wallokaya_chat';
const VIP_CHANNEL_LINK = 'https://t.me/+PXUGCtdmWoQ4OGE1'; // VIP Channel Link

const SUB_ADMINS = process.env.SUB_ADMINS ? process.env.SUB_ADMINS.split(',') : [];

// --- Language Dictionary ---
const langs = {
    si: {
        welcome: "✨ <b>𝐖𝐀𝐋 𝐋𝐎𝐊𝐀𝐘𝐀 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋</b> 👑\n━━━━━━━━━━━━━━━━━━━━\n\n👋 <b>ආයුබෝවන්! සාදරයෙන් පිළිගනිමු.</b>\n\nමම ඔබේ වීඩියෝ ලබා දෙන ස්වයංක්‍රීය බොට් එකයි. 🎬\n\n👉 <b>වීඩියෝ ලබා ගැනීමට අපේ ප්‍රධාන චැනල් එකේ ඇති ලින්ක් එකක් භාවිතා කර බොට් වෙත පැමිණෙන්න.</b> 💎\n\n━━━━━━━━━━━━━━━━━━━━\n📊 <b>පද්ධති තත්ත්වය:</b> 🟢 <i>Online & Active</i>\n⚡ <b>වේගය:</b> <i>Ultra Fast</i>",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language / භාෂාව",
        backBtn: "⬅️ Back to Menu",
        subRequired: "⚠️ <b>අවධානයයි! වීඩියෝව ලබා ගැනීමට පහත පියවර සම්පූර්ණ කරන්න.</b>\n━━━━━━━━━━━━━━━━━━━━\n\nවීඩියෝව ඩවුන්ලෝඩ් කර ගැනීමට නම් ඔබ අපගේ ප්‍රධාන චැනල් එකේ සහ චැට් ගෲප් එකේ සාමාජිකයෙකු විය යුතුය.\n\n👇 පහත බොත්තම් භාවිතයෙන් Join වී <b>\"🔄 නැවත Verify කරන්න\"</b> ක්ලික් කරන්න.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Subscription",
        linkExpired: "❌ <b>සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.</b>",
        warningText: "━━━━━━━━━━━━━━━━━━━━\n⚠️ <b>අවධානයට:</b>\n━━━━━━━━━━━━━━━━━━━━\nමෙම අන්තර්ගතය ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත! ⏳",
        protectedNote: "\n\n🔒 <i>(මෙම අන්තර්ගතය ෆෝවර්ඩ් කිරීමට හෝ ඩවුන්ලෝඩ් කිරීමට නොහැකි වේ.)</i>",
        vipPromoSi: "\n\n⭐ <b>ඔබට මේ වගේ වීඩියෝ save කරගන්න අවශ්‍ය නම් අපේ VIP membership එක ලබාගන්න. Lifetime access තියෙනවා.</b>",
        getVipBtn: "⭐ Get VIP Access",
        clickBtnText: "━━━━━━━━━━━━━━━━━━━━\n🔓 <b>රෙඩි ටු අන්ලොක් (READY TO UNLOCK)</b>\n━━━━━━━━━━━━━━━━━━━━\n\nඅන්තර්ගතය ලබා ගැනීමට පහත බොත්තම ඔබන්න: 🔥",
        viewsCount: "📊 මෙතෙක් නැරඹුම් වාර:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ How to Get Video? (Guide)",
        systemError: "❌ පද්ධතියේ දෝෂයක් සිදු විය.",
        notSubbedAlert: "❌ ඔබ අවශ්‍ය සියලුම නාලිකා/ගෲප් සඳහා Join වී නැත!",
        subSuccess: "✅ ස්තූතියි! දැන් ඔබට අන්තර්ගතය ලබාගත හැක.",
        guideContent: "━━━━━━━━━━━━━━━━━━━━\n📖 <b>වීඩියෝ ලබාගන්නා ආකාරය (GUIDE)</b> 💡\n━━━━━━━━━━━━━━━━━━━━\n\n1️⃣ මුලින්ම <b>\"▶️ Watch Ad & Get Content\"</b> බොත්තම ඔබන්න. 👉\n2️⃣ විවෘත වන පිටුවේ ඇති දැන්වීම මත ක්ලික් කර තත්පර 5ක් රැඳී සිටින්න. ⏱️\n3️⃣ කාලය අවසන් වූ පසු මතුවන <b>\"🚀 Get Video\"</b> බොත්තම ඔබන්න. 🔥\n4️⃣ එවිට ස්වයංක්‍රීයව බොට් වෙත පැමිණ ඔබට අවශ්‍ය අන්තර්ගතය ලැබෙනු ඇත! 🎬",
        supportMsg: "━━━━━━━━━━━━━━━━━━━━\n📞 <b>සහාය සහ උදව් (SUPPORT)</b>\n━━━━━━━━━━━━━━━━━━━━\n\nගැටළු සඳහා අපගේ ප්‍රධාන චැනල් එක හා සම්බන්ධ වන්න.",
        langSelect: "━━━━━━━━━━━━━━━━━━━━\n🌐 <b>භාෂාව තෝරන්න (LANGUAGE SELECTION)</b>\n━━━━━━━━━━━━━━━━━━━━\n\nකරුණාකර ඔබේ භාෂාව තෝරන්න / Please select your language: ✨",
        
        appTitle: "වීඩියෝව සූදානම් වෙමින් පවතී",
        appInstruction: "පහත බොත්තම ඔබා දැන්වීම නරඹා, තත්පර <span class=\"text-sky-400 font-semibold\">5ක්</span> රැඳී සිටින්න.",
        appAdBtn: "🔗 දැන්වීම විවෘත කරන්න",
        appStatusWait: "තත්පර කිහිපයක් රැඳී සිටින්න...",
        appSuccessMsg: "✔ නැරඹීම සාර්ථකයි! දැන් වීඩියෝව ලබාගත හැක.",
        appGetVideoBtn: "🚀 වීඩියෝව ලබා ගන්න",
        
        ageTitle: "වයස තහවුරු කිරීම අවශ්‍යයි",
        ageDesc: "මෙම Mini App එක තුළ වැඩිහිටි අන්තර්ගතයන් අඩංගු වේ. ඇතුළු වීමට ඔබේ වයස අවුරුදු 18 හෝ ඊට වැඩි විය යුතුය.",
        ageUnderBtn: "මගේ වයස 18ට අඩුයි",
        ageOverBtn: "මගේ වයස 18ට වැඩි හෝ සමානයි"
    },
    en: {
        welcome: "✨ <b>𝐖𝐀𝐋 𝐋𝐎𝐊𝐀𝐘𝐀 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋</b> 👑\n━━━━━━━━━━━━━━━━━━━━\n\n👋 <b>Hello! Welcome.</b>\n\nI am your automated bot that provides videos and movies. 🎬\n\n👉 <b>Please use a link from our main channel to access content through the bot.</b> 💎\n\n━━━━━━━━━━━━━━━━━━━━\n📊 <b>System Status:</b> 🟢 <i>Online & Active</i>\n⚡ <b>Speed:</b> <i>Ultra Fast</i>",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language",
        backBtn: "⬅️ Back to Menu",
        subRequired: "⚠️ <b>Attention! Complete the steps below.</b>\n━━━━━━━━━━━━━━━━━━━━\n\nYou must join our main channel and chat group to get this video.\n\n👇 Join using the buttons below and click <b>\"🔄 Check Again\"</b>.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Again",
        linkExpired: "❌ <b>Sorry, this link has expired or is invalid.</b>",
        warningText: "━━━━━━━━━━━━━━━━━━━━\n⚠️ <b>ATTENTION:</b>\n━━━━━━━━━━━━━━━━━━━━\nThis content will automatically disappear from your chat! ⏳",
        protectedNote: "\n\n🔒 <i>(This content is protected against forwarding or downloading)</i>",
        vipPromoEn: "\n\n⭐ <b>If you want to save videos like this, get our VIP membership. Lifetime access available.</b>",
        getVipBtn: "⭐ Get VIP Access",
        clickBtnText: "━━━━━━━━━━━━━━━━━━━━\n🔓 <b>READY TO UNLOCK</b>\n━━━━━━━━━━━━━━━━━━━━\n\nClick the button below to get the content: 🔥",
        viewsCount: "📊 Total Views so far:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ How to Get Video? (Guide)",
        systemError: "❌ A system error occurred.",
        notSubbedAlert: "❌ You have not joined all required channels/groups yet!",
        subSuccess: "✅ Thank you! You can now access the content.",
        guideContent: "━━━━━━━━━━━━━━━━━━━━\n📖 <b>HOW TO GET CONTENT</b> 💡\n━━━━━━━━━━━━━━━━━━━━\n\n1️⃣ First click the <b>\"▶️ Watch Ad & Get Content\"</b> button. 👉\n2️⃣ Click on the ad on the opened page and wait for 5 seconds. ⏱️\n3️⃣ Once time is up, click the <b>\"🚀 Get Video\"</b> button that appears. 🔥\n4️⃣ Then you will automatically be redirected to the bot to receive your content! 🎬",
        supportMsg: "━━━━━━━━━━━━━━━━━━━━\n📞 <b>SUPPORT & HELP</b>\n━━━━━━━━━━━━━━━━━━━━\n\nFor inquiries, please contact our main channel.",
        langSelect: "━━━━━━━━━━━━━━━━━━━━\n🌐 <b>LANGUAGE SELECTION</b>\n━━━━━━━━━━━━━━━━━━━━\n\nPlease select your language: ✨",
        
        appTitle: "Video is getting ready",
        appInstruction: "Click the button below, view the ad, and wait for <span class=\"text-sky-400 font-semibold\">5 seconds</span>.",
        appAdBtn: "🔗 Open Ad",
        appStatusWait: "Please wait a few seconds...",
        appSuccessMsg: "✔ Watching successful! You can now get the video.",
        appGetVideoBtn: "🚀 Get Video",
        
        ageTitle: "Age Verification Required",
        ageDesc: "This mini app contains adult content. You must be at least 18 years old to enter.",
        ageUnderBtn: "I am under 18",
        ageOverBtn: "I am 18 or older"
    }
};

// Dynamic Progress Bar Helper Function
function renderProgressBar(percent) {
    const totalBars = 10;
    const filledBars = Math.round((percent / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return "🟩".repeat(filledBars) + "⬛".repeat(emptyBars) + ` ${percent}%`;
}

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

// Mongoose Schemas
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgId: { type: Number },      
    fileMsgIds: { type: [Number] },   
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    protectContent: { type: Boolean, default: false },
    isVipContent: { type: Boolean, default: false },
    reactions: {
        peach: { type: Number, default: 0 },
        banana: { type: Number, default: 0 },
        hot: { type: Number, default: 0 }
    },
    reactedUsers: { type: [String], default: [] }
});
const FileModel = mongoose.model('File', fileSchema);

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' },
    language: { type: String, default: 'si' },
    isVip: { type: Boolean, default: false }
});
const UserModel = mongoose.model('User', userSchema);

const sessionSchema = new mongoose.Schema({
    chatId: { type: String, required: true },
    sentVideoIds: { type: [Number], required: true },
    warningMsgId: { type: Number, required: true },
    token: { type: String, required: true },
    isProtected: { type: Boolean, default: false },
    lang: { type: String, default: 'si' },
    createdAt: { type: Date, default: Date.now }
});
const SessionModel = mongoose.model('Session', sessionSchema);

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Boolean, default: false }
});
const SettingModel = mongoose.model('Setting', settingSchema);

// Membership Check Function
async function checkMembership(ctx, userId) {
    let isChannelMember = true;
    let isGroupMember = true;

    if (REQUIRED_CHANNEL) {
        try {
            const chatMember = await ctx.telegram.getChatMember(REQUIRED_CHANNEL, userId);
            const status = chatMember.status;
            isChannelMember = ['creator', 'administrator', 'member'].includes(status);
        } catch (error) {
            isChannelMember = true;
        }
    }

    if (CHAT_GROUP_ID) {
        try {
            const groupMember = await ctx.telegram.getChatMember(CHAT_GROUP_ID, userId);
            const status = groupMember.status;
            isGroupMember = ['creator', 'administrator', 'member'].includes(status);
        } catch (error) {
            isGroupMember = true;
        }
    }

    return {
        isChannelMember,
        isGroupMember,
        isFullySubscribed: isChannelMember && isGroupMember
    };
}

const activeTimers = new Map();

function getReactionHeatBar(reactions) {
    const total = (reactions.peach || 0) + (reactions.banana || 0) + (reactions.hot || 0);
    if (total === 0) return `[░░░░░░░░░░] 0% Reactions`;
    const positive = (reactions.peach || 0) + (reactions.hot || 0);
    const percentage = Math.round((positive / total) * 100);
    return `[${renderProgressBar(percentage)}] (${total} Votes)`;
}

// Timer Starter Function
function startVideoSessionTimer(sessionId, chatId, sentVideoIds, warningMsgId, token, isProtected, lang, initialRemainingMinutes) {
    let remainingMinutes = initialRemainingMinutes;

    const updateInterval = setInterval(async () => {
        remainingMinutes -= 5;
        if (remainingMinutes > 0) {
            const t = langs[lang] || langs.si;
            
            try {
                const fileDoc = await FileModel.findOne({ token });
                const reactions = fileDoc ? (fileDoc.reactions || { peach: 0, banana: 0, hot: 0 }) : { peach: 0, banana: 0, hot: 0 };
                const heatBarText = getReactionHeatBar(reactions);

                let timeRemainingText = lang === 'en' ? `⏳ <b>Time Remaining:</b> <code>${remainingMinutes}</code> mins` : `⏳ <b>ඉතිරි කාලය:</b> විනාඩි <code>${remainingMinutes}</code> යි`;
                let updatedWarningText = t.warningText + `\n\n📊 <b>CONTENT RATING:</b>\n${heatBarText}\n\n` + timeRemainingText + (isProtected ? t.protectedNote : "");
                
                let keyboardRows = [
                    [
                        { text: `🍑 ${reactions.peach || 0}`, callback_data: `react_peach_${token}`, style: "primary" },
                        { text: `🍌 ${reactions.banana || 0}`, callback_data: `react_banana_${token}`, style: "success" },
                        { text: `🥵 ${reactions.hot || 0}`, callback_data: `react_hot_${token}`, style: "danger" }
                    ],
                    [{ text: "🚨 Report Broken Link", callback_data: `report_link_${token}`, style: "danger" }]
                ];

                if (isProtected) {
                    keyboardRows.splice(1, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
                }

                await bot.telegram.editMessageText(
                    chatId, 
                    warningMsgId, 
                    null, 
                    updatedWarningText, 
                    {
                        parse_mode: 'HTML',
                        reply_markup: { inline_keyboard: keyboardRows }
                    }
                ).catch(() => {});
            } catch (e) {}
        } else {
            clearInterval(updateInterval);
        }
    }, 5 * 60 * 1000);

    const deleteTimeout = setTimeout(async () => {
        clearInterval(updateInterval);
        activeTimers.delete(sessionId.toString());
        try {
            for (let msgId of sentVideoIds) {
                await bot.telegram.deleteMessage(chatId, msgId).catch(() => {});
            }
            await bot.telegram.deleteMessage(chatId, warningMsgId).catch(() => {});
        } catch (err) {}
        await SessionModel.deleteOne({ _id: sessionId }).catch(() => {});
    }, remainingMinutes * 60 * 1000);

    activeTimers.set(sessionId.toString(), { updateInterval, deleteTimeout });
}

// Helper Function to handle Video Delivery
async function deliverVideosAndSetupTimer(ctx, fileDoc, token, lang) {
    const t = langs[lang];
    const userId = ctx.from.id.toString();

    const userDoc = await UserModel.findOne({ userId });
    const isVipUser = userDoc ? userDoc.isVip : false;

    if (fileDoc.isVipContent && !isVipUser) {
        let vipAlert = lang === 'en' ? "⭐ <b>This content is for VIP members only!</b>" : "⭐ <b>මෙම අන්තර්ගතය VIP සාමාජිකයන්ට පමණි!</b>";
        return ctx.reply(vipAlert, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]
                ]
            }
        });
    }

    const isProtected = isVipUser ? false : (fileDoc.protectContent === true);

    let msgIdsArray = fileDoc.fileMsgId ? [fileDoc.fileMsgId] : (fileDoc.fileMsgIds || []);
    let sentVideoIds = [];

    let preparingText = lang === 'en' ? `⚡ <b>Content is getting ready...</b>\n\n${renderProgressBar(30)}` : `⚡ <b>අන්තර්ගතය සූදානම් වෙමින් පවතී...</b>\n\n${renderProgressBar(30)}`;
    const statusMsg = await ctx.reply(preparingText, { parse_mode: 'HTML' });

    for (let i = 0; i < msgIdsArray.length; i++) {
        let id = msgIdsArray[i];
        try {
            const sentMsg = await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, id, { protect_content: isProtected });
            sentVideoIds.push(sentMsg.message_id);
            
            let progress = Math.round(((i + 1) / msgIdsArray.length) * 100);
            let receivingText = lang === 'en' ? `⚡ <b>Receiving content...</b>\n\n${renderProgressBar(progress)}` : `⚡ <b>අන්තර්ගතය ලැබෙමින් පවතී...</b>\n\n${renderProgressBar(progress)}`;
            await ctx.telegram.editMessageText(
                ctx.chat.id,
                statusMsg.message_id,
                null,
                receivingText,
                { parse_mode: 'HTML' }
            ).catch(() => {});

            await new Promise(r => setTimeout(r, 400));
        } catch (e) {
            console.error("Error copying message:", e.message);
        }
    }

    await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id).catch(() => {});

    if (sentVideoIds.length === 0) {
        let missingMsg = lang === 'en' ? "❌ <b>Sorry, this video has been deleted from the database or is unavailable.</b>" : "❌ <b>සමාවන්න, මෙම වීඩියෝව ඩේටාබේස් එකෙන් මකා දමා ඇත හෝ ලබා ගත නොහැක.</b>";
        return ctx.reply(missingMsg, { parse_mode: 'HTML' });
    }

    let remainingMinutes = 30;
    const reactions = fileDoc.reactions || { peach: 0, banana: 0, hot: 0 };
    const heatBarText = getReactionHeatBar(reactions);

    let timeRemainingText = lang === 'en' ? `⏳ <b>Time Remaining:</b> <code>${remainingMinutes}</code> mins` : `⏳ <b>ඉතිරි කාලය:</b> විනාඩි <code>${remainingMinutes}</code> යි`;
    let warningText = t.warningText + `\n\n📊 <b>CONTENT RATING:</b>\n${heatBarText}\n\n` + timeRemainingText + (isProtected ? (t.protectedNote + (isVipUser ? "" : (lang === 'si' ? t.vipPromoSi : t.vipPromoEn))) : "");

    let inlineKeyboard = [
        [
            { text: `🍑 ${reactions.peach || 0}`, callback_data: `react_peach_${token}`, style: "primary" },
            { text: `🍌 ${reactions.banana || 0}`, callback_data: `react_banana_${token}`, style: "success" },
            { text: `🥵 ${reactions.hot || 0}`, callback_data: `react_hot_${token}`, style: "danger" }
        ]
    ];

    if (isProtected && !isVipUser) {
        inlineKeyboard.push([{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
    }

    inlineKeyboard.push([{ text: "🚨 Report Broken Link", callback_data: `report_link_${token}`, style: "danger" }]);

    const warningMsg = await ctx.reply(warningText, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: inlineKeyboard }
    });

    const sessionDoc = await SessionModel.create({
        chatId: ctx.chat.id.toString(),
        sentVideoIds: sentVideoIds,
        warningMsgId: warningMsg.message_id,
        token: token,
        isProtected: isProtected,
        lang: lang,
        createdAt: new Date()
    });

    startVideoSessionTimer(
        sessionDoc._id,
        ctx.chat.id.toString(),
        sentVideoIds,
        warningMsg.message_id,
        token,
        isProtected,
        lang,
        30
    );
}

// Telegram Stars Payment Handlers
bot.command('vip', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const invoiceDesc = lang === 'en' 
        ? 'Through this facility, you get special VIP access to join our VIP CHANNEL and download (save) all videos!'
        : 'මෙම පහසුකම හරහා ඔබට අපගේ VIP CHANNEL එකට JOIN වීමට සහ සියලුම වීඩියෝස් ඩවුන්ලෝඩ් (Save) කරගත හැකි විශේෂ VIP අවසරය ලැබේ!';
    const errorMsg = lang === 'en' ? '❌ Error generating invoice.' : '❌ ඉන්වොයිසිය සකස් කිරීමේදී දෝෂයක් ඇති විය.';

    try {
        await ctx.replyWithInvoice({
            title: '⭐ VIP Channel & Unlimited Download Access',
            description: invoiceDesc,
            payload: 'vip_100_stars_payload',
            currency: 'XTR',
            prices: [{ label: 'VIP Lifetime Access', amount: 100 }],
            provider_token: ''
        });
    } catch (e) {
        console.error("VIP Invoice Error:", e);
        ctx.reply(errorMsg);
    }
});

bot.on('pre_checkout_query', async (ctx) => {
    try {
        await ctx.answerPreCheckoutQuery(true);
    } catch (e) {}
});

// ⭐ Successful Payment Handler: Sends congratulations message with Join VIP Channel button
bot.on('successful_payment', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    try {
        await UserModel.updateOne({ userId }, { $set: { isVip: true } }, { upsert: true });
        
        let successMsg = lang === 'en'
            ? "🎉 <b>Congratulations! You successfully paid 100 Stars and became a VIP member!</b>\n\n✨ Now you can join our special VIP channel through the button below! 🎬"
            : "🎉 <b>සුභ පැතුම්! ඔබ සාර්ථකව Stars 100ක් ගෙවා VIP සාමාජිකයෙකු බවට පත් විය!</b>\n\n✨ දැන් ඔබට පහත බොත්තම හරහා අපගේ විශේෂ VIP චැනල් එකට සම්බන්ධ විය හැක! 🎬";

        await ctx.reply(
            successMsg,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "⭐ Join VIP Channel", url: VIP_CHANNEL_LINK, style: "success" }]
                    ]
                }
            }
        );
    } catch (e) {
        console.error("Payment update error:", e);
    }
});

// Listener for users sending "VIP" text message in chat to claim free access
bot.hears(/^(vip|\/vip)$/i, async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    try {
        let user = await UserModel.findOne({ userId });
        if (!user) {
            user = await UserModel.create({ userId, joinedAt: new Date(), status: 'active', isVip: false });
        }

        if (user.isVip) {
            let alreadyVip = lang === 'en' ? "✨ You are already a **VIP** member!\n\n👇 Go to the VIP channel from here:" : "✨ ඔබ දැනටමත් **VIP** සාමාජිකයෙකි!\n\n👇 VIP චැනල් එකට මෙතැනින් යන්න:";
            return ctx.reply(alreadyVip, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "⭐ Join VIP Channel", url: VIP_CHANNEL_LINK, style: "success" }]
                    ]
                }
            });
        }

        const currentVipCount = await UserModel.countDocuments({ isVip: true });

        if (currentVipCount < 3) {
            await UserModel.updateOne({ userId }, { $set: { isVip: true } });
            let freeVipMsg = lang === 'en'
                ? "🎉 <b>Congratulations! You are among the first 3 lucky users who messaged \"VIP\" and won!</b>\n\n⭐ You got **FREE VIP ACCESS** completely free! Join the VIP channel from the link below. 🎬"
                : "🎉 <b>සුභ පැතුම්! ඔබ මුලින්ම \"VIP\" මැසේජ් කර ජයග්‍රහණය කළ වාසනාවන්තයන් 3 දෙනා අතරට පැමිණියෙහිය!</b>\n\n⭐ ඔබට සම්පූර්ණයෙන්ම නොමිලේ **FREE VIP ACCESS** හිමි විය! පහත ලින්ක් එකෙන් VIP චැනල් එකට සම්බන්ධ වන්න. 🎬";

            return ctx.reply(
                freeVipMsg,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "⭐ Join VIP Channel", url: VIP_CHANNEL_LINK, style: "success" }]
                        ]
                    }
                }
            );
        } else {
            let quotaOverMsg = lang === 'en'
                ? "❌ <b>Sorry! The quota for the first 3 lucky users has already ended!</b>\n\n⭐ If you want, you can get VIP by paying 100 Stars by clicking the button below:"
                : "❌ <b>සමාවන්න! පළමු වාසනාවන්තයන් 3 දෙනාගේ කෝටාව දැනටමත් අවසන් වී ඇත!</b>\n\n⭐ ඔබට අවශ්‍ය නම් පහත බොත්තම ඔබා Stars 100ක් ගෙවා VIP ලබාගත හැක:";

            return ctx.reply(
                quotaOverMsg,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "⭐ Get VIP Access", callback_data: "buy_vip", style: "success" }]
                        ]
                    }
                }
            );
        }
    } catch (e) {
        console.error("VIP text trigger error:", e);
    }
});

// Admin Manual VIP Commands
bot.command('addvip', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID && !SUB_ADMINS.includes(userId)) return;

    const args = ctx.message.text.split(' ');
    const targetUserId = args[1];

    if (!targetUserId) {
        return ctx.reply("⚠️ <b>How to use / භාවිතා කරන ආකාරය:</b>\n<code>/addvip USER_ID</code>", { parse_mode: 'HTML' });
    }

    try {
        const result = await UserModel.findOneAndUpdate(
            { userId: targetUserId.toString() },
            { $set: { isVip: true } },
            { new: true }
        );

        if (!result) {
            return ctx.reply(`❌ User ID <code>${targetUserId}</code> not found / හමු නොවීය.`, { parse_mode: 'HTML' });
        }

        await ctx.reply(`✅ <b>Success / සාර්ථකයි!</b> VIP Access granted to User ID <code>${targetUserId}</code>.`, { parse_mode: 'HTML' });

        try {
            await ctx.telegram.sendMessage(
                targetUserId,
                "🎉 <b>Congratulations! Admin has granted you VIP Access.</b>\n\n✨ Now you can join the VIP channel through the button below!",
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "⭐ Join VIP Channel", url: VIP_CHANNEL_LINK, style: "success" }]
                        ]
                    }
                }
            );
        } catch (e) {}

    } catch (e) {
        console.error("AddVIP Error:", e);
    }
});

bot.command('removevip', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID && !SUB_ADMINS.includes(userId)) return;

    const args = ctx.message.text.split(' ');
    const targetUserId = args[1];

    if (!targetUserId) {
        return ctx.reply("⚠️ <b>How to use / භාවිතා කරන ආකාරය:</b>\n<code>/removevip USER_ID</code>", { parse_mode: 'HTML' });
    }

    try {
        const result = await UserModel.findOneAndUpdate(
            { userId: targetUserId.toString() },
            { $set: { isVip: false } },
            { new: true }
        );

        if (!result) {
            return ctx.reply(`❌ User ID <code>${targetUserId}</code> not found / හමු නොවීය.`, { parse_mode: 'HTML' });
        }

        await ctx.reply(`✅ <b>Success / සාර්ථකයි!</b> VIP Access removed from User ID <code>${targetUserId}</code>.`, { parse_mode: 'HTML' });

    } catch (e) {
        console.error("RemoveVIP Error:", e);
    }
});

// Report Broken Link Action
bot.action(/^report_link_(.+)$/, async (ctx) => {
    const token = ctx.match[1];
    const ADMIN_ID = process.env.ADMIN_ID;
    const userId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : `User ID: ${userId}`;

    await ctx.answerCbQuery("🚨 Reported to Admin. Thank you! / ඇඩ්මින් වෙත වාර්තා කරන ලදී. ස්තුතියි!", { show_alert: true });

    if (ADMIN_ID) {
        try {
            await ctx.telegram.sendMessage(
                ADMIN_ID,
                `🚨 <b>Broken Link Reported!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 Reported by: ${username}\n🔑 Token: <code>${token}</code>`,
                { parse_mode: 'HTML' }
            );
        } catch (e) {}
    }
});

// Bot Start & Handlers
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userIdStr = userId.toString();
    const payload = ctx.startPayload;

    try {
        await UserModel.updateOne(
            { userId: userIdStr }, 
            { $setOnInsert: { joinedAt: new Date(), isVip: false }, $set: { status: 'active' } }, 
            { upsert: true }
        );
    } catch (err) {}

    const lang = await getUserLang(userId);
    const t = langs[lang];
    const userDoc = await UserModel.findOne({ userId: userIdStr });
    const isVipUser = userDoc ? userDoc.isVip : false;

    if (!payload) {
        let welcomeKeyboard = [
            [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
            [
                { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
                { text: t.supportBtn, callback_data: "support_info", style: "danger" }
            ],
            [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
        ];

        if (!isVipUser) {
            welcomeKeyboard.splice(2, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
        }

        return ctx.reply(t.welcome, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: welcomeKeyboard }
        });
    }

    const membership = await checkMembership(ctx, userId);
    if (!membership.isFullySubscribed) {
        const buttons = [];

        if (!membership.isChannelMember) {
            let channelBtnText = lang === 'en' ? '📢 Join Main Channel' : '📢 Main Channel එකට Join වන්න';
            buttons.push([{ text: channelBtnText, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }]);
        }
        if (!membership.isGroupMember) {
            let groupBtnText = lang === 'en' ? '💬 Join Chat Group' : '💬 Chat Group එකට Join වන්න';
            buttons.push([{ text: groupBtnText, url: CHAT_GROUP_LINK, style: "success" }]);
        }

        let verifyBtnText = lang === 'en' ? '🔄 Verify Again' : '🔄 නැවත Verify කරන්න';
        buttons.push([{ text: verifyBtnText, callback_data: `check_sub_${payload}`, style: "danger" }]);

        let subReqText = lang === 'en'
            ? `⚠️ <b>Attention!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nPlease join all required channels to get the video and click <b>"Verify Again"</b>.`
            : `⚠️ <b>අවධානයෙයි!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nවීඩියෝව ලබා ගැනීමට අවශ්‍ය සියලුම නාලිකා සඳහා Join වී <b>"නැවත Verify කරන්න"</b> ක්ලික් කරන්න.`;

        return ctx.replyWithHTML(subReqText, {
            reply_markup: { inline_keyboard: buttons }
        });
    }

    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOne({ token });
            
            if (!fileDoc) {
                return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });
            }

            await FileModel.updateOne({ token }, { $inc: { views: 1 } });
            await deliverVideosAndSetupTimer(ctx, fileDoc, token, lang);
            return;
        }

        const fileDoc = await FileModel.findOneAndUpdate({ token: payload }, { $inc: { clicks: 1 } }, { new: true });
        if (!fileDoc) return ctx.reply(t.linkExpired, { parse_mode: 'HTML' });

        if (fileDoc.isVipContent) {
            if (!isVipUser) {
                let vipOnlyMsg = lang === 'en' ? "⭐ <b>This content is for VIP members only!</b>" : "⭐ <b>මෙම අන්තර්ගතය VIP සාමාජිකයන්ට පමණි!</b>";
                return ctx.reply(vipOnlyMsg, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]
                        ]
                    }
                });
            } else {
                return await deliverVideosAndSetupTimer(ctx, fileDoc, payload, lang);
            }
        }

        if (isVipUser) {
            return await deliverVideosAndSetupTimer(ctx, fileDoc, payload, lang);
        }

        const hostUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${hostUrl}/miniapp?token=${payload}&uid=${userId}`;

        let startKeyboard = [
            [{ text: t.watchAdText, web_app: { url: miniAppUrl }, style: "success" }],
            [{ text: t.guideText, callback_data: "how_to_use", style: "primary" }]
        ];

        if (!isVipUser) {
            startKeyboard.splice(1, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
        }

        let viewsLabel = lang === 'en' ? "📊 Total Views:" : "📊 නැරඹුම් වාර (Views):";

        await ctx.reply(
            `${t.clickBtnText}\n\n${viewsLabel} <code>${fileDoc.views}</code>`,
            {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: startKeyboard }
            }
        );
    } catch (error) {
        console.error("Start command error:", error);
        ctx.reply(t.systemError, { parse_mode: 'HTML' });
    }
});

// Buy VIP Action Button
bot.action('buy_vip', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);

    let vipPrompt = lang === 'en'
        ? "⭐ <b>To get VIP membership:</b>\n\nClick the button below and pay 100 Telegram Stars to get VIP membership!"
        : "⭐ <b>VIP සාමාජිකත්වය ලබා ගැනීම සඳහා:</b>\n\nපහත බොත්තම ඔබා Telegram Stars 100ක් ගෙවා VIP සාමාජිකත්වය ලබා ගන්න!";
    let btnText = lang === 'en' ? "💳 Pay via Telegram Stars (/vip)" : "💳 Telegram Stars හරහා ගෙවීමට (/vip)";
    let errorMsg = lang === 'en' ? "❌ An error occurred." : "❌ දෝෂයක් ඇති විය.";

    try {
        await ctx.reply(
            vipPrompt,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: btnText, callback_data: "pay_stars", style: "success" }]
                    ]
                }
            }
        );
    } catch (e) {
        ctx.reply(errorMsg);
    }
});

bot.action('pay_stars', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const invoiceDesc = lang === 'en'
        ? 'Through this facility, you get special VIP access to download (save) all videos!'
        : 'මෙම පහසුකම හරහා ඔබට සියලුම වීඩියෝස් ඩවුන්ලෝඩ් (Save) කරගත හැකි විශේෂ VIP අවසරය ලැබේ!';
    const errorMsg = lang === 'en' ? '❌ Error generating invoice.' : '❌ ඉන්වොයිසිය සකස් කිරීමේදී දෝෂයක් ඇති විය.';

    try {
        await ctx.replyWithInvoice({
            title: '⭐ VIP Unlimited Download Access',
            description: invoiceDesc,
            payload: 'vip_100_stars_payload',
            currency: 'XTR',
            prices: [{ label: 'VIP Lifetime Access', amount: 100 }],
            provider_token: ''
        });
    } catch (e) {
        ctx.reply(errorMsg);
    }
});

// Single Reaction Handler
bot.action(/^react_(peach|banana|hot)_(.+)$/, async (ctx) => {
    const type = ctx.match[1];
    const token = ctx.match[2];
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);

    try {
        const fileDoc = await FileModel.findOne({ token });
        if (!fileDoc) return ctx.answerCbQuery(lang === 'en' ? "❌ Link Expired!" : "❌ ලින්ක් එක කල් ඉකුත් වී ඇත!");

        if (fileDoc.reactedUsers && fileDoc.reactedUsers.includes(userId)) {
            let alreadyReacted = lang === 'en' ? "⚠️ You have already reacted to this video!" : "⚠️ ඔබ දැනටමත් මෙම වීඩියෝවට ප්‍රතිචාරයක් දක්වා ඇත!";
            return ctx.answerCbQuery(alreadyReacted, { show_alert: true });
        }

        const updatedFile = await FileModel.findOneAndUpdate(
            { token: token },
            { 
                $inc: { [`reactions.${type}`]: 1 },
                $push: { reactedUsers: userId }
            },
            { new: true }
        );

        const reactions = updatedFile.reactions || { peach: 0, banana: 0, hot: 0 };
        let successReaction = lang === 'en' ? "🎉 Your reaction was successfully added!" : "🎉 ඔබේ ප්‍රතිචාරය සාර්ථකව එකතු විය!";
        await ctx.answerCbQuery(successReaction, { show_alert: true });

        const userDoc = await UserModel.findOne({ userId });
        const isVipUser = userDoc ? userDoc.isVip : false;
        const isProtected = isVipUser ? false : fileDoc.protectContent;

        let inlineKeyboard = [
            [
                { text: `🍑 ${reactions.peach || 0}`, callback_data: `react_peach_${token}`, style: "primary" },
                { text: `🍌 ${reactions.banana || 0}`, callback_data: `react_banana_${token}`, style: "success" },
                { text: `🥵 ${reactions.hot || 0}`, callback_data: `react_hot_${token}`, style: "danger" }
            ]
        ];

        const t = langs[lang] || langs.si;

        if (isProtected && !isVipUser) {
            inlineKeyboard.push([{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
        }

        inlineKeyboard.push([{ text: "🚨 Report Broken Link", callback_data: `report_link_${token}`, style: "danger" }]);

        await ctx.editMessageReplyMarkup({ inline_keyboard: inlineKeyboard });
    } catch (err) {
        console.error("Reaction Error:", err);
    }
});

// Interactive Menu Handlers with editMessageText and Balanced Colors
bot.action('how_to_use', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];
    
    await ctx.editMessageText(t.guideContent, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: t.backBtn, callback_data: "back_to_main", style: "danger" }]
            ]
        }
    }).catch(() => {});
});

bot.action('support_info', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];

    await ctx.editMessageText(t.supportMsg, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: t.backBtn, callback_data: "back_to_main", style: "danger" }]
            ]
        }
    }).catch(() => {});
});

bot.action('change_language', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];

    await ctx.editMessageText(t.langSelect, {
        parse_mode: 'HTML',
        reply_markup: { 
            inline_keyboard: [
                [
                    { text: "🇱🇰 සිංහල", callback_data: "set_lang_si", style: "success" }, 
                    { text: "🇬🇧 English", callback_data: "set_lang_en", style: "primary" }
                ],
                [{ text: t.backBtn, callback_data: "back_to_main", style: "danger" }]
            ] 
        }
    }).catch(() => {});
});

bot.action('back_to_main', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];
    const userDoc = await UserModel.findOne({ userId });
    const isVipUser = userDoc ? userDoc.isVip : false;

    let mainKeyboard = [
        [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
        [
            { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
            { text: t.supportBtn, callback_data: "support_info", style: "danger" }
        ],
        [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
    ];

    if (!isVipUser) {
        mainKeyboard.splice(2, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
    }

    await ctx.editMessageText(t.welcome, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: mainKeyboard }
    }).catch(() => {});
});

bot.action('set_lang_si', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'si' } }, { upsert: true });
    await ctx.answerCbQuery("සිංහල භාෂාව තෝරන ලදී.", { show_alert: true });
    const t = langs['si'];
    const userDoc = await UserModel.findOne({ userId });
    const isVipUser = userDoc ? userDoc.isVip : false;
    
    let mainKeyboard = [
        [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
        [
            { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
            { text: t.supportBtn, callback_data: "support_info", style: "danger" }
        ],
        [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
    ];

    if (!isVipUser) {
        mainKeyboard.splice(2, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
    }

    await ctx.editMessageText(t.welcome, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: mainKeyboard }
    }).catch(() => {});
});

bot.action('set_lang_en', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'en' } }, { upsert: true });
    await ctx.answerCbQuery("Language set to English.", { show_alert: true });
    const t = langs['en'];
    const userDoc = await UserModel.findOne({ userId });
    const isVipUser = userDoc ? userDoc.isVip : false;
    
    let mainKeyboard = [
        [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}`, style: "primary" }],
        [
            { text: t.howToUseBtn, callback_data: "how_to_use", style: "success" }, 
            { text: t.supportBtn, callback_data: "support_info", style: "danger" }
        ],
        [{ text: t.langBtn, callback_data: "change_language", style: "primary" }]
    ];

    if (!isVipUser) {
        mainKeyboard.splice(2, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
    }

    await ctx.editMessageText(t.welcome, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: mainKeyboard }
    }).catch(() => {});
});

// Express App setup
const app = express();
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.get('/miniapp', async (req, res) => {
    const token = req.query.token || '';
    const userId = req.query.uid || '';
    
    try {
        const fileCheck = await FileModel.findOne({ token });
        if (!fileCheck) {
            return res.send(`<!DOCTYPE html><html><body style="background:#09090b;color:#f87171;text-align:center;padding-top:80px;font-family:sans-serif;"><h2>❌ Link has expired or is invalid!</h2></body></html>`);
        }

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
            0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.4); }
            50% { box-shadow: 0 0 35px rgba(14, 165, 233, 0.8); }
        }
        .glow-effect { animation: pulse-glow 2s infinite; }
        
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner-ring { animation: spin-slow 1.5s linear infinite; }

        @keyframes success-glow {
            0%, 100% { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 0 25px rgba(16, 185, 129, 0.3); }
            50% { border-color: rgba(16, 185, 129, 0.9); box-shadow: 0 0 45px rgba(16, 185, 129, 0.6); }
        }
        .success-card { animation: success-glow 2s infinite; }
    </style>
</head>
<body class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-5 select-none font-sans relative overflow-hidden">
    
    <div class="absolute -top-20 -left-20 w-64 h-64 bg-sky-600/30 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

    <div id="age-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl hidden">
        <div class="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-slate-800/80 p-7 text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl">
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
                    class="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-rose-900/40 text-sm active:scale-95"
                >
                    ${t.ageOverBtn}
                </button>
                <button
                    onclick="handleAgeVerify(false)"
                    class="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition-all text-sm border border-slate-700/50"
                >
                    ${t.ageUnderBtn}
                </button>
            </div>
        </div>
    </div>

    <div id="main-card" class="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-7 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden transition-all duration-500">
        
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
            <a href="${adLink1}" target="_blank" id="ad-btn-1" onclick="openAd(1)" class="glow-effect flex items-center justify-between w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg text-sm active:scale-95">
                <span>⭐ Watch Ad 1</span>
                <span id="ad-status-1" class="text-xs bg-white/20 px-2.5 py-1 rounded-xl">Pending</span>
            </a>
        </div>

        <div class="mb-5" id="ad-box-2">
            <a href="${adLink2}" target="_blank" id="ad-btn-2" onclick="openAd(2)" class="flex items-center justify-between w-full bg-slate-800/80 text-slate-500 font-bold py-3.5 px-4 rounded-2xl transition-all text-sm pointer-events-none border border-slate-700/50">
                <span>⭐ Watch Ad 2</span>
                <span id="ad-status-2" class="text-xs bg-slate-700 px-2.5 py-1 rounded-xl text-slate-400">Locked</span>
            </a>
        </div>

        <div id="timer-box" class="my-5 hidden">
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center bg-slate-800/80 border border-sky-500/30 rounded-full mb-3 shadow-inner">
                <div id="countdown" class="text-3xl font-black text-sky-400">5</div>
            </div>
            <p id="status-text" class="text-xs text-slate-400 font-medium">${t.appStatusWait || "Connecting..."}</p>
            
            <div class="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden border border-slate-700/50">
                <div id="progress-bar" class="bg-gradient-to-r from-sky-500 to-emerald-400 h-full w-full transition-all duration-1000"></div>
            </div>
        </div>

        <div id="success-box" class="hidden">
            <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
                <p class="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    ${t.appSuccessMsg}
                </p>
            </div>
            <button onclick="getVideo()" id="unlock-btn" class="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/30 text-sm active:scale-95">
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

            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
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
                setTimeout(() => { window.Telegram.WebApp.close(); }, 400);
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

bot.use(async (ctx, next) => {
    try {
        const setting = await SettingModel.findOne({ key: 'maintenance_mode' });
        if (setting && setting.value === true) {
            const userId = ctx.from ? ctx.from.id.toString() : '';
            const ADMIN_ID = process.env.ADMIN_ID;
            
            if (ADMIN_ID && (userId === ADMIN_ID || SUB_ADMINS.includes(userId))) {
                return next();
            }

            const lang = await getUserLang(userId);
            if (ctx.callbackQuery) {
                return ctx.answerCbQuery(lang === 'en' ? "🛠️ Bot is under maintenance!" : "🛠️ බොට් නඩත්තු කටයුතු සිදු කරමින් පවතී!", { show_alert: true });
            }
            let maintMsg = lang === 'en'
                ? "🛠️ <b>Bot is under maintenance!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nPlease try again in a little while."
                : "🛠️ <b>බොට් නඩත්තු කටයුතු සිදු කරමින් පවතී!</b>\n━━━━━━━━━━━━━━━━━━━━\n\nකරුණාකර මද වේලාවකින් නැවත උත්සාහ කරන්න.";
            return ctx.reply(maintMsg, { parse_mode: 'HTML' });
        }
    } catch (err) {
        console.error("Maintenance check error:", err);
    }
    return next();
});

bot.command('maintenance', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) return;

    try {
        let setting = await SettingModel.findOne({ key: 'maintenance_mode' });
        if (!setting) {
            setting = await SettingModel.create({ key: 'maintenance_mode', value: true });
        } else {
            setting.value = !setting.value;
            await setting.save();
        }

        const statusText = setting.value ? "🔴 <b>Enabled / සක්‍රීය කරන ලදී</b>" : "🟢 <b>Disabled / අක්‍රීය කරන ලදී</b>";
        await ctx.reply(`🛠 <b>Maintenance Mode Status:</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${statusText}`, { parse_mode: 'HTML' });
    } catch (error) {
        console.error("Maintenance toggle error:", error);
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
                ],
                [{ text: t.backBtn, callback_data: "back_to_main", style: "danger" }]
            ]
        }
    });
});

// Admin Stats Command
bot.command('stats', async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) return;

    try {
        const totalUsers = await UserModel.countDocuments({});
        const activeUsers = await UserModel.countDocuments({ status: 'active' });
        const vipUsers = await UserModel.countDocuments({ isVip: true });
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
            `📊 <b>Bot Analytics Dashboard / සංඛ්‍යාලේඛන</b> 📈\n━━━━━━━━━━━━━━━━━━━━\n\n` +
            `👥 Total Users: <code>${totalUsers}</code>\n` +
            `⭐ VIP Users: <code>${vipUsers}</code>\n` +
            `🟢 Active Users: <code>${activeUsers}</code>\n` +
            `🔴 Blocked Users: <code>${blockedUsers}</code>\n` +
            `📅 New Users This Month: <code>${monthlyUsers}</code>\n` +
            `📁 Stored Contents: <code>${totalFiles}</code>\n` +
            `🔗 Total Clicks: <code>${totalClicks}</code>\n` +
            `👁️ Total Views: <code>${totalViews}</code>\n` +
            `📈 Conversion Rate: <code>${conversionRate}%</code>`,
            { parse_mode: 'HTML' }
        );

    } catch (error) {
        console.error("Stats error:", error);
    }
});

// Normal Broadcast (Sends to ALL Users)
bot.command('broadcast', async (ctx) => {
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    const repliedMessage = ctx.message.reply_to_message;
    if (!repliedMessage) {
        return ctx.reply("❌ Please **Reply** to the post you want to broadcast and send <code>/broadcast</code>.", { parse_mode: 'HTML' });
    }

    await ctx.reply("🚀 <b>Broadcasting post to all users started... Please wait.</b>", { parse_mode: 'HTML' });

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
                `📊 <b>Broadcast Report (All Users):</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                `✅ Success: <code>${successCount}</code>\n` +
                `🔴 Blocked: <code>${blockedCount}</code>\n` +
                `⚠️ Other Errors: <code>${failedCount}</code>`,
                { parse_mode: 'HTML' }
            );
        } catch (err) {
            console.error("Broadcast Execution Error:", err);
            await ctx.reply("❌ An error occurred while broadcasting.", { parse_mode: 'HTML' });
        }
    });
});

// VIP-Only Broadcast (Sends ONLY to VIP Users)
bot.command('vipbroadcast', async (ctx) => {
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    const repliedMessage = ctx.message.reply_to_message;
    if (!repliedMessage) {
        return ctx.reply("❌ Please **Reply** to the post you want to broadcast to VIPs only and send <code>/vipbroadcast</code>.", { parse_mode: 'HTML' });
    }

    await ctx.reply("🚀 <b>Broadcasting post to VIP members only started... Please wait.</b>", { parse_mode: 'HTML' });

    setImmediate(async () => {
        try {
            const vipUsers = await UserModel.find({ isVip: true, status: { $ne: 'blocked' } });
            let successCount = 0;
            let blockedCount = 0;
            let failedCount = 0;

            for (const user of vipUsers) {
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
                `📊 <b>VIP Broadcast Report:</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                `⭐ Successfully sent to VIPs: <code>${successCount}</code>\n` +
                `🔴 Blocked: <code>${blockedCount}</code>\n` +
                `⚠️ Other Errors: <code>${failedCount}</code>`,
                { parse_mode: 'HTML' }
            );
        } catch (err) {
            console.error("VIP Broadcast Execution Error:", err);
            await ctx.reply("❌ An error occurred while broadcasting.", { parse_mode: 'HTML' });
        }
    });
});

// Check Subscription Action
bot.action(/^check_sub_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const payload = ctx.match[1];
    const lang = await getUserLang(userId);
    const t = langs[lang];

    const membership = await checkMembership(ctx, userId);
    if (!membership.isFullySubscribed) {
        return ctx.answerCbQuery(t.notSubbedAlert, { show_alert: true });
    }

    await ctx.answerCbQuery(t.subSuccess, { show_alert: true });
    
    try {
        if (payload.startsWith("getvideo_")) {
            const token = payload.replace("getvideo_", "");
            const fileDoc = await FileModel.findOne({ token });

            if (!fileDoc) {
                return ctx.editMessageText(t.linkExpired, { parse_mode: 'HTML' });
            }

            await FileModel.updateOne({ token }, { $inc: { views: 1 } });
            await deliverVideosAndSetupTimer(ctx, fileDoc, token, lang);
            return;
        }

        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.editMessageText(t.linkExpired, { parse_mode: 'HTML' });
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}&uid=${userId}`;

        const userDoc = await UserModel.findOne({ userId: userId.toString() });
        const isVipUser = userDoc ? userDoc.isVip : false;

        let checkSubKeyboard = [
            [{ text: t.watchAdText, web_app: { url: miniAppUrl }, style: "success" }],
            [{ text: t.guideText, callback_data: "how_to_use", style: "primary" }]
        ];

        if (!isVipUser) {
            checkSubKeyboard.splice(1, 0, [{ text: t.getVipBtn, callback_data: "buy_vip", style: "success" }]);
        }

        let viewsLabel = lang === 'en' ? "📊 Total Views:" : "📊 නැරඹුම් වාර (Views):";

        await ctx.editMessageText(
            `${t.clickBtnText}\n\n${viewsLabel} <code>${fileDoc.views}</code>`,
            {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: checkSubKeyboard }
            }
        );
    } catch (error) {
        console.error(error);
    }
});

// Upload Workflow Actions
const pendingUploads = new Map();

function isAdminOrSubAdmin(userId) {
    const ADMIN_ID = process.env.ADMIN_ID;
    return userId === ADMIN_ID || SUB_ADMINS.includes(userId);
}

bot.command('cancel', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdminOrSubAdmin(userId)) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("⚠️ No active upload or configuration currently in progress.", { parse_mode: 'HTML' });
    }

    pendingUploads.delete(userId);
    await ctx.reply("❌ <b>Upload successfully cancelled. All data cleared.</b>", { parse_mode: 'HTML' });
});

bot.action('cancel_upload', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    
    if (pending) {
        pendingUploads.delete(userId);
        await ctx.answerCbQuery("Upload cancelled.", { show_alert: true });
        await ctx.editMessageText("❌ <b>Upload successfully cancelled.</b>", { parse_mode: 'HTML' });
    } else {
        await ctx.answerCbQuery("No active upload found.");
    }
});

bot.action('done_upload', async (ctx) => {
    const userId = ctx.from.id.toString();
    await ctx.answerCbQuery();
    await finalizeUpload(ctx);
});

bot.action('toggle_spoiler_yes', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.hasSpoiler = true;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔒 Thumbnail set to Blur.", { show_alert: true });
    await promptVipContent(ctx);
});

bot.action('toggle_spoiler_no', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.hasSpoiler = false;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔓 Thumbnail set to Unblurred.", { show_alert: true });
    await promptVipContent(ctx);
});

async function promptVipContent(ctx) {
    await ctx.editMessageText(
        "⭐ <b>VIP Content Selection:</b>\n━━━━━━━━━━━━━━━━━━━━\n\n" +
        "Do you want to set this content as **VIP Only** and post it to the VIP channel?",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "⭐ Yes (VIP Only - VIP Channel)", callback_data: "toggle_vip_yes", style: "success" },
                        { text: "🔓 Normal (Main Channel)", callback_data: "toggle_vip_no", style: "primary" }
                    ],
                    [{ text: "❌ Cancel", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
}

bot.action('toggle_vip_yes', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.isVipContent = true;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("⭐ Set as VIP Only and post to VIP channel.", { show_alert: true });
    await promptProtectContent(ctx);
});

bot.action('toggle_vip_no', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.isVipContent = false;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔓 Set as normal content.", { show_alert: true });
    await promptProtectContent(ctx);
});

async function promptProtectContent(ctx) {
    await ctx.editMessageText(
        "🛡️ <b>Protect Content (Download / Forward Restriction):</b>\n━━━━━━━━━━━━━━━━━━━━\n\n" +
        "Do you want to protect (block) this content from being <b>forwarded and downloaded</b> by users?",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 Yes (Block)", callback_data: "toggle_protect_yes", style: "danger" },
                        { text: "🔓 No (Allow)", callback_data: "toggle_protect_no", style: "success" }
                    ],
                    [{ text: "❌ Cancel Upload", callback_data: "cancel_upload", style: "danger" }]
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
    await ctx.answerCbQuery("🔒 Forward & Download blocked.", { show_alert: true });
    await ctx.editMessageText(
        "✅ <b>Settings Saved Successfully!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n" +
        "⭐ VIP Content: <code>" + (pending.isVipContent ? "YES (VIP Channel)" : "NO (Main Channel)") + "</code>\n" +
        "🛡️ Protect Content: <code>ON (Block)</code>\n\n" +
        "Now send the corresponding video, photo, or document. When finished, type <b>/done</b> or click the button below.",
        { 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Done & Publish", callback_data: "done_upload", style: "success" }],
                    [{ text: "❌ Cancel", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
});

bot.action('toggle_protect_no', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pending = pendingUploads.get(userId);
    if (pending) {
        pending.protectContent = false;
        pendingUploads.set(userId, pending);
    }
    await ctx.answerCbQuery("🔓 Forward & Download allowed.", { show_alert: true });
    await ctx.editMessageText(
        "✅ <b>Settings Saved Successfully!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n" +
        "⭐ VIP Content: <code>" + (pending.isVipContent ? "YES (VIP Channel)" : "NO (Main Channel)") + "</code>\n" +
        "🛡️ Protect Content: <code>OFF (Allow)</code>\n\n" +
        "Now send the corresponding video, photo, or document. When finished, type <b>/done</b> or click the button below.",
        { 
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Done & Publish", callback_data: "done_upload", style: "success" }],
                    [{ text: "❌ Cancel", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
});

bot.on('photo', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdminOrSubAdmin(userId)) return;

    const pending = pendingUploads.get(userId);
    
    if (pending && pending.photoFileId && pending.hasSpoiler !== undefined && !pending.waitingForCaption) {
        try {
            const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
            pending.videoMsgIds.push(forwarded.message_id);
            pendingUploads.set(userId, pending);

            await ctx.reply(
                `✅ Content added! (Total: <code>${pending.videoMsgIds.length}</code>). Send more if any, or click /done or the button below when finished.`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "✅ Done", callback_data: "done_upload", style: "success" },
                                { text: "❌ Cancel", callback_data: "cancel_upload", style: "danger" }
                            ]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
        return;
    }

    if (pending && pending.waitingForCaption) {
        pending.caption = ctx.message.caption || ctx.message.text || "";
        pending.waitingForCaption = false;
        pendingUploads.set(userId, pending);

        return ctx.reply(
            "✅ <b>Video title successfully received!</b>\n\nNow send the video or document file:",
            { parse_mode: 'HTML' }
        );
    }

    const photo = ctx.message.photo;
    const largestPhoto = photo[photo.length - 1].file_id;

    pendingUploads.set(userId, {
        photoFileId: largestPhoto,
        caption: "",
        videoMsgIds: [],
        hasSpoiler: true,
        isVipContent: false,
        protectContent: false,
        waitingForCaption: false
    });

    await ctx.reply(
        "📸 <b>Thumbnail received!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n" +
        "Choose whether you want to **Blur (Spoiler)** this thumbnail or not:",
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 Blur", callback_data: "toggle_spoiler_yes", style: "primary" },
                        { text: "🔓 No Blur", callback_data: "toggle_spoiler_no", style: "success" }
                    ],
                    [{ text: "❌ Cancel Completely", callback_data: "cancel_upload", style: "danger" }]
                ]
            }
        }
    );
});

bot.on('text', async (ctx, next) => {
    const userId = ctx.from.id.toString();
    if (!isAdminOrSubAdmin(userId)) return next();

    const pending = pendingUploads.get(userId);
    if (pending && pending.waitingForCaption) {
        pending.caption = ctx.message.text;
        pending.waitingForCaption = false;
        pendingUploads.set(userId, pending);

        return ctx.reply(
            "✅ <b>Video Title added successfully!</b>\n\nNow send the video or document file:",
            { parse_mode: 'HTML' }
        );
    }
    return next();
});

bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdminOrSubAdmin(userId)) return;

    const pending = pendingUploads.get(userId);
    if (!pending) {
        return ctx.reply("⚠️ Please send a thumbnail first.", { parse_mode: 'HTML' });
    }

    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
        pending.videoMsgIds.push(forwarded.message_id);
        pendingUploads.set(userId, pending);

        await ctx.reply(
            `✅ Content added! (Total: <code>${pending.videoMsgIds.length}</code>). Send more if any, or type <code>/done</code> or click the button below.`,
            {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "✅ Done", callback_data: "done_upload", style: "success" },
                            { text: "❌ Cancel", callback_data: "cancel_upload", style: "danger" }
                        ]
                    ]
                }
            }
        );
    } catch (error) {
        console.error(error);
    }
});

async function finalizeUpload(ctx) {
    const userId = (ctx.from && ctx.from.id) ? ctx.from.id.toString() : null;
    if (!userId) return;

    const pending = pendingUploads.get(userId);
    if (!pending || pending.videoMsgIds.length === 0) {
        return ctx.reply("⚠️ Please send a thumbnail and at least one piece of content (video/photo) first.", { parse_mode: 'HTML' });
    }

    try {
        const token = Math.random().toString(36).substring(2, 10);

        await FileModel.create({
            token: token,
            fileMsgIds: pending.videoMsgIds,
            views: 0,
            clicks: 0,
            isVipContent: pending.isVipContent,
            protectContent: pending.protectContent
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        const targetChannel = pending.isVipContent ? (process.env.VIP_CHANNEL_ID || VIP_CHANNEL_LINK) : MAIN_CHANNEL_ID;

        await ctx.reply(`✅ <b>Stored Successfully!</b> (Files count: <code>${pending.videoMsgIds.length}</code>)\n\n🚀 Post sent to target channel!`, { parse_mode: 'HTML' });

        const buttonText = pending.videoMsgIds.length > 1 ? "▶️ View Full Collection" : "▶️ View Content";
        
        const headerText = pending.isVipContent
            ? "⭐ <b>[ NEW VIP VIDEO ] 🎬✨\n━━━━━━━━━━━━━━━━━━━━</b>"
            : (pending.videoMsgIds.length > 1 ? "🔥 <b>[ NEW COLLECTION ] 🎬💎\n━━━━━━━━━━━━━━━━━━━━</b>" : "🔥 <b>[ NEW VIDEO ] 🎬🚀\n━━━━━━━━━━━━━━━━━━━━</b>");

        let channelKeyboard = [
            [{ text: buttonText, url: shareLink, style: "success" }]
        ];

        if (!pending.isVipContent) {
            channelKeyboard.push([{ text: "📢 Join Backup Channel", url: `https://t.me/+bCed3QPGYqQ3MWY9`, style: "primary" }]);
        } else {
            channelKeyboard.push([{ text: "⭐ VIP Channel", url: VIP_CHANNEL_LINK, style: "success" }]);
        }

        const titleDisplay = pending.caption ? `📢 <b>Title:</b> <i>${pending.caption}</i>\n\n` : "";

        await ctx.telegram.sendPhoto(targetChannel, pending.photoFileId, {
            caption: `${headerText}\n\n` +
                     `${titleDisplay}` +
                     `📁 <b>Files:</b> <code>${pending.videoMsgIds.length}</code> Files Included\n\n` +
                     `👇 <b>Click the button below to watch:</b>`,
            parse_mode: 'HTML',
            has_spoiler: pending.hasSpoiler,
            reply_markup: {
                inline_keyboard: channelKeyboard
            }
        });

        pendingUploads.delete(userId);
    } catch (error) {
        console.error(error);
        ctx.reply("Error posting to channel.");
    }
}

bot.command('done', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!isAdminOrSubAdmin(userId)) return;
    
    const pending = pendingUploads.get(userId);
    if (pending && !pending.caption) {
        pending.waitingForCaption = true;
        pendingUploads.set(userId, pending);
        return ctx.reply("✏️ <b>Please type and send the title/text for this video now:</b>", { parse_mode: 'HTML' });
    }

    await finalizeUpload(ctx);
});

const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Attempt to set commands with robust error handling
    try {
        await bot.telegram.setMyCommands([
            { command: 'start', description: 'Start the bot' },
            { command: 'vip', description: 'Buy VIP access (100 Stars)' },
            { command: 'language', description: 'Change language / භාෂාව මාරු කරන්න' }
        ]);
        console.log("Bot commands menu set successfully!");
    } catch (err) {
        console.warn("⚠️ Warning: Could not set bot commands on startup (Telegram API 502 Bad Gateway). The bot will still run normally.", err.message);
    }

    bot.launch();
});


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
