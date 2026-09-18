const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const DB_CHANNEL_ID = process.env.DB_CHANNEL_ID;
const MONGO_URI = process.env.MONGO_URI;

// ඔබේ Adsterra Smart Links 2 මෙතැනට දාන්න
const AD_LINK_1 = process.env.AD_LINK_1 || "https://www.profitableratecpmnetwork.com/g7p33na9?key=d6d0cdc4f9da3f0a448d3a891515c3ac"; 
const AD_LINK_2 = process.env.AD_LINK_2 || "https://www.profitableratecpmnetwork.com/x4nu2jpe7?key=e6f63d4148e5fe567831c01264bced81";

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

// 2. Mongoose Schema for User Ad Progress
const userProgressSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    token: { type: String, required: true },
    ad1Clicked: { type: Boolean, default: false },
    ad2Clicked: { type: Boolean, default: false }
});
const UserProgressModel = mongoose.model('UserProgress', userProgressSchema);

// උපකාරක ෆන්ක්ෂන් එක: යූසර්ගේ වත්මන් ප්‍රගතිය මත බටන්ස් සෑදීම
async function getAdKeyboard(userId, token) {
    let progress = await UserProgressModel.findOne({ userId, token });
    if (!progress) {
        progress = await UserProgressModel.create({ userId, token, ad1Clicked: false, ad2Clicked: false });
    }

    const ad1Text = progress.ad1Clicked ? "✅ Ad 1 Viewed (Completed)" : "🔗 Click Here to View Ad 1";
    const ad2Text = progress.ad2Clicked ? "✅ Ad 2 Viewed (Completed)" : "🔗 Click Here to View Ad 2";

    let inlineKeyboard = [
        // දැන් URL වෙනුවට callback_data දමා ඇත. එවිට යූසර් ක්ලික් කළ බව බොට් එකට අල්ලාගත හැක.
        [{ text: ad1Text, callback_data: `click_ad1_${token}` }],
        [{ text: ad2Text, callback_data: `click_ad2_${token}` }]
    ];

    // ඇඩ් 2ම ක්ලික් කර ඇත්නම් පමණක් 'Get Video Now' බටන් එක පෙන්වීම
    if (progress.ad1Clicked && progress.ad2Clicked) {
        inlineKeyboard.push([{ text: "🎬 Get Video Now", callback_data: `get_video_${token}` }]);
    } else {
        inlineKeyboard.push([{ text: "🔄 Check Status (Verify)", callback_data: `check_status_${token}` }]);
    }

    return inlineKeyboard;
}

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

        const keyboard = await getAdKeyboard(userId, payload);

        await ctx.reply(
            "🔓 **වීඩියෝව අන්ලොක් කරගැනීමට පහත පියවර අනුගමනය කරන්න:**\n\n" +
            "1. ඉහත **Ad 1** සහ **Ad 2** බටන් ක්ලික් කර දැන්වීම් දෙක නරඹන්න.\n" +
            "2. බැලීමෙන් පසු **'Check Status'** බටන් එක ඔබන්න.",
            {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: keyboard }
            }
        );

    } catch (error) {
        console.error(error);
        ctx.reply("පද්ධතියේ දෝෂයක් සිදු විය. කරුණාකර පසුව උත්සාහ කරන්න.");
    }
});

// Ad 1 ක්ලික් කළ විට (ඩේටාබේස් එකේ Ad 1 True කර, යූසර්ව ඇඩ් ලින්ක් එකට වෙබ් බ්‍රව්සර් එක හරහා යැවීම)
bot.action(/click_ad1_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    const userId = ctx.from.id;

    await UserProgressModel.updateOne({ userId, token }, { ad1Clicked: true });
    
    // යූසර්ට ඇඩ් ලින්ක් එක විවෘත කරගැනීමට ඊට අදාළ ලින්ක් එක ඇක්ෂන් එකක් මඟින් හෝ ඇලර්ට් එකක් මඟින් දීම
    await ctx.answerCbQuery("Opening Ad 1...", { url: AD_LINK_1 });

    // මෙනු බටන්ස් අප්ඩේට් කිරීම
    const keyboard = await getAdKeyboard(userId, token);
    try {
        await ctx.editMessageReplyMarkup({ inline_keyboard: keyboard });
    } catch (e) {}
});

// Ad 2 ක්ලික් කළ විට
bot.action(/click_ad2_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    const userId = ctx.from.id;

    await UserProgressModel.updateOne({ userId, token }, { ad2Clicked: true });
    
    await ctx.answerCbQuery("Opening Ad 2...", { url: AD_LINK_2 });

    const keyboard = await getAdKeyboard(userId, token);
    try {
        await ctx.editMessageReplyMarkup({ inline_keyboard: keyboard });
    } catch (e) {}
});

// 'Check Status' බටන් එක එබූ විට
bot.action(/check_status_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    const userId = ctx.from.id;

    const progress = await UserProgressModel.findOne({ userId, token });

    if (progress && progress.ad1Clicked && progress.ad2Clicked) {
        await ctx.answerCbQuery("✔ සියලුම දැන්වීම් සාර්ථකයි!");
        const keyboard = await getAdKeyboard(userId, token);
        await ctx.editMessageText(
            "🎉 දැන්වීම් දෙකම සාර්ථකව නරඹන ලදී! දැන් පහත බොත්තම ඔබා ඔබේ වීඩියෝව ලබා ගන්න.",
            { reply_markup: { inline_keyboard: keyboard } }
        );
    } else {
        await ctx.answerCbQuery("❌ කරුණාකර මුලින් Ad 1 සහ Ad 2 යන බටන් දෙකම ක්ලික් කර ඇඩ්ස් නරඹන්න!", { show_alert: true });
    }
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
