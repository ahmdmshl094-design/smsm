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
  version: "1.1.0",
  hasPermssion: 1,
  credits: "انجالاتي",
  description: "إعدادات حماية المجموعة",
  commandCategory: "إدارة",
  usages: "اعدادات",
  cooldowns: 5
};

/* ================== الأمر ================== */
module.exports.run = async function ({ api, event }) {
  const { threadID, senderID } = event;

  const threadInfo = await api.getThreadInfo(threadID);
  const admins = threadInfo.adminIDs.map(e => e.id);
  if (!admins.includes(senderID)) {
    return api.sendMessage("❌ هذا الأمر للمسؤولين فقط.", threadID);
  }

  const data = loadData();
  if (!data[threadID]) {
    data[threadID] = {
      name: threadInfo.name || "",
      antiName: false,
      antiLeave: false,
      antiNickname: false
    };
    saveData(data);
  }

  const s = data[threadID];

  const msg = `
1️⃣ حماية اسم المجموعة        ${s.antiName ? "✅" : "❌"}
2️⃣ مكافحة تغيير الكُنى       ${s.antiNickname ? "✅" : "❌"}
3️⃣ مكافحة الخروج             ${s.antiLeave ? "✅" : "❌"}

✍️ رد بالأرقام (مثال: 1 3)
`;

  api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      author: senderID,
      messageID: info.messageID
    });
  });
};

/* ================== الرد ================== */
module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (event.senderID !== handleReply.author) return;

  const data = loadData();
  const s = data[event.threadID];
  const choices = event.body.split(" ").map(Number);

  for (const c of choices) {
    if (c === 1) s.antiName = !s.antiName;
    if (c === 2) s.antiNickname = !s.antiNickname;
    if (c === 3) s.antiLeave = !s.antiLeave;
  }

  saveData(data);
  api.sendMessage("✅ تم حفظ الإعدادات.", event.threadID);
};

/* ================== الأحداث ================== */
module.exports.handleEvent = async function ({ api, event }) {
  const data = loadData();
  const s = data[event.threadID];
  if (!s) return;

  /* 🔒 حماية الاسم */
  if (event.logMessageType === "log:thread-name" && s.antiName) {
    await api.setTitle(s.name, event.threadID);
    api.sendMessage("🚫 ممنوع تغيير اسم المجموعة 🐸☝🏿", event.threadID);
  }

  /* 🔒 حماية الكُنى */
  if (event.logMessageType === "log:user-nickname" && s.antiNickname) {
    const { participant_id, nickname } = event.logMessageData;
    await api.changeNickname("", event.threadID, participant_id);
    api.sendMessage("🚫 ممنوع تغيير الكُنى 🐸☝🏿", event.threadID);
  }

  /* 🔒 مكافحة الخروج */
  if (event.logMessageType === "log:unsubscribe" && s.antiLeave) {
    try {
      await api.addUserToGroup(
        event.logMessageData.leftParticipantFbId,
        event.threadID
      );
      api.sendMessage("😂 قال مارق بكرامتو 🐸☝🏿", event.threadID);
    } catch {}
  }
};
