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

module.exports.run = async function({ api, event, args, getText }) {
  const fs = require("fs");
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  // تحميل الصورة
  const image = (await axios.get("https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg", { responseType: "stream" })).data;

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {

    // جمع الأوامر حسب الفئة
    const categories = {};
    for (let [name, value] of commands) {
      const cat = value.config.commandCategory || "عام";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    const categoryMap = {
      "نظام": "النظام",
      "ترفية": "الترفية",
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

    // بناء القائمة مزخرفة ومنظمة
    let allCommands = [];
    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let block = `╭─【 ${categoryEmoji[cat] || "📂"} ${categoryMap[cat] || cat} 】─╮\n`;
      for (let i = 0; i < cmds.length; i++) {
        block += `│ ${i + 1}. ${cmds[i]}\n`;
      }
      block += `╰────────────────────╯`;
      allCommands.push(block);
    }

    // تقسيم الصفحات 3
    const totalPages = 3;
    const perPage = Math.ceil(allCommands.length / totalPages);
    const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), totalPages);
    const start = (page - 1) * perPage;
    const finalBlocks = allCommands.slice(start, start + perPage).join("\n\n");

    // عد إجمالي الأوامر
    let count = 0;
    for (let cat in categories) count += categories[cat].length;

    const msg = `
╭───〔 هياتو ⚡ قائمة الأوامر 〕───╮

${finalBlocks}

📌 المجموع: ${count} أمر
💡 استخدم ${prefix}help [اسم الأمر] لعرض التفاصيل.

⇨ البوت: هياتو
⇨ المطور: انجالاتي

${page === 1 ? "🌸 استغفر الله العظيم وأتوب إليه\n🤍 اللهم صل وسلم على نبينا محمد ﷺ" : ""}
╰────────────────────────────╯
`;

    return api.sendMessage(
      { body: msg, attachment: image },
      threadID
    );
  }

  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
      command.config.commandCategory,
      command.config.cooldowns,
      (command.config.hasPermssion == 0)
        ? getText("user")
        : (command.config.hasPermssion == 1)
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};
