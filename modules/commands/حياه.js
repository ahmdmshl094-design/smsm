const fs = require("fs");
const path = require("path");
const readline = require("readline");

// مسار ملف البيانات
const dataFile = path.join(__dirname, "lifeData.json");

// تحميل البيانات أو إنشاء ملف جديد
function loadData() {
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try {
    return JSON.parse(fs.readFileSync(dataFile));
  } catch (e) {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// البيانات المخزنة
let lifeData = loadData();

// دالة التسجيل
function registerLife(userId) {
  if (lifeData[userId]) return `⚠️ أنت مسجل بالفعل!`;

  lifeData[userId] = {
    name: `لاسم`,
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
  return `✅ تم تسجيلك بنجاح في لعبة الحياة! اكتب "حياة" لبدء اليوم.`;
}

// دالة عرض حالة اللاعب
function showLife(userId) {
  if (!lifeData[userId]) return `⚠️ أنت لم تسجل بعد. اكتب "حياة تسجيل" للتسجيل.`;

  const p = lifeData[userId];
  return `
═════════════════════════
💠 الاسم: ${p.name}
🎖️ العمر: ${p.age}
⚡ الطاقة: ${p.energy}
💰 المال: ${p.money}
😊 المزاج: ${p.mood}
❤️ الصحة: ${p.health}
🧠 الذكاء: ${p.intelligence}
💍 متزوج: ${p.married ? "نعم" : "لا"}
👶 الأطفال: ${p.children}
✨ المهارات المكتسبة: ${p.skills.join(", ") || "لا يوجد"}
═════════════════════════
`;
}

// دالة تنفيذ نشاط
function doActivity(userId, activity) {
  const p = lifeData[userId];
  switch (activity) {
    case "العمل":
      p.money += 50;
      p.energy -= 20;
      p.mood -= 5;
      p.skills.push("خبرة العمل");
      return `💼 عملت اليوم وكسبت 50 مال، الطاقة -20، المزاج -5، واكتسبت مهارة "خبرة العمل"`;
    case "الطعام":
      p.energy += 20;
      p.health += 10;
      return `🍽️ أكلت طعام صحي، الطاقة +20، الصحة +10`;
    case "الشراب":
      p.mood += 10;
      return `🥤 شربت مشروب منعش، المزاج +10`;
    case "المشي":
      p.energy -= 10;
      p.health += 5;
      p.mood += 5;
      return `🚶‍♂️ ذهبت للمشي، الطاقة -10، الصحة +5، المزاج +5`;
    case "الزواج":
      if (!p.married) {
        p.married = true;
        return `💍 تهانينا! أنت الآن متزوج.`;
      } else {
        return `⚠️ أنت متزوج بالفعل.`;
      }
    case "الإنجاب":
      if (p.married) {
        p.children += 1;
        p.mood += 10;
        return `👶 أنجبتم طفلاً جديدًا! المزاج +10`;
      } else {
        return `⚠️ لا يمكنك الإنجاب قبل الزواج.`;
      }
    case "التربية":
      if (p.children > 0) {
        p.energy -= 10;
        p.mood += 5;
        p.skills.push("تربية الأطفال");
        return `👶 ربيت أطفالك، الطاقة -10، المزاج +5، واكتسبت مهارة "تربية الأطفال"`;
      } else {
        return `⚠️ ليس لديك أطفال لتربيهم.`;
      }
    case "التسوق":
      if (p.money >= 20) {
        p.money -= 20;
        p.mood += 15;
        return `🛒 ذهبت للتسوق، المزاج +15، المال -20`;
      } else {
        return `⚠️ لا يوجد مال كافي للتسوق.`;
      }
    case "الرياضة":
      p.energy -= 15;
      p.health += 10;
      p.mood += 5;
      return `🏋️‍♂️ مارست الرياضة، الطاقة -15، الصحة +10، المزاج +5`;
    case "القراءة":
      p.intelligence += 5;
      p.mood += 5;
      return `📖 قرأت كتابًا، الذكاء +5، المزاج +5`;
    case "السفر":
      if (p.money >= 30) {
        p.money -= 30;
        p.mood += 20;
        p.energy -= 20;
        return `✈️ سافرت، المزاج +20، الطاقة -20، المال -30`;
      } else {
        return `⚠️ لا يوجد مال كافي للسفر.`;
      }
    case "المشاكل":
      p.mood -= 15;
      p.health -= 5;
      return `⚠️ واجهت مشاكل اليوم، المزاج -15، الصحة -5`;
    default:
      return `⚠️ نشاط غير معروف.`;
  }
}

// واجهة نصية تفاعلية
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startDay(userId) {
  showMenu();

  function showMenu() {
    console.log(showLife(userId));
    console.log("اختر نشاطك اليوم:");
    console.log("1. العمل");
    console.log("2. الطعام");
    console.log("3. الشراب");
    console.log("4. المشي");
    console.log("5. الزواج");
    console.log("6. الإنجاب");
    console.log("7. التربية");
    console.log("8. التسوق");
    console.log("9. الرياضة");
    console.log("10. القراءة");
    console.log("11. السفر");
    console.log("12. المشاكل");
    console.log("0. إنهاء اليوم");

    rl.question("اختر رقم النشاط: ", (answer) => {
      const activities = {
        "1": "العمل",
        "2": "الطعام",
        "3": "الشراب",
        "4": "المشي",
        "5": "الزواج",
        "6": "الإنجاب",
        "7": "التربية",
        "8": "التسوق",
        "9": "الرياضة",
        "10": "القراءة",
        "11": "السفر",
        "12": "المشاكل"
      };

      if (answer === "0") {
        saveData(lifeData);
        console.log("✅ تم إنهاء اليوم وحفظ البيانات.");
        rl.close();
        return;
      }

      const activity = activities[answer];
      if (!activity) {
        console.log("⚠️ اختيار غير صحيح.");
      } else {
        console.log(doActivity(userId, activity));
        saveData(lifeData);
      }

      showMenu();
    });
  }
}

// محاكاة استقبال الرسائل
const userId = "user123";
function handleMessage(message) {
  message = message.toLowerCase();
  if (message === "حياة تسجيل") {
    console.log(registerLife(userId));
  } else if (message === "حياة") {
    startDay(userId);
  } else {
    console.log(`⚠️ أمر غير معروف. استخدم "حياة تسجيل" أو "حياة"`);
  }
}

// تجربة الكود
handleMessage("حياة تسجيل"); // تسجيل المستخدم
handleMessage("حياة");         // بدء اليوم التفاعلي
