// admin.js - رفع المطور ادمن
module.exports.config = {
  name: "admin",
  version: "1.0",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "رفع المطور ادمن أو إرجاعه عضو",
  commandCategory: "المطور",
  usages: "admin",
  cooldowns: 3
};

const devID = "61579001370029";

module.exports.run = async ({ api, event }) => {
  const sender = event.senderID;

  // منع غير المطور
  if (sender != devID)
    return api.sendMessage("احش جدك ما قلنا الامر للمطور بس 🗿", event.threadID);

  // رسالـة البدء
  api.sendMessage(
    "💬 اكتب أحد الخيارات التالية:\n\n• ادمن → لرفعي كأدمن\n• عضو عادي → لإرجاعي عضو فقط",
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: sender,
        type: "adminSetting"
      });
    }
  );
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  if (event.senderID != handleReply.author)
    return api.sendMessage("احش جدك ما قلنا الامر للمطور بس 🗿", event.threadID);

  const text = event.body.toLowerCase();

  // رفع لأدمن
  if (text === "ادمن") {
    try {
      await api.changeAdminStatus(event.threadID, devID, true);
      return api.sendMessage("✔️ تم رفع المطور ادمن بنجاح", event.threadID);
    } catch {
      return api.sendMessage("❌ فشل في رفع الادمن. تأكد أن البوت أدمن.", event.threadID);
    }
  }

  // رجوع عضو
  if (text === "عضو عادي") {
    return api.sendMessage("تࢪقد 🫦", event.threadID);
  }

  // أي شيء آخر
  api.sendMessage("❌ خيار غير صحيح.. اكتب: ادمن / عضو عادي", event.threadID);
};
