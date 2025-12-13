module.exports.config = {
  name: "نرد",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "رمي نرد",
  commandCategory: "ألعاب",
  usages: "نرد",
  cooldowns: 2
};

module.exports.run = async ({ api, event }) => {
  const num = Math.floor(Math.random() * 6) + 1;
  api.sendMessage(`🎲 طلعت لك: ${num}`, event.threadID);
};
