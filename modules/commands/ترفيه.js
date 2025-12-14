module.exports.config = {
  name: "ترفيه",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "أوامر ترفيهية وألعاب",
  commandCategory: "games",
  usages: "ترفيه",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;

  const games = [
    "🎯 أصبت الهدف بنجاح!",
    "💣 انفجرت القنبلة! خسرت 😭",
    "🧠 ذكاؤك عالي اليوم 🔥",
    "🎲 حظك سيء… حاول مرة أخرى",
    "⚔️ فزت في المعركة!",
    "🏃 هربت في آخر لحظة 😅"
  ];

  const random = games[Math.floor(Math.random() * games.length)];

  if (!args[0]) {
    return api.sendMessage(
      `🎮 | الأوامر الترفيهية
━━━━━━━━━━━━━━
🎯 حظ
⚔️ معركة
🎲 رول
🧠 ذكاء
💣 تفجير
━━━━━━━━━━━━━━
✍️ مثال: ترفيه حظ`,
      threadID,
      messageID
    );
  }

  switch (args[0]) {
    case "حظ":
      api.sendMessage(`🎲 | نتيجتك:\n${random}`, threadID, messageID);
      break;

    case "معركة":
      api.sendMessage("⚔️ دخلت معركة شرسة… النتيجة:\n" + random, threadID, messageID);
      break;

    case "رول":
      api.sendMessage(`🎰 | الرقم العشوائي: ${Math.floor(Math.random() * 100)}`, threadID, messageID);
      break;

    case "ذكاء":
      api.sendMessage(`🧠 | نسبة ذكائك: ${Math.floor(Math.random() * 160)}%`, threadID, messageID);
      break;

    case "تفجير":
      api.sendMessage("💣 BOOM! " + random, threadID, messageID);
      break;

    default:
      api.sendMessage("❌ الأمر غير معروف", threadID, messageID);
  }
};
