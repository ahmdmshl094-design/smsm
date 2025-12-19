const config = {
    name: "اعدادات",
    aliases: ["setting"],
    description: "Settings for better group management",
    usage: "اعدادات",
    cooldown: 3,
    permissions: [1],
    credits: "XaviaTeam",
};

const langData = {
    ar_SY: {
        menu: `⌈ اعـدادات الـمـجـموعـة ⌋
1. [{antiSpam}] مكافحة الازعاج
2. [{antiOut}] مكافحة الخروج
3. [{antiChangeGroupName}] مكافحة تغيير اسم المجموعة
4. [{antiChangeGroupImage}] مكافحة تغيير صورة المجموعة
5. [{antiChangeNickname}] مكافحة تغيير الكنية
6. [{notifyChange}] اخطار احداث المجموعة
⇒ ارسل رقم لتغيير الإعداد`,
        notGroup: "لا يمكن استخدام هذا الأمر إلا في المجموعة!",
        invalid: "مدخل غير صالح",
        success: "تم تغيير الاعداد بنجاح",
        error: "حدث خطأ، يرجى المحاولة لاحقًا",
    },
};

// دالة لحفظ البيانات في Threads
async function updateSettings(threadID, newSettings) {
    try {
        await global.controllers.Threads.updateData(threadID, {
            antiSettings: newSettings,
        });
    } catch (e) {
        console.error("updateSettings error:", e);
    }
}

// الدالة الرئيسية
async function onCall({ message, data, getLang }) {
    try {
        if (!data?.thread?.info) return message.reply(getLang("error"));
        if (!data.thread.info.isGroup) return message.reply(getLang("notGroup"));

        // الإعدادات الحالية
        const threadData = data.thread.data || {};
        const antiSettings = threadData.antiSettings || {
            antiSpam: false,
            antiOut: false,
            antiChangeGroupName: false,
            antiChangeGroupImage: false,
            antiChangeNickname: false,
            notifyChange: false,
        };

        // عرض القائمة
        const displaySettings = {};
        for (const key in antiSettings) {
            displaySettings[key] = antiSettings[key] ? "✅" : "❌";
        }

        await message.reply(getLang("menu", displaySettings));

        // انتظار رد المستخدم
        global.api.listenToNextMessage(message.threadID, async (reply) => {
            const nums = reply.body
                .split(/[\s,]+/)
                .map((n) => parseInt(n))
                .filter((n) => n >= 1 && n <= 6);

            if (nums.length === 0) return message.reply(getLang("invalid"));

            const keys = Object.keys(antiSettings);
            for (const n of nums) {
                const key = keys[n - 1];
                antiSettings[key] = !antiSettings[key];
            }

            await updateSettings(message.threadID, antiSettings);
            return message.reply(getLang("success"));
        });
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall,
};
