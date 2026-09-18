const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MONGO_URI = process.env.MONGO_URI;

// ඔබේ Adsterra Smart Links 2 මෙතැනට දාන්න
const AD_LINK_1 = process.env.AD_LINK_1 || "https://your-adsterra-link-1.com"; 
const AD_LINK_2 = process.env.AD_LINK_2 || "https://your-adsterra-link-2.com";

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

// 2. Mongoose Schema for User Ad Progress (යූසර්ගේ ඇඩ් බැලීමේ ප්‍රගතිය ට්‍රැක් කිරීමට)
const userProgressSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    token: { type: String, required: true },
    ad1Clicked: { type: Boolean, default: false },
    ad2Clicked: { type: Boolean, default: false }
});
const UserProgressModel = mongoose.model('UserProgress', userProgressSchema);

// /start command with Deep Link token (Ad Locker Step)
bot.start(async (ctx) => {
    const payload = ctx.startPayload; // token එක
    const userId = ctx.from.id;

    if (!payload) {
        return ctx.reply("ආයුබෝවන්! මම File Store Bot එකයි. වීඩියෝ ලබා ගැනීමට නිවැරදි ලින්ක් එකක් භාවිතා කරන්න.");
    }

    try {
        const fileDoc = await FileModel.findOne({ token: payload });
        if (!fileDoc) {
            return ctx.reply("සමාවන්න, මෙම ලින්ක් එක කල් ඉකුත් වී ඇත හෝ වැරදිය.");
        }

        // යූසර්ගේ ප්‍රගතිය ඩේටාබේස් එකෙන් සෙවීම හෝ සෑදීම
        let progress = await UserProgressModel.findOne({ userId, token: payload });
        if (!progress) {
            progress = await UserProgressModel.create({ userId, token: payload });
        }

        // ටික් ලකුණු පෙන්වීමේ තත්ත්වය
        const ad1Text = progress.ad1Clicked ? "✅ Ad 1 Viewed (Completed)" : "🔗 Click Here to View Ad 1";
        const ad2Text = progress.ad2Clicked ? "✅ Ad 2 Viewed (Completed)" : "🔗 Click Here to View Ad 2";

        let inlineKeyboard = [
            [{ text: ad1Text, url: AD_LINK_1 }],
            [{ text: ad2Text, url: AD_LINK_2 }]
        ];

        // ඇඩ් 2ම බලා ඇත්නම් 'Get Video' බටන් එක පෙන්වීම, නැත්නම් 'Verify' බටන් එක පෙන්වීම
        if (progress.ad1Clicked && progress.ad2Clicked) {
            inlineKeyboard.push([{ text: "🎬 Get Video Now", callback_data: `get_video_${payload}` }]);
        } else {
            inlineKeyboard.push([{ text: "🔄 Check Status & Verify", callback_data: `verify_ads_${payload}` }]);
        }

        await ctx.reply(
            "🔓 **වීඩියෝව අන්ලොක් කරගැනීමට පහත පියවර අනුගමනය කරන්න:**\n\n" +
            "1. ඉහත **Ad 1** සහ **Ad 2** ලින්ක්ස් දෙක ක්ලික් කර දැන්වීම් නරඹන්න.\n" +
            "2. දැන්වීම් බැලීමෙන් පසු පහත ඇති **'Check Status & Verify'** බටන් එක ඔබන්න.",
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: inlineKeyboard }
            }
        );

    } catch (error) {
        console.error(error);
        ctx.reply("පද්ධතියේ දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

// 'Verify Ads' බටන් එක එබූ විට (ඇඩ් 2ම බැලූ බව තහවුරු කර ගැනීම)
bot.action(/verify_ads_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    const userId = ctx.from.id;

    // මෙහිදී යූසර් ලින්ක්ස් ක්ලික් කර පැමිණ Verify එබූ විට ඇඩ් 2 සම්පූර්ණ කළ ලෙස සටහන් වේ
    await UserProgressModel.updateOne(
        { userId, token },
        { ad1Clicked: true, ad2Clicked: true }
    );

    await ctx.answerCbQuery("✔ දැන්වීම් තහවුරු කරන ලදී!");

    // බටන්ස් අප්ඩේට් කිරීම (Get Video බටන් එක පෙන්වීම)
    await ctx.editMessageText(
        "🎉 සියලුම දැන්වීම් සාර්ථකව පරීක්ෂා කරන ලදී! දැන් පහත බොත්තම ඔබා ඔබේ වීඩියෝව ලබා ගන්න.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Ad 1 Viewed", url: AD_LINK_1 }],
                    [{ text: "✅ Ad 2 Viewed", url: AD_LINK_2 }],
                    [{ text: "🎬 Get Video Now", callback_data: `get_video_${token}` }]
                ]
            }
        }
    );
});

// 'Get Video Now' බටන් එක එබූ විට වීඩියෝව එවීම
bot.action(/get_video_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    const fileDoc = await FileModel.findOne({ token });

    if (!fileDoc) {
        return ctx.answerCbQuery("❌ ගොනුව හමුවී නැත!", { show_alert: true });
    }

    try {
        await ctx.answerCbQuery("🎉 මෙන්න ඔබේ වීඩියෝව!");
        await ctx.telegram.copyMessage(ctx.chat.id, DB_CHANNEL_ID, fileDoc.fileMsgId);
    } catch (error) {
        console.error(error);
        ctx.answerCbQuery("❌ වීඩියෝව එවීමේදී දෝෂයක් ඇති විය.", { show_alert: true });
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

// Render එකට අවශ්‍ය සර්වර් සහ පෝට් සැකසුම
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
