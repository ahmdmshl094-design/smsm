module.exports.config = {
  name: "اوامر",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "كولو",
  description: "قائمة الاوامر",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false, // يمكنك تغييره true إذا أردت الحذف التلقائي
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
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  if (!command) {
    const allCommands = Array.from(commands.keys()).sort();
    const totalPages = 3;
    const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), totalPages);
    const perPage = Math.ceil(allCommands.length / totalPages);
    const slice = allCommands.slice((page-1)*perPage, page*perPage);

    let msg = "╭─⋅⋅─☾─⋅⋅─╮\n";
    msg += `  ◆ ◈  قائمة أوامر Kiros ◈ ◆\n`;
    msg += "╰─⋅⋅─☾─⋅⋅─╯\n\n";

    // تقسيم الأوامر 5 في كل سطر
    for (let i = 0; i < slice.length; i += 5) {
      const row = slice.slice(i, i + 5).join(" • ");
      msg += `│  ${row}\n`;
    }

    msg += "\n╭─⋅⋅─☾─⋅⋅─╮\n";
    msg += ` › إجمالي الأوامر: ${allCommands.length}\n`;
    msg += ` › الصفحة: ${page}/${totalPages}\n`;
    msg += " › اسم البوت: Kiros\n";
    msg += " › المطور: كولو\n";
    msg += ` › استخدم: ${prefix}اوامر [رقم الصفحة]\n`;
    msg += "╰─⋅⋅─☾─⋅⋅─╯";

    return api.sendMessage(msg, threadID, async (err, info) => {
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend*1000));
        return api.unsendMessage(info.messageID);
      }
    });
  }

  // عرض معلومات أمر محدد
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
    ),
    threadID,
    messageID
  );
};
