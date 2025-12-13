module.exports.config = {
  name: "حجر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "لعبة حجر ورقة مقص",
  commandCategory: "ألعاب",
  usages: "حجر",
  cooldowns: 3
};

module.exports.run = async ({ api, event }) => {
  const choices = ["🪨 حجر", "📄 ورقة", "✂️ مقص"];
  const bot = choices[Math.floor(Math.random() * choices.length)];
  api.sendMessage(`🎮 اخترت: ${bot}`, event.threadID);
};
