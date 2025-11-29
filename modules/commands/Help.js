module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "كولو + GPT",
  description: "قائمة الاوامر بشكل فخم ومقسم إلى فئات",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false, // ❌ لا حذف تلقائي
    delayUnsend: 20
  }
};

module.exports.run = async function({ api, event, args }) {
  const { commands } = global.client;
  const { threadID } = event;

  // تقسيم الفئات
  const categories = {};

  for (let [name, info] of commands) {
    const cat = info.config.commandCategory || "غير مصنف";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  }

  // استايل فخم
  let msg = `
╭─⭓〔 ✨ قائمة أوامر البوت ✨ 〕⭓──╮
│  البادئة المستخدمة:  [ / ]
│  عدد الأوامر: ${commands.size}
├───────────────────────────╯
`;

  // عرض الفئات
  for (let cat in categories) {
    msg += `\n⟣─〔 ${cat} 〕─⟣\n`;
    msg += categories[cat].map(cmd => `• ${cmd}`).join("\n");
    msg += "\n──────────────────────\n";
  }

  msg += "⚠️ ملاحظة: لعرض شرح أي أمر استخدم:\n  /help اسم_الأمر\n\n";
  msg += "✨ تم تصميم الاستايل بشكل فخم ومنظم";

  return api.sendMessage(msg, threadID);
};
