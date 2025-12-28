const fs = require("fs");
const path = require("path");

const DEVELOPER_ID = "61579001370029";
const shellDataFile = path.join(__dirname, "../commands/cache/data/shellData.json");

function loadShellData() {
  if (!fs.existsSync(shellDataFile)) {
    fs.writeFileSync(shellDataFile, JSON.stringify({
      botImage: null,
      commandDisplayStyle: "grid",
      botPrefix: ".",
      customCommands: {}
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(shellDataFile));
  } catch (e) {
    return { botImage: null, commandDisplayStyle: "grid", botPrefix: ".", customCommands: {} };
  }
}

function saveShellData(data) {
  try {
    fs.writeFileSync(shellDataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("saveShellData error:", e);
  }
}

// قائمة أوامر المطور
const devCommands = [
  { name: "تغيير صورة البوت", code: "صورة" },
  { name: "تغيير طريقة عرض الأوامر", code: "عرض" },
  { name: "تغيير بادئة الأوامر", code: "بادئة" },
  { name: "إضافة أمر مخصص", code: "أضف" },
  { name: "حذف أمر مخصص", code: "حذف" },
  { name: "إعادة تشغيل البوت", code: "إعادة" },
  { name: "معلومات النظام", code: "معلومات" }
];

module.exports.config = {
  name: "شيل",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "Bot Developer",
  description: "لوحة تحكم البوت - للمطور فقط",
  commandCategory: "إدارة",
  usages: "شيل",
  cooldowns: 1
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  if (String(senderID) !== DEVELOPER_ID) {
    return api.sendMessage("❌ هذا الأمر متاح للمطور فقط!", threadID, messageID);
  }

  let message = `
قائمة المطور
────────

`;

  devCommands.forEach((cmd, i) => {
    message += `${i + 1}. ${cmd.name}\n`;
  });

  message += `
────────
للرد، اكتب رقم الامر
هياتو بوت
`;

  const sent = await api.sendMessage(message, threadID);

  global.client.handleReply.push({
    name: "شيل",
    messageID: sent.messageID,
    commands: devCommands,
    threadID,
    senderID
  });
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (String(senderID) !== DEVELOPER_ID) return;

  const choice = parseInt(body);
  if (isNaN(choice)) return;

  const index = choice - 1;
  const cmd = handleReply.commands[index];
  if (!cmd) return api.sendMessage("الرقم غير صحيح", threadID, messageID);

  // تنفيذ الأمر مباشرة حسب الرقم
  switch (cmd.code) {
    case "صورة":
      return api.sendMessage("✅ أرسل صورة جديدة لتغيير صورة البوت", threadID, messageID);
    case "عرض":
      return api.sendMessage("✅ اكتب 'grid' أو 'list' لتغيير طريقة عرض الأوامر", threadID, messageID);
    case "بادئة":
      return api.sendMessage("✅ اكتب البادئة الجديدة للأوامر", threadID, messageID);
    case "أضف":
      return api.sendMessage("✅ أرسل بيانات الأمر الجديد بصيغة JSON", threadID, messageID);
    case "حذف":
      return api.sendMessage("✅ اكتب اسم الأمر الذي تريد حذفه", threadID, messageID);
    case "إعادة":
      api.sendMessage("🔄 جاري إعادة تشغيل البوت...", threadID, messageID);
      setTimeout(() => process.exit(0), 2000);
      return;
    case "معلومات":
      const shellData = loadShellData();
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      return api.sendMessage(
        `معلومات النظام\n────────\nوقت التشغيل: ${hours}س ${minutes}د ${seconds}ث\nطريقة عرض الأوامر: ${shellData.commandDisplayStyle}\nبادئة الأوامر: ${shellData.botPrefix}\nأوامر مخصصة: ${Object.keys(shellData.customCommands).length}\nهياتو بوت`,
        threadID,
        messageID
      );
    default:
      return api.sendMessage(`تم اختيار الأمر: ${cmd.name}`, threadID, messageID);
  }
};
