module.exports.config = {
  name: "welcome",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "محمد إدريس",
};

module.exports.run = async function ({ api, event }) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const groupName = threadInfo.threadName;
    const memberCount = threadInfo.participantIDs.length;

    let addedUser = event.logMessageData.addedParticipants;
    if (!addedUser || addedUser.length === 0) return;

    addedUser.forEach(user => {
      const name = user.fullName;

      const msg = 
`◆━━━━━▷ ✦ ◁━━━━━◆
❏ أهلاً بـك يا | ${name}
❏ انضممت الآن إلى | ${groupName}
❏ رقمـك بيننا | ${memberCount}
❏ لا تثـق كثيـراً… فـالقلـوب تتغيّـر 🖤
◆━━━━━▷ ✦ ◁━━━━━◆`;

      api.sendMessage(msg, event.threadID);
    });
  } catch (err) {
    console.error("Welcome event error:", err);
  }
};
