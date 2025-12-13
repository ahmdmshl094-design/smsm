module.exports.config = {
  name: "حكم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "لعبة حكم",
  commandCategory: "ألعاب",
  usages: "حكم",
  cooldowns: 5
};

const dares = [
  "أكتب اسم آخر زول كلمتو",
  "غير كنيتك ساعة كاملة 😈",
  "أرسل ايموجي بدون سبب",
  "أكتب نكتة هسي"
];

module.exports.run = async ({ api, event }) => {
  const d = dares[Math.floor(Math.random() * dares.length)];
  api.sendMessage(`🔥 يا زول، حكم:\n${d}`, event.threadID);
};
