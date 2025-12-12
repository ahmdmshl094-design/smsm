module.exports.config = {
  name: "غادر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "يغادر المجموعة إذا طلب المطور",
  commandCategory: "أدوات",
  usages: "",
  cooldowns: 3
};

module.exports.run = async ({ api, event }) => {
  const developerID = "61579001370029"; // ← ID المطور

  // السماح فقط للمطور الحقيقي
  if (event.senderID !== developerID) {
    return api.sendMessage("❌ هذا الأمر مخصص للمطور فقط.", event.threadID);
  }

  // إرسال الرسالة قبل المغادرة
  await api.sendMessage("🦧كنتم عبيد", event.threadID);

  // مغادرة البوت
  return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
};
