module.exports.config = {
  name: "اوامر",
  version: "1.0.6",
  hasPermssion: 0,
  credits: "انس + تصميم منسق بواسطة محمد إدريس",
  description: "قائمة الأوامر بشكل منسق وجميل",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false, // تم تعطيل الحذف التلقائي
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

module.exports.run = function({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  if (!command) {

    // تقسيم الأوامر حسب الفئات
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

    let blocks = [];
    let count = 0;

    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let block = `╭── 🍁 ${categoryMap[cat] || cat} 🍁 ──╮\n`;

      // تقسيم الأوامر 5 في كل سطر
      for (let i = 0; i < cmds.length; i += 5) {
        const row = cmds.slice(i, i + 5).join(" | "); // فصل الأوامر بشرطة
        block += `│ ${row}\n`;
        count += row.split("|").length;
      }

      block += `╰────────────╯`;
      blocks.push(block);
    }

    // تقسيم الصفحات
    const totalPages = 3;
    const perPage = Math.ceil(blocks.length / totalPages);
    const page = parseInt(args[0]) || 1;

    if (page < 1 || page > totalPages)
      return api.sendMessage(`⚠️ اختر صفحة بين 1 - ${totalPages}`, threadID, messageID);

    const start = (page - 1) * perPage;
    const finalBlocks = blocks.slice(start, start + perPage).join("\n\n");

    const msg = `
『🦋ᏒᎥፚᏋᏁ  🕸』
── قائمة الأوامر ──

${finalBlocks}

📄 الصفحة: ${page}/${totalPages}
📦 عدد الأوامر: ${count}
💡 استخدم: ${prefix}help [اسم الأمر]

${page === 1 ? "🌿 اللهم صل وسلم على سيدنا محمد 🌿" : ""}
`;

    return api.sendMessage(msg, threadID);
  }

  // معلومات أمر معيّن
  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
      command.config.commandCategory,
      command.config.cooldowns,
      ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
      command.config.credits
    ), threadID, messageID
  );
};
