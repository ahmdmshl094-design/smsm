module.exports.config = {
  name: "هجوم",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "عمر",
  description: "انضم لمعركة شخصيات حربية",
  commandCategory: "العاب",
  cooldowns: 20000000,
  envConfig: { cooldownTime: 200000000 }
};

module.exports.languages = {
  "en": {
    "cooldown": "⚡️لقد انتهيت ، عد لاحقًا : %1 دقيقة و %2 ثانية ."
  }
};

const characters = [
  {name:"السيف المشتعل", hp:180, power:40, speed:20, ability:"ضربة نارية +20 ضرر"},
  {name:"ظل الليل", hp:120, power:55, speed:35, ability:"هجوم مزدوج سريع"},
  {name:"الحارس الحجري", hp:250, power:25, speed:10, ability:"درع يمتص 30 ضرر"},
  {name:"الرامي الذهبي", hp:140, power:50, speed:30, ability:"سهم يخترق +15 ضرر"},
  {name:"المرتل المظلم", hp:160, power:30, speed:40, ability:"إضعاف الخصم -10 قوة"},
  {name:"الساحر الأزرق", hp:110, power:60, speed:25, ability:"موجة سحرية +25 ضرر"},
  {name:"الذئب الفضي", hp:170, power:45, speed:35, ability:"هجوم شرس +15"},
  {name:"المخالب الحديدية", hp:200, power:35, speed:20, ability:"نزيف -5 صحة كل جولة"},
  {name:"عين الصقر", hp:150, power:45, speed:30, ability:"دقة تزيد الضرر 20%"},
  {name:"ملك العاصفة", hp:130, power:55, speed:30, ability:"صاعقة +30 ضرر"}
];

let battles = {}; // لتخزين بيانات كل معركة مؤقتاً

module.exports.handleReply = async ({ event, api, handleReply, Currencies }) => {
  const { threadID, messageID, senderID } = event;
  let data = (await Currencies.getData(senderID)).data || {};

  if(handleReply.type == "chooseCharacter") {
    const choice = parseInt(event.body);
    if(isNaN(choice) || choice < 1 || choice > 10) return api.sendMessage("⚡️الاختيار غير صالح.", threadID, messageID);

    const char = characters[choice-1];

    // حفظ اختيار اللاعب
    if(!battles[threadID]) battles[threadID] = {players:[]};
    battles[threadID].players.push({id: senderID, char: char});

    // حذف القائمة القديمة وعرض تفاصيل الشخصية
    api.unsendMessage(handleReply.messageID);
    await api.sendMessage(
      `⚔️ لقد اخترت الشخصية:\n\n` +
      `اسم: ${char.name}\n` +
      `الصحة: ${char.hp}\n` +
      `القوة: ${char.power}\n` +
      `السرعة: ${char.speed}\n` +
      `القدرة الخاصة: ${char.ability}\n\n` +
      `انتظر لاعب آخر للانضمام...`,
      threadID, messageID
    );

    // إذا انضم لاعبان ابدأ المعركة
    if(battles[threadID].players.length == 2) {
      const [p1, p2] = battles[threadID].players;

      // تطبيق القدرات الخاصة الديناميكية
      function applyAbility(char) {
        let bonus = 0;
        switch(char.ability) {
          case "ضربة نارية +20 ضرر":
            bonus = 20;
            break;
          case "هجوم مزدوج سريع":
            bonus = Math.floor(Math.random() * 15) + 10;
            break;
          case "درع يمتص 30 ضرر":
            bonus = -30; // يقلل الضرر المستلم
            break;
          case "سهم يخترق +15 ضرر":
            bonus = 15;
            break;
          case "إضعاف الخصم -10 قوة":
            bonus = -10;
            break;
          case "موجة سحرية +25 ضرر":
            bonus = 25;
            break;
          case "هجوم شرس +15":
            bonus = 15;
            break;
          case "نزيف -5 صحة كل جولة":
            bonus = -5;
            break;
          case "دقة تزيد الضرر 20%":
            bonus = Math.floor(char.power * 0.2);
            break;
          case "صاعقة +30 ضرر":
            bonus = 30;
            break;
          default: bonus = 0;
        }
        return bonus;
      }

      const score1 = p1.char.power + p1.char.speed + applyAbility(p1.char);
      const score2 = p2.char.power + p2.char.speed + applyAbility(p2.char);

      let winner, loser;
      if(score1 > score2) { winner = p1; loser = p2; }
      else if(score2 > score1) { winner = p2; loser = p1; }
      else { // tie breaker باستخدام الصحة + random
        winner = (p1.char.hp >= p2.char.hp) ? p1 : p2;
        loser = (winner == p1 ? p2 : p1);
      }

      const reward = Math.floor(Math.random() * 5000) + 2000;
      await Currencies.increaseMoney(winner.id, reward);

      await api.sendMessage(
        `🏆✨ ⚔️ المعركة انتهت! ⚔️✨ 🏆\n\n` +
        `🌟 الفائز: @${winner.id} \n` +
        `شخصيته: ${winner.char.name}\n` +
        `💰 ربح: ${reward} دولار\n\n` +
        `😹 الخاسر: @${loser.id}\n` +
        `شخصيته: ${loser.char.name}\n` +
        `ضحك لقيت الحش كيف ينجص ☝🏿🐸`,
        threadID, null, { mentions: [winner.id, loser.id] }
      );

      delete battles[threadID]; // مسح بيانات المعركة بعد الانتهاء
    }
  }
};

module.exports.run = async ({ event, api }) => {
  const { threadID, messageID } = event;

  // رسالة افتتاحية + قائمة الشخصيات بالاستايل الأول
  api.sendMessage(
    `⚔️ انضم لاعب جديد للمعركة\n\n` +
    `╭──〔 ⚔️ ساحة الهجوم 〕───\n` +
    `│ 1 • السيف المشتعل\n` +
    `│ 2 • ظل الليل\n` +
    `│ 3 • الحارس الحجري\n` +
    `│ 4 • الرامي الذهبي\n` +
    `│ 5 • المرتل المظلم\n` +
    `│ 6 • الساحر الأزرق\n` +
    `│ 7 • الذئب الفضي\n` +
    `│ 8 • المخالب الحديدية\n` +
    `│ 9 • عين الصقر\n` +
    `│ 10 • ملك العاصفة\n` +
    `╰──────────────────\n` +
    `↯ رد برقم الشخصية لبدء اللعب`,
    threadID, (err, info) => {
      global.client.handleReply.push({
        type: "chooseCharacter",
        name: "هجوم",
        author: event.senderID,
        messageID: info.messageID
      });
    }
  );
};
