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

// --- Language Dictionary (භාෂා පරිවර්තන එකතුව) ---
const langs = {
    si: {
        welcome: "👋 **ආයුබෝවන්! සාදරයෙන් පිළිගනිමු.**\n\nමම ඔබේ වීඩියෝ සහ චිත්‍රපට ලබා දෙන ස්වයංක්‍රීය බොට් එකයි.\n\n👇 වීඩියෝ ලබා ගැනීමට අපේ ප්‍රධාන චැනල් එකේ ඇති ලින්ක් එකක් භාවිතා කර බොට් වෙත පැමිණེන්න.",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language / භාෂාව",
        subRequired: "⚠️️ **ඔබ තවමත් අපේ ප්‍රධාන චැනල් එක Join වී නැත!**\n\nමෙම වීඩියෝව ලබා ගැනීමට නම් මුලින්ම අපේ චැනල් එකට Join වී සිටිය යුතුය.\n\n👇 පහත බොත්තම ඔබා චැනල් එකට Join වී, පසුව **\"🔄 Check Subscription\"** ඔබන්න.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Subscription",
        linkExpired: "❌ සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.",
        warningText: "⚠️ **අවධානයට:**\nමෙම අන්තර්ගතය **විනාඩි 30 කින්** ස්වයංක්‍රීයව ඔබේ චැට් එකෙන් මැකී යනු ඇත!",
        protectedNote: "\n\n🔒 *(මෙම අන්තර්ගතය ෆෝවර්ඩ් කිරීමට හෝ ඩවුන්ලෝඩ් කිරීමට නොහැකි ලෙස ආරක්ෂා කර ඇත)*",
        clickBtnText: "🔓 **අන්තර්ගතය ලබා ගැනීමට පහත බොත්තම ඔබන්න:**",
        viewsCount: "📊 මෙතෙක් නැරඹුම් වාර:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ වීඩියෝව ලබා ගන්නේ කෙසේද? (Guide)",
        systemError: "පද්ධතියේ දෝෂයක් සිදු විය.",
        notSubbedAlert: "❌ ඔබ තවමත් චැනල් එකට Join වී නැත!",
        subSuccess: "✅ ස්තූතියි! දැන් ඔබට අන්තර්ගතය ලබාගත හැක.",
        guideContent: "📖 **අන්තර්ගතයක් ලබාගන්නේ කෙසේද? (පියවර)**\n\n1️⃣ මුලින්ම **\"▶️ Watch Ad & Get Content\"** බොත්තම ඔබන්න.\n2️⃣ විවෘත වන පිටුවේ ඇති දැන්වීම මත ක්ලික් කර තත්පර 5ක් රැඳී සිටින්න.\n3️⃣ කාලය අවසන් වූ පසු මතුවන **\"🚀 වීඩියෝව ලබා ගන්න\"** බොත්තම ඔබන්න.\n4️⃣ එවිට ස්වයංක්‍රීයව බොට් වෙත පැමිණ ඔබට අවශ්‍ය අන්තර්ගතය ලැබෙනු ඇත!",
        supportMsg: "📞 ගැටළු සඳහා අපගේ ප්‍රධාන චැනල් එක හා සම්බන්ධ වන්න.",
        langSelect: "🌐 **ਕරුණාකර ඔබේ භාෂාව තෝරන්න / Please select your language:**",
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
        ageDesc: "මෙම Mini App එක තුළ වැඩිහිටි අන්තර්ගතයන් අඩංගු වේ. ඇතුළු වීමට ඔබේ වයස අවුරුදු 18 හෝ அதற்கு වැඩි විය යුතුය.",
        ageUnderBtn: "මගේ වයස 18ට අඩුයි",
        ageOverBtn: "මගේ වයස 18ට වැඩි හෝ සමානයි"
    },
    en: {
        welcome: "👋 **Hello! Welcome.**\n\nI am your automated bot that provides videos and movies.\n\n👇 Please use a link from our main channel to access content through the bot.",
        channelBtn: "📢 Our Channel",
        howToUseBtn: "ℹ️ How to Use",
        supportBtn: "📞 Support",
        langBtn: "🌐 Language",
        subRequired: "⚠️ **You haven't joined our main channel yet!**\n\nYou must join our channel first to get this video.\n\n👇 Click the button below to join the channel, then click **\"🔄 Check Subscription\"**.",
        joinChannel: "📢 Join Channel",
        checkSub: "🔄 Check Subscription",
        linkExpired: "❌ Sorry, this link has expired or is invalid.",
        warningText: "⚠️ **Attention:**\nThis content will automatically disappear from your chat in **30 minutes**!",
        protectedNote: "\n\n🔒 *(This content is protected against forwarding or downloading)*",
        clickBtnText: "🔓 **Click the button below to get the content:**",
        viewsCount: "📊 Total Views so far:",
        watchAdText: "▶️ Watch Ad & Get Content",
        guideText: "❓ How to get video? (Guide)",
        systemError: "A system error occurred.",
        notSubbedAlert: "❌ You have not joined the channel yet!",
        subSuccess: "✅ Thank you! You can now access the content.",
        guideContent: "📖 **How to get content? (Steps)**\n\n1️⃣ First click the **\"▶ Watch Ad & Get Content\"** button.\n2️⃣ Click on the ad on the opened page and wait for 5 seconds.\n3️⃣ Once time is up, click the **\"🚀 Get Video\"** button that appears.\n4️⃣ Then you will automatically be redirected to the bot to receive your content!",
        supportMsg: "📞 For inquiries, please contact our main channel.",
        langSelect: "🌐 **Please select your language / කරුණාකර ඔබේ භාෂාව තෝරන්න:**",
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

// Express App setup for Render
const app = express();
app.use(express.urlencoded({ extended: true }));
// Fixed Express MiniApp Route with Stats (Views & Users) and Age Verification Gate
app.get('/miniapp', async (req, res) => {
    const token = req.query.token || '';
    const userId = req.query.uid || '';
    
    try {
        const user = await UserModel.findOne({ userId: userId.toString() });
        const lang = (user && user.language) ? user.language : 'si';
        const t = langs[lang] || langs.si;

        // 1. Get Total Bot Users
        const totalUsers = await UserModel.countDocuments({});

        // 2. Get Total File Views (සමස්ත වීඩියෝ නැරඹුම් එකතුව)
        const allFiles = await FileModel.find({});
        let totalViews = 0;
        allFiles.forEach(file => {
            totalViews += file.views || 0;
        });

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
    
    <!-- Age Verification Modal / Gateway -->
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

    <!-- Main Content App Card -->
    <div id="main-card" class="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 p-7 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden transition-all duration-500">
        
        <div class="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>

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
            ${t.appInstruction}
        </p>

        <div class="mb-5">
            <a href="${AD_LINK}" target="_blank" id="ad-link-btn" onclick="openAd()" class="glow-effect flex items-center justify-center w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg text-sm gap-2">
                <span>${t.appAdBtn}</span>
            </a>
        </div>

        <div id="timer-box" class="my-5 hidden">
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center bg-slate-800/80 border border-sky-500/30 rounded-full mb-3 shadow-inner">
                <div id="countdown" class="text-3xl font-black text-sky-400">5</div>
            </div>
            <p id="status-text" class="text-xs text-slate-400 font-medium">${t.appStatusWatching}</p>
            
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

        <!-- Live Stats Dashboard Inside Mini App -->
        <div class="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-around text-center">
            <div>
                <p class="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Users</p>
                <p class="text-sm font-extrabold text-sky-400 mt-0.5">👥 ${totalUsers.toLocaleString()}</p>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div>
                <p class="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Views</p>
                <p class="text-sm font-extrabold text-emerald-400 mt-0.5">👁️ ${totalViews.toLocaleString()}</p>
            </div>
        </div>

    </div>

    <script>
        // Check age verification on initial page load
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

        let adClicked = false;
        let leaveTime = 0;
        let timerStarted = false;

        function openAd() {
            adClicked = true;
            leaveTime = Date.now();
            
            document.getElementById('step-1-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold";
            document.getElementById('step-2-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/30";

            const adBtn = document.getElementById('ad-link-btn');
            adBtn.innerHTML = "${t.appAdBtnWatching}";
            adBtn.className = "flex items-center justify-center w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg text-sm";
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
                    statusText.innerText = "${t.appStatusWarning}";
                    statusText.className = "text-xs text-rose-400 mt-2 font-semibold";
                    adBtn.innerHTML = "${t.appAdBtnAgain}";
                    adBtn.className = "flex items-center justify-center w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg text-sm";
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
            const progressBar = document.getElementById('progress-bar');
            const mainCard = document.getElementById('main-card');

            statusText.innerText = "${t.appStatusWait}";

            const timer = setInterval(() => {
                timeLeft--;
                countdownEl.innerText = timeLeft;
                progressBar.style.width = (timeLeft / 5) * 100 + "%";

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    
                    document.getElementById('step-2-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold";
                    document.getElementById('step-3-dot').className = "flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/30";

                    timerBox.classList.add('hidden');
                    successBox.classList.remove('hidden');

                    mainCard.classList.add('success-card');
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
            return ctx.reply("🛠️ **ਬੋට් නඩත්තු කටයුතු සිදු කරමින් පවතී!**\n\nකරුණාකර சிறிது වේලාවකින් නැවත උත්සාහ කරන්න.", { parse_mode: 'Markdown' });
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
        return ctx.reply("❌ මෙම විධානය භාවිතා කළ හැක්කේ ඇඩ්මින්ට පමණි.");
    }

    try {
        let setting = await SettingModel.findOne({ key: 'maintenance_mode' });
        if (!setting) {
            setting = await SettingModel.create({ key: 'maintenance_mode', value: true });
        } else {
            setting.value = !setting.value;
            await setting.save();
        }

        const statusText = setting.value ? "🔴 සක්‍රීය කරන ලදී (Enabled)" : "🟢 අක්‍රීය කරන ලදී (Disabled)";
        await ctx.reply(`🛠 **Maintenance Mode Status:**\n\n${statusText}`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error("Maintenance toggle error:", error);
        await ctx.reply("❌ දෝෂයක් ඇති විය.");
    }
});

// Language Command
bot.command('language', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];

    await ctx.reply(t.langSelect, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "සිංහල 🇱🇰", callback_data: "set_lang_si" },
                    { text: "English 🇬🇧", callback_data: "set_lang_en" }
                ]
            ]
        }
    });
});

bot.action('set_lang_si', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'si' } }, { upsert: true });
    await ctx.answerCbQuery("සිංහල භාෂාව තෝරන ලදී.");
    await ctx.editMessageText("✅ **භාෂාව සිංහල ලෙස වෙනස් කරන ලදී.**\n\nමූලික මෙනුව වෙත යාමට /start ටයිප් කරන්න.", { parse_mode: 'Markdown' });
});

bot.action('set_lang_en', async (ctx) => {
    const userId = ctx.from.id.toString();
    await UserModel.updateOne({ userId }, { $set: { language: 'en' } }, { upsert: true });
    await ctx.answerCbQuery("Language set to English.");
    await ctx.editMessageText("✅ **Language changed to English.**\n\nType /start to go to the main menu.", { parse_mode: 'Markdown' });
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
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.channelBtn, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
                        [{ text: t.howToUseBtn, callback_data: "how_to_use" }, { text: t.supportBtn, callback_data: "support_info" }],
                        [{ text: t.langBtn, callback_data: "change_language" }]
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
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.joinChannel, url: `https://t.me/${REQUIRED_CHANNEL.replace('@', '')}` }],
                        [{ text: t.checkSub, callback_data: `check_sub_${payload}` }]
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
                return ctx.reply(t.linkExpired);
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

            const warningMsg = await ctx.reply(warningText, { parse_mode: 'Markdown' });

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
            return ctx.reply(t.linkExpired);
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}&uid=${userId}`;

        await ctx.reply(
            `${t.clickBtnText}\n\n` +
            `${t.viewsCount} ${fileDoc.views}\n\n` +
            (lang === 'si' ? "මෙම බොත්තම එබූ විට විවෘත වන පිටුවෙන් දැන්වීම බලා තත්පර 5ක් රැඳී සිට අන්තර්ගතය ලබා ගන්න." : "Click the button below, view the ad on the page, wait 5 seconds, and get your content."),
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.watchAdText, web_app: { url: miniAppUrl } }],
                        [{ text: t.guideText, callback_data: "how_to_use" }]
                    ]
                }
            }
        );

    } catch (error) {
        console.error(error);
        ctx.reply(t.systemError);
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
            `📊 **බොට් හි සංඛ්‍යාලේඛන (Analytics Dashboard)**\n\n` +
            `👥 මුළු යුසර්ස්ලා (Total Users): **${totalUsers}**\n` +
            `🟢 සක්‍රීය පරිශීලකයන් (Active): **${activeUsers}**\n` +
            `🔴 බ්ලොක් කළ අය (Blocked): **${blockedUsers}**\n` +
            `📅 මෙම මාසයේ අලුත් යුසර්ස්ලා: **${monthlyUsers}**\n` +
            `📁 ගබඩා කර ඇති අන්තර්ගතයන්: **${totalFiles}**\n` +
            `🔗 මුළු ලින්ක් ක්ලික්ස් (Total Clicks): **${totalClicks}**\n` +
            `👁️ මුළු නැරඹුම් (Total Views): **${totalViews}**\n` +
            `📈 ඇඩ් සාර්ථකත්ව අනුපාතය (Conversion): **${conversionRate}%**`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error("Stats error:", error);
        await ctx.reply("❌ සංඛ්‍යාලේඛන ලබාගැනීමේදී දෝෂයක් ඇති විය.");
    }
});

// Admin Broadcast Command
bot.command('broadcast', async (ctx) => {
    const ADMIN_ID = process.env.ADMIN_ID;
    if (ctx.from.id.toString() !== ADMIN_ID) return;

    const repliedMessage = ctx.message.reply_to_message;
    if (!repliedMessage) {
        return ctx.reply("❌ කරුණාකර ඔබ බ්‍රෝඩ්කාස්ට් කිරීමට අවශ්‍ය පෝස්ට් එකට **Reply** කර `/broadcast` ලෙස යවන්න.");
    }

    await ctx.reply("🚀 පෝස්ට් බ්‍රෝඩ්කාස්ට් කිරීම ආරම්භ කරන ලදී...");

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
            } else {
                failedCount++;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    await ctx.reply(
        `📊 **පෝස්ට් බ්‍රෝඩ්කාස්ට් වාර්තාව:**\n\n` +
        `✅ සාර්ථකයි (Active): ${successCount}\n` +
        `🔴 බ්ලොක් කර ඇත (Blocked): ${blockedCount}\n` +
        `⚠️ අනෙකුත් දෝෂ: ${failedCount}`,
        { parse_mode: 'Markdown' }
    );
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
                return ctx.editMessageText(t.linkExpired);
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

            const warningMsg = await ctx.reply(warningText, { parse_mode: 'Markdown' });

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
            return ctx.editMessageText(t.linkExpired);
        }

        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}&uid=${userId}`;

        await ctx.editMessageText(
            `${t.clickBtnText}\n\n${t.viewsCount} ${fileDoc.views}`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: t.watchAdText, web_app: { url: miniAppUrl } }],
                        [{ text: t.guideText, callback_data: "how_to_use" }]
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
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "සිංහල 🇱🇰", callback_data: "set_lang_si" },
                    { text: "English 🇬🇧", callback_data: "set_lang_en" }
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

        await ctx.reply(t.guideContent, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error(error);
    }
});

bot.action('support_info', async (ctx) => {
    const userId = ctx.from.id.toString();
    const lang = await getUserLang(userId);
    const t = langs[lang];
    await ctx.answerCbQuery();
    await ctx.reply(t.supportMsg);
});

// --- Upload Workflow Actions ---

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
        "🛡️ **Protect Content (Download / Forward Restriction):**\n\n" +
        "මෙම අන්තර්ගතය යූසර්ස්ලාට **Forward සහ Download කිරීමට නොහැකි වන සේ** ආරක්ෂා (Block) කරන්න ඕනේද?",
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 ඔව්, Block කරන්න (Yes)", callback_data: "toggle_protect_yes" },
                        { text: "🔓 නැහැ, ඉඩ දෙන්න (No)", callback_data: "toggle_protect_no" }
                    ]
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
        "✅ **සැකසීම් සාර්ථකයි!**\n\n" +
        "🔒 Blur Mode: **ON**\n" +
        "🛡️ Protect Content: **ON (Block)**\n\n" +
        "දැන් අදාළ වීඩියෝව, ඡායාරූපය හෝ ලේඛනය එවන්න. අවසන් වූ පසු `/done` ටයිප් කරන්න.",
        { parse_mode: 'Markdown' }
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
        "✅ **සැකසීම් සාර්ථකයි!**\n\n" +
        "🔒 Blur Mode: **ස්ථාපිතයි**\n" +
        "🛡️ Protect Content: **OFF (Allow)**\n\n" +
        "දැන් අදාළ වීඩියෝව, ඡායාරූපය හෝ ලේඛනය එවන්න. අවසන් වූ පසු `/done` ටයිප් කරන්න.",
        { parse_mode: 'Markdown' }
    );
});

const pendingUploads = new Map();

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

            await ctx.reply(`✅ ඡායාරූපය එකතු විය! (මුළු ගණන: ${pending.videoMsgIds.length}). තවත් ඇත්නම් එවන්න, නැතහොත් /done ටයිප් කරන්න.`);
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
        "📸 Thumbnail එක ලැබුණා!\n\n" +
        "දැන් තෝරන්න මේකේ Thumbnail එක **Blur (Spoiler)** කරන්න ඕනේද නැද්ද කියලා:",
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔒 Blur කරන්න (Yes)", callback_data: "toggle_spoiler_yes" },
                        { text: "🔓 Blur කරන්න එපා (No)", callback_data: "toggle_spoiler_no" }
                    ]
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
        return ctx.reply("⚠️ මුලින්ම Thumbnail එකක් එවන්න.");
    }

    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, ctx.message.message_id);
        pending.videoMsgIds.push(forwarded.message_id);
        pendingUploads.set(userId, pending);

        await ctx.reply(`✅ අන්තර්ගතය එකතු විය! (මුළු ගණන: ${pending.videoMsgIds.length}). තවත් ඇත්නම් එවන්න, නැතහොත් `/done` ටයිප් කරන්න.`);
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
        return ctx.reply("⚠️ කරුණාකර මුලින්ම Thumbnail එකක් සහ අන්තර්ගතයක් (වීඩියෝ/ፎටෝ) එකක් හෝ කිහිපයක් එවන්න.");
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

        await ctx.reply(`✅ **සාර්ථකව ගබඩා විය!** (ගොනු ගණන: ${pending.videoMsgIds.length})\n\n🚀 ප්‍රධාන චැනල් එකට පෝස්ට් යවන ලදී!`, { parse_mode: 'Markdown' });

        const buttonText = pending.videoMsgIds.length > 1 ? "▶️ View Full Collection" : "▶️ View Content";
        const headerText = pending.videoMsgIds.length > 1 
            ? "🔥 **දැන් නිකුත් වූ විශේෂ කලෙක්ෂන් එක!** 🔥" 
            : "🔥 **දැන් නිකුත් වූ විශේෂ අන්තර්ගතය!** 🔥";

        await ctx.telegram.sendPhoto(MAIN_CHANNEL_ID, pending.photoFileId, {
            caption: `${headerText}\n\n` +
                     `✨ *${pending.caption}*\n\n` +
                     `📁 **අන්තර්ගතය:** ගොනු ${pending.videoMsgIds.length} ක් ඇතුළත් වේ.\n\n` +
                     `👇 **නරඹන්න පහත බොත්තම ක්ලික් කරන්න:**`,
            parse_mode: 'Markdown',
            has_spoiler: pending.hasSpoiler,
            reply_markup: {
                inline_keyboard: [
                    [{ text: buttonText, url: shareLink }],
                    [{ text: "📢 Join Backup Channel", url: `https://t.me/+bCed3QPGYqQ3MWY9` }]
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
