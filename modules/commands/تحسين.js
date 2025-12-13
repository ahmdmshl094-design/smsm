const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "تحسين",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "تحسين جودة الصورة",
  commandCategory: "ترفيه",
  usages: "تحسين",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  api.sendMessage("📸 أرسل لي الصورة اللي عايز تحسّن جودتها.", threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: senderID,
      type: "getImage"
    });
  });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { senderID, threadID, messageID, attachments } = event;
  if(senderID !== handleReply.author) return;

  if(handleReply.type === "getImage") {
    if(!attachments || attachments.length === 0) {
      return api.sendMessage("❌ ما لقيت صورة، حاول تاني.", threadID);
    }

    const imageUrl = attachments[0].url;
    // نسخ الصورة محلياً
    const imagePath = path.join(__dirname, "cache", `${senderID}.jpg`);
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    // نرسل رسالة اختيار الدقة
    api.sendMessage("🎯 اختر الدقة: 1️⃣ 2×   2️⃣ 4×", threadID, (err, info) => {
      global.client.handleReply.push({
        name: handleReply.name,
        messageID: info.messageID,
        author: senderID,
        type: "chooseScale",
        imagePath
      });
    });
  }

  if(handleReply.type === "chooseScale") {
    let scale = event.body.trim();
    if(scale !== "1" && scale !== "2") return api.sendMessage("❌ اختار 1 أو 2.", threadID);

    scale = scale === "1" ? 2 : 4;

    // هنا تضع طلب الـ API لتحسين الصورة
    // مثال: API_UPSCALE(imagePath, scale) => imageEnhancedPath

    const enhancedPath = handleReply.imagePath; // مؤقت قبل الدمج مع API

    api.sendMessage({
      body: `✅ تم تحسين الصورة بدقة ${scale}×`,
      attachment: fs.createReadStream(enhancedPath)
    }, threadID);
  }
};
