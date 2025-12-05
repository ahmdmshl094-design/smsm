const { exec } = require("child_process");
const fs = require("fs");

const DEVELOPER_ID = "61570782968645"; // ضع هنا ID المطور

module.exports.config = {
  name: "ادارة",
  version: "1.1",
  credits: "محمد إدريس",
  description: "أمر شل وتشيل مع عرض الملفات ⚙️🗑️",
  commandCategory: "النظام",
  usages: "ادارة شل <الأمر> | ادارة شيل <اسم الملف> | ادارة عرض",
  cooldowns: 5,
};

module.exports.run = async ({ event, api, args }) => {
  const userID = event.senderID;

  if (userID != DEVELOPER_ID) {
    return api.sendMessage("هذا الامر مخصص للرجال (⌣̀_𓁹҂)‏", event.threadID, event.messageID);
  }

  const subCommand = args[0];
  const subArgs = args.slice(1);

  // === عرض الملفات المتاحة ===
  if (subCommand?.toLowerCase() === "عرض") {
    const commandFolder = __dirname; // مجلد الأوامر
    const files = fs.readdirSync(commandFolder)
      .filter(file => file.endsWith(".js"));
    if (files.length === 0) return api.sendMessage("📂 لا يوجد ملفات في المجلد.", event.threadID, event.messageID);

    return api.sendMessage(`📂 الملفات المتاحة:\n${files.join("\n")}`, event.threadID, event.messageID);
  }

  // === أمر شل: تنفيذ أوامر النظام ===
  if (subCommand?.toLowerCase() === "شل") {
    const command = subArgs.join(" ");
    if (!command) return api.sendMessage("⚠️ | اكتب الأمر الذي تريد تنفيذه.", event.threadID, event.messageID);

    exec(command, (error, stdout, stderr) => {
      if (error) return api.sendMessage(`❌ خطأ:\n${error.message}`, event.threadID, event.messageID);
      if (stderr) return api.sendMessage(`⚠️ تحذير:\n${stderr}`, event.threadID, event.messageID);
      api.sendMessage(`✅ الناتج:\n${stdout}`, event.threadID, event.messageID);
    });

  // === أمر شيل: حذف ملف ===
  } else if (subCommand?.toLowerCase() === "شيل") {
    const fileName = subArgs[0];
    if (!fileName) return api.sendMessage("⚠️ | اكتب اسم الملف الذي تريد حذفه.", event.threadID, event.messageID);

    const path = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(path)) return api.sendMessage("❌ | الملف غير موجود.", event.threadID, event.messageID);

    fs.unlinkSync(path);
    api.sendMessage(`🗑️ | تم حذف الملف ${fileName}.js بنجاح ✅`, event.threadID, event.messageID);

  } else {
    api.sendMessage("⚠️ | النوع غير معروف. استخدم: شل أو شيل أو عرض.", event.threadID, event.messageID);
  }
};