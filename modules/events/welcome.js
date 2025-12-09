module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "1.0.0",
  credits: "محمد إدريس",
};

module.exports.run = async function ({ api, event, Users }) {
  try {

    // ============================================
    // 🔹 1) الترحيب بالعضو الجديد + صورة
    // ============================================
    if (event.logMessageType === "log:subscribe") {

      let addedUser = event.logMessageData.addedParticipants;
      if (!addedUser || addedUser.length === 0) return;

      addedUser.forEach(user => {
        const name = user.fullName;
        const msg =
`◆━━━━━▷ ✦ ◁━━━━━◆
❏ أهلاً بـك يا | ${name}
❏ انضممت الآن إلى المجموعة
❏ لا تثق كثيراً… فالقلوب تتغيّر 🖤
❏ اللهم صلِّ وسلم على سيدنا محمد 🤍🌸
◆━━━━━▷ ✦ ◁━━━━━◆`;

        // الرابط المباشر للصورة
        const imgURL = "https://i.ibb.co/qYzjczwD/0dfd43fae004e551aa8046f1b1ac818b.jpg";

        api.sendMessage({
          body: msg,
          attachment: await global.utils.download(imgURL)
        }, event.threadID);
      });
    }

    // ============================================
    // 🔹 2) إرجاع العضو إذا خرج لوحده (AntiOut)
    // ============================================
    else if (event.logMessageType === "log:unsubscribe") {

      const leftID = event.logMessageData.leftParticipantFbId;

      if (leftID == api.getCurrentUserID()) return;

      const type = (event.author == leftID) ? "self" : "kicked";

      const name = await Users.getNameUser(leftID);

      if (type === "self") {
        api.addUserToGroup(leftID, event.threadID, (err) => {
          if (err) {
            api.sendMessage(`☝🏿🐸 العب اغبى من انو ينضاف تاني`, event.threadID);
          } else {
            api.sendMessage(`🐸☝🏿 الحق العب قال مارق بي كرامتو`, event.threadID);
          }
        });
      } else if (type === "kicked") {
        api.sendMessage(`ԅ(¯﹃¯ԅ) بلع بان في جلحتو`, event.threadID);
      }

    }

  } catch (err) {
    console.error("Welcome event error:", err);
  }
};
