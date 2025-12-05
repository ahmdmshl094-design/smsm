const fs = require("fs");
const path = require("path");

// 📂 ملف حفظ حالة التفعيل
const dataPath = path.join(__dirname, "antilink.json");

if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

function loadData() {
  return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports.config = {
  name: "antilink",
  version: "1.0",
  hasPermssion: 1,
  credits: "محمد إدريس",
  description: "منع الروابط مع تحذير وطرد تلقائي",
  commandCategory: "الحماية",
  usages: "antilink [on/off]",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args }) {
  const data = loadData();
  const threadID = event.threadID;

  if (!args[0]) return api.sendMessage("استخدم: antilink on/off", threadID);

  if (args[0].toLowerCase() === "on") {
    data[threadID] = true;
    saveData(data);
    return api.sendMessage("🚫 نظام منع الروابط مفعل.", threadID);
  } else if (args[0].toLowerCase() === "off") {
    delete data[threadID];
    saveData(data);
    return api.sendMessage("✅ نظام منع الروابط متوقف.", threadID);
  } else {
    return api.sendMessage("استخدم: antilink on أو off فقط.", threadID);
  }
};

module.exports.handleEvent = async function({ api, event, Threads, Users }) {
  if (event.type !== "message" || !event.body) return;
  const data = loadData();
  const threadID = event.threadID;
  const senderID = event.senderID;
  const body = event.body;

  // 🔒 تحقق من التفعيل
  if (!data[threadID]) return;

  // 🧩 تحقق من وجود رابط
  const linkRegex = /(https?:\/\/|www\.)/i;
  if (!linkRegex.test(body)) return;

  // 🛡️ تجاهل الأدمن والمطور
  const threadInfo = await api.getThreadInfo(threadID);
  const admins = threadInfo.adminIDs.map(a => a.id);
  const developerID = "61570782968645"; // ضع آي دي المطور هنا

  if (admins.includes(senderID) || senderID === developerID) return;

  // 🚫 تفاعل وإنذار
  try {
    await api.setMessageReaction("🚫", event.messageID, () => {}, true);
  } catch {}
  await api.sendMessage("احذف (⌣̀_𓁹҂)‏", threadID, event.messageID);

  // ⏳ انتظار 5 ثواني
  await new Promise(r => setTimeout(r, 5000));

  // 📥 فحص هل الرسالة ما زالت موجودة
  try {
    await api.removeUserFromGroup(senderID, threadID);
    api.sendMessage("تم الجغم بنجاح (⌣̀_𓁹)", threadID);
  } catch (e) {
    api.sendMessage("ما قدرت أطرد العضو، تأكد إن البوت أدمن (⌣̀_𓁹)", threadID);
  }
};