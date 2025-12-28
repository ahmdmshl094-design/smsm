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
  version: "9.0.0",
  hasPermssion: 0,
  credits: "انجالاتي + تطوير عباس",
  description: "نظام حروب شامل + دفاع ينقص + نووي + توب",
  commandCategory: "war",
  usages: "جيشي",
  cooldowns: 3
};

/* ================== RUN ================== */
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, messageReply } = event;
  let data = loadData();

  /* ===== تسجيل ===== */
  if (!data[senderID] && args[0] !== "تسجيل") {
    return api.sendMessage(
      "❌ لازم تسجل أولاً\n✍️ جيشي تسجيل <اسمك>",
      threadID,
      messageID
    );
  }

  if (args[0] === "تسجيل") {
    if (data[senderID])
      return api.sendMessage("⚠️ أنت مسجل مسبقًا", threadID, messageID);

    const name = args.slice(1).join(" ") || "قائد مجهول";

    data[senderID] = {
      name,
      soldiers: 60,
      power: 35,
      defense: 30,
      shield: 0,
      gold: 300,
      nukes: 0,
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
`◉⊱  جيشك - ${army.name} ⊰◉
━━━━━━━━━━━━━━
🪖 الجنود: ${army.soldiers}
⚔️ القوة: ${army.power}
🛡️ الدفاع: ${army.defense}
🛡️ الدرع: ${army.shield}
💰 الذهب: ${army.gold}
☢️ النووي: ${army.nukes}
━━━━━━━━━━━━━━`,
      threadID,
      messageID
    );
  }

  /* ===== يومي ===== */
  if (args[0] === "يومي") {
    if (now() - army.lastDaily < 86400000)
      return api.sendMessage("⏳ اليومي لم يجهز بعد", threadID, messageID);

    army.gold += 150;
    army.lastDaily = now();
    saveData(data);
    return api.sendMessage("🎁 استلمت 150 ذهب", threadID, messageID);
  }

  /* ===== تدريب ===== */
  if (args[0] === "تدريب") {
    if (now() - army.trainingCooldown < 600000)
      return api.sendMessage("⏳ التدريب كل 10 دقائق", threadID, messageID);

    const p = Math.floor(Math.random() * 10) + 5;
    const s = Math.floor(Math.random() * 5) + 1;

    army.power += p;
    army.soldiers += s;
    army.trainingCooldown = now();
    saveData(data);

    return api.sendMessage(
      `💪 تم تدريب الجيش\n+${p} قوة | +${s} جنود`,
      threadID,
      messageID
    );
  }

  /* ===== تفعيل درع ===== */
  if (args[0] === "دفاع") {
    if (army.gold < 100)
      return api.sendMessage("❌ تحتاج 100 ذهب", threadID, messageID);

    army.gold -= 100;
    army.shield += 50;
    saveData(data);

    return api.sendMessage("🛡️ تم تفعيل الدرع (+50)", threadID, messageID);
  }

  /* ===== تصنيع نووي ===== */
  if (args[0] === "نووي" && !args[1]) {
    if (army.gold < 500)
      return api.sendMessage("❌ تحتاج 500 ذهب", threadID, messageID);

    army.gold -= 500;
    army.nukes += 1;
    saveData(data);

    return api.sendMessage("☢️ تم تصنيع قنبلة نووية", threadID, messageID);
  }

  /* ===== هجوم عادي ===== */
  if (args[0] === "هاجم") {
    let targetID;
    if (mentions && Object.keys(mentions).length)
      targetID = Object.keys(mentions)[0];
    else if (messageReply)
      targetID = messageReply.senderID;

    if (!targetID)
      return api.sendMessage("❌ امنشن لاعب أو رد على رسالته", threadID, messageID);
    if (!data[targetID])
      return api.sendMessage("❌ اللاعب غير مسجل", threadID, messageID);
    if (targetID === senderID)
      return api.sendMessage("❌ لا يمكنك مهاجمة نفسك", threadID, messageID);

    const enemy = data[targetID];

    let damage = Math.max(0, army.power - enemy.defense);

    // 🛡️ الدرع ينقص أولاً
    if (enemy.shield > 0) {
      const shieldLoss = Math.min(enemy.shield, damage);
      enemy.shield -= shieldLoss;
      damage -= shieldLoss;
    }

    // 🛡️ الدفاع ينقص مع كل هجوم
    enemy.defense = Math.max(0, enemy.defense - Math.floor(damage / 2));

    enemy.soldiers = Math.max(0, enemy.soldiers - damage);

    saveData(data);

    return api.sendMessage(
      `⚔️ هجوم ناجح!
خسارة الجنود: ${damage}
انخفاض الدفاع: ${Math.floor(damage / 2)}`,
      threadID,
      messageID
    );
  }

  /* ===== هجوم نووي ===== */
  if (args[0] === "نووي" && args[1] === "هاجم") {
    if (army.nukes < 1)
      return api.sendMessage("❌ لا تملك سلاح نووي", threadID, messageID);

    if (now() - army.lastNuke < 3600000)
      return api.sendMessage("⏳ النووي كل ساعة", threadID, messageID);

    let targetID;
    if (mentions && Object.keys(mentions).length)
      targetID = Object.keys(mentions)[0];
    else if (messageReply)
      targetID = messageReply.senderID;

    if (!targetID || !data[targetID])
      return api.sendMessage("❌ حدد لاعب مسجل", threadID, messageID);

    const enemy = data[targetID];

    enemy.soldiers = Math.floor(enemy.soldiers * 0.5);
    enemy.defense = Math.floor(enemy.defense * 0.5);
    enemy.shield = 0;

    army.nukes -= 1;
    army.lastNuke = now();

    saveData(data);

    return api.sendMessage(
      "☢️ ضربة نووية مدمرة!\nتم تدمير نصف الجيش والدفاع",
      threadID,
      messageID
    );
  }

  /* ===== توب ===== */
  if (args[0] === "توب") {
    const top = Object.values(data)
      .sort((a, b) => b.soldiers - a.soldiers)
      .slice(0, 10);

    let msg = "🏆 أقوى الجيوش:\n\n";
    top.forEach((u, i) => {
      msg += `${i + 1}. ${u.name} 🪖 ${u.soldiers}\n`;
    });

    return api.sendMessage(msg, threadID, messageID);
  }

  return api.sendMessage("❌ أمر غير معروف", threadID, messageID);
};
