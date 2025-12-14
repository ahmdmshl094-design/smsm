const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "lifeData.json");

function loadData() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
  return JSON.parse(fs.readFileSync(dataPath));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports.config = {
  name: "حياة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "لعبة حياة يومية (وظائف، زواج، أطفال)",
  commandCategory: "rpg",
  usages: "حياة",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;
  let data = loadData();

  if (!data[senderID]) {
    data[senderID] = {
      money: 0,
      job: null,
      marriedTo: null,
      kids: 0,
      lastWork: 0
    };
    saveData(data);
  }

  const user = data[senderID];

  // 📋 القائمة
  if (!args[0]) {
    return api.sendMessage(
`🏠 | لعبة الحياة
━━━━━━━━━━━━━━
📝 تسجيل
💼 وظائف
✅ اختيار <وظيفة>
🛠️ عمل
💍 زواج @شخص
🏖️ شهر_العسل
👶 انجاب
📊 حالتي
━━━━━━━━━━━━━━
✍️ مثال: حياة تسجيل`,
      threadID,
      messageID
    );
  }

  // 📝 تسجيل
  if (args[0] === "تسجيل") {
    return api.sendMessage("✅ تم تسجيلك في لعبة الحياة!", threadID, messageID);
  }

  // 💼 وظائف
  if (args[0] === "وظائف") {
    return api.sendMessage(
`💼 | الوظائف المتاحة
━━━━━━━━━━━━━━
👨‍🌾 مزارع (50$)
🚕 سائق (70$)
🧑‍🍳 طباخ (60$)
👮 شرطي (80$)
💻 مبرمج (100$)
━━━━━━━━━━━━━━
✍️ مثال: حياة اختيار مبرمج`,
      threadID,
      messageID
    );
  }

  // ✅ اختيار وظيفة
  if (args[0] === "اختيار") {
    if (!args[1]) return api.sendMessage("❌ اكتب اسم الوظيفة", threadID, messageID);
    user.job = args[1];
    saveData(data);
    return api.sendMessage(`✅ تم اختيار وظيفة: ${args[1]}`, threadID, messageID);
  }

  // 🛠️ عمل يومي
  if (args[0] === "عمل") {
    const now = Date.now();
    if (now - user.lastWork < 86400000)
      return api.sendMessage("⏳ لقد عملت اليوم، عد غدًا!", threadID, messageID);

    const salary = Math.floor(Math.random() * 50) + 50;
    user.money += salary;
    user.lastWork = now;
    saveData(data);

    return api.sendMessage(`🛠️ عملت اليوم وربحت 💰 ${salary}$`, threadID, messageID);
  }

  // 💍 زواج
  if (args[0] === "زواج") {
    if (Object.keys(mentions).length === 0)
      return api.sendMessage("❌ منشن الشخص للزواج", threadID, messageID);

    const partnerID = Object.keys(mentions)[0];
    user.marriedTo = partnerID;
    saveData(data);

    return api.sendMessage("💍 تم الزواج بنجاح! مبروك ❤️", threadID, messageID);
  }

  // 🏖️ شهر العسل
  if (args[0] === "شهر_العسل") {
    if (!user.marriedTo)
      return api.sendMessage("❌ يجب أن تكون متزوجًا أولاً", threadID, messageID);

    return api.sendMessage("🏖️ ذهبت لشهر العسل 🌴❤️", threadID, messageID);
  }

  // 👶 إنجاب
  if (args[0] === "انجاب") {
    if (!user.marriedTo)
      return api.sendMessage("❌ يجب الزواج أولاً", threadID, messageID);

    user.kids += 1;
    saveData(data);
    return api.sendMessage(`👶 مبروك! أنجبت طفل 👼 العدد الآن: ${user.kids}`, threadID, messageID);
  }

  // 📊 حالتي
  if (args[0] === "حالتي") {
    return api.sendMessage(
`📊 | حالتك
━━━━━━━━━━━━━━
💼 الوظيفة: ${user.job || "بدون"}
💰 الرصيد: ${user.money}$
💍 متزوج: ${user.marriedTo ? "نعم" :
