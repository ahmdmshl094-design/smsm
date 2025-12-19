const fs = require("fs");
const path = require("path");

// مسار ملف البيانات
const dataFile = path.join(__dirname, "lifeData.json");

// تحميل البيانات أو إنشاء ملف جديد
function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

let lifeData = loadData();

// =================== التسجيل ===================
function registerLife(userId) {
  if (lifeData[userId]) return "⚠️ أنت مسجل بالفعل.";

  lifeData[userId] = {
    name: "لاسم",
    age: 20,
    energy: 100,
    money: 50,
    mood: 80,
    health: 100,
    intelligence: 10,
    married: false,
    children: 0,
    skills: []
  };

  saveData(lifeData);
  return "✅ تم تسجيلك في لعبة الحياة!\nاكتب: حياة";
}

// =================== عرض الحالة ===================
function showLife(userId) {
  const p = lifeData[userId];
  return `
════════════════════
💠 الاسم: ${p.name}
🎖️ العمر: ${p.age}
⚡ الطاقة: ${p.energy}
💰 المال: ${p.money}
😊 المزاج: ${p.mood}
❤️ الصحة: ${p.health}
🧠 الذكاء: ${p.intelligence}
💍 متزوج: ${p.married ? "نعم" : "لا"}
👶 الأطفال: ${p.children}
✨ المهارات: ${p.skills.join("، ") || "لا يوجد"}
════════════════════`;
}

// =================== تنفيذ الأنشطة ===================
function doActivity(userId, activity) {
  const p = lifeData[userId];

  switch (activity) {
    case "عمل":
      p.money += 50;
      p.energy -= 20;
      p.mood -= 5;
      if (!p.skills.includes("خبرة العمل")) p.skills.push("خبرة العمل");
      return "💼 عملت اليوم وكسبت 50 مال.";

    case "طعام":
      p.energy += 20;
      p.health += 10;
      return "🍽️ تناولت طعامًا صحيًا.";

    case "شراب":
      p.mood += 10;
      return "🥤 شربت مشروبًا منعشًا.";

    case "مشي":
      p.energy -= 10;
      p.health += 5;
      p.mood += 5;
      return "🚶‍♂️ ذهبت للمشي.";

    case "زواج":
      if (p.married) return "⚠️ أنت متزوج بالفعل.";
      p.married = true;
      return "💍 تهانينا! تم الزواج.";

    case "إنجاب":
      if (!p.married) return "⚠️ يجب الزواج أولاً.";
      p.children += 1;
      p.mood += 10;
      return "👶 رزقت بطفل جديد!";

    case "تربية":
      if (p.children < 1) return "⚠️ لا يوجد أطفال.";
      p.energy -= 10;
      p.mood += 5;
      if (!p.skills.includes("تربية الأطفال")) p.skills.push("تربية الأطفال");
      return "👨‍👩‍👧 قمت بتربية أطفالك.";

    case "تسوق":
      if (p.money < 20) return "⚠️ لا يوجد مال كافٍ.";
      p.money -= 20;
      p.mood += 15;
      return "🛒 ذهبت للتسوق.";

    case "رياضة":
      p.energy -= 15;
      p.health += 10;
      p.mood += 5;
      return "🏋️‍♂️ مارست الرياضة.";

    case "قراءة":
      p.intelligence += 5;
      p.mood += 5;
      return "📖 قرأت كتابًا.";

    case "سفر":
      if (p.money < 30) return "⚠️ لا يوجد مال كافٍ.";
      p.money -= 30;
      p.energy -= 20;
      p.mood += 20;
      return "✈️ سافرت واستمتعت.";

    case "مشاكل":
      p.mood -= 15;
      p.health -= 5;
      return "⚠️ واجهت بعض المشاكل.";

    default:
      return "⚠️ نشاط غير معروف.";
  }
}

// =================== أمر البوت ===================
function handleLifeCommand(userId, message) {
  message = message.trim();

  if (message === "حياة تسجيل") {
    return registerLife(userId);
  }

  if (message === "حياة") {
    if (!lifeData[userId])
      return "⚠️ غير مسجل.\nاكتب: حياة تسجيل";

    return (
      showLife(userId) +
      `
📌 الأوامر:
• حياة عمل
• حياة طعام
• حياة شراب
• حياة مشي
• حياة زواج
• حياة إنجاب
• حياة تربية
• حياة تسوق
• حياة رياضة
• حياة قراءة
• حياة سفر
• حياة مشاكل`
    );
  }

  if (message.startsWith("حياة ")) {
    if (!lifeData[userId])
      return "⚠️ سجل أولاً: حياة تسجيل";

    const activity = message.replace("حياة ", "");
    const result = doActivity(userId, activity);
    saveData(lifeData);

    return result + "\n" + showLife(userId);
  }

  return null;
}

// =================== ربطه بالبوت ===================
module.exports = (api) => {
  api.listenMqtt((err, event) => {
    if (err) return;
    if (event.type !== "message" || !event.body) return;

    const reply = handleLifeCommand(event.senderID, event.body);
    if (reply) api.sendMessage(reply, event.threadID);
  });
};
