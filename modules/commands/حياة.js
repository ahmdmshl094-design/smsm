const fs = require("fs");
const path = require("path");

const rpgDataFile = path.join(__dirname, "../commands/cache/data/rpgData.json");

function loadRPGData() {
  if (!fs.existsSync(rpgDataFile)) fs.writeFileSync(rpgDataFile, "{}");
  try {
    return JSON.parse(fs.readFileSync(rpgDataFile));
  } catch (e) {
    return {};
  }
}

function saveRPGData(data) {
  try {
    fs.writeFileSync(rpgDataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("saveRPGData error:", e);
  }
}

module.exports.config = {
  name: "rpg",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Bot",
  description: "لعبة RPG تفاعلية",
  commandCategory: "ألعاب",
  usages: "rpg",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const data = loadRPGData();
  
  if (!data[senderID]) {
    data[senderID] = {
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      gold: 0,
      inventory: [],
      class: "محارب",
      stats: { attack: 10, defense: 5, magic: 5 }
    };
    saveRPGData(data);
    
    return api.sendMessage(
      `🎮 مرحباً بك في عالم RPG!\n\n👤 اسمك: لاعب ${senderID.slice(-4)}\n⚔️ الفئة: محارب\n❤️ الصحة: 100/100\n🎯 المستوى: 1\n💰 الذهب: 0\n\n📝 الأوامر:\nrpg info - معلومات شخصيتك\nrpg attack - هاجم عدو\nrpg quest - قبول مهمة\nrpg shop - المتجر`,
      threadID,
      messageID
    );
  }
  
  const character = data[senderID];
  const info = `
✨ **معلومات شخصيتك** ✨
━━━━━━━━━━━━━━━━━━━
👤 **الاسم:** لاعب ${senderID.slice(-4)}
⚔️ **الفئة:** ${character.class}
🎯 **المستوى:** ${character.level}
💫 **التجربة:** ${character.experience}/100
❤️ **الصحة:** ${character.health}/${character.maxHealth}
💰 **الذهب:** ${character.gold}

📊 **الإحصائيات:**
⚔️ الهجوم: ${character.stats.attack}
🛡️ الدفاع: ${character.stats.defense}
✨ السحر: ${character.stats.magic}

📦 **الجرد:** ${character.inventory.length > 0 ? character.inventory.join(", ") : "فارغ"}
`;
  
  return api.sendMessage(info, threadID, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  const data = loadRPGData();
  
  if (!data[senderID]) return;
  
  const character = data[senderID];
  const command = body.toLowerCase().split(" ")[0];
  
  if (command === "attack") {
    const damage = Math.floor(Math.random() * 20) + character.stats.attack;
    const enemyHealth = 50;
    const finalDamage = Math.max(1, damage - Math.floor(Math.random() * 10));
    character.experience += 10;
    character.gold += finalDamage;
    
    if (character.experience >= 100) {
      character.level += 1;
      character.experience = 0;
      character.maxHealth += 20;
      character.health = character.maxHealth;
      character.stats.attack += 5;
      character.stats.defense += 2;
      
      saveRPGData(data);
      return api.sendMessage(
        `⚡ انتصرت في القتال!\n\n💥 الضرر: ${finalDamage}\n⭐ صعدت مستوى! المستوى الجديد: ${character.level}\n🎁 مكافآت: ${finalDamage} ذهب`,
        threadID,
        messageID
      );
    }
    
    saveRPGData(data);
    return api.sendMessage(
      `⚔️ قتال ضخم!\n\n💥 الضرر المسبب: ${finalDamage}\n💫 اكتسبت 10 تجربة\n💰 اكتسبت ${finalDamage} ذهب`,
      threadID,
      messageID
    );
  }
  
  if (command === "quest") {
    const quests = [
      { name: "قتل الوحوش", reward: 50, exp: 20 },
      { name: "جمع الكنز", reward: 100, exp: 30 },
      { name: "انقاذ القرية", reward: 150, exp: 50 }
    ];
    
    const quest = quests[Math.floor(Math.random() * quests.length)];
    character.currentQuest = quest;
    character.gold += quest.reward;
    character.experience += quest.exp;
    
    saveRPGData(data);
    return api.sendMessage(
      `📜 **مهمة جديدة!**\n\n📝 ${quest.name}\n💰 المكافأة: ${quest.reward} ذهب\n✨ التجربة: ${quest.exp}`,
      threadID,
      messageID
    );
  }
};
