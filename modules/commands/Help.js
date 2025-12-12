const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name:"اوامر",
  version: "1.0.8",
  hasPermssion: 0,
  credits: "المطور: انجالاتي | الادمن: ثانوس",
  description: "🦧اوامري",
  commandCategory: "الاوامر",
  usages: "[صفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 20
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const commands = [...global.client.commands.values()];
  const prefix = global.config.PREFIX || "/";

  const commandsPerPage = 10;
  const page = parseInt(args[0]) || 1;
  const totalPages = Math.ceil(commands.length / commandsPerPage);

  if(page > totalPages || page < 1) {
    return api.sendMessage(`❌ هذه الصفحة غير موجودة! الصفحات المتوفرة: 1-${totalPages}`, threadID, messageID);
  }

  const start = (page - 1) * commandsPerPage;
  const end = start + commandsPerPage;
  const pageCommands = commands.slice(start, end);

  const divider = "─❖─";
  const line = "──────────────────────";

  let message = `
${line}
        ◈『 ⚔ اوامر ⚔ 』◈
${line}\n`;

  pageCommands.forEach((cmd, index) => {
    message += `⚜ ${start + index + 1} ${divider} ${prefix}${cmd.config.name}\n`;
  });

  message += `
${line}
🔹 الصفحة: ${page} من ${totalPages}
🔹 عدد الأوامر الكلي: ${commands.length}

🏰 استمتع مع بوت هياتو 🏰

⚜ المطور: انجالاتي ⚜
👑 الادمن: ثانوس 👑
${line}
`;

  const imagePath = path.join(process.cwd(), "attached_assets", "received_1354469396415619_1765356692054.jpeg");

  try {
    if (fs.existsSync(imagePath)) {
      return api.sendMessage(
        { body: message, attachment: fs.createReadStream(imagePath) },
        threadID,
        messageID
      );
    } else {
      return api.sendMessage(message, threadID, messageID);
    }
  } catch (error) {
    return api.sendMessage(message, threadID, messageID);
  }
};
