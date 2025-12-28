 fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "rpgData.json");
let cache = null;

// ------------------- إدارة البيانات -------------------
function loadData() {
  if (cache) return cache;
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
  try {
    cache = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  } catch (e) {
    cache = {};
  }
  return cache;
}

function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    cache = data;
  } catch (e) {
    console.error("خطأ في حفظ البيانات:", e);
  }
}

// ------------------- دوال مساعدة -------------------
function clamp(value, min = 0, max = 9999) {
  return Math.max(min, Math.min(max, value));
}

// ------------------- إنشاء شخصية -------------------
function createCharacter() {
  return {
    name: "محارب",
    level: 1,
    xp: 0,
    health: 100,
    maxHealth: 100,
    gold: 100,
    class: "محارب",
    stats: { attack: 10, defense: 5 },
    shield: { active: false, points: 0, max: 0 },
    training: 0,
    potions: 0,
    inventory: [],
    currentQuest: null
  };
}

// ------------------- التدريب -------------------
function train(character) {
  if (character.gold < 50) return "⛨ لا تمتلك ذهب كافٍ للتدريب (50)";
  character.gold -= 50;
  character.stats.attack += 2;
  character.stats.defense += 1;
  character.training += 1;
  return `⚔ لقد تدربت بنجاح. مستوى التدريب الآن: ${character.training}`;
}

// ------------------- استخدام الإكسير -------------------
function usePotion(character) {
  if (character.potions <= 0) return "⛧ ليس لديك أي إكسير للاستخدام";
  character.potions -= 1;
  character.health = character.maxHealth;
  return "✪ لقد استخدمت الإكسير وتعافيت بالكامل";
}

// ------------------- تفعيل الدرع -------------------
function activateShield(character) {
  if (character.shield.active) return "🛡 الدرع مفعل بالفعل";
  if (character.gold < 100) return "⛨ تحتاج 100 ذهب لتفعيل الدرع";

  character.gold -= 100;
  character.shield = { active: true, points: 3, max: 3 };
  return "🛡 تم تفعيل الدرع. نقاط الدرع: 3";
}

// ------------------- الهجوم -------------------
function getTarget(event, data) {
  if (event.messageReply) return data[event.messageReply.senderID];
  const ids = Object.keys(event.mentions || {});
  if (ids.length > 0) return data[ids[0]];
  return null;
}

function attackPlayer(attacker, target) {
  if (!target) return "⛨ رد على شخص أو امنشنه للهجوم";

  if (target.shield.active) {
    target.shield.points -= 1;
    if (target.shield.points <= 0) {
      target.shield.active = false;
      return "⚔ هاجمت اللاعب، الدرع انكسر وأصبح مكشوفًا";
    }
    return `⚔ هاجمت اللاعب لكن الدرع صد الهجوم\nنقاط الدرع المتبقية: ${target.shield.points}`;
  }

  const damage = Math.max(1, attacker.stats.attack - Math.floor(target.stats.defense / 2));
  target.health = clamp(target.health - damage, 0, target.maxHealth);

  let msg = `⚔ تم الهجوم بنجاح\n✪ الضرر: ${damage}\n❤️ صحة الهدف: ${target.health}/${target.maxHealth}`;

  if (target.health <= 0) {
    const loot = Math.floor(target.gold / 2);
    attacker.gold += loot;
    target.gold -= loot;
    msg += `\n⛩ لقد قتلت اللاعب! تكسب نصف ذهبه: ${loot}`;
  }

  return msg;
}

// ------------------- المهام -------------------
function quest(character) {
  const quests = [
    { name: "قتل الوحوش", gold: 50, xp: 20 },
    { name: "جمع الكنز", gold: 100, xp: 30 },
    { name: "إنقاذ القرية", gold: 150, xp: 50 }
  ];
  const q = quests[Math.floor(Math.random() * quests.length)];
  character.currentQuest = q;
  character.gold += q.gold;
  character.xp += q.xp;
  return `📜 مهمة جديدة: ${q.name}\n💰 المكافأة: ${q.gold} ذهب\n⭐ الخبرة: ${q.xp}`;
}

// ------------------- عرض معلومات الشخصية -------------------
function showCharacterInfo(character) {
  return `
⛨=== معلومات شخصيتك ===⛨
الاسم: ${character.name}
الفئة: ${character.class}
المستوى: ${character.level}
الخبرة: ${character.xp}/100
الصحة: ${character.health}/${character.maxHealth}
الذهب: ${character.gold}
الجرد: ${character.inventory.length > 0 ? character.inventory.join(", ") : "فارغ"}
مستوى التدريب: ${character.training}
عدد الإكسير: ${character.potions}
درع مفعل: ${character.shield.active ? "نعم" : "لا"} (نقاط: ${character.shield.points})
⛨=======================⛨
`;
}

// ------------------- الموديول -------------------
module.exports.config = {
  name: "مقاتل",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Bot + عباس",
  description: "لعبة RPG جماعية بالعربية مع هجوم بين اللاعبين ودرع",
  commandCategory: "ألعاب",
  usages: "مقاتل",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const data = loadData();

  // ----- تسجيل باسم محارب -----
  if (!data[senderID]) {
    if (!args || args[0].toLowerCase() !== "تسجيل") {
      return api.sendMessage(
        "⛨ يجب التسجيل أولاً\n✍️ اكتب: تسجيل",
        threadID,
        messageID
      );
    }

    data[senderID] = createCharacter();
    saveData(data);
    return api.sendMessage("🛡 تم تسجيل شخصيتك باسم: محارب", threadID, messageID);
  }

  const character = data[senderID];

  // بدون args → عرض الشخصية
  if (!args || args.length === 0) {
    return api.sendMessage(showCharacterInfo(character), threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, body }) {
  const { threadID, messageID, senderID } = event;
  const data = loadData();
  if (!data[senderID]) return;

  const character = data[senderID];
  const command = body.toLowerCase().split(" ")[0];

  if (command === "تدريب") {
    const msg = train(character);
    saveData(data);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (command === "اكسيير") {
    const msg = usePotion(character);
    saveData(data);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (command === "مهمة") {
    const msg = quest(character);
    saveData(data);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (command === "درع") {
    const msg = activateShield(character);
    saveData(data);
    return api.sendMessage(msg, threadID, messageID);
  }

  if (command === "هاجم") {
    const target = getTarget(event, data);
    const msg = attackPlayer(character, target);
    saveData(data);
    return api.sendMessage(msg, threadID, messageID);
  }
};
