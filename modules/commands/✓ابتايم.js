module.exports.config = {
  name: "ابتايم",
  version: "1.1",
  hasPermssion: 0,
  credits: "محمد ادريس",
  description: "يعرض وقت التشغيل وعدد القروبات وحالة البوت",
  commandCategory: "خدمات",
  usages: "ابتايم",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Threads }) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  // جلب كل القروبات
  const allThreads = await Threads.getAll();
  const threadCount = allThreads.length;

  // حالة البوت
  const botStatus = "🟢 Online";

  // استايل الرسالة الفخم والبسيط
  const uptimeMessage = `
───────── 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘂𝘀 ─────────
⏳ مدة التشغيل : ${hours} ساعة | ${minutes} دقيقة | ${seconds} ثانية
📂 عدد القروبات : ${threadCount} مجموعة
💡 حالة البوت : ${botStatus}
🕰️ الوقت الحالي : ${new Date().toLocaleString()}
─────────────────────────────
`;

  return api.sendMessage(uptimeMessage, event.threadID);
};
