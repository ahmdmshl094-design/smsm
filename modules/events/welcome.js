module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "محمد إدريس",
};

module.exports.run = async function ({ api, event }) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    let addedUser = event.logMessageData.addedParticipants;
    if (!addedUser || addedUser.length === 0) return;

    addedUser.forEach(user => {
      const name = user.fullName;

      // تحقق إذا الشخص الذي أضاف هو البوت نفسه
      if (user.userFbId === api.getCurrentUserID()) {
        // رسالة خاصة عند إضافة البوت إلى مجموعة جديدة
        const msg = 
`╭──〔  تم الاتصال 🔵 بنجاح 〕──
│
│ ↫اسم البوت   ⤹  𝑲𝒀𝑹𝑶𝑺 ❘  𝑩𝑶𝑻 ⇊
│
│ ↫الاصدار     : 〘3.7.0〙
│
│ ↫عدد الاوامر:  〘126〙
│
│ ↫البادئة : 〘-〙
│
│↫⇨ المطور: ڪولو سـان 
│
│↫🤍 اللهم صل وسلم على نبينا محمد ﷺ
╰──────────────`;
        api.sendMessage(msg, event.threadID);
      } else {
        // رسالة الترحيب العادية
        const msg = 
`◆━━━━━▷ ✦ ◁━━━━━◆
❏ أهلاً بـك يا | ${name}
❏ انضممت الآن إلى | ${groupName}
❏ رقمـك بيننا | ${memberCount}
❏ لا تثـق كثيـراً… فـالقلـوب تتغيّـر 🖤
◆━━━━━▷ ✦ ◁━━━━━◆`;

        api.sendMessage(msg, event.threadID);
      }
    });
  } catch (err) {
    console.error("Welcome event error:", err);
  }
};
