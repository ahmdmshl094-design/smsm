const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "armyData.json");

function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  return JSON.parse(fs.readFileSync(dataFile));
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// 🌍 مناطق اللعبة
const regions = [
  { name: "🏜️ الصحراء", army: 60, power: 40, defense: 30, gold: 80 },
  { name: "🌲 الغابة", army: 90, power: 55, defense: 45, gold: 120 },
  { name: "🏔️ الجبال", army: 120, power: 70, defense: 60, gold: 200 }
];

module.exports.config = {
  name: "جيشي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "نظام الجيش المتكامل (تسجيل – هجوم – دفاع – حصار – أوامر إضافية)",
  commandCategory: "war",
  usages: "جيشي",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
  let data = loadData();

  // ❌ غير مسجل
  if (!data[senderID] && args[0] !== "تسجيل") {
    return api.sendMessage("❌ لازم تسجل أولاً\n✍️ اكتب: جيشي تسجيل", threadID, messageID);
  }

  // 📝 تسجيل الجيش
  if (args[0] === "تسجيل") {
    if (data[senderID]) return api.sendMessage("⚠️ أنت مسجل مسبقًا", threadID, messageID);

    data[senderID] = {
      soldiers: 50,
      power: 30,
      defense: 25,
      gold: 150,
      shield: false
    };
    saveData(data);

    return api.sendMessage(
`🪖 تم تسجيل جيشك بنجاح!
━━━━━━━━━━━━━━
👥 الجنود: 50
⚔️ القوة: 30
🛡️ الدفاع: 25
💰 الذهب: 150
━━━━━━━━━━━━━━
✍️ اكتب: جيشي لعرض جيشك`,
      threadID,
      messageID
    );
  }

  const army = data[senderID];

  // 📊 عرض الجيش
  if (!args[0]) {
    return api.sendMessage(
`⚔️ | جيشك
━━━━━━━━━━━━━━
👥 الجنود: ${army.soldiers}
⚔️ القوة: ${army.power}
🛡️ الدفاع: ${army.defense}
🛡️ درع مفعل: ${army.shield ? "نعم" : "لا"}
💰 الذهب: ${army.gold}
━━━━━━━━━━━━━━
✍️ للأوامر: جيشي هجوم/دفاع/حصار/تجنيد/تدريب`,
      threadID,
      messageID
    );
  }

  // 🛡️ دفاع
  if (args[0] === "دفاع") {
    army.shield = true;
    saveData(data);
    return api.sendMessage("🛡️ تم تفعيل الدفاع! جيشك محمي مؤقتًا.", threadID, messageID);
  }

  // ⚔️ هجوم لاعب
  if (args[0] === "هجوم") {
    if (Object.keys(mentions).length === 0)
      return api.sendMessage("❌ منشن لاعب للهجوم", threadID, messageID);

    const enemyID = Object.keys(mentions)[0];
    if (!data[enemyID])
      return api.sendMessage("❌ اللاعب غير مسجل في نظام الجيش", threadID, messageID);

    const enemy = data[enemyID];

    let attackPower = army.soldiers + army.power;
    let defensePower = enemy.soldiers + enemy.defense + (enemy.shield ? 20 : 0);

    if (attackPower > defensePower) {
      const lostSoldiers = Math.floor(Math.random() * 10) + 5;
      const loot = Math.floor(Math.random() * 50) + 20;

      // إنقاص نقاط العدو
      enemy.soldiers = Math.max(0, enemy.soldiers - lostSoldiers);
      enemy.shield = false;

      // مكافأة المهاجم
      army.gold += loot;

      saveData(data);

      return api.sendMessage(
`🔥 | هجوم ناجح!
━━━━━━━━━━━━━━
👤 تم الهجوم على: ${mentions[enemyID].replace("@", "")}
💥 خسر من جنوده: -${lostSoldiers}
💰 غنمت: ${loot} ذهب
━━━━━━━━━━━━━━`,
        threadID,
        {
          mentions: [{
            tag: mentions[enemyID],
            id: enemyID
          }]
        }
      );
    } else {
      const lostSoldiers = Math.floor(Math.random() * 10) + 5;
      army.soldiers = Math.max(0, army.soldiers - lostSoldiers);
      army.shield = false;
      saveData(data);

      return api.sendMessage(
`💀 | فشل الهجوم
━━━━━━━━━━━━━━
👤 الخصم: ${mentions[enemyID].replace("@", "")}
💥 خسرت من جنودك: -${lostSoldiers}
━━━━━━━━━━━━━━`,
        threadID,
        messageID
      );
    }
  }

  // 🏰 حصار منطقة
  if (args[0] === "حصار") {
    const regionName = args.slice(1).join(" ");
    const region = regions.find(r => r.name.includes(regionName));

    if (!region)
      return api.sendMessage("❌ المنطقة غير موجودة", threadID, messageID);

    const armyPower = army.soldiers + army.power;
    const regionPower = region.army + region.defense;

    if (armyPower > regionPower) {
      army.gold += region.gold;
      army.soldiers -= 5;
      saveData(data);

      return api.sendMessage(
`🏰 تم حصار ${region.name} بنجاح!
💰 الغنيمة: ${region.gold} ذهب`,
        threadID,
        messageID
      );
    } else {
      army.soldiers -= 15;
      saveData(data);
      return api.sendMessage(`💥 فشل الحصار على ${region.name}`, threadID, messageID);
    }
  }

  // 🗺️ عرض المناطق
  if (args[0] === "مناطق") {
    let msg = "🗺️ | المناطق المتاحة:\n━━━━━━━━━━━━━━\n";
    regions.forEach(r => {
      msg += `${r.name}\n👥 الجيش: ${r.army}\n⚔️ القوة: ${r.power}\n🛡️ الدفاع: ${r.defense}\n💰 الغنيمة: ${r.gold}\n\n`;
    });
    msg += "✍️ مثال: جيشي حصار الصحراء";
    return api.sendMessage(msg, threadID, messageID);
  }

  // 🪖 أوامر إضافية: تجنيد، تدريب، ترقية القوة، غنائم
  if (args[0] === "تجنيد") {
    const newSoldiers = Math.floor(Math.random() * 20) + 10;
    army.soldiers += newSoldiers;
    saveData(data);
    return api.sendMessage(`🪖 تم تجنيد ${newSoldiers} جندي جديد`, threadID, messageID);
  }

  if (args[0] === "تدريب") {
    const powerIncrease = Math.floor(Math.random() * 10) + 5;
    army.power += powerIncrease;
    saveData(data);
    return api.sendMessage(`⚔️ تم تدريب الجيش وزادت القوة +${powerIncrease}`, threadID, messageID);
  }

  if (args[0] === "ترقية") {
    const defenseIncrease = Math.floor(Math.random() * 10) + 5;
    army.defense += defenseIncrease;
    saveData(data);
    return api.sendMessage(`🛡️ تم ترقية الدفاع +${defenseIncrease}`, threadID, messageID);
  }

  if (args[0] === "غنائم") {
    const loot = Math.floor(Math.random() * 100) + 50;
    army.gold += loot;
    saveData(data);
    return api.sendMessage(`💰 حصلت على غنيمة قدرها ${loot} ذهب`, threadID, messageID);
  }

  api.sendMessage("❌ أمر غير معروف", threadID, messageID);
};
