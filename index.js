const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MONGO_URI = process.env.MONGO_URI;

// ඔබේ Adsterra Smart Link එක
const AD_LINK = process.env.AD_LINK || "https://www.profitableratecpmnetwork.com/g7p33na9?key=d6d0cdc4f9da3f0a448d3a891515c3ac"; 

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 1. Mongoose Schema for Files
const fileSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    fileMsgId: { type: Number, required: true }
});
const FileModel = mongoose.model('File', fileSchema);

// Express App setup for Render (Bot + Web App combined)
const app = express();
app.use(express.urlencoded({ extended: true }));

// Mini App HTML Page Endpoint (Render එකෙන්ම ලෝඩ් වන වෙබ් පේජ් එක)
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
        </head>
        <body class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
            <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full">
                <h1 class="text-xl font-bold mb-2">🎬 වීඩියෝව සූදානම් වෙමින් පවතී</h1>
                <p class="text-slate-400 text-xs mb-6">කරුණාකර පහත දැක්වෙන දැන්වීම නරඹා තත්පර 5ක් රැඳී සිටින්න.</p>

                <!-- ඇඩ් එක ඕපන් කරගැනීමට බටන් එකක් (Pop-up blocker මඟහරවා ගැනීමට) -->
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

                    // බටන් එක පෙනුම වෙනස් කිරීම
                    const adBtn = document.getElementById('ad-link-btn');
                    adBtn.innerText = "✅ දැන්වීම විවෘත විය";
                    adBtn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
                    adBtn.classList.add('bg-slate-800', 'text-slate-400');

                    // ටයිමර් එක පෙන්වීම
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
                    const botUsername = "${process.env.BOT_USERNAME || 'YourBotUsername'}";
                    window.location.href = "https://t.me/" + botUsername + "?start=" + "${token}";
                }
            </script>
        </body>
        </html>
    `);
});

// /start command with Deep Link token
bot.start(async (ctx) => {
    const payload = ctx.startPayload;
    const userId = ctx.from.id;

    if (!payload) {
        return ctx.reply("ආයුබෝවන්! මම File Store Bot එකයි. වීඩියෝ ලබා ගැනීමට නිවැරදි ලින්ක් එකක් භාවිතා කරන්න.");
    }

    try {
        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        // Render එකේ සර්වර් යූආර්එල් එක ලබා ගැනීම (Render එකෙන් AUTO දෙන Render external URL එක මෙහි පාවිච්චි වේ)
        const renderUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
        const miniAppUrl = `${renderUrl}/miniapp?token=${payload}`;

        // Telegram Web App button එක හරහා Mini App එක පෙන්වීම
        await ctx.reply(
            "🔓 **වීඩියෝව ලබා ගැනීමට පහත බොත්තම ඔබන්න:**\n\n" +
            "මෙම බොත්තම එබූ විට විවෘත වන පිටුවෙන් තත්පර 5ක් රැඳී සිට වීඩියෝව ලබා ගන්න.",
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "▶️ Watch Ad & Get Video", web_app: { url: miniAppUrl } }]
                    ]
                }
            }
        );

    } catch (error) {
        console.error(error);
        ctx.reply("පද්ධතියේ දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

// Admin වීඩියෝවක් එව්වොත් එය ස්ටෝර් කර ලින්ක් එකක් සදා දීම
bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    if (ADMIN_ID && userId !== ADMIN_ID) {
        return ctx.reply("❌ සමාවන්න! මෙම බොට් හරහා වීඩියෝ ගබඩා කිරීමට අවසර ඇත්තේ ඇඩ්මින්ට පමණි.");
    }

    const message = ctx.message;
    const msgId = message.message_id;
    try {
        const forwarded = await ctx.telegram.forwardMessage(DB_CHANNEL_ID, ctx.chat.id, msgId);
        const dbMsgId = forwarded.message_id;
        const token = Math.random().toString(36).substring(2, 10);

        await FileModel.create({
            token: token,
            fileMsgId: dbMsgId
        });

        const botUsername = ctx.botInfo.username;
        const shareLink = `https://t.me/${botUsername}?start=${token}`;

        ctx.reply(`✅ වීඩියෝව සාර්ථකව ගබඩා විය!\n\n🔗 **Share Link:**\n\`${shareLink}\``, {
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error(error);
        ctx.reply("වීඩියෝව සේව් කරගැනීමේදී දෝෂයක් ඇති විය.");
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
