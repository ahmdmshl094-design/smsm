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
  version: "1.0.6",
  hasPermssion: 1,
  credits: "مطور",
  description: "إعدادات حماية المجموعة",
  commandCategory: "إدارة",
  usages: "اعدادات",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

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

  // جميع الإعدادات تبدأ [❌] إذا لم يتم تفعيلها
  const msg = `
💠⚙️ 𝐆𝐫𝐨𝐮𝐩 𝐏𝐫𝐨𝐭𝐞𝐜𝐭𝐢𝐨𝐧 ⚙️💠
━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ • منع تغيير الكنيات       : ${s.antiNickname ? "[✅] مفعل" : "[❌] معطل"}
2️⃣ • منع المغادرة            : ${s.antiLeave ? "[✅] مفعل" : "[❌] معطل"}
3️⃣ • منع تغيير اسم المجموعة  : ${s.antiName ? "[✅] مفعل" : "[❌] معطل"}
4️⃣ • منع تغيير صورة المجموعة : ${s.antiImage ? "[✅] مفعل" : "[❌] معطل"}

━━━━━━━━━━━━━━━━━━━━━━━
📌 *قم بالرد بالأرقام لفصلها بمسافة لتفعيل/تعطيل أكثر من خيار.*
📌 *بعد الاختيار، تفاعل ب 👍 لحفظ الإعدادات الجديدة.*
`;

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

  const choices = body.trim().split(/\s+/).map(x => parseInt(x)).filter(x => [1,2,3,4].includes(x));
  if (choices.length === 0) return;

  const data = loadData();
  if (!data[threadID]) return;

  const threadInfo = await api.getThreadInfo(threadID);

  let msg = "🔄 تم تحديث الإعدادات:\n";

  for (let choice of choices) {
    let key = "", name = "";
    switch (choice) {
      case 1: key = "antiNickname"; name = "منع تغيير الكنيات"; break;
      case 2: key = "antiLeave"; name = "منع المغادرة"; break;
      case 3: key = "antiName"; name = "منع تغيير اسم المجموعة"; break;
      case 4: key = "antiImage"; name = "منع تغيير صورة المجموعة"; break;
    }
    data[threadID][key] = !data[threadID][key];

    if (key === "antiNickname" && data[threadID][key]) {
      data[threadID].nicknames = threadInfo.nicknames || {};
    }
    if (key === "antiName" && data[threadID][key]) {
      data[threadID].name = threadInfo.name;
    }
    if (key === "antiImage" && data[threadID][key]) {
      data[threadID].image = threadInfo.imageSrc || "";
    }

    msg += `${data[threadID][key] ? "[✅]" : "[❌]"} ${name}\n`;
  }

  saveData(data);

  msg += "\n👍 تفاعل لحفظ الإعدادات الجديدة.";

  api.sendMessage(msg, threadID, messageID);
};

// حماية الكنيات عند التغيير
module.exports.onNicknameChange = async function({ api, event }) {
  const { threadID, author, nickname } = event;
  const data = loadData();
  if (!data[threadID]?.antiNickname) return;

  const originalNick = data[threadID].nicknames?.[author];
  if (originalNick && nickname !== originalNick) {
    try {
      await api.changeNickname(originalNick, threadID, author);
      api.sendMessage(`افطر انا قاعد م بخليك تلعب 🐸☝🏿`, threadID);
    } catch(e) {
      console.log("خطأ في إعادة الكنية:", e);
    }
  }
};

// حماية الاسم عند تغييره
module.exports.onNameChange = async function({ api, event }) {
  const { threadID, name } = event;
  const data = loadData();
  if (!data[threadID]?.antiName) return;

  const originalName = data[threadID].name;
  if (originalName && name !== originalName) {
    try {
      await api.setTitle(originalName, threadID);
      api.sendMessage(`افطر انا قاعد م بخليك تلعب 🐸☝🏿`, threadID);
    } catch(e) {
      console.log("خطأ في إعادة الاسم:", e);
    }
  }
};

// حماية الصورة عند تغييرها
module.exports.onImageChange = async function({ api, event }) {
  const { threadID, imageSrc } = event;
  const data = loadData();
  if (!data[threadID]?.antiImage) return;

  const originalImage = data[threadID].image;
  if (originalImage && imageSrc !== originalImage) {
    try {
      await api.setImage(originalImage, threadID);
      api.sendMessage(`افطر انا قاعد م بخليك تلعب 🐸☝🏿`, threadID);
    } catch(e) {
      console.log("خطأ في إعادة الصورة:", e);
    }
  }
};
