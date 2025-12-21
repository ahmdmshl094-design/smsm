const fs = require("fs");
const path = require("path");

const DEVELOPER_ID = "61579001370029";
const shellDataFile = path.join(__dirname, "../commands/cache/data/shellData.json");

function loadShellData() {
  if (!fs.existsSync(shellDataFile)) {
    fs.writeFileSync(shellDataFile, JSON.stringify({
      botImage: null,
      commandDisplayStyle: "grid",
      botPrefix: ".",
      customCommands: {}
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(shellDataFile));
  } catch (e) {
    return { botImage: null, commandDisplayStyle: "grid", botPrefix: ".", customCommands: {} };
  }
}

function saveShellData(data) {
  try {
    fs.writeFileSync(shellDataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("saveShellData error:", e);
  }
}

module.exports.config = {
  name: "شيل",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Bot Developer",
  description: "لوحة تحكم البوت - للمطور فقط",
  commandCategory: "إدارة",
  usages: "شيل",
  cooldowns: 1
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  if (String(senderID) !== DEVELOPER_ID) {
    return api.sendMessage("❌ هذا الأمر متاح للمطور فقط!\nالمعرف: 61579001370029", threadID, messageID);
  }

  const shellData = loadShellData();
  
  const menu = `
⚙️ **لوحة تحكم البوت** ⚙️
━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 📷 تغيير صورة البوت
اكتب: شيل -> صورة (ثم أرسل صورة)

2️⃣ 📝 تغيير طريقة عرض الأوامر
اكتب: شيل -> عرض grid (أو list)

3️⃣ 🔤 تغيير بادئة الأوامر
اكتب: شيل -> بادئة !

4️⃣ ➕ إضافة أمر جديد
اكتب: شيل -> أضف

5️⃣ 📋 عرض الأوامر المخصصة
اكتب: شيل -> قائمة

6️⃣ 🗑️ حذف أمر مخصص
اكتب: شيل -> حذف <اسم الأمر>

7️⃣ 🔄 إعادة تشغيل البوت
اكتب: شيل -> إعادة تشغيل

8️⃣ ℹ️ معلومات النظام
اكتب: شيل -> معلومات

━━━━━━━━━━━━━━━━━━━━━━━━
📊 **الحالة الحالية:**
🖼️ صورة البوت: ${shellData.botImage ? "مخصصة ✅" : "افتراضية ⚪"}
📝 أسلوب العرض: ${shellData.commandDisplayStyle}
🔤 البادئة: ${shellData.botPrefix}
📦 أوامر مخصصة: ${Object.keys(shellData.customCommands).length}
`;

  return api.sendMessage(menu, threadID, (err, info) => {
    if (!err) {
      global.client.handleReply.push({
        name: "شيل",
        messageID: info.messageID,
        threadID,
        senderID,
        replyType: "menu"
      });
    }
  }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body, attachments } = event;

  if (String(senderID) !== DEVELOPER_ID) return;

  const command = body.toLowerCase().split(" ")[0];
  const args = body.split(" ").slice(1).join(" ");
  const shellData = loadShellData();

  // تغيير الصورة
  if (command === "صورة") {
    if (attachments && attachments.length > 0) {
      shellData.botImage = attachments[0].url;
      saveShellData(shellData);
      return api.sendMessage("✅ تم تحديث صورة البوت بنجاح!\nسيتم عرضها مع الأوامر", threadID, messageID);
    }
  }

  // تغيير طريقة العرض
  if (command === "عرض") {
    const style = args.toLowerCase();
    if (!["grid", "list"].includes(style)) {
      return api.sendMessage("❌ الخيارات:\n• grid - عرض شبكة\n• list - عرض قائمة", threadID, messageID);
    }
    shellData.commandDisplayStyle = style;
    saveShellData(shellData);
    return api.sendMessage(`✅ تم تغيير أسلوب العرض إلى: ${style === "grid" ? "شبكة" : "قائمة"}`, threadID, messageID);
  }

  // تغيير البادئة
  if (command === "بادئة") {
    const prefix = args[0];
    if (!prefix) {
      return api.sendMessage("❌ حدد البادئة الجديدة\nمثال: شيل -> بادئة !", threadID, messageID);
    }
    shellData.botPrefix = prefix;
    saveShellData(shellData);
    return api.sendMessage(`✅ تم تغيير البادئة إلى: ${prefix}`, threadID, messageID);
  }

  // عرض القائمة
  if (command === "قائمة") {
    let list = "📋 **الأوامر المخصصة:**\n━━━━━━━━━━━━━━━━\n";
    const customCmds = Object.keys(shellData.customCommands);
    if (customCmds.length === 0) {
      list += "لا توجد أوامر مخصصة حالياً";
    } else {
      customCmds.forEach((cmd, idx) => {
        list += `${idx + 1}. ✅ ${cmd}\n`;
      });
    }
    return api.sendMessage(list, threadID, messageID);
  }

  // حذف أمر
  if (command === "حذف") {
    const cmdName = args.toLowerCase();
    if (!cmdName) {
      return api.sendMessage("❌ حدد اسم الأمر للحذف\nمثال: شيل -> حذف اسم_الأمر", threadID, messageID);
    }
    if (shellData.customCommands[cmdName]) {
      delete shellData.customCommands[cmdName];
      saveShellData(shellData);
      return api.sendMessage(`✅ تم حذف الأمر: ${cmdName}`, threadID, messageID);
    }
    return api.sendMessage(`❌ الأمر ${cmdName} غير موجود`, threadID, messageID);
  }

  // إضافة أمر جديد
  if (command === "أضف" || command === "إضافة") {
    api.sendMessage(
      `📝 **أضافة أمر جديد**
━━━━━━━━━━━━━━━━
أرسل بيانات الأمر بصيغة JSON:

{
  "name": "اسم الأمر",
  "description": "وصف الأمر",
  "code": "api.sendMessage('مرحبا', threadID)"
}

📌 ملاحظة: الكود يجب أن يستخدم الـ API بشكل صحيح`,
      threadID,
      (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: "شيل_اضف",
            messageID: info.messageID,
            threadID,
            senderID,
            replyType: "addCommand"
          });
        }
      },
      messageID
    );
    return;
  }

  // إعادة التشغيل
  if (command === "إعادة" || command === "تشغيل") {
    api.sendMessage("🔄 جاري إعادة تشغيل البوت... سيعود بعد قليل", threadID);
    setTimeout(() => {
      console.log("✅ إعادة تشغيل من قبل المطور");
      process.exit(0);
    }, 2000);
    return;
  }

  // معلومات النظام
  if (command === "معلومات") {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    
    const info = `
📊 **معلومات النظام**
━━━━━━━━━━━━━━━━━━
⏱️ وقت التشغيل: ${hours}س ${minutes}د ${seconds}ث
💾 استخدام الذاكرة: ${memUsage} MB
🎯 عدد الأوامر المخصصة: ${Object.keys(shellData.customCommands).length}
📝 طريقة العرض: ${shellData.commandDisplayStyle}
🔤 بادئة الأوامر: ${shellData.botPrefix}
👤 معرّف المطور: ${DEVELOPER_ID}
✅ حالة البوت: نشط وجاهز
    `;
    return api.sendMessage(info, threadID, messageID);
  }
};

// معالج خاص لإضافة الأوامر الجديدة
module.exports.handleReplyAddCommand = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (String(senderID) !== DEVELOPER_ID) return;

  try {
    const commandData = JSON.parse(body);
    const shellData = loadShellData();

    if (!commandData.name || !commandData.code) {
      return api.sendMessage("❌ البيانات غير كاملة\nيجب أن تحتوي على: name و code", threadID, messageID);
    }

    // التحقق من أن الاسم لا يتعارض مع أوامر موجودة
    if (fs.existsSync(path.join(__dirname, `${commandData.name}.js`))) {
      return api.sendMessage(`❌ الأمر ${commandData.name} موجود بالفعل!`, threadID, messageID);
    }

    shellData.customCommands[commandData.name] = {
      description: commandData.description || "أمر مخصص",
      code: commandData.code,
      createdAt: new Date().toISOString(),
      author: DEVELOPER_ID
    };
    
    saveShellData(shellData);

    return api.sendMessage(
      `✅ **تم إضافة الأمر بنجاح!**
━━━━━━━━━━━━━━━━
📝 الاسم: ${commandData.name}
📄 الوصف: ${commandData.description || "بدون وصف"}
✔️ يمكنك استخدامه الآن!`,
      threadID,
      messageID
    );
  } catch (error) {
    return api.sendMessage(`❌ خطأ في البيانات:\n${error.message}`, threadID, messageID);
  }
};
