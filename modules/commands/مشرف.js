// ⚙️👑 مشرف.js - نظام إدارة المشرفين + صلاحيات تشغيل
const fs = require("fs");
const adminsPath = __dirname + "/admins.json";

if (!fs.existsSync(adminsPath)) fs.writeFileSync(adminsPath, JSON.stringify([]));

module.exports.config = {
    name: "مشرف",
    version: "3.0.0",
    hasPermssion: 2,
    credits: "محمد إدريس + GPT-5",
    description: "نظام إدارة المشرفين مع تشغيل تلقائي للقروبات التي يضيفها المشرف",
    commandCategory: "المطور",
    usages: "add/remove/list/help",
};

// 🎨 استايل جديد
function style(msg) {
    return `╭───────⌈ 👑 نظام المشرفين 👑 ⌋───────╮
${msg}
╰──────────────────────────────────╯`;
}

module.exports.run = async ({ api, event, args }) => {
    const devID = "61570782968645";
    if (event.senderID != devID)
        return api.sendMessage("❌ هذا الأمر للمطور فقط.", event.threadID);

    let admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));
    const cmd = args[0]?.toLowerCase() || "help";

    // 🟦 إضافة مشرف
    if (cmd === "add") {
        if (!event.messageReply)
            return api.sendMessage(style("👤 قم بالرد على الشخص لرفعه مشرف."), event.threadID);

        const uid = event.messageReply.senderID;

        if (admins.includes(uid))
            return api.sendMessage(style("⚠️ هذا الشخص بالفعل مشرف."), event.threadID);

        admins.push(uid);
        fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

        return api.sendMessage(style(`✅ تم رفعه مشرف.\n🆔 ${uid}`), event.threadID);
    }

    // 🟦 عرض المشرفين
    if (cmd === "list" || cmd === "slait") {
        if (admins.length === 0)
            return api.sendMessage(style("⚠️ لا يوجد مشرفين بعد."), event.threadID);

        let txt = "📋 قائمة المشرفين:\n\n";
        for (let i in admins) {
            let id = admins[i];
            let info = await api.getUserInfo(id);
            let name = info[id]?.name || "غير معروف";
            txt += `✨ ${parseInt(i) + 1}. ${name}\n🆔 ${id}\n\n`;
        }

        return api.sendMessage(style(txt), event.threadID);
    }

    // 🟦 إزالة مشرف
    if (cmd === "remove") {
        if (!args[1]) return api.sendMessage(style("⚠️ اكتب رقم المشرف."), event.threadID);

        const index = parseInt(args[1]) - 1;

        if (isNaN(index) || index < 0 || index >= admins.length)
            return api.sendMessage(style("❌ رقم غير صالح."), event.threadID);

        const removed = admins.splice(index, 1)[0];
        fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2));

        return api.sendMessage(style(`🗑️ تمت إزالة المشرف.\n🆔 ${removed}`), event.threadID);
    }

    // 🟦 help
    return api.sendMessage(style(
        "📌 الأوامر:\n\n" +
        "➤ مشرف add (بالرد) : رفع مشرف\n" +
        "➤ مشرف list : عرض المشرفين\n" +
        "➤ مشرف remove رقم : حذف مشرف\n" +
        "➤ مشرف help : عرض القائمة"
    ), event.threadID);
};


// 🟣 نظام التشغيل التلقائي للقروب إذا أضافه مشرف
module.exports.handleEvent = async ({ api, event }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
        const admins = JSON.parse(fs.readFileSync(adminsPath, "utf8"));
        const addedBy = event.author;

        // ⭐ إذا المشرف أضاف البوت → يشغل القروب
        if (admins.includes(addedBy)) {
            return api.sendMessage(
                "✨ تم إضافة البوت بواسطة مشرف مسجل.\n🚀 تم تفعيل البوت في هذه المجموعة!",
                event.threadID
            );
        }

    } catch (e) {
        console.log("Admin system error:", e);
    }
};
