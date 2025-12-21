const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "cache/data/lifeData.json");

function ensureDir() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadData() {
  ensureDir();
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "{}");
  }
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (e) {
    console.error("Error loading life data:", e);
    return {};
  }
}

function saveData(data) {
  try {
    ensureDir();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving life data:", e);
  }
}

module.exports.config = {
  name: "حياة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "مطور",
  description: "محاكاة الحياة الواقعية مع حفظ البيانات",
  commandCategory: "ألعاب",
  usages: "حياة",
  cooldowns: 2
};

// تسجيل المستخدم
function registerUser(userId) {
  const data = loadData();
  
  if (data[userId]) {
    return "⚠️ أنت مسجل بالفعل في لعبة الحياة!";
  }

  data[userId] = {
    name: "شخصية جديدة",
    age: 18,
    energy: 100,
    money: 5000,
    mood: 80,
    health: 100,
    intelligence: 50,
    experience: 0,
    level: 1,
    married: false,
    partner: null,
    children: 0,
    job: null,
    salary: 0,
    education: "ابتدائية",
    skills: [],
    house: "شقة صغيرة",
    car: null,
    lifeEvents: [],
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };

  saveData(data);
  return "✅ تم التسجيل! اكتب: حياة";
}

// عرض حالة المستخدم
function showStatus(userId) {
  const data = loadData();
  const user = data[userId];

  if (!user) {
    return "⚠️ لم تسجل بعد! اكتب: حياة تسجيل";
  }

  const healthBar = "█".repeat(Math.floor(user.health / 10)) + "░".repeat(10 - Math.floor(user.health / 10));
  const energyBar = "█".repeat(Math.floor(user.energy / 10)) + "░".repeat(10 - Math.floor(user.energy / 10));
  const moodBar = "█".repeat(Math.floor(user.mood / 10)) + "░".repeat(10 - Math.floor(user.mood / 10));

  return `
╔════════════════════════════════════╗
║         📊 حالتك في الحياة        ║
╚════════════════════════════════════╝

👤 الاسم: ${user.name}
🎂 العمر: ${user.age} سنة
⭐ المستوى: ${user.level}
📈 الخبرة: ${user.experience}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❤️ الصحة: ${healthBar} ${user.health}%
⚡ الطاقة: ${energyBar} ${user.energy}%
😊 المزاج: ${moodBar} ${user.mood}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 الوظيفة: ${user.job || "بدون وظيفة"}
💰 الراتب الشهري: ${user.salary} ريال
💵 رصيدك: ${user.money} ريال
🧠 الذكاء: ${user.intelligence}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 السكن: ${user.house}
🚗 السيارة: ${user.car || "بدون سيارة"}
📚 التعليم: ${user.education}
💍 الحالة: ${user.married ? `متزوج من ${user.partner}` : "أعزب"}
👶 الأطفال: ${user.children}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 المهارات: ${user.skills.length > 0 ? user.skills.join("، ") : "لا توجد مهارات"}

╚════════════════════════════════════╝`;
}

// تنفيذ النشاط
function doActivity(userId, activity) {
  const data = loadData();
  const user = data[userId];

  if (!user) return { msg: "⚠️ سجل أولاً! اكتب: حياة تسجيل", updated: false };

  activity = activity.toLowerCase().trim();
  let msg = "";
  let energyNeeded = 0;

  switch (activity) {
    case "نوم":
    case "نام":
      user.energy = 100;
      user.health = Math.min(100, user.health + 15);
      msg = "😴 نمت بعمق واستيقظت منتعشاً!\nاستعدت طاقتك بالكامل.";
      break;

    case "طعام":
    case "تناول":
      if (user.money < 50) return { msg: "❌ لا تملك مال كافي (تحتاج 50)", updated: false };
      user.money -= 50;
      user.energy = Math.min(100, user.energy + 30);
      user.health = Math.min(100, user.health + 10);
      msg = "🍽️ تناولت وجبة صحية لذيذة!\n+30 طاقة، +10 صحة";
      break;

    case "عمل":
      energyNeeded = 30;
      if (user.energy < energyNeeded) return { msg: `❌ أنت متعب! تحتاج ${energyNeeded} طاقة`, updated: false };
      
      if (!user.job) {
        msg = "⚠️ أنت بدون وظيفة! استخدم 'حياة بحث' أولاً";
      } else {
        user.energy -= energyNeeded;
        user.mood -= 5;
        user.experience += 10;
        user.money += user.salary / 30;
        
        if (user.experience >= user.level * 100) {
          user.level++;
          user.experience = 0;
          msg = `💼 عملت بجد! كسبت ${Math.round(user.salary / 30)} ريال\n🎉 صعدت المستوى إلى ${user.level}!`;
        } else {
          msg = `💼 عملت بجد! كسبت ${Math.round(user.salary / 30)} ريال`;
        }
      }
      break;

    case "رياضة":
    case "تمرين":
      energyNeeded = 20;
      if (user.energy < energyNeeded) return { msg: `❌ أنت متعب جداً! تحتاج ${energyNeeded} طاقة`, updated: false };
      user.energy -= energyNeeded;
      user.health = Math.min(100, user.health + 15);
      user.mood = Math.min(100, user.mood + 10);
      if (!user.skills.includes("اللياقة البدنية")) user.skills.push("اللياقة البدنية");
      msg = "🏋️ مارست الرياضة وشعرت بتحسن رائع!\n+15 صحة، +10 مزاج";
      break;

    case "تعلم":
    case "دراسة":
      energyNeeded = 15;
      if (user.energy < energyNeeded) return { msg: `❌ أنت متعب! تحتاج ${energyNeeded} طاقة`, updated: false };
      user.energy -= energyNeeded;
      user.intelligence = Math.min(200, user.intelligence + 5);
      user.mood += 3;
      if (!user.skills.includes("المعرفة")) user.skills.push("المعرفة");
      msg = "📚 تعلمت مهارات جديدة!\n+5 ذكاء";
      break;

    case "تسوق":
      if (user.money < 200) return { msg: "❌ لا تملك 200 ريال للتسوق", updated: false };
      user.money -= 200;
      user.mood = Math.min(100, user.mood + 20);
      user.energy -= 10;
      msg = "🛒 تسوقت وقضيت وقتاً رائعاً!\n+20 مزاج";
      break;

    case "بحث":
    case "وظيفة":
      const jobs = [
        { name: "موظف استقبال", salary: 2000 },
        { name: "مدرس", salary: 3000 },
        { name: "طبيب", salary: 8000 },
        { name: "مهندس", salary: 5000 },
        { name: "مبرمج", salary: 6000 },
        { name: "صاحب متجر", salary: 4000 }
      ];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      user.job = job.name;
      user.salary = job.salary;
      msg = `✅ حصلت على وظيفة جديدة!\n💼 ${job.name}\n💰 الراتب: ${job.salary} ريال`;
      break;

    case "زواج":
    case "تزوج":
      if (user.married) return { msg: "⚠️ أنت متزوج بالفعل!", updated: false };
      if (user.age < 20) return { msg: "⚠️ يجب أن تكون أكبر من 20 سنة", updated: false };
      if (user.money < 5000) return { msg: "❌ تحتاج 5000 ريال للزواج", updated: false };
      
      const names = ["سارة", "فاطمة", "لينا", "هند", "نور", "رامي", "أحمد", "محمد"];
      user.partner = names[Math.floor(Math.random() * names.length)];
      user.married = true;
      user.money -= 5000;
      user.mood = 100;
      msg = `💍 تهانينا بالزواج!\n👰 ${user.partner} أصبحت شريكة حياتك`;
      break;

    case "إنجاب":
    case "طفل":
      if (!user.married) return { msg: "⚠️ يجب أن تكون متزوجاً أولاً!", updated: false };
      if (user.money < 2000) return { msg: "❌ تحتاج 2000 ريال للإنجاب", updated: false };
      user.children++;
      user.money -= 2000;
      user.mood += 15;
      user.energy -= 20;
      msg = `👶 مبروك! رزقت بطفل جديد!\n🎉 عدد الأطفال: ${user.children}`;
      break;

    case "سفر":
      if (user.money < 3000) return { msg: "❌ تحتاج 3000 ريال للسفر", updated: false };
      user.money -= 3000;
      user.energy -= 15;
      user.mood = 100;
      msg = "✈️ سافرت واستمتعت برحلة رائعة!\nعادت روحك بالكامل";
      break;

    case "عيادة":
    case "طبيب":
      if (user.money < 500) return { msg: "❌ تحتاج 500 ريال للعيادة", updated: false };
      user.money -= 500;
      user.health = 100;
      msg = "🏥 زرت الطبيب وتعافيت بالكامل!";
      break;

    case "سيارة":
      if (user.money < 30000) return { msg: "❌ تحتاج 30000 ريال لشراء سيارة", updated: false };
      const cars = ["تويوتا", "هونداي", "بي إم دبليو", "مرسيدس"];
      user.car = cars[Math.floor(Math.random() * cars.length)];
      user.money -= 30000;
      msg = `🚗 اشتريت سيارة جديدة!\n${user.car}`;
      break;

    case "بيت":
    case "منزل":
      if (user.money < 50000) return { msg: "❌ تحتاج 50000 ريال لشراء منزل", updated: false };
      user.house = "فيلا فاخرة";
      user.money -= 50000;
      msg = "🏡 اشتريت فيلا فاخرة! حياتك تتحسن";
      break;

    case "يوم":
      msg = "📅 اليوم الكامل:\n";
      user.energy -= 20;
      user.mood += 5;
      user.money += user.salary / 30;
      user.health = Math.min(100, user.health + 5);
      msg = "✨ قضيت يوماً منتجاً وسعيداً!";
      break;

    default:
      return { msg: `❌ نشاط غير معروف: ${activity}\nاكتب: حياة قائمة`, updated: false };
  }

  user.lastActivity = new Date().toISOString();
  saveData(data);

  return { msg, updated: true };
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const command = body.split(" ").slice(1).join(" ").toLowerCase();

  // تسجيل جديد
  if (command === "تسجيل") {
    const msg = registerUser(senderID);
    return api.sendMessage(msg, threadID, messageID);
  }

  // قائمة الأوامر
  if (command === "قائمة") {
    const menu = `
╔════════════════════════════════════╗
║         🎮 قائمة الأوامر         ║
╚════════════════════════════════════╝

📊 **عرض الحالة:**
حياة

🎯 **الأنشطة:**
حياة نوم - استرجع طاقتك
حياة طعام - تناول وجبة
حياة بحث - ابحث عن وظيفة
حياة عمل - اعمل واكسب مال
حياة رياضة - مارس الرياضة
حياة تعلم - تعلم مهارات
حياة تسوق - تسوق وترفه عن نفسك
حياة سفر - اسفر واستمتع
حياة عيادة - اذهب للطبيب

💍 **العائلة:**
حياة زواج - تزوج
حياة إنجاب - أنجب طفل

🏠 **الممتلكات:**
حياة سيارة - اشتري سيارة
حياة بيت - اشتري فيلا

════════════════════════════════════`;
    return api.sendMessage(menu, threadID, messageID);
  }

  // تنفيذ النشاط
  if (command) {
    const result = doActivity(senderID, command);
    if (!result.updated) {
      return api.sendMessage(result.msg, threadID, messageID);
    }
    const status = showStatus(senderID);
    return api.sendMessage(result.msg + "\n\n" + status, threadID, messageID);
  }

  // عرض الحالة فقط
  const status = showStatus(senderID);
  return api.sendMessage(status + `

📝 اكتب: حياة قائمة`, threadID, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, senderID, body } = event;

  if (body.toLowerCase() === "تسجيل") {
    const msg = registerUser(senderID);
    return api.sendMessage(msg, threadID, messageID);
  }

  const result = doActivity(senderID, body);
  if (!result.updated) {
    return api.sendMessage(result.msg, threadID, messageID);
  }

  const status = showStatus(senderID);
  return api.sendMessage(result.msg + "\n\n" + status, threadID, messageID);
};
