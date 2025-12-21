const config = {
    name: "اعدادات",
    aliases: ["setting"],
    description: "Settings for better group management",
    usage: "",
    cooldown: 3,
    permissions: [1],
    credits: "XaviaTeam",
};

const langData = {
    ar_SY: {
        menu: "⌈ اعـدادات الـمـجـموعـة ⌋\n\n1. [{antiSpam}] مكافحة الإزعاج\n2. [{antiOut}] مكافحة الخروج\n3. [{antiChangeGroupName}] استرجاع اسم المجموعة\n4. [{antiChangeGroupImage}] استرجاع صورة المجموعة\n5. [{antiChangeNickname}] منع تغيير الكنية\n\n6. [{notifyChange}] اخطار أحداث المجموعة\n\n⇒ اكتب أرقام الخيارات لتفعيل/تعطيل الإعدادات مباشرة",
        DataNotReady: "البيانات ليست جاهزة، يرجى المحاولة لاحقًا\nاو استخدم: ${prefix}قم بالتحديث وحاول مرة أخرى",
        notGroup: "لا يمكن استخدام هذا الأمر إلا في المجموعات!",
        error: "حدث خطأ، يرجى المحاولة لاحقًا",
        invalid: "مدخل غير صالح",
        botNotAdmin: "البوت ليس أدمن في هذه المجموعة، لذلك سيتم تجاهل مكافحة الإزعاج ومكافحة الخروج",
        success: "تم حفظ الإعدادات الجديدة بنجاح",
    },
};

async function chooseMenu({ message, getLang, data }) {
    try {
        let chosenIndexes = message.args.filter(
            (e) => !!e && !isNaN(e) && e > 0 && e <= 6
        );

        if (chosenIndexes.length === 0) return message.reply(getLang("invalid"));

        const _THREAD = data?.thread;
        if (!_THREAD) return message.reply(getLang("error"));

        const _THREAD_DATA = _THREAD.data;
        const _THREAD_DATA_ANTI_SETTINGS = _THREAD_DATA?.antiSettings || {};

        const newSettings = {
            antiSpam: !!_THREAD_DATA_ANTI_SETTINGS?.antiSpam,
            antiOut: !!_THREAD_DATA_ANTI_SETTINGS?.antiOut,
            antiChangeGroupName: !!_THREAD_DATA_ANTI_SETTINGS?.antiChangeGroupName,
            antiChangeGroupImage: !!_THREAD_DATA_ANTI_SETTINGS?.antiChangeGroupImage,
            antiChangeNickname: !!_THREAD_DATA_ANTI_SETTINGS?.antiChangeNickname,
            notifyChange: !!_THREAD_DATA_ANTI_SETTINGS?.notifyChange,
        };

        const settingsKeys = Object.keys(newSettings);

        for (const _index of chosenIndexes) {
            const _key = settingsKeys[_index - 1];
            newSettings[_key] = !newSettings[_key];
        }

        // فحص إذا كان البوت أدمن
        const isBotAdmin = _THREAD.info?.adminIDs?.some((e) => e == global.botID);
        if (!isBotAdmin && (newSettings.antiSpam || newSettings.antiOut)) {
            newSettings.antiOut = false;
            newSettings.antiSpam = false;
            await message.reply(getLang("botNotAdmin"));
        }

        // حفظ الإعدادات مباشرة
        await global.controllers.Threads.updateData(message.threadID, {
            antiSettings: newSettings,
        });

        const _newSettings = {};
        for (const _key of settingsKeys) {
            _newSettings[_key] = newSettings[_key] ? "✅" : "❌";
        }

        return message.reply(getLang("success") + "\n\n" +
            "⌈ الإعدادات الحالية ⌋\n" +
            `1. مكافحة الإزعاج: ${_newSettings.antiSpam}\n` +
            `2. مكافحة الخروج: ${_newSettings.antiOut}\n` +
            `3. استرجاع اسم المجموعة: ${_newSettings.antiChangeGroupName}\n` +
            `4. استرجاع صورة المجموعة: ${_newSettings.antiChangeGroupImage}\n` +
            `5. منع تغيير الكنية: ${_newSettings.antiChangeNickname}\n` +
            `6. اخطار أحداث المجموعة: ${_newSettings.notifyChange}`
        );
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

async function onCall({ message, getLang, data, prefix }) {
    if (!data?.thread?.info) return message.reply(getLang("DataNotReady", { prefix }));
    if (!data.thread.info.isGroup) return message.reply(getLang("notGroup"));

    const _THREAD_DATA_ANTI_SETTINGS = {
        ...(data.thread.data?.antiSettings || {}),
    };

    const keys = [
        "antiSpam",
        "antiOut",
        "antiChangeGroupName",
        "antiChangeGroupImage",
        "antiChangeNickname",
        "notifyChange",
    ];

    const displaySettings = {};
    for (const key of keys) {
        displaySettings[key] = _THREAD_DATA_ANTI_SETTINGS[key] ? "✅" : "❌";
    }

    return message
        .reply(getLang("menu", { ...displaySettings }))
        .then((_) => _.addReplyEvent({ callback: chooseMenu }))
        .catch((e) => {
            console.error(e);
            message.reply(getLang("error"));
        });
}

export default {
    config,
    langData,
    onCall,
};
