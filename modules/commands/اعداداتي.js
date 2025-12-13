const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "اعداداتي",
  version: "1.0.0",
  hasPermssion: 3,
  credits: "انجالاتي",
  description: "كل أوامر المطور الخاصة بيك",
  commandCategory: "مطوّر",
  usages: "اعداداتي",
  cooldowns: 5
};

// ----------- تشغيل البوت -----------
module.exports.run = async function({ api, event, args }) {
  const { senderID, threadID } = event;
  if(senderID !== "61579001370029") return api.sendMessage("❌ ده أمر خاص بالمطور بس.", threadID);

  const subCmd = args[0] ? args[0].toLowerCase() : "";

  // ---- ريستارت البوت ----
  if(subCmd === "ريستارت") {
    return api.sendMessage("🔄 جاري إعادة تشغيل البوت...", threadID, () => process.exit(1));
  }

  // ---- قائمة المستخدمين ----
  if(subCmd === "قائمة_المستخدمين") {
    const users = Array.from(global.data.userName.entries()).map(([id, name]) => `${name} - ${id}`).join("\n");
    return api.sendMessage(`📋 قائمة المستخدمين:\n${users}`, threadID);
  }

  // ---- جلب معلومات مستخدم ----
  if(subCmd === "info") {
    if(!args[1]) return api.sendMessage("❌ أكتب ID المستخدم.", threadID);
    try {
      const userInfo = await api.getUserInfo(args[1]);
      const info = userInfo[args[1]];
      return api.sendMessage(`📌 معلومات المستخدم:\n- الاسم: ${info.name}\n- ID: ${args[1]}`, threadID);
    } catch {
      return api.sendMessage("❌ ما قدر البوت يجيب معلومات المستخدم.", threadID);
    }
  }

  // ---- بث رسالة ----
  if(subCmd === "بث") {
    const text = args.slice(1).join(" ").split("|");
    if(text.length < 2) return api.sendMessage("❌ صيغة صحيحة: بث [ID] | [الرسالة]", threadID);
    const targetID = text[0].trim();
    const message = text[1].trim();
    try {
      await api.sendMessage(message, targetID);
      return api.sendMessage("✅ تم الإرسال بنجاح.", threadID);
    } catch {
      return api.sendMessage("❌ ما قدر البوت يرسل الرسالة.", threadID);
    }
  }

  // ---- تفعيل / تعطيل أي أمر ----
  if(subCmd === "تفعيل_تعطيل") {
    const arg = args.slice(1).join(" ").split("|");
    if(arg.length < 2) return api.sendMessage("❌ صيغة صحيحة: تفعيل_تعطيل [اسم_الأمر] | [on/off]", threadID);

    const cmd = arg[0].trim();
    const status = arg[1].trim().toLowerCase();
    global.client.disabledCommands = global.client.disabledCommands || {};
    global.client.disabledCommands[cmd] = status === "off";

    return api.sendMessage(`✅ تم ${status === "on" ? "تفعيل" : "تعطيل"} الأمر ${cmd}`, threadID);
  }

  // ---- أمر غير معروف ----
  api.sendMessage("❌ ما عرفت الأمر. الأوامر المتاحة: ريستارت | قائمة_المستخدمين | info | بث | تفعيل_تعطيل", threadID);
};
