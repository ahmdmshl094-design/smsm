const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "armyData.json");

/* ================== DATA ================== */
function loadData() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
  try {
    return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  } catch {
    fs.writeFileSync(dataPath, "{}");
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const now = () => Date.now();

/* ================== CONFIG ================== */
module.exports.config = {
  name: "جيشي",
  version: "11.0.0",
  hasPermssion: 0,
  credits: "انجالاتي + تطوير عباس",
  description: "نظام جيش متقدم (نهب + حصار + مستويات)",
  commandCategory: "war",
  usages: "جيشي",
  cooldowns: 3
};

/* ================== RUN ================== */
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  let data = loadData();

  /* ===== تسجيل ===== */
  if (!data[senderID]) {
    if (args[0] !== "تسجيل") {
      return api.sendMessage(
        "✍️ للتسجيل:\nجيشي تسجيل <اسمك>",
        threadID,
        messageID
      );
    }

    const name = args.slice(1).join(" ") || "قائد مجهول";
    data[senderID] = {
      name,
      soldiers: 60,
      power: 35,
      defense: 30,
      shield: 0,
      gold: 300,
      nukes: 0,
      level: 1,
      armyLevel: 1,
      territories: [],
      sieges: {},
      lastNuke: 0,
      lastDaily: 0,
      trainingCooldown: 0
    };

    saveData(data);
    return api.sendMessage(`🪖 تم تسجيل جيشك باسم ${name}`, threadID, messageID);
  }

  const army = data[senderID];

  /* ===== عرض الجيش ===== */
  if (!args[0]) {
    return api.sendMessage(
`⚔️ جيش ${army.name}
━━━━━━━━━━━━━━
👤 مستوى القائد: ${army.level}
🪖 مستوى الجيش: ${army.armyLevel}
🪖 الجنود: ${army.soldiers}
⚔️ القوة: ${army.power}
🛡️ الدفاع: ${army.defense}
💰 الذهب: ${army.gold}
🌍 الأراضي: ${army.territories.join("، ") || "لا يوجد"}
━━━━━━━━━━━━━━`,
      threadID,
      messageID
    );
  }

  /* ===== تدريب ===== */
  if (args[0] === "تدريب") {
    if (now() - army.trainingCooldown < 600000)
      return api.sendMessage("⏳ التدريب كل 10 دقائق", threadID, messageID);

    const gain = Math.floor(Math.random() * 10) + 5;
    army.power += gain;
    army.trainingCooldown = now();
    saveData(data);

    return api.sendMessage(`💪 تدريب ناجح (+${gain} قوة)`, threadID, messageID);
  }

  /* ===== تجنيد ===== */
  if (args[0] === "تجنيد") {
    if (army.gold < 50)
      return api.sendMessage("❌ تحتاج 50 ذهب", threadID, messageID);

    const recruits = Math.floor(Math.random() * 10) + 5;
    army.soldiers += recruits;
    army.gold -= 50;
    saveData(data);

    return api.sendMessage(`🪖 تم تجنيد ${recruits} مشاة`, threadID, messageID);
  }

  /* ===== هجوم لاعب ===== */
  if (args[0] === "هاجم") {
    let targetID;
    if (mentions && Object.keys(mentions).length)
      targetID = Object.keys(mentions)[0];
    else if (messageReply)
      targetID = messageReply.senderID;

    if (!targetID || !data[targetID])
      return api.sendMessage("❌ حدد لاعب مسجل", threadID, messageID);
    if (targetID === senderID)
      return api.sendMessage("❌ لا تهاجم نفسك", threadID, messageID);

    const enemy = data[targetID];
    let damage = Math.max(0, army.power - enemy.defense);

    enemy.soldiers = Math.max(0, enemy.soldiers - damage);
    enemy.defense = Math.max(0, enemy.defense - Math.floor(damage / 2));

    // 📈 زيادة المستوى
    army.level += 1;
    army.armyLevel += 1;

    saveData(data);

    return api.sendMessage(
      `⚔️ هجوم ناجح!
خسائر العدو: ${damage}
📈 مستواك ارتفع`,
      threadID,
      messageID
    );
  }

  /* ===== نهب دولة ===== */
  if (args[0] === "انهب") {
    const country = args.slice(1).join(" ");
    if (!country)
      return api.sendMessage("❌ اكتب اسم الدولة", threadID, messageID);

    const loot = Math.floor(Math.random() * 300) + 100;
    army.gold += loot;

    army.level += 1;
    army.armyLevel += 1;

    saveData(data);

    return api.sendMessage(
      `💰 نهبت ${country}
+${loot} ذهب
📈 ارتفع مستواك`,
      threadID,
      messageID
    );
  }

  /* ===== حصار دولة ===== */
  if (args[0] === "حاصر") {
    const country = args.slice(1).join(" ");
    if (!country)
      return api.sendMessage("❌ اكتب اسم الدولة", threadID, messageID);

    if (army.territories.includes(country))
      return api.sendMessage("⚠️ هذه الدولة تحت سيطرتك بالفعل", threadID, messageID);

    if (army.sieges[country])
      return api.sendMessage("⏳ الحصار مستمر", threadID, messageID);

    army.sieges[country] = now();
    saveData(data);

    setTimeout(() => {
      const freshData = loadData();
      freshData[senderID].territories.push(country);
      delete freshData[senderID].sieges[country];
      saveData(freshData);

      api.sendMessage(
        `🏴‍☠️ تم حصار ${country} بنجاح!
🌍 أُضيفت إلى أراضيك`,
        threadID
      );
    }, 600000); // 10 دقائق

    return api.sendMessage(
      `⚔️ بدأ حصار ${country}
⏳ المدة: 10 دقائق`,
      threadID,
      messageID
    );
  }

  /* ===== عرض الأراضي ===== */
  if (args[0] === "أراضي") {
    return api.sendMessage(
      `🌍 أراضيك:
${army.territories.join("، ") || "لا توجد أراضي"}`,
      threadID,
      messageID
    );
  }

  return api.sendMessage("❌ أمر غير معروف", threadID, messageID);
};
