const fs = require("fs");
const path = require("path");

const protectDir = path.join(__dirname, "../cache/protect/");
if (!fs.existsSync(protectDir)) fs.mkdirSync(protectDir, { recursive: true });

module.exports.config = {
  name: "إعدادات",
  version: "5.0",
  credits: "محمد إدريس + GPT",
  description: "نظام حماية متوافق مع dongdev/fca-unofficial",
  role: 1
};

// جلب بيانات الحماية
function getProtectData(threadID) {
  const filePath = path.join(protectDir, `${threadID}.json`);
  if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath));
  return {
    active: false,
    protectName: false,
    protectImage: false,
    protectNick: false,
    name: "",
    nicknames: {},
    imageBuffer: null
  };
}

// حفظ البيانات
function saveProtectData(threadID, data) {
  const filePath = path.join(protectDir, `${threadID}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports.run = async ({ api, event }) => {
  const threadID = event.threadID;
  const senderID = event.senderID;

  const thread = await api.getThreadInfo(threadID);
  const isAdmin = thread.adminIDs.some(e => e.id == senderID);

  if (!isAdmin)
    return api.sendMessage("❌ هذا الأمر للأدمن فقط.", threadID, event.messageID);

  const protectData = getProtectData(threadID);
  const status = (x) => (x ? "✅" : "❌");

  const msg = `
╭───『 ⚙️ إعدادات الحماية 』───╮
│ 1️⃣ حماية الاسم: ${status(protectData.protectName)}
│ 2️⃣ حماية الصورة: ${status(protectData.protectImage)}
│ 3️⃣ حماية الكنيات: ${status(protectData.protectNick)}
│ 4️⃣ تشغيل/إيقاف النظام: ${status(protectData.active)}
╰────────────────────────╯
💬 *أرسل أرقامًا لتعديل الإعدادات. ثم اضغط 👍 للحفظ.*
`;

  const sent = await api.sendMessage(msg, threadID);

  global.client.handleReply.push({
    name: module.exports.config.name,
    author: senderID,
    messageID: sent.messageID,
    type: "menu",
    data: protectData
  });
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  if (event.senderID !== handleReply.author) return;

  const threadID = event.threadID;
  const threadInfo = await api.getThreadInfo(threadID);
  const protectData = handleReply.data;

  const choices = event.body.match(/\d+/g)?.map(Number) || [];
  if (!choices.length) return;

  let changed = [];

  for (const num of choices) {
    switch (num) {
      case 1:
        protectData.protectName = !protectData.protectName;
        if (protectData.protectName) protectData.name = threadInfo.threadName;
        changed.push("حماية الاسم");
        break;

      case 2:
        protectData.protectImage = !protectData.protectImage;
        if (protectData.protectImage) {
          try {
            const img = await api.httpGetBuffer(threadInfo.imageSrc);
            protectData.imageBuffer = img.toString("base64");
          } catch (e) {}
        }
        changed.push("حماية الصورة");
        break;

      case 3:
        protectData.protectNick = !protectData.protectNick;
        if (protectData.protectNick) {
          threadInfo.participantIDs.forEach(uid => {
            protectData.nicknames[uid] = threadInfo.nicknames?.[uid] || "";
          });
        }
        changed.push("حماية الكنيات");
        break;

      case 4:
        protectData.active = !protectData.active;
        changed.push("تشغيل/إيقاف النظام");
        break;
    }
  }

  const sent = await api.sendMessage(
    `⚡ تم تعديل:\n- ${changed.join("\n- ")}\nاضغط 👍 لحفظ.`,
    threadID
  );

  global.client.handleReaction.push({
    name: module.exports.config.name,
    author: event.senderID,
    messageID: sent.messageID,
    data: protectData
  });
};

module.exports.handleReaction = async ({ api, event, handleReaction }) => {
  if (event.userID !== handleReaction.author) return;
  if (event.reaction !== "👍") return;

  saveProtectData(event.threadID, handleReaction.data);

  api.sendMessage("✅ تم حفظ الإعدادات بنجاح.", event.threadID);
};

// الأحداث التلقائية
module.exports.onEvent = async ({ api, event }) => {
  const threadID = event.threadID;
  const protectData = getProtectData(threadID);

  if (!protectData.active) return;

  // حماية الاسم
  if (event.logMessageType === "log:thread-name" && protectData.protectName) {
    const newName = event.logMessageData.name;
    if (newName !== protectData.name) {
      api.setTitle(protectData.name, threadID);
      api.sendMessage("🛡️ تمت إعادة اسم الجروب.", threadID);
    }
  }

  // حماية الصورة
  if (
    event.logMessageType === "log:thread-icon" &&
    protectData.protectImage &&
    protectData.imageBuffer
  ) {
    try {
      const buffer = Buffer.from(protectData.imageBuffer, "base64");
      api.changeGroupImage(buffer, threadID);
      api.sendMessage("🖼️ تمت إعادة صورة الجروب.", threadID);
    } catch (e) {}
  }

  // حماية الكنيات
  if (event.logMessageType === "log:user-nickname" && protectData.protectNick) {
    const uid = event.logMessageData.participant_id;
    const original = protectData.nicknames[uid];

    if (original && event.logMessageData.nickname !== original) {
      api.changeNickname(original, threadID, uid);
      api.sendMessage("👤 تمت إعادة الكنية الأصلية.", threadID);
    }
  }
};
