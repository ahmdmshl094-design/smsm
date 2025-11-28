const fs = require("fs");
const path = require("path");

const protectDir = path.join(__dirname, "../cache/protect/");
if (!fs.existsSync(protectDir)) fs.mkdirSync(protectDir, { recursive: true });

module.exports.config = {
  name: "إعدادات",
  version: "4.0",
  credits: "محمد إدريس",
  description: "إدارة إعدادات الحماية للأدمن مع حفظ مؤقت ومراقبة تلقائية",
  role: 1 // فقط الأدمن
};

// جلب بيانات الحماية
function getProtectData(threadID) {
  const filePath = path.join(protectDir, `${threadID}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return {
    active: false,
    protectName: false,
    protectImage: false,
    protectNick: false,
    name: "",
    nicknames: {},
    imageSrc: ""
  };
}

// حفظ بيانات الحماية
function saveProtectData(threadID, data) {
  const filePath = path.join(protectDir, `${threadID}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// عرض الإعدادات
module.exports.run = async ({ api, event }) => {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(admin => admin.id == senderID);
  if (!isAdmin) return api.sendMessage("❌ هذا الأمر للأدمن فقط.", threadID, event.messageID);

  const protectData = getProtectData(threadID);
  const status = (x) => (x ? "✅" : "❌");

  const msg = `
╭───『 ⚙️ إعدادات الحماية 』───╮
│
│ 1️⃣ حماية اسم الجروب : ${status(protectData.protectName)}
│ 2️⃣ حماية صورة الجروب : ${status(protectData.protectImage)}
│ 3️⃣ حماية الكنيات : ${status(protectData.protectNick)}
│ 4️⃣ تفعيل / تعطيل النظام بالكامل : ${status(protectData.active)}
│
╰────────────────────────╯
💬 *رد بالأرقام لتغيير أكثر من إعداد دفعة واحدة، كل رقم بسطر أو بمسافة.*
مثال:
1
2
3

ثم اضغط 👍 لحفظ التغييرات.
`;

  const sent = await api.sendMessage(msg, threadID, event.messageID);

  global.client.handleReply.push({
    name: module.exports.config.name,
    author: senderID,
    messageID: sent.messageID,
    type: "multiMenu",
    data: protectData
  });
};

// التعامل مع الردود متعددة الأرقام
module.exports.handleReply = async ({ api, event, handleReply }) => {
  if (event.senderID !== handleReply.author) return;

  const threadID = event.threadID;
  const protectData = handleReply.data;

  // استخراج كل الأرقام من الرد
  const choices = event.body.match(/\d+/g)?.map(x => parseInt(x)) || [];
  if (choices.length === 0) return api.sendMessage("❌ لم يتم التعرف على أي رقم.", threadID, event.messageID);

  // التبديل مؤقت لكل اختيار
  const toggle = (key) => (protectData[key] = !protectData[key]);
  let changes = [];

  const threadInfo = await api.getThreadInfo(threadID);

  for (const choice of choices) {
    switch (choice) {
      case 1:
        toggle("protectName");
        if (protectData.protectName) protectData.name = threadInfo.threadName;
        changes.push("حماية اسم الجروب");
        break;
      case 2:
        toggle("protectImage");
        if (protectData.protectImage) protectData.imageSrc = threadInfo.imageSrc || "";
        changes.push("حماية صورة الجروب");
        break;
      case 3:
        toggle("protectNick");
        if (protectData.protectNick) {
          threadInfo.participantIDs.forEach(uid => {
            protectData.nicknames[uid] = threadInfo.nicknames?.[uid] || "";
          });
        }
        changes.push("حماية الكنيات");
        break;
      case 4:
        toggle("active");
        changes.push("النظام بالكامل");
        break;
    }
  }

  // إرسال رسالة تطلب التفاعل للحفظ
  const info = await api.sendMessage(
    `⚡ تم تطبيق التغييرات مؤقتًا على:\n- ${changes.join("\n- ")}\n\nاضغط 👍 لحفظ الإعدادات الجديدة.`,
    threadID,
    event.messageID
  );

  global.client.handleReaction.push({
    name: module.exports.config.name,
    messageID: info.messageID,
    author: event.senderID,
    data: protectData
  });
};

// التعامل مع التفاعل لحفظ الإعدادات
module.exports.handleReaction = async ({ api, event, handleReaction }) => {
  if (event.userID !== handleReaction.author) return;
  if (event.reaction !== "👍") return;

  const threadID = event.threadID;
  const protectData = handleReaction.data;

  saveProtectData(threadID, protectData);

  api.sendMessage("✅ تم حفظ جميع التغييرات بنجاح 🔒", threadID);
};

// مراقبة الأحداث لتطبيق الحماية تلقائيًا
module.exports.onEvent = async ({ api, event }) => {
  const threadID = event.threadID;
  const protectData = getProtectData(threadID);

  if (!protectData.active) return;

  // حماية الاسم
  if (protectData.protectName && event.logMessageType === "log:thread-name") {
    if (event.logMessageData.name !== protectData.name) {
      api.setTitle(protectData.name, threadID);
      api.sendMessage("🛡️ تم إعادة اسم الجروب إلى الاسم المحمي.", threadID);
    }
  }

  // حماية الصورة
  if (protectData.protectImage && event.logMessageType === "log:thread-icon") {
    if (event.logMessageData.thread_icon !== protectData.imageSrc) {
      api.setThreadImage(protectData.imageSrc, threadID);
      api.sendMessage("🖼️ تم إعادة صورة الجروب الأصلية.", threadID);
    }
  }

  // حماية الكنيات
  if (protectData.protectNick && event.logMessageType === "log:user-nickname") {
    const changedUser = event.logMessageData.userID;
    const originalNick = protectData.nicknames[changedUser];
    if (originalNick && event.logMessageData.nickname !== originalNick) {
      api.changeNickname(originalNick, threadID, changedUser);
      api.sendMessage(`👤 تم إعادة كنية العضو ${changedUser} الأصلية.`, threadID);
    }
  }
};
