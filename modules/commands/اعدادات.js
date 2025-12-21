const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "groupProtection.json");

function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try {
    return JSON.parse(fs.readFileSync(dataFile));
  } catch (e) {
    console.error("loadData error:", e);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("saveData error:", e);
  }
}

async function isAdminOfGroup(api, threadID, userID) {
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const senderID = String(userID);
    
    // البحث في قائمة المسؤولين
    if (threadInfo.adminIDs && Array.isArray(threadInfo.adminIDs)) {
      for (const admin of threadInfo.adminIDs) {
        if (String(admin.id || admin) === senderID) {
          return true;
        }
      }
    }
    
    // البحث في admins
    if (threadInfo.admins && Array.isArray(threadInfo.admins)) {
      for (const admin of threadInfo.admins) {
        if (String(admin.id || admin) === senderID) {
          return true;
        }
      }
    }
    
    // التحقق من المطورين
    const ADMINBOT = Array.isArray(global.config?.ADMINBOT)
      ? global.config.ADMINBOT.map(id => String(id))
      : [];
    
    if (ADMINBOT.includes(senderID)) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.error("isAdminOfGroup error:", e);
    return false;
  }
}

module.exports.config = {
  name: "اعدادات",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "مطور",
  description: "إعدادات حماية المجموعة",
  commandCategory: "إدارة",
  usages: "اعدادات",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  // التحقق من أن المستخدم مسؤول أو مطور
  const hasPermission = await isAdminOfGroup(api, threadID, senderID);
  
  if (!hasPermission) {
    return api.sendMessage("❌ هذا الأمر للمشرفين فقط!", threadID, messageID);
  }

  const data = loadData();
  const threadInfo = await api.getThreadInfo(threadID);

  // إنشاء البيانات الأساسية إذا لم تكن موجودة
  if (!data[threadID]) {
    data[threadID] = {
      enabled: true,
      antiNickname: false,
      antiLeave: false,
      antiName: false,
      antiImage: false,
      originalName: threadInfo.threadName || "",
      originalImage: threadInfo.imageSrc || "",
      nicknames: {}
    };
    
    // حفظ الكنيات الحالية
    if (threadInfo.participantData) {
      threadInfo.participantData.forEach((participant) => {
        if (participant.nickname) {
          data[threadID].nicknames[participant.userID] = participant.nickname;
        }
      });
    }
    
    saveData(data);
  }

  const s = data[threadID];

  let msg =
`✨⚙️ **إعــدادات حــمــايــة الــمــجــمــوعــة** ⚙️✨
━━━━━━━━━━━━━━━━━━━━━━━
📋 حالة الحماية: ${s.enabled ? "🟢 مفعلة" : "🔴 معطلة"}

1️⃣ • **منع تغيير الكنيات:** ${s.antiNickname ? "🟢 مفعل" : "🔴 معطل"}
2️⃣ • **منع المغادرة:** ${s.antiLeave ? "🟢 مفعل" : "🔴 معطل"}
3️⃣ • **منع تغيير اسم المجموعة:** ${s.antiName ? "🟢 مفعل" : "🔴 معطل"}
4️⃣ • **منع تغيير صورة المجموعة:** ${s.antiImage ? "🟢 مفعل" : "🔴 معطل"}

━━━━━━━━━━━━━━━━━━━━━━━
📩 *قم بالرد على الرسالة برقم الإعداد للتفعيل أو التعطيل.*
(مثال: ارسل 1 أو 1 2 3 4 لتفعيل أو تعطيل عدة خيارات)`;

  api.sendMessage(msg, threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        threadID,
        type: "settings"
      });
    }
  }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (String(threadID) !== String(handleReply.threadID)) return;

  // التحقق من أن المستخدم مسؤول أو مطور
  const hasPermission = await isAdminOfGroup(api, threadID, senderID);
  
  if (!hasPermission) {
    return api.sendMessage("❌ هذا الأمر للمشرفين فقط!", threadID, messageID);
  }

  // معالجة الإدخال (يمكن كتابة أرقام متعددة مفصولة بمسافات أو فواصل)
  const choices = String(body)
    .trim()
    .split(/[\s,]+/)
    .map(n => parseInt(n))
    .filter(n => !isNaN(n) && n >= 1 && n <= 4);

  if (choices.length === 0) {
    return api.sendMessage("❌ اختر رقم من 1 إلى 4 فقط.\nمثال: ارسل 1 أو 1 2 3 4", threadID, messageID);
  }

  const data = loadData();
  if (!data[threadID]) return;

  const settingsMap = {
    1: { key: "antiNickname", name: "منع تغيير الكنيات" },
    2: { key: "antiLeave", name: "منع المغادرة" },
    3: { key: "antiName", name: "منع تغيير اسم المجموعة" },
    4: { key: "antiImage", name: "منع تغيير صورة المجموعة" }
  };

  let response = "✅ تم تحديث الإعدادات:\n";

  choices.forEach((choice) => {
    const setting = settingsMap[choice];
    if (setting) {
      data[threadID][setting.key] = !data[threadID][setting.key];
      const status = data[threadID][setting.key] ? "🟢 مفعل" : "🔴 معطل";
      response += `\n${setting.name}: ${status}`;
    }
  });

  saveData(data);

  return api.sendMessage(response, threadID, messageID);
};
