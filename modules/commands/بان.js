module.exports.config = {
  name: "بانكاي",
  version: "1.1",
  hasPermission: 1,
  credits: "Rako San",
  description: "طرد عضو عبر التاغ أو الرد على رسالته",
  commandCategory: "مطور",
  usages: "طرد @تاغ | أو رد على العضو",
  cooldowns: 5
};

const axios = require("axios");
const fs = require("fs");

module.exports.run = async function({ api, event, args, Users, Threads }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  // تحقق من صلاحية الأدمن داخل المجموعة
  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(admin => admin.id === senderID);
  if (!isAdmin) {
    return api.sendMessage("⛔ ليس لديك صلاحية لتنفيذ هذا الأمر", threadID, messageID);
  }

  let targetID = null;

  if (messageReply?.senderID) {
    targetID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  }

  if (!targetID) {
    return api.sendMessage("اعمل تاغ للعضو الذي تريد طرده 🐸💔", threadID, (err, info) => {
      if (!global.client.handleReply) global.client.handleReply = [];
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        threadID
      });
    }, messageID);
  }

  if (targetID === api.getCurrentUserID()) {
    return api.sendMessage("ʕᴗᴥಡ҂ʔ لا يمكنك طرد البوت", threadID, messageID);
  }

  try {
    await api.removeUserFromGroup(targetID, threadID);

    const imageUrl = "https://i.ibb.co/dwvYh0Yz/3098e2fb48d8ac91fe240de5ba4ff977.jpg";
    const path = __dirname + "/temp_ban.jpg";

    if (!fs.existsSync(path)) {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, response.data);
    }

    api.sendMessage({
      body: "تم تنفيذ حكم الاعدام 🐸☝🏿",
      attachment: fs.createReadStream(path)
    }, threadID, messageID);

  } catch (err) {
    console.error("❌ فشل في طرد العضو:", err.message);
    api.sendMessage("⚠️ لم أستطع طرد العضو، تحقق من صلاحيات البوت.", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, senderID, messageReply } = event;

  if (senderID !== handleReply.author || threadID !== handleReply.threadID) return;

  const targetID = messageReply?.senderID;
  if (!targetID) return;

  if (targetID === api.getCurrentUserID()) {
    return api.sendMessage("ʕᴗᴥಡ҂ʔ لا يمكنك طرد البوت", threadID, messageID);
  }

  try {
    await api.removeUserFromGroup(targetID, threadID);

    const imageUrl = "https://i.ibb.co/dwvYh0Yz/3098e2fb48d8ac91fe240de5ba4ff977.jpg";
    const path = __dirname + "/temp_ban.jpg";

    if (!fs.existsSync(path)) {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, response.data);
    }

    api.sendMessage({
      body: "تم تنفيذ حكم الاعدام 🐸☝🏿",
      attachment: fs.createReadStream(path)
    }, threadID, messageID);

  } catch (err) {
    console.error("❌ فشل في طرد العضو:", err.message);
    api.sendMessage("⚠️ لم أستطع طرد العضو، تحقق من صلاحيات البوت.", threadID, messageID);
  }
};
