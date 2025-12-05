module.exports.config = {
  name: "حذف",
  version: "1.0",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "يحذف رسالة البوت إذا طلب العضو ذلك",
  commandCategory: "خدمات",
  usages: "حذف (رد على رسالة البوت)",
  cooldowns: 0,
};

module.exports.run = async function({ api, event }) {
  try {
    // تحقق أن المستخدم رد على رسالة
    if (!event.messageReply) 
      return api.sendMessage("↯︙يرجى الرد على رسالة البوت فقط بكلمة حذف", event.threadID, event.messageID);

    // تحقق أن الرسالة الأصلية من البوت
    if (event.messageReply.senderID != api.getCurrentUserID())
      return api.sendMessage("↯︙يمكن حذف رسائل البوت فقط (⌣̀_𓁹҂)‏", event.threadID, event.messageID);

    // احذف الرسالة الأصلية من البوت
    api.unsendMessage(event.messageReply.messageID);

    // احذف رسالة العضو "حذف" بعد لحظات بسيطة
    setTimeout(() => api.unsendMessage(event.messageID), 1000);

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ حدث خطأ أثناء محاولة حذف الرسالة.", event.threadID, event.messageID);
  }
};