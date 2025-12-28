const fs = require("fs");
const path = require("armyData.json");

/* ================== DATA ================== */
function loadData() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
  try { return JSON.parse(fs.readFileSync(path)); } catch { return {}; }
}
function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
const now = () => Date.now();

/* ================== REGIONS ================== */
const regions = [
  { name: "الصحراء", army: 60, defense: 30, gold: 80 },
  { name: "الغابة", army: 90, defense: 45, gold: 120 },
  { name: "الجبال", army: 120, defense: 60, gold: 200 }
];

/* ================== CONFIG ================== */
module.exports.config = {
  name: "جيشي",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "نظام حروب شامل مع تدريب وهجوم على اللاعبين",
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
    return api.sendMessage("❌ لازم تسجل أولاً\n✍️ جيشي تسجيل", threadID, messageID);
  }

  if (args[0] === "تسجيل") {
    if (data[senderID]) return api.sendMessage("⚠️ أنت مسجل مسبقًا", threadID, messageID);
    data[senderID] = {
      soldiers: 60,
      power: 35,
      defense: 30,
      gold: 300,
      nukes: 0,
      research: 0,
      shield: 0, // قوة الدرع
      shieldUntil: 0,
      lastDaily: 0,
      buildings: { base: 1, factory: 0, reactor: 0 },
      trainingCooldown: 0
    };
    saveData(data);
    return api.sendMessage("🪖 تم تسجيل جيشك بنجاح!", threadID, messageID);
  }

  const army = data[senderID];
  const shieldActive = army.shield > 0;

  /* ===== عرض الجيش ===== */
  if (!args[0]) {
    return api.sendMessage(
`◉⊱  جيشك  ⊰◉
━━━━━━━━━━━━━━
◉⊱ الجنود: ${army.soldiers}
◉⊱ القوة: ${army.power}
◉⊱ الدفاع: ${army.defense}
◉⊱ الذهب: ${army.gold}
◉⊱ الدرع: ${army.shield}
━━━━━━━━━━━━━━`,
      threadID,
      messageID
    );
  }

  /* ===== دخل يومي ===== */
  if (args[0] === "يومي") {
    if (now() - army.lastDaily < 86400000)
      return api.sendMessage("⏳ اليومي لم يجهز بعد", threadID, messageID);
    const income = 100 + army.buildings.reactor * 50;
    army.gold += income;
    army.lastDaily = now();
    saveData(data);
    return api.sendMessage(`🎁 استلمت ${income} ذهب`, threadID, messageID);
  }

  /* ===== تدريب ===== */
  if (args[0] === "تدريب") {
    if (now() - army.trainingCooldown < 600000) // 10 دقائق
      return api.sendMessage("⏳ التدريب يحتاج 10 دقائق بين كل مرة", threadID, messageID);
    const gain = Math.floor(Math.random() * 10) + 5;
    army.power += gain;
    army.soldiers += Math.floor(Math.random() * 5) + 1;
    army.trainingCooldown = now();
    saveData(data);
    return api.sendMessage(`💪 تدريبت جيشك! القوة زادت ${gain} والجنود ${Math.floor(Math.random()*5)+1}`, threadID, messageID);
  }

  /* ===== درع ===== */
  if (args[0] === "دفاع") {
    if (army.gold < 100) return api.sendMessage("❌ تحتاج 100 ذهب", threadID, messageID);
    army.gold -= 100;
    army.shield += 50; // الدرع يبدأ بـ 50 قوة
    saveData(data);
    return api.sendMessage("🛡️ تم تفعيل الدرع. سينقص مع كل هجوم!", threadID, messageID);
  }

  /* ===== هجوم على لاعب ===== */
  if (args[0] === "هاجم") {
    let targetID;
    if (Object.keys(mentions).length) targetID = Object.keys(mentions)[0];
    else if (messageReply) targetID = messageReply.senderID;
    if (!targetID) return api.sendMessage("❌ امنشن اللاعب أو رد على رسالته للهجوم", threadID, messageID);
    if (!data[targetID]) return api.sendMessage("❌ اللاعب غير مسجل", threadID, messageID);
    if (targetID === senderID) return api.sendMessage("❌ لا يمكنك مهاجمة نفسك", threadID, messageID);

    const enemy = data[targetID];
    let attackPower = army.power;
    let damage = Math.max(0, attackPower - enemy.defense);

    // الدرع ينقص أولاً
    if (enemy.shield > 0) {
      if (enemy.shield >= damage) {
        enemy.shield -= damage;
        damage = 0;
      } else {
        damage -= enemy.shield;
        enemy.shield = 0;
      }
    }

    enemy.soldiers = Math.max(0, enemy.soldiers - damage);
    saveData(data);

    return api.sendMessage(`⚔️ هاجمت اللاعب! خسارته الجنود: ${damage}`, threadID, messageID);
  }

  api.sendMessage("❌ أمر غير معروف", threadID, messageID);
};
