const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports.config = {
  name: "شهرالعسل",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "صورة شهر العسل مركبة من بروفايلات الأشخاص",
  commandCategory: "ترفيه",
  usages: "شهر العسل @الشخص",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { senderID, threadID, mentions } = event;

  if(Object.keys(mentions).length === 0)
    return api.sendMessage("❌ لازم تشير لشخص عشان يكون العروسة.", threadID);

  const mentionedID = Object.keys(mentions)[0];

  try {
    // تحميل صور البروفايل
    const senderPic = await api.getUserInfo(senderID);
    const mentionedPic = await api.getUserInfo(mentionedID);

    const senderURL = senderPic[senderID].profileUrl;
    const mentionedURL = mentionedPic[mentionedID].profileUrl;

    const [imgSender, imgMentioned] = await Promise.all([
      loadImage(senderURL),
      loadImage(mentionedURL)
    ]);

    // صورة خلفية افتراضية (Base64 صغيرة)
    const bgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+gJqAAAAA..."; // ضع Base64 هنا
    const bg = await loadImage(bgData);

    // إعداد الكانفس
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0);

    // رسم العريس (المستخدم القائل)
    ctx.drawImage(imgSender, 50, 50, 150, 150);

    // رسم العروسة (الموشَر عليه)
    ctx.drawImage(imgMentioned, 250, 50, 150, 150);

    // حفظ الصورة
    const filePath = path.join(__dirname, "cache", `honeymoon_${Date.now()}.png`);
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
      api.sendMessage({ attachment: fs.createReadStream(filePath) }, threadID, () => {
        fs.unlinkSync(filePath);
      });
    });

  } catch(e) {
    console.error(e);
    api.sendMessage("❌ حصل خطأ أثناء توليد صورة شهر العسل.", threadID);
  }
};
