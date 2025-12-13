module.exports.config = {
  name: "توافق",
  version: "1.0",
  hasPermission: 0,
  credits: "انجالاتي",
  description: "يقيس التوافق بين شخصين",
  commandCategory: "ترفيه",
  usages: "@اسم1 @اسم2"
};

module.exports.run = async function({ api, event, mentions }) {
  const names = Object.keys(mentions);
  if (names.length < 2) return api.sendMessage("قم بعمل تاغ لشخصين!", event.threadID);

  const score = Math.floor(Math.random() * 101);
  api.sendMessage(`💖 نسبة التوافق بين ${mentions[names[0]].replace("@", "")} و${mentions[names[1]].replace("@", "")} هي: ${score}%`, event.threadID);
};
