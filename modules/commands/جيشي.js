const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "armyData.json");

/* ================== DATA ================== */
function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try { return JSON.parse(fs.readFileSync(dataFile)); } catch { return {}; }
}
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}
const now = () => Date.now();

/* ================== REGIONS ================== */
const regions = [
  { name: "🏜️ الصحراء", army: 60, defense: 30, gold: 80 },
  { name: "🌲 الغابة", army: 90, defense: 45, gold: 120 },
  { name: "🏔️ الجبال", army: 120, defense: 60, gold: 200 }
];

/* ================== CONFIG ================== */
module.exports.config = {
  name: "جيشي",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "نظام حروب شامل (نووي – منشآت – أبحاث – تجسس – سوق)",
  commandCategory: "war",
  usages: "جيشي",
  cooldowns: 3
};

/* ================== RUN ================== */
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
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
      shieldUntil: 0,
      lastDaily: 0,
      buildings: { base: 1, factory: 0, reactor: 0 }
    };
    saveData(data);
    return api.sendMessage("🪖 تم تسجيل جيشك بنجاح!", threadID, messageID);
  }

  const army = data[senderID];
  const shieldActive = army.shieldUntil > now();

  /* ===== عرض ===== */
  if (!args[0]) {
    return api.sendMessage(
`⚔️ جيشك
━━━━━━━━━━━━━━
👥 الجنود: ${army.soldiers}
⚔️ القوة: ${army.power}
🛡️ الدفاع: ${army.defense}
☢️ نووي: ${army.nukes}
🔬 أبحاث: ${army.research}
🛡️ درع نشط: ${shieldActive ? "نعم" : "لا"}
💰 الذهب: ${army.gold}

🏗️ المنشآت:
🏰 قواعد: ${army.buildings.base}
🏭 مصانع: ${army.buildings.factory}
⚡ مفاعلات: ${army.buildings.reactor}
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

  /* ===== بناء ===== */
  if (args[0] === "بناء") {
    const type = args[1];
    const cost = { قاعدة:150, مصنع:200, مفاعل:300 };
    if (!cost[type]) return api.sendMessage("❌ اختر: قاعدة / مصنع / مفاعل", threadID, messageID);
    if (army.gold < cost[type]) return api.sendMessage("❌ ذهب غير كافي", threadID, messageID);

    army.gold -= cost[type];
    if (type === "قاعدة") { army.buildings.base++; army.defense += 5; }
    if (type === "مصنع") { army.buildings.factory++; army.power += 5; }
    if (type === "مفاعل") army.buildings.reactor++;
    saveData(data);
    return api.sendMessage(`🏗️ تم بناء ${type}`, threadID, messageID);
  }

  /* ===== بحث ===== */
  if (args[0] === "بحث") {
    if (army.gold < 200) return api.sendMessage("❌ تحتاج 200 ذهب", threadID, messageID);
    army.gold -= 200;
    army.research++;
    army.power += 3;
    army.defense += 2;
    saveData(data);
    return api.sendMessage("🔬 تم تطوير أبحاث عسكرية", threadID, messageID);
  }

  /* ===== تجنيد ===== */
  if (args[0] === "تجنيد") {
    const add = Math.floor(Math.random() * 20) + 10;
    army.soldiers += add;
    saveData(data);
    return api.sendMessage(`🪖 تم تجنيد ${add} جندي`, threadID, messageID);
  }

  /* ===== درع ===== */
  if (args[0] === "دفاع") {
    if (army.gold < 100) return api.sendMessage("❌ تحتاج 100 ذهب", threadID, messageID);
    army.gold -= 100;
    army.shieldUntil = now() + 30 * 60 * 1000;
    saveData(data);
    return api.sendMessage("🛡️ تم تفعيل الدرع لمدة 30 دقيقة", threadID, messageID);
  }

  /* ===== نووي ===== */
  if (args[0] === "نووي") {
    if (args[1] === "تصنيع") {
      if (army.gold < 500) return api.sendMessage("❌ تحتاج 500 ذهب", threadID, messageID);
      army.gold -= 500;
      army.nukes++;
      saveData(data);
      return api.sendMessage("☢️ تم تصنيع صاروخ نووي", threadID, messageID);
    }

    if (args[1] === "استخدام") {
      if (army.nukes < 1) return api.sendMessage("❌ لا تملك نووي", threadID, messageID);
      if (!Object.keys(mentions).length) return api.sendMessage("❌ منشن لاعب", threadID, messageID);

      const enemyID = Object.keys(mentions)[0];
      if (!data[enemyID]) return api.sendMessage("❌ اللاعب غير مسجل", threadID, messageID);

      const enemy = data[enemyID];
      enemy.soldiers = Math.max(0, enemy.soldiers - 50);
      enemy.power = Math.max(0, enemy.power - 10);
      enemy.defense = Math.max(0, enemy.defense - 10);
      army.nukes--;
      saveData(data);

      return api.sendMessage(`☢️ تم ضرب ${mentions[enemyID]} نوويًا!`, threadID, messageID);
    }
  }

  /* ===== حصار ===== */
  if (args[0] === "حصار") {
    const name = args.slice(1).join(" ");
    const r = regions.find(x => x.name.includes(name));
    if (!r) return api.sendMessage("❌ منطقة غير موجودة", threadID, messageID);

    const p1 = army.soldiers + army.power;
    const p2 = r.army + r.defense;
    if (p1 > p2) {
      army.gold += r.gold;
      army.soldiers -= 5;
      saveData(data);
      return api.sendMessage(`🏰 تم احتلال ${r.name}`, threadID, messageID);
    } else {
      army.soldiers = Math.max(0, army.soldiers - 15);
      saveData(data);
      return api.sendMessage("💥 فشل الحصار", threadID, messageID);
    }
  }

  api.sendMessage("❌ أمر غير معروف", threadID, messageID);
};
