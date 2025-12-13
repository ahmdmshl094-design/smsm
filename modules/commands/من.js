module.exports.config = {
  name: "من",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "لعبة من الأكتر",
  commandCategory: "ألعاب",
  usages: "من",
  cooldowns: 4
};

const who = [
  "من أكتر زول عصبي هنا؟",
  "من أكتر زول بيضحك؟",
  "من أكتر زول بيختفي فجأة؟",
  "من أكتر زول بينوم بدري؟"
];

module.exports.run = async ({ api, event }) => {
  const q = who[Math.floor(Math.random() * who.length)];
  api.sendMessage(`👀 يا زول، ${q}`, event.threadID);
};
