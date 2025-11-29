module.exports.config = {
  name: "اوامر",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "كولو + GPT-5",
  description: "قائمة أوامر مقسمة لصفحات وكل سطر يحتوي 5 أوامر",
  commandCategory: "نظام",
  usages: "[1 | 2 | 3]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 20
  }
};

module.exports.run = async function({ api, event, args }) {
  const { commands } = global.client;
  const { threadID } = event;

  const prefix = "/";
  const page = parseInt(args[0]) || 1;

  // تحويل الأوامر إلى مصفوفة
  const allCmds = Array.from(commands.keys());

  // تقسيم إلى 3 صفحات بالتساوي
  const perPage = Math.ceil(allCmds.length / 3);
  const pages = [
    allCmds.slice(0, perPage),
    allCmds.slice(perPage, perPage * 2),
    allCmds.slice(perPage * 2)
  ];

  if (page < 1 || page > 3) {
    return api.sendMessage(`❌ اختر صفحة من 1 إلى 3 فقط.`, threadID);
  }

  const cmds = pages[page - 1];

  // كل 5 أوامر في سطر
  const formatted = [];
  for (let i = 0; i < cmds.length; i += 5) {
    formatted.push("• " + cmds.slice(i, i + 5).join("   • "));
  }

  // رسالة الاستايل
  const msg = `
╭─⭓〔 📄 قائمة الأوامر – صفحة ${page} من 3 〕⭓──╮
├───────────────────────────╯

${formatted.join("\n")}

────────────────────────
📌 عدد الأوامر: ${allCmds.length}
📌 البادئة: [ ${prefix} ]
📌 طريقة الاستخدام: ${prefix}help اسم_الأمر
📌 لفتح صفحة أخرى: ${prefix}اوامر 1 / 2 / 3
`;

  return api.sendMessage(msg, threadID);
};
