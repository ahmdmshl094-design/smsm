// ⚙️ نظام الصيانة — ملف واحد فقط
const fs = require("fs");
const path = __dirname + "/maintenance.json";

// --- إنشاء ملف الصيانة لو غير موجود ---
if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({
        enable: false,
        developer: "61570782968645"
    }, null, 2));
}

module.exports.config = {
    name: "صيانة",
    version: "2.0.0",
    hasPermssion: 2, // فقط المطور
    credits: "GPT + محمد إدريس",
    description: "تشغيل أو إيقاف وضع الصيانة",
    commandCategory: "النظام",
    usages: "[on/off]",
    cooldowns: 5
};

// --- الفحص الرئيسي قبل أي أمر ---
module.exports.handleEvent = function ({ event }) {
    try {
        const data = JSON.parse(fs.readFileSync(path));

        // إذا الصيانة غير مفعلة → لا تعمل شيء
        if (!data.enable) return;

        // السماح فقط للمطور
        if (String(event.senderID) !== data.developer) {
            return; // تجاهل الرسالة بالكامل
        }

    } catch (e) {
        console.error("Maintenance error:", e);
    }
};

// --- أمر تشغيل/إيقاف الصيانة ---
module.exports.run = async ({ api, event, args }) => {
    try {
        const data = JSON.parse(fs.readFileSync(path));

        // السماح للمطور فقط
        if (String(event.senderID) !== data.developer)
            return api.sendMessage("❌ هذا الأمر خاص بالمطور فقط.", event.threadID, event.messageID);

        const action = args[0];

        if (action === "on") {
            data.enable = true;
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
            return api.sendMessage("🔧✨ تم تفعيل وضع الصيانة.\nالبوت الآن يستجيب للمطور فقط.", event.threadID);
        }

        if (action === "off") {
            data.enable = false;
            fs.writeFileSync(path, JSON.stringify(data, null, 2));
            return api.sendMessage("☑️ تم إلغاء وضع الصيانة.\nعاد البوت للعمل الطبيعي.", event.threadID);
        }

        return api.sendMessage("استخدم:\nصيانة on\nصيانة off", event.threadID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ حدث خطأ أثناء تشغيل أمر الصيانة.", event.threadID);
    }
};
