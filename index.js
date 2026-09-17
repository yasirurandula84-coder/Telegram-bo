const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mongoose Schema for Files
const fileSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  fileMsgId: { type: Number, required: true }
});

const FileModel = mongoose.model('File', fileSchema);

// /start command with Deep Link token
bot.start(async (ctx) => {
    const payload = ctx.startPayload; // උදාහරණයක් ලෙස: token එක

    if (!payload) {
        return ctx.reply("ආයුබෝවන්! මම File Store Bot එකයි. වීඩියෝ ලබා ගැනීමට නිවැරදි ලින්ක් එකක් භාවිතා කරන්න.");
    }

    try {
        const fileDoc = await FileModel.findOne({ token: payload });

        if (fileDoc) {
            // ප්‍රයිවට් චැනල් එකෙන් අදාළ වීඩියෝව පරිශීලකයාට ෆෝවර්ඩ් කිරීම
            await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgId);
        } else {
            ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("පද්ධතියේ දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

// Admin වීඩියෝවක් එව්වොත් එය ස්ටෝර් කර ලින්ක් එකක් සදා දීම
bot.on(['video', 'document'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const ADMIN_ID = process.env.ADMIN_ID;

    // මෙතැනදී පරීක්ෂා කරන්නේ වීඩියෝව එවන්නේ Admin ද කියලා පමණයි
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


// Render එකට අවශ්‍ය සර්වර් හෝ පෝට් අවශ්‍යතාවය (Render Web Service එකක් ලෙස රන් කිරීමට)
const PORT = process.env.PORT || 3000;
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running successfully!');
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    bot.launch();
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
