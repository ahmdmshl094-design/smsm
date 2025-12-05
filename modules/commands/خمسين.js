module.exports.config = {
  name: "خمسين",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "كولو",
  description: "رد تلقائي على كلمة خمسين",
  commandCategory: "مرح",
  usages: "خمسين",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, body } = event;

  if (body && body.trim() === "خمسين") {
    return api.sendMessage("شيل العشرة وادي امك الاربعين", threadID, messageID);
  }
};