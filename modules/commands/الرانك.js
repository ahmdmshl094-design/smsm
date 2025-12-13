const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "رانك",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "GPT-5",
  description: "يعرض بطاقة الرانك الخاصة بك مع شريط تقدم وخلفية",
  commandCategory: "الألعاب",
  usages: "رانك",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies }) {
  try {
    const userID = event.senderID;
    const userName = await Users.getNameUser(userID);

    // بيانات وهمية XP (تقدر تربطها بنظامك)
    const data = await Currencies.getData(userID);
    const exp = data.exp || 0;
    const level = Math.floor(exp / 1000);
    const expForNextLevel = 1000;
    const progress = Math.min(exp / expForNextLevel, 1); // نسبة شريط التقدم

    // تحميل صورة المستخدم
    const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
    const avatar = await Jimp.read(avatarURL);
    avatar.resize(180, 180).circle();

    // إنشاء البطاقة
    const card = await Jimp.read("https://i.ibb.co/kcJ7F6s/bg-card.png"); // رابط خلفية جاهزة
    card.resize(900, 250); // التأكد من الأبعاد

    // تحميل خط
    const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    // دمج صورة البروفايل
    card.composite(avatar, 30, 35);

    // كتابة النصوص
    card.print(fontBig, 240, 50, userName);
    card.print(fontSmall, 240, 110, `⭐ المستوى: ${level}`);
    card.print(fontSmall, 240, 150, `🔢 الخبرة: ${exp} XP`);

    // رسم شريط التقدم
    const barWidth = 500;
    const barHeight = 25;
    const xBar = 240;
    const yBar = 190;

    // الخلفية الرمادية للشريط
    card.scan(xBar, yBar, barWidth, barHeight, function (x, y, idx) {
      this.bitmap.data[idx + 0] = 100; // R
      this.bitmap.data[idx + 1] = 100; // G
      this.bitmap.data[idx + 2] = 100; // B
      this.bitmap.data[idx + 3] = 255; // Alpha
    });

    // جزء التقدم
    card.scan(xBar, yBar, barWidth * progress, barHeight, function (x, y, idx) {
      this.bitmap.data[idx + 0] = 255; // R
      this.bitmap.data[idx + 1] = 215; // G
      this.bitmap.data[idx + 2] = 0;   // B (ذهبي)
      this.bitmap.data[idx + 3] = 255; // Alpha
    });

    // حفظ الصورة
    const outputPath = path.join(__dirname, "rank_card.png");
    await card.writeAsync(outputPath);

    // إرسال البطاقة
    api.sendMessage(
      {
        body: "🎖️ بطاقة الرانك الخاصة بك:",
        attachment: fs.createReadStream(outputPath)
      },
      event.threadID,
      () => fs.unlinkSync(outputPath)
    );

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ حصل خطأ أثناء إنشاء بطاقة الرانك.", event.threadID);
  }
};
