module.exports.config = {
  name: "اشعار",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "ChatGPT",
  description: "إرسال إشعار لجميع المجموعات",
  commandCategory: "أدوات",
  usages: "",
  cooldowns: 3
};

module.exports.run = async ({ api, event }) => {
  return api.sendMessage(
    "🔔 رد على رسالتي بالرسالة التي تريد إرسالها لجميع المجموعات.",
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "sendNotify"
      });
    }
  );
};

module.exports.handleReply = async ({ api, event, handleReply }) => {

  // السماح فقط لصاحب الأمر
  if (event.senderID != handleReply.author) return;

  switch (handleReply.type) {
    case "sendNotify": {
      const msg = event.body;

      // الحصول على جميع الخيوط
      const allThreads = global.data.allThreadID;

      for (const thread of allThreads) {
        api.sendMessage(`📢 إشعار إداري:\n\n${msg}`, thread);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      api.sendMessage("✅ تم إرسال الإشعار لجميع المجموعات.", event.threadID);
      break;
    }
  }
};
