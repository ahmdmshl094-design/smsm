module.exports.config = {
  name: "leaveNoti",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "HĐGN", // Mod by H.Thanh
  description: "Thông báo Bot hoặc người rời khỏi nhóm có random gif/ảnh/video",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

const checkttPath = __dirname + '/../commands/tuongtac/checktt/';

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const path = join(__dirname, "cache", "leaveGif", "randomgif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    return;
};

module.exports.run = async function ({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const { threadID } = event;
    var fullYear = global.client.getTime("fullYear");
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:s");
    const hours = moment.tz("Asia/Ho_Chi_Minh").format("HH");

    const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const iduser = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser);
    const type = (event.author == iduser) ? "𝐑𝐨̛̀𝐢" : "𝐁𝐢̣ 𝐐𝐓𝐕 𝐊𝐢𝐜𝐤";

    const path = join(__dirname, "cache", "leaveGif", "randomgif");
    const pathGif = join(path, `${threadID}`);

    var msg, formPush;

    // حذف العضو من ملفات التفاعل
    if (existsSync(checkttPath + threadID + '.json')) {
        const threadData = JSON.parse(readFileSync(checkttPath + threadID + '.json'));
        const userData_week_index = threadData.week.findIndex(e => e.id == iduser);
        const userData_day_index = threadData.day.findIndex(e => e.id == iduser);
        const userData_total_index = threadData.total.findIndex(e => e.id == iduser);

        if (userData_total_index != -1) threadData.total.splice(userData_total_index, 1);
        if (userData_week_index != -1) threadData.week.splice(userData_week_index, 1);
        if (userData_day_index != -1) threadData.day.splice(userData_day_index, 1);

        writeFileSync(checkttPath + threadID + '.json', JSON.stringify(threadData, null, 4));
    }

    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    // رسالة المغادرة (ثابتة)
    msg = "غادر عب المجموعة 🐦‍⬛.";

    const randomPath = readdirSync(join(__dirname, "cache", "leaveGif", "randomgif"));

    if (existsSync(pathGif)) {
        formPush = { body: msg, attachment: createReadStream(pathGif) };
    } else if (randomPath.length != 0) {
        const pathRandom = join(__dirname, "cache", "leaveGif", "randomgif", randomPath[Math.floor(Math.random() * randomPath.length)]);
        formPush = { body: msg, attachment: createReadStream(pathRandom) };
    } else {
        formPush = { body: msg };
    }

    return api.sendMessage(formPush, threadID);
};
