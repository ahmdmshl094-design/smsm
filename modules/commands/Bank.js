const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "بنك",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "عمر",
  description: "نظام بنك متكامل: تسجيل، تنقيب، عمل، تحويل، كشف حساب، قرض، بالدولار والجنيه مع زخارف سودانية",
  commandCategory: "الاموال",
  usages: "تسجيل/عرض/تنقيب/عمل/حول/توب/كشف/قرض",
  cooldowns: 0
};

const bankingDir = path.join(__dirname, 'banking');
const pathData = path.join(bankingDir, 'banking.json');

// ------------------- تحميل البيانات -------------------
function تحميل_البيانات() {
  if (!fs.existsSync(bankingDir)) fs.mkdirSync(bankingDir);
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(pathData, "utf-8"));
}

// ------------------- حفظ البيانات -------------------
function حفظ_البيانات(المستخدمين) {
  try {
    fs.writeFileSync(pathData, JSON.stringify(المستخدمين, null, 2));
  } catch (err) {
    console.error("حدث خطأ أثناء حفظ البيانات:", err);
  }
}

// ------------------- تسجيل الحساب -------------------
function تسجيل_الحساب(senderID, الاسم) {
  const المستخدمين = تحميل_البيانات();
  if (!المستخدمين.find(u => u.senderID == senderID)) {
    المستخدمين.push({
      senderID,
      name: الاسم,
      money: 0,
      اخر_تنقيب: 0,
      تحويلات: [],
      دين: 0
    });
    حفظ_البيانات(المستخدمين);
    return `◉⊱ مبروك يا ${الاسم}! اتسجلت في البنك بنجاح\n◉⊱ هسي ممكن تبدأ التنقيب والعمل وتحويل القروش.`;
  } else return "⧉ انت مسجل أصلاً في البنك يا زول";
}

// ------------------- عرض الرصيد -------------------
function عرض_الرصيد(senderID) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";
  return `◉⊱ رصيدك الحالي: ${المستخدم.money}$\n◉⊱ دينك الحالي: ${المستخدم.دين}$`;
}

// ------------------- تنقيب -------------------
function تنقيب(senderID, نوع) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";

  const الان = Date.now();
  const cooldown = 10 * 60 * 1000; // 10 دقائق
  if (المستخدم.اخر_تنقيب && الان - المستخدم.اخر_تنقيب < cooldown) {
    const وقت_متبقي = cooldown - (الان - المستخدم.اخر_تنقيب);
    if (وقت_متبقي > 60000) {
      const دقيقة = Math.ceil(وقت_متبقي/60000);
      return "⧉ انت عملت تنقيب قبل كده، استنى " + دقيقة + " دقيقة قبل ما تنقب تاني.";
    } else {
      const ثانية = Math.ceil(وقت_متبقي/1000);
      return "⧉ استنى " + ثانية + " ثانية قبل ما تنقب تاني.";
    }
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

  return `◉⊱ عملت ${نوع} وكسبت ${مبلغ}$\n◉⊱ رصيدك هسي: ${المستخدم.money}$`;
}

// ------------------- العمل -------------------
function العمل(senderID) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";

  const الاعمال = [
    { نص: "نمت ليلة في الفراش وبعت القضية", مبلغ: Math.floor(Math.random()*200)+50 },
    { نص: "شتغلت قونة لفنان وحصلت على قروش", مبلغ: Math.floor(Math.random()*250)+80 },
    { نص: "شتغلت في بيت فدادية وبعت 40 جالون عرقي", مبلغ: Math.floor(Math.random()*300)+100 },
    { نص: "وصلت الطلبات لعدة زبائن وكسبت قروش", مبلغ: Math.floor(Math.random()*150)+50 }
  ];

  const العمل_المختار = الاعمال[Math.floor(Math.random()*الاعمال.length)];
  المستخدم.money += العمل_المختار.مبلغ;
  حفظ_البيانات(المستخدمين);

  return `◉⊱ ${العمل_المختار.نص}\n◉⊱ كسبت ${العمل_المختار.مبلغ}$\n◉⊱ رصيدك هسي: ${المستخدم.money}$`;
}

// ------------------- تحويل -------------------
function تحويل(senderID, targetID, مبلغ, بال_جنيه=false) {
  const المستخدمين = تحميل_البيانات();
  const المرسل = المستخدمين.find(u => u.senderID == senderID);
  const المستفيد = المستخدمين.find(u => u.senderID == targetID);
  if (!المرسل) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";
  if (!المستفيد) return "⧉ العضو المستفيد ما عنده حساب في البنك";

  مبلغ = Math.floor(مبلغ);
  if (!مبلغ || مبلغ <= 0) return "⧉ حدد مبلغ صحيح";
  if (senderID === targetID) return "⧉ ما ممكن تحول قروش لنفسك!";
  if (المرسل.money < مبلغ) return "⧉ رصيدك ما بكفي للتحويل";

  let المبلغ_المرسل = مبلغ;
  if (بال_جنيه) {
    // تحويل بالدولار إلى الجنيه: نفترض 1$ = 600 جنيه سوداني
    المبلغ_المرسل = مبلغ / 600;
    if (المرسل.money < المبلغ_المرسل) return "⧉ رصيدك ما بكفي للتحويل بالجنيه";
  }

  المرسل.money -= المبلغ_المرسل;
  المستفيد.money += المبلغ_المرسل;

  // تسجيل التحويلات
  المرسل.تحويلات.push({ نوع: "صادر", الى: المستفيد.name, مبلغ });
  المستفيد.تحويلات.push({ نوع: "وارد", من: المرسل.name, مبلغ });

  حفظ_البيانات(المستخدمين);

  return `◉⊱ حولت ${مبلغ}${بال_جنيه?" جنيه":"$"} للعضو ${المستفيد.name}\n◉⊱ رصيدك هسي: ${المرسل.money}$`;
}

// ------------------- كشف الحساب -------------------
function كشف_الحساب(senderID) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";
  if (المستخدم.تحويلات.length === 0) return "⧉ ما عندك أي تحويلات حتى الآن";

  let رسالة = "◉⊱ سجل التحويلات:\n";
  المستخدم.تحويلات.slice(-10).forEach(t => {
    if (t.نوع === "صادر") رسالة += `◉⊱ أرسلت ${t.مبلغ}$ → ${t.الى}\n`;
    else رسالة += `◉⊱ استلمت ${t.مبلغ}$ ← ${t.من}\n`;
  });
  return رسالة;
}

// ------------------- أخذ قرض -------------------
function قرض(senderID, مبلغ) {
  const المستخدمين = تحميل_البيانات();
  const المستخدم = المستخدمين.find(u => u.senderID == senderID);
  if (!المستخدم) return "⧉ يا زول لازم تسجل أولاً: تسجيل <اسمك>";
  مبلغ = Math.floor(mبلغ);
  if (!مبلغ || مبلغ <= 0) return "⧉ اكتب مبلغ القرض صحيح";
  المستخدم.money += مبلغ;
  المستخدم.دين += مبلغ;
  حفظ_البيانات(المستخدمين);
  return `◉⊱ اخذت قرض ${مبلغ}$\n◉⊱ رصيدك هسي: ${المستخدم.money}$\n◉⊱ دينك: ${المستخدم.دين}$`;
}

// ------------------- عرض التوب -------------------
function توب() {
  const المستخدمين = تحميل_البيانات();
  if (المستخدمين.length === 0) return "⧉ ما في زول مسجل حتى الآن";

  const ترتيب = [...المستخدمين].sort((a,b) => b.money - a.money);
  let رسالة = "◉⊱ قائمة أغنى المستخدمين:\n";
  ترتيب.slice(0,10).forEach((u, index) => {
    رسالة += `◉⊱ ${index+1}. ${u.name} → ${u.money}$\n`;
  });

  return رسالة;
}

// ------------------- الدالة الرئيسية -------------------
module.exports.run = async function({ api, event, args, mentions }) {
  const { senderID, threadID, messageID } = event;
  const امر = args[0]?.toLowerCase();
  let رسالة = "";

  if (امر === "تسجيل") {
    const الاسم = args.slice(1).join(" ");
    if (!الاسم) return api.sendMessage("⧉ اكتب: تسجيل <اسمك>", threadID, messageID);
    رسالة = تسجيل_الحساب(senderID, الاسم);
  } else {
    const الاوامر = {
      عرض: () => عرض_الرصيد(senderID),
      "تنقيب": () => تنقيب(senderID, "تنقيب"),
      "تنقيب كبير": () => تنقيب(senderID, "تنقيب كبير"),
      "تنقيب ضخم": () => تنقيب(senderID, "تنقيب ضخم"),
      عمل: () => العمل(senderID),
      توب: () => توب(),
      كشف: () => كشف_الحساب(senderID),
      قرض: () => {
        if (!args[1] || isNaN(parseInt(args[1]))) return "⧉ اكتب: قرض <المبلغ بالدولار>";
        return قرض(senderID, parseInt(args[1]));
      },
      حول: () => {
        if (!args[1] || isNaN(parseInt(args[1]))) return "⧉ اكتب: حول @الشخص <المبلغ>";
        const targetID = Object.keys(mentions)[0];
        if (!targetID) return "⧉ ضع منشن للشخص اللي عايز تحول ليه القروش";
        return تحويل(senderID, targetID, parseInt(args[1]));
      }
    };
    رسالة = (الاوامر[امر]) ? الاوامر[امر]() : "⧉ الأمر ما معروف. استعمل: تسجيل، عرض، تنقيب، عمل، حول، توب، كشف، قرض";
  }

  return api.sendMessage(رسالة, threadID, messageID);
};
