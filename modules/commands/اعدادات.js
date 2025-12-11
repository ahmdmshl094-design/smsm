const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "groupProtection.json");

function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try {
    return JSON.parse(fs.readFileSync(dataFile));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports.config = {
  name: "اعدادات",
  version: "1.0.3",
  hasPermssion: 1,
  credits: "مطور",
  description: "إعدادات حماية المجموعة",
  commandCategory: "إدارة",
  usages: "اعدادات",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  // تحقق من كون الشخص أدمن في المجموعة
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const admins = threadInfo.adminIDs.map(a => a.id);

    if (!admins.includes(senderID)) return; // تجاهل إذا ليس أدمن
  } catch {
    return;
  }

  const data = loadData();

  if (!data[threadID]) {
    data[threadID] = {
      enabled: false,
      name: "",
      image: "",
      nicknames: {},
      antiNickname: false,
      antiLeave: false,
      antiName: false,
      antiImage: false
    };
    saveData(data);
  }

  const s = data[threadID];

  // ✨ قائمة أنيقة مع رموز البداية [❌]
  const msg = `
🌟⚙️ 𝐆𝐫𝐨𝐮𝐩 𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 ⚙️🌟
━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  • منع تغيير الكنيات      : ${s.antiNickname ? "[✅] مفعل" : "[❌] معطل"}
2️⃣  • منع المغادرة           : ${s.antiLeave ? "[✅] مفعل" : "[❌] معطل"}
3️⃣  • منع تغيير اسم المجموعة : ${s.antiName ? "[✅] مفعل" : "[❌] معطل"}
4️⃣  • منع تغيير صورة المجموعة : ${s.antiImage ? "[✅] مفعل" : "[❌] معطل"}

━━━━━━━━━━━━━━━━━━━━━━━
📌 *قم بالرد على الرقم لتفعيل أو تعطيل الإعداد.*`;

  api.sendMessage(msg, threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: module.exports.config.name,
        author: senderID,
        messageID: info.messageID,
        type: "settings"
      });
    }
  }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (senderID !== handleReply.author) return;

  const choice = parseInt(body.trim());
  if (![1, 2, 3, 4].includes(choice)) return;

  const data = loadData();
  if (!data[threadID]) return;

  let key = "", name = "";

  switch (choice) {
    case 1: key = "antiNickname"; name = "منع تغيير الكنيات"; break;
    case 2: key = "antiLeave"; name = "منع المغادرة"; break;
    case 3: key = "antiName"; name = "منع تغيير اسم المجموعة"; break;
    case 4: key = "antiImage"; name = "منع تغيير صورة المجموعة"; break;
  }

  data[threadID][key] = !data[threadID][key];
  saveData(data);

  let msg = `${data[threadID][key] ? "[✅] تم تفعيل" : "[❌] تم تعطيل"} ${name}`;

  // إعادة الاسم أو الصورة أو الكنيات عند التفعيل
  try {
    const threadInfo = await api.getThreadInfo(threadID);

    if (key === "antiNickname") {
      const changedNicknames = threadInfo.approvalMode ? {} : threadInfo.nicknames || {};
      data[threadID].nicknames = changedNicknames;
      saveData(data);
      msg += `\n🔄 تم إعادة الكنيات الأصلية للأعضاء.`;
    }
    if (key === "antiName") {
      data[threadID].name = threadInfo.name;
      saveData(data);
      msg += `\n🔄 تم إعادة اسم المجموعة الأصلي.`;
    }
    if (key === "antiImage") {
      data[threadID].image = threadInfo.imageSrc || "";
      saveData(data);
      msg += `\n🔄 تم إعادة صورة المجموعة الأصلية.`;
    }
  } catch(e) {
    console.log("خطأ في إعادة البيانات:", e);
  }

  return api.sendMessage(msg, threadID, messageID);
};
