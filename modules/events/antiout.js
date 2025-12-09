module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "1.0.2",
    credits: "محمد إدريس (تعديل)",
    description: "إرجاع العضو عند خروجه أو الكشف عن الطرد"
};

module.exports.run = async({ event, api, Threads, Users }) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    if (!data.antiout) return;

    const leftID = event.logMessageData.leftParticipantFbId;

    // تجاهل لو البوت هو اللي خرج
    if (leftID == api.getCurrentUserID()) return;

    // جلب اسم العضو
    const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    // تحديد الطريقة: خروج ذاتي أم طرد
    const type = (event.author == leftID) ? "self" : "kicked";

    // 🟢 إذا العضو خرج من نفسه
    if (type === "self") {
        api.addUserToGroup(leftID, event.threadID, (err) => {
            if (err) {
                api.sendMessage(
                    `🐸☝🏿 العب اغبى من انو ينضاف تاني`,
                    event.threadID
                );
            } else {
                api.sendMessage(
                    `🐸☝🏿 الحق العب قال مارق بي كرامتو`,
                    event.threadID
                );
            }
        });
    }

    // 🔴 إذا الأدمن طرده
    else if (type === "kicked") {
        api.sendMessage(
            `ԅ(¯﹃¯ԅ) بلع بان في جلحتو`,
            event.threadID
        );
    }
};
