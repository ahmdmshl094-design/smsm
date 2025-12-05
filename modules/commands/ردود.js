module.exports.config = {
    name: "ردود",
    version: "1.0.0",
    credits: "GPT",
    hasPermssion: 0,
    description: "ردود تلقائية حسب الكلمات",
    commandCategory: "نظام",
    usages: "",
    cooldowns: 0
};

module.exports.handleEvent = function({ api, event }) {
    const text = event.body?.toLowerCase();
    if (!text) return;

    const replies = [
        // ردود المستخدم:
        { trigger: "اسي دا لي شنو", reply: "•-• الرد  اسي دا لي شنو'-'؟" },

        { trigger: "جيب رصيد", reply: "رصيد بتاع امك وزع احشك زاتو ( 𓎲‿𓎲)" },

        { trigger: "🦧", reply: "زرقو" },

        { trigger: "بوت", reply: "بوت ابوك 🗿" },

        { trigger: "كولو", reply: "عمك وعم ابوك 🐸☝🏿" },

        { trigger: "ضحك", reply: "بتفصل مالك" },

        { trigger: "( 𓎲‿𓎲)", reply: "عامل زي اختك" },

        { trigger: "'-'", reply: "عامل زي الحامل" }
    ];

    for (const item of replies) {
        if (text.includes(item.trigger)) {
            return api.sendMessage(item.reply, event.threadID, event.messageID);
        }
    }
};

module.exports.run = function() {};
