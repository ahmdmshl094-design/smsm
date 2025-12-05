module.exports.config = {
  name: "welcome_leave",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "2.6.0",
  credits: "محمد إدريس + التعديل العصري بواسطة GPT-5",
  description: "نظام ترحيب ومغادرة حديث بتصميم أنيق ⚙️💎",
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageType } = event;

  // 🌟===== عند دخول عضو جديد =====🌟
  if (logMessageType === "log:subscribe") {
    // 👑 عند انضمام البوت نفسه
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      api.changeNickname(
        `[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "Bot Messenger" : global.config.BOTNAME}`,
        threadID,
        api.getCurrentUserID()
      );

      const botJoinMessage = `
╭──⌈ تم الاتصال بنجاح ✅ ⌋──
│ 
│ 💠 اسم البوت: 〖⏳〗〖 ⤹  𝑲𝒀𝑹𝑶𝑺 ❘  𝑩𝑶𝑻 ⇊ 〗 
│
│ ⚙️ الإصدار: 〘2.7.0〙
│ 
│ 🧩 عدد الأوامر: 〘152〙
│
│ 💬 البادئة: 〘/〙
│
│ 👑 المطور: كولو'و ۦۦ ﹾ٭ﹾۦﹾ٭ﹾ 
│
│ 🌐 حساب المطور:
│ https://www.facebook.com/share/1712u8LzjE
│
│ 🤍 اللهم صل وسلم على نبينا محمد ﷺ
╰────────────────────`;

      const { createReadStream, existsSync } = global.nodemodule["fs-extra"];
      const path = require("path");
      const imagePath = path.join(__dirname, "cache", "botJoin.png"); 

      if (existsSync(imagePath)) {
        return api.sendMessage({ body: botJoinMessage, attachment: createReadStream(imagePath) }, threadID);
      } else {
        return api.sendMessage(botJoinMessage, threadID);
      }
    }

    // 🌸 عند انضمام عضو جديد
    try {
      const { createReadStream, existsSync } = global.nodemodule["fs-extra"];
      const { threadName, participantIDs } = await api.getThreadInfo(threadID);
      const nameArray = [];
      const mentions = [];

      for (const p of event.logMessageData.addedParticipants) {
        const userName = p.fullName;
        nameArray.push(userName);
        mentions.push({ tag: userName, id: p.userFbId });

        if (!global.data.allUserID.includes(p.userFbId)) {
          await Users.createData(p.userFbId, { name: userName, data: {} });
          global.data.userName.set(p.userFbId, userName);
          global.data.allUserID.push(p.userFbId);
        }
      }

      const getData = await Users.getData(event.author);
      const nameAuthor = typeof getData.name === "undefined" ? "أحد الأعضاء" : getData.name;

      // 🌷 استايل ترحيب جديد (مُدمج)
      const msg = `
╭───────👑✨ W  E  L  C  O  M  E ✨👑───────╮

🌟 أهــلـًا بـنـا فـي نــور القـروب يا:  
» ${nameArray.join(", ")}

🏠︙اســم القـروب: 《 ${threadName} 》
👥︙أصـبـح عـددنـا الآن: ${participantIDs.length}

🧩︙مـن أضـافـك: ${nameAuthor}

──────────────────────────────

📜︙قوانـيـن القـروب:
• ممنوع السب والشتم ❌  
• ممنوع نشر الروابط والإعلانات 🚫  
• ممنوع تغيير الصورة أو الاسم بدون إذن ⚠️  
• مطلوب التفاعل والأدب والانضباط 💬🔥

──────────────────────────────

🌹 نتمنى لك أطيب الأوقات معنا  
🤍 صلّوا على النبي ﷺ

╰──────────────────────────╯
`;

      const pathGif = path.join(__dirname, "cache", "joinGif", `${1}.mp4`);
      let formPush;
      if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
      } else {
        formPush = { body: msg, mentions };
      }

      return api.sendMessage(formPush, threadID);
    } catch (e) {
      console.log(e);
    }
  }

  // 🚪===== عند خروج عضو =====🚪
  if (logMessageType === "log:unsubscribe") {
    try {
      const leftUser = event.logMessageData.leftParticipantFbId;

      api.addUserToGroup(leftUser, threadID, (err) => {
        if (err) {
          api.sendMessage(`انا م بضيف ظنوج احشك زاتو (⌣̀_𓁹҂)‏`, threadID);
        } else {
          api.sendMessage(`لديك كرامة جميلة 🗿🔨`, threadID);
        }
      });
    } catch (err) {
      console.log("❌ خطأ في محاولة إعادة العضو:", err);
    }
  }
};
