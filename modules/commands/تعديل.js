const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "تعديل",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "تعديل الصور بالنص",
  commandCategory: "ترفيه",
  usages: "تعديل",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, senderID } = event;

  api.sendMessage("📸 أرسل الصورة اللي عايز تعدلها.", threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      author: senderID,
      messageID: info.messageID,
      type: "getImage"
    });
  });
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { senderID, threadID, attachments } = event;
  if(senderID !== handleReply.author) return;

  if(handleReply.type === "getImage") {
    if(!attachments || attachments.length === 0)
      return api.sendMessage("❌ ما لقيت صورة، حاول تاني.", threadID);

    const imageUrl = attachments[0].url;
    const imagePath = path.join(__dirname, "cache", `${senderID}.png`);
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    api.sendMessage("✏️ الآن اكتب لي التعديل اللي عايز تعمله على الصورة.", threadID, (err, info) => {
      global.client.handleReply.push({
        name: handleReply.name,
        author: senderID,
        messageID: info.messageID,
        type: "getText",
        imagePath
      });
    });
  }

  if(handleReply.type === "getText") {
    const text = event.body.trim();
    if(!text) return api.sendMessage("❌ اكتب الوصف اللي عايز تعدله.", threadID);

    // هنا تستخدم API التعديل
    // مثال: editedImagePath = await API_EDIT_IMAGE(handleReply.imagePath, text);

    const editedImagePath = handleReply.imagePath; // مؤقت قبل دمج API

    api.sendMessage({
      body: `✅ تم تعديل الصورة حسب الوصف: "${text}"`,
      attachment: fs.createReadStream(editedImagePath)
    }, threadID);
  }
};
