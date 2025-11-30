module.exports.config = {
  name: "ابتايم",
  version: "1.0",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "يعرض مدة تشغيل البوت وعدد المجموعات وحالة البوت بشكل مزخرف وأنيق",
  commandCategory: "خدمات",
  usages: "ابتايم",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const os = require('os');

  // 🕐 مدة التشغيل
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  // 🗂️ عدد المجموعات
  const threadCount = Object.keys(await api.getThreadList(100, null, [])).length;

  // ⚙️ حالة البوت
  const botStatus = "متصل ✅"; // يمكنك تغييره إلى أي حالة تريد، مثل "في وضع عدم الإزعاج"

  // ✨ الاستايل الجديد
  const serverData = `
╭─❖ ⌜ 𝐔𝐏 ⌛𝐓𝐢𝐦𝐞 ⌟ ❖─╮
│
│ 🕰️ • المدة: ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية
│ 👥 • عدد المجموعات: ${threadCount}
│ ⚙️ • الحالة: ${botStatus}
│
╰─❖ 𝐁𝐨𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 ❖─╯
`;

  return api.sendMessage(serverData, event.threadID);
};
