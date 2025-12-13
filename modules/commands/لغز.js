module.exports.config = {
  name: "لغز",
  version: "1.0",
  hasPermission: 0,
  credits: "انجالاتي",
  description: "يطرح لغزًا للأعضاء",
  commandCategory: "ترفيه",
};

module.exports.run = async function({ api, event }) {
  const riddles = [
    { q: "ما الشيء الذي كلما أخذت منه يكبر؟", a: "الحفرة" },
    { q: "له أسنان ولا يعض، ما هو؟", a: "المشط" },
    { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم" }
  ];
  const r = riddles[Math.floor(Math.random() * riddles.length)];
  api.sendMessage(`🧩 لغز: ${r.q}\n(أجب في الرد)`, event.threadID);
};
