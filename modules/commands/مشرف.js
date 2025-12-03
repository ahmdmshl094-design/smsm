// ⚙️✨ مشرف.js - نظام إدارة المشرفين مع صلاحيات فعلية + استايل مطوّر
const fs = require("fs");
const adminsPath = __dirname + "/admins.json";

if (!fs.existsSync(adminsPath)) fs.writeFileSync(adminsPath, JSON.stringify([]));

module.exports.config = {
    name: "مشرف",
    version: "2.0.0",
    hasPermssion: 2, // المطور فقط
    credits: "محمد إدريس + GPT-5",
    description: "نظام إدارة المشرفين مع صلاحيات فعلية",
    commandCategory: "المطور",
    usages: "add/remove/slait/band/help",
};

// 🌟 دالة تصميم الرسائل
function style(msg) {
    return `╔═━━━✦✿✦━━━═╗
${msg}
╚═━━━✦✿✦━━━═╝`;
}

module.exports.run = async ({ api, event, args }) => {
    const devID = "61570782968645";
    if (event.senderID != devID)
        return api.sendMessage("❌ هذا الأمر مخصص للمطور فقط.", event.threadID);

    let admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));
    const cmd = args[0]?.toLowerCase() || "help";

    switch (cmd) {
        case "add":
            if (!event.messageReply)
                return api.sendMessage(style("👤 قم بالرد على الشخص الذي تريد رفعه مشرف."), event.threadID);

            const uid = event.messageReply.senderID;

            if (admins.includes(uid))
                return api.sendMessage(style("⚠️ هذا الشخص بالفعل مشرف."), event.threadID);

            admins.push(uid);
            fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

            return api.sendMessage(
                style(`✅ تم رفع الشخص كمشرف.\n\n👤 ID: ${uid}`),
                event.threadID
            );

        case "slait":
            if (admins.length === 0)
                return api.sendMessage(style("⚠️ لا يوجد مشرفين بعد."), event.threadID);

            let listText = "📋 قائمة المشرفين:\n\n";

            for (let i = 0; i < admins.length; i++) {
                let id = admins[i];
                let info = await api.getUserInfo(id);
                let name = info[id]?.name || "غير معروف";

                listText += `✨ ${i + 1}. ${name}\n🆔 ID: ${id}\n\n`;
            }

            return api.sendMessage(style(listText), event.threadID);

        case "band":
            if (admins.length === 0)
                return api.sendMessage(style("⚠️ لا يوجد مشرفين."), event.threadID);

            let bandText = "🛑 المشرفين بالترتيب:\n\n";

            for (let i = 0; i < admins.length; i++) {
                let id = admins[i];
                let info = await api.getUserInfo(id);
                let name = info[id]?.name || "غير معروف";

                bandText += `🔹 ${i + 1}. ${name}\n🆔 ID: ${id}\n\n`;
            }

            bandText += "📌 لإزالة مشرف: مشرف remove رقم";

            return api.sendMessage(style(bandText), event.threadID);

        case "remove":
            if (!args[1]) return api.sendMessage(style("⚠️ اكتب رقم المشرف."), event.threadID);

            const index = parseInt(args[1]) - 1;
            if (isNaN(index) || index < 0 || index >= admins.length)
                return api.sendMessage(style("❌ رقم غير صالح."), event.threadID);

            const removed = admins.splice(index, 1)[0];
            fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

            return api.sendMessage(style(`✅ تم إزالة المشرف.\n👤 ID: ${removed}`), event.threadID);

        default:
            return api.sendMessage(style(
                "🔧 قائمة أوامر المشرف:\n\n" +
                "1️⃣ مشرف add (بالرد) ➤ رفع مشرف\n" +
                "2️⃣ مشرف slait ➤ عرض المشرفين\n" +
                "3️⃣ مشرف band ➤ عرض المشرفين مع ترتيب\n" +
                "4️⃣ مشرف remove رقم ➤ إزالة مشرف\n" +
                "5️⃣ مشرف help ➤ عرض الأوامر"
            ), event.threadID);
    }
};


// 🎯 إضافة صلاحيات للمشرفين عند إضافة البوت لقروب
module.exports.handleEvent = async ({ api, event }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
        const admins = JSON.parse(fs.readFileSync(__dirname + "/admins.json"));

        const addedBy = event.author; // الشخص الذي أضاف البوت

        // لو المشرف هو اللي أضاف البوت → يعمل طبيعي
        if (admins.includes(addedBy)) {
            api.sendMessage(
                "✨ تم إضافة البوت لهذه المجموعة بواسطة مشرف.\n🚀 أهلاً بالجميع!",
                event.threadID
            );
            return;
        }

    } catch (e) {
        console.log("Admin event error:", e);
    }
};
