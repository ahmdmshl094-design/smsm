// ⚡ ping.js - أمر قياس البنج وحالة السيرفر مع استايل جميل
const os = require("os");

module.exports.config = {
    name: "بنج",
    aliases: ["ping"],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "GPT",
    description: "قياس البنج وحالة السيرفر",
    commandCategory: "النظام",
    usages: "",
    cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
    const start = Date.now();

    // يرسل رسالة أولية للمستخدم
    api.sendMessage("⏳ **انتظر قليلاً… جاري قياس الاتصال…**", event.threadID, (err, info) => {
        if (err) return;

        setTimeout(() => {
            const latency = Date.now() - start; // البنج الحقيقي

            // معلومات السيرفر
            const cpu = os.cpus();
            const cpuModel = cpu[0].model;
            const cores = cpu.length;
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const memUsage = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);

            // تقييم السرعة حسب البنج
            let connectionStatus = "";
            let speedEmoji = "";
            if (latency <= 80) { connectionStatus = "ممتاز"; speedEmoji = "🚀"; }
            else if (latency <= 150) { connectionStatus = "جيد"; speedEmoji = "⚡"; }
            else if (latency <= 250) { connectionStatus = "متوسط"; speedEmoji = "🌀"; }
            else { connectionStatus = "ضعيف"; speedEmoji = "🐌"; }

            // الاستايل الرائع
            const msg =
`╭─❖ ⌜ ⚡ 𝐏𝐢𝐧𝐠 ⌟ ❖─╮
│
│ 📡 • البنج: ${latency}ms
│ 💹 • السرعة: ${connectionStatus} ${speedEmoji}
│
│ 🖥 • المعالج: ${cpuModel}
│ 🔩 • الأنوية: ${cores}
│ 📦 • الرام: ${totalMem - freeMem}MB / ${totalMem}MB
│ 📊 • نسبة الاستخدام: ${memUsage}%
│
╰─❖ 𝐁𝐨𝐭 𝐒𝐲𝐬𝐭𝐞𝐦 ❖─╯`;

            api.editMessage(msg, info.messageID);
        }, 5000); // تأخير 5 ثواني
    });
};
