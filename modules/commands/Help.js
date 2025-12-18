module.exports.config = {
  name: "اوامر",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "انجالاتي + تصميم منسق بواسطة محمد إدريس",
  description: "قائمة الأوامر بشكل منسق وجميل",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 20
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Waiting time: %5 seconds(s)\n❯ Permission: %6\n\n» Module code by %7 «",
    "helpList": '[ There are %1 commands on this bot, Use: "%2help nameCommand" to know how to use! ]',
    "user": "User",
    "adminGroup": "Admin group",
    "adminBot": "Admin bot"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const image = (await axios.get(
    "https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg",
    { responseType: "stream" }
  )).data;

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {

    const categories = {};
    for (let [name, value] of commands) {
      const cat = (value.config.commandCategory || "عام").trim();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    const categoryMap = {
      "نظام": "النظام",
      "ترفية": "الترفيه",
      "اقتصاد": "الاقتصاد",
      "العاب": "الألعاب",
      "ذكاء صناعي": "الذكاء الصناعي",
      "مطور": "المطور",
      "عام": "عام"
    };

    const categoryEmoji = {
      "نظام": "⚙️",
      "ترفية": "🎮",
      "اقتصاد": "💰",
      "العاب": "🕹️",
      "ذكاء صناعي": "🤖",
      "مطور": "👨‍💻",
      "عام": "📌"
    };

    const blocks = [];
    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let text = `${categoryEmoji[cat] || "📂"} ${categoryMap[cat] || cat}\n`;
      for (const cmd of cmds) {
        text += `➤ ${cmd}\n`;
      }
      blocks.push(text);
    }

    const perPage = 2; // عدد الفئات في الصفحة
    const totalPages = Math.ceil(blocks.length / perPage);
    const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), totalPages);

    const start = (page - 1) * perPage;
    const content = blocks.slice(start, start + perPage).join("\n");

    let count = 0;
    for (let cat in categories) count += categories[cat].length;

    const msg =
`📜 قائمة الأوامر
━━━━━━━━━━━━━━
📄 الصفحة: ${page}/${totalPages}

${content}
━━━━━━━━━━━━━━
📌 المجموع: ${count} أمر
💡 استخدم ${prefix}help [اسم الأمر]

🤍 اللهم صل وسلم على نبينا محمد ﷺ`;

    return api.sendMessage(
      { body: msg, attachment: image },
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${command.config.usages || ""}`,
      command.config.commandCategory,
      command.config.cooldowns,
      command.config.hasPermssion == 0
        ? getText("user")
        : command.config.hasPermssion == 1
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};
