const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "بنك",
  version: "1.7.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "نظام بنك + تنقيب + عمل + تحويل + توب بالدولار باللهجة السودانية مع زخارف",
  commandCategory: "الاموال",
  usages: "تسجيل/عرض/تنقيب/عمل/حول/توب",
  cooldowns: 0
};

const pathData = path.join(__dirname, 'banking', 'banking.json');

// ------------------- تحميل البيانات -------------------
function تحميل_البيانات() {
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(pathData, "utf-8"));
}

// ------------------- حفظ البيانات -------------------
function حفظ_البيانات(المستخدمين) {
  fs.writeFileSync(pathData, JSON.stringify(المستخدمين, null, 2));
}

// ------------------- تسجيل الحساب -------------------
function تسجيل_الحساب(senderID) {
  const المستخدمين = تحميل_البيانات();
  if (!المستخدمين.find(u => u.senderID == senderID)) {
    المستخدمين.push({ senderID, money: 0, اخر_تنقيب: 0 });
    حفظ_البيانات(المستخدمين);
    return "◉⊱ مبروك يا زول! اتسجلت في البنك بنجاح\n◉⊱ هسي ممكن تبدأ التنقيب والعمل وتحويل القروش بالدولار.";
  } else return "⧉ انت مسجل أصلاً في البنك يا زول";
}

// ------------------- عرض الرصيد -------------------
function عرض_الرصيد(senderID) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: بنك تسجيل";
  return "◉⊱ رصيدك الحالي في البنك: " + المستخدم.money + "$";
}

// ------------------- تنقيب -------------------
function تنقيب(senderID, نوع) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: بنك تسجيل";

  const الان = Date.now();
  const cooldown = 10 * 60 * 1000; // 10 دقائق
  if (المستخدم.اخر_تنقيب && الان - المستخدم.اخر_تنقيب < cooldown) {
    const دقيقة = Math.ceil((cooldown - (الان - المستخدم.اخر_تنقيب))/60000);
    return "⧉ يا زول! انت عملت تنقيب قبل كده، استنى " + دقيقة + " دقيقة قبل ما تنقب تاني.";
  }

  let مبلغ = 0;
  switch (نوع) {
    case "تنقيب": مبلغ = Math.floor(Math.random() * 100) + 50; break;
    case "تنقيب كبير": مبلغ = Math.floor(Math.random() * 200) + 150; break;
    case "تنقيب ضخم": مبلغ = Math.floor(Math.random() * 500) + 400; break;
    default: return "⧉ اختار نوع التنقيب: تنقيب، تنقيب كبير، تنقيب ضخم";
  }

  المستخدم.money += مبلغ;
  المستخدم.اخر_تنقيب = الان;
  حفظ_البيانات(المستخدمين);

  return "◉⊱ عملت " + نوع + " وكسبت " + مبلغ + "$ دولار يا زول\n◉⊱ رصيدك هسي: " + المستخدم.money + "$";
}

// ------------------- العمل -------------------
function العمل(senderID) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: بنك تسجيل";

  const الاعمال = [
    { نص: "نمت ليلة في الفراش وبعت القضية", مبلغ: Math.floor(Math.random()*200)+50 },
    { نص: "شتغلت قونة لفنان وحصلت على كدا", مبلغ: Math.floor(Math.random()*250)+80 },
    { نص: "شتغلت في بيت فدادية وبعت 40 جالون عرقي", مبلغ: Math.floor(Math.random()*300)+100 },
    { نص: "وصلت الطلبات لعدة زبائن وكسبت قروش", مبلغ: Math.floor(Math.random()*150)+50 }
  ];

  const العمل_المختار = الاعمال[Math.floor(Math.random()*الاعمال.length)];
  المستخدم.money += العمل_المختار.مبلغ;
  حفظ_البيانات(المستخدمين);

  return `◉⊱ ${العمل_المختار.نص}\n◉⊱ كسبت ${العمل_المختار.مبلغ}$ دولار يا زول\n◉⊱ رصيدك هسي: ${المستخدم.money}$`;
}

// ------------------- التحويل بين المستخدمين -------------------
function تحويل(senderID, targetID, مبلغ) {
  const المستخدمين = تحميل_البيانات();
  const المرسل = المستخدمين.find(u => u.senderID == senderID);
  if (!المرسل) return "⧉ يا زول لازم تسجل أولاً: بنك تسجيل";
  const المستفيد = المستخدمين.find(u => u.senderID == targetID);
  if (!المستفيد) return "⧉ العضو المستفيد ما عنده حساب في البنك";

  if (!مبلغ || isNaN(مبلغ) || مبلغ <= 0) return "⧉ يا زول، حدد مبلغ صحيح بالدولار";
  if (المرسل.money < مبلغ) return "⧉ رصيدك ما بكفي للتحويل";

  المرسل.money -= مبلغ;
  المستفيد.money += مبلغ;
  حفظ_البيانات(المستخدمين);

  return "◉⊱ حولت " + مبلغ + "$ دولار للعضو المحدد\n◉⊱ رصيدك هسي: " + المرسل.money + "$";
}

// ------------------- عرض التوب -------------------
function توب() {
  const المستخدمين = تحميل_البيانات();
  if (المستخدمين.length === 0) return "⧉ ما في زول مسجل حتى الآن";

  const ترتيب = [...المستخدمين].sort((a,b) => b.money - a.money);
  
  let رسالة = "◉⊱ قائمة أغنى المستخدمين:\n";
  ترتيب.slice(0,10).forEach((u, index) => {
    const اسم = "لاعب " + u.senderID.slice(-4);
    رسالة += `◉⊱ ${index+1}. ${اسم} → ${u.money}$\n`;
  });

  return رسالة;
}

// ------------------- الدالة الرئيسية -------------------
module.exports.run = async function({ api, event, args, mentions }) {
  const { senderID, threadID, messageID } = event;
  const امر = args[0];

  if (!امر) return api.sendMessage("◉⊱ يا زول اكتب أمر: تسجيل، عرض، تنقيب، عمل، حول، توب", threadID, messageID);

  let رسالة = "";

  switch(امر) {
    case "تسجيل":
      رسالة = تسجيل_الحساب(senderID); break;
    case "عرض":
      رسالة = عرض_الرصيد(senderID); break;
    case "تنقيب":
    case "تنقيب كبير":
    case "تنقيب ضخم":
      رسالة = تنقيب(senderID, امر); break;
    case "عمل":
      رسالة = العمل(senderID); break;
    case "حول":
      if (!args[2] || isNaN(parseInt(args[2]))) {
        رسالة = "⧉ اكتب: حول @الشخص المبلغ بالدولار"; break;
      }
      const targetID = Object.keys(mentions)[0];
      if (!targetID) {
        رسالة = "⧉ ضع منشن للشخص اللي عايز تحول ليه القروش"; break;
      }
      رسالة = تحويل(senderID, targetID, parseInt(args[2]));
      break;
    case "توب":
      رسالة = توب(); break;
    default:
      رسالة = "⧉ الأمر ما معروف. استعمل: تسجيل، عرض، تنقيب، عمل، حول، توب";
  }

  return api.sendMessage(رسالة, threadID, messageID);
}
