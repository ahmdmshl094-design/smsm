module.exports.config = {
  name: "devsystem",
  version: "6.1.0",
  hasPermssion: 2, // خاص بالمطور
  credits: "Mohamed Idris",
  description: "Developer System + Linux Mode + Palace Choice + Maintenance (Settings Style)",
  commandCategory: "System",
  usages: "[+linux | palace choice | maintenance]",
  cooldowns: 3
};

const os = require("os");

// إعدادات النظام
let linuxMode = false;
let palaceChoice = false;
let maintenanceMode = false;
let palaceReplies = [
  "PALACE ACTIVATED!",
  "WELCOME TO THE PALACE!",
  "PALACE CHOICE IS ON!"
];

// ID المطور
const DEV_ID = "61570782968645";

// دالة لتنسيق الرسائل بأسلوب إعدادات النظام
function settingsStyle(title, content) {
  return `
==============================
        ${title.toUpperCase()}
==============================

${content}
`;
}

module.exports.run = async ({ api, event, args }) => {
  const cmd = args[0];

  // تحقق من المطور
  if (event.senderID !== DEV_ID) {
    return api.sendMessage("❌ THIS COMMAND IS DEVELOPER ONLY!", event.threadID, event.messageID);
  }

  // 📡 رد فعل عند تنفيذ أي أمر
  await api.sendMessage("📡", event.threadID, event.messageID);

  // +linux commands
  if (cmd === "linux") {
    const action = args[1];
    if (action === "on") {
      linuxMode = true;
      return api.sendMessage(settingsStyle("LINUX MODE", "✔️ LINUX MODE ACTIVATED!"), event.threadID, event.messageID);
    }
    if (action === "off") {
      linuxMode = false;
      return api.sendMessage(settingsStyle("LINUX MODE", "❌ LINUX MODE DEACTIVATED!"), event.threadID, event.messageID);
    }

    // عرض معلومات النظام
    const uptime = process.uptime();
    const memory = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
    const threads = await api.getThreadList(100, null, []);
    const content = 
      `LINUX MODE: ${linuxMode ? "ON ✓" : "OFF ✗"}\n` +
      `PALACE CHOICE: ${palaceChoice ? "ON ✓" : "OFF ✗"}\n` +
      `MAINTENANCE: ${maintenanceMode ? "ON ✓" : "OFF ✗"}\n` +
      `RAM USED: ${memory}MB\n` +
      `UPTIME: ${Math.floor(uptime / 60)} MINUTES\n` +
      `THREADS: ${threads.length}`;
    return api.sendMessage(settingsStyle("SYSTEM STATUS", content), event.threadID, event.messageID);
  }

  // Maintenance
  if (cmd === "maintenance") {
    const action = args[1];
    if (action === "on") {
      maintenanceMode = true;
      return api.sendMessage(settingsStyle("MAINTENANCE", "🛠️ MAINTENANCE MODE ENABLED! BOT IGNORES ALL USERS."), event.threadID, event.messageID);
    }
    if (action === "off") {
      maintenanceMode = false;
      return api.sendMessage(settingsStyle("MAINTENANCE", "🛠️ MAINTENANCE MODE DISABLED! BOT WORKS NORMALLY."), event.threadID, event.messageID);
    }
  }
};

// مراقبة Palace Choice و وضع الصيانة
module.exports.handleEvent = async ({ api, event }) => {
  const text = event.body?.toLowerCase();
  if (!text) return;

  const isAdmin = event.senderID === DEV_ID;

  // palace choice on/off
  if (isAdmin && text === "palace choice on") {
    palaceChoice = true;
    return api.sendMessage(settingsStyle("PALACE CHOICE", "PALACE CHOICE ACTIVATED!"), event.threadID, event.messageID);
  }
  if (isAdmin && text === "palace choice off") {
    palaceChoice = false;
    return api.sendMessage(settingsStyle("PALACE CHOICE", "PALACE CHOICE DEACTIVATED!"), event.threadID, event.messageID);
  }

  // الرد التلقائي عند Palace Choice مفعل
  if (palaceChoice && text.startsWith("-")) {
    const reply = palaceReplies[Math.floor(Math.random() * palaceReplies.length)];
    return api.sendMessage(settingsStyle("PALACE REPLY", reply), event.threadID, event.messageID);
  }

  // تجاهل جميع الأوامر إذا كان وضع الصيانة مفعل
  if (maintenanceMode && !isAdmin) return;
};
