const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "cache/data/lifeData.json");
let cache = null;

// ------------------- إدارة الملفات -------------------
function ensureDir() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadData() {
  if (cache) return cache;
  ensureDir();
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
  try {
    cache = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (e) {
    console.error("Error loading life data:", e);
    cache = {};
  }
  return cache;
}

function saveData(data) {
  try {
    ensureDir();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    cache = data;
  } catch (e) {
    console.error("Error saving life data:", e);
  }
}

// ------------------- دوال مساعدة -------------------
function createBar(value) {
  const filled = "█".repeat(Math.floor(value / 10));
  const empty = "░".repeat(10 - Math.floor(value / 10));
  return filled + empty;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

// ------------------- تسجيل المستخدم -------------------
function registerUser(userId) {
  const data = loadData();
  
  if (data[userId]) return "انت مسجل بالفعل في لعبة الحياة.";

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
  return "تم التسجيل! اكتب: حياة";
}

// ------------------- عرض الحالة -------------------
function showStatus(userId) {
  const data = loadData();
  const user = data[userId];
  if (!user) return "لم تسجل بعد! اكتب: حياة تسجيل";

  return `
========= حالتك في الحياة =========

الاسم: ${user.name}
العمر: ${user.age} سنة
المستوى: ${user.level}
الخبرة: ${user.experience}

الصحة: ${createBar(user.health)} ${user.health}%
الطاقة: ${createBar(user.energy)} ${user.energy}%
المزاج: ${createBar(user.mood)} ${user.mood}%

الوظيفة: ${user.job || "بدون وظيفة"}
الراتب الشهري: ${user.salary} ريال
الرصيد: ${user.money} ريال
الذكاء: ${user.intelligence}

السكن: ${user.house}
السيارة: ${user.car || "بدون سيارة"}
التعليم: ${user.education}
الحالة: ${user.married ? `متزوج من ${user.partner}` : "أعزب"}
الأطفال: ${user.children}

المهارات: ${user.skills.length > 0 ? user.skills.join("، ") : "لا توجد مهارات"}
==================================`;
}

// ------------------- الأنشطة -------------------
function sleep(user) { user.energy = 100; user.health = clamp(user.health + 15); return "نمت واستعدت طاقتك بالكامل."; }
function eat(user) { if (user.money < 50) return "لا تملك مال كافي (50)"; user.money -= 50; user.energy = clamp(user.energy + 30); user.health = clamp(user.health + 10); return "تناولت وجبة صحية (+30 طاقة، +10 صحة)"; }
function work(user) { const e=30; if(user.energy<e)return `أنت متعب! تحتاج ${e} طاقة`; if(!user.job)return "أنت بدون وظيفة! استخدم 'حياة بحث'"; user.energy-=e; user.mood=clamp(user.mood-5); user.experience+=10; user.money+=Math.round(user.salary/30); let msg=`عملت بجد! كسبت ${Math.round(user.salary/30)} ريال`; if(user.experience>=user.level*100){user.level++; user.experience=0; msg+=`\nصعدت المستوى إلى ${user.level}`;} return msg; }
function exercise(user){const e=20;if(user.energy<e)return`أنت متعب جداً! تحتاج ${e} طاقة`;user.energy-=e;user.health=clamp(user.health+15);user.mood=clamp(user.mood+10);if(!user.skills.includes("لياقة"))user.skills.push("لياقة");return "مارست الرياضة (+15 صحة، +10 مزاج)";}
function study(user){const e=15;if(user.energy<e)return`أنت متعب! تحتاج ${e} طاقة`;user.energy-=e;user.intelligence=clamp(user.intelligence+5,0,200);user.mood=clamp(user.mood+3);if(!user.skills.includes("معرفة"))user.skills.push("معرفة");return "تعلمت مهارات جديدة (+5 ذكاء)";}
function shop(user){if(user.money<200)return"لا تملك 200 ريال للتسوق";user.money-=200;user.mood=clamp(user.mood+20);user.energy=clamp(user.energy-10);return "تسوقت وقضيت وقتاً رائعاً (+20 مزاج)";}
function findJob(user){const jobs=[{name:"موظف استقبال",salary:2000},{name:"مدرس",salary:3000},{name:"طبيب",salary:8000},{name:"مهندس",salary:5000},{name:"مبرمج",salary:6000},{name:"صاحب متجر",salary:4000}];const j=jobs[Math.floor(Math.random()*jobs.length)];user.job=j.name;user.salary=j.salary;return `حصلت على وظيفة جديدة: ${j.name}، الراتب: ${j.salary}`;}
function marry(user){if(user.married)return "أنت متزوج بالفعل!";if(user.age<20)return "يجب أن تكون أكبر من 20 سنة";if(user.money<5000)return "تحتاج 5000 ريال للزواج";const names=["سارة","فاطمة","لينا","هند","نور","رامي","أحمد","محمد"];user.partner=names[Math.floor(Math.random()*names.length)];user.married=true;user.money-=5000;user.mood=100;return `تهانينا بالزواج! شريك حياتك: ${user.partner}`;}
function haveChild(user){if(!user.married)return"يجب أن تكون متزوجاً أولاً";if(user.money<2000)return"تحتاج 2000 ريال للإنجاب";user.children++;user.money-=2000;user.mood=clamp(user.mood+15);user.energy=clamp(user.energy-20);return `رزقت بطفل جديد! عدد الأطفال: ${user.children}`;}
function travel(user){if(user.money<3000)return"تحتاج 3000 ريال للسفر";user.money-=3000;user.energy=clamp(user.energy-15);user.mood=100;return "سافرت واستمتعت برحلة رائعة.";}
function doctor(user){if(user.money<500)return"تحتاج 500 ريال للعيادة";user.money-=500;user.health=100;return "ذهبت للطبيب وتعافيت بالكامل.";}
function buyCar(user){if(user.money<30000)return"تحتاج 30000 ريال لشراء سيارة";const cars=["تويوتا","هونداي","بي إم دبليو","مرسيدس"];user.car=cars[Math.floor(Math.random()*cars.length)];user.money-=30000;return `اشتريت سيارة جديدة: ${user.car}`;}
function buyHouse(user){if(user.money<50000)return"تحتاج 50000 ريال لشراء منزل";user.house="فيلا فاخرة";user.money-=50000;return "اشتريت فيلا فاخرة.";}
function fullDay(user){user.energy=clamp(user.energy-20);user.mood=clamp(user.mood+5);user.money+=Math.round(user.salary/30);user.health=clamp(user.health+5);return "قضيت يوماً منتجاً.";}

const activities={نوم:sleep,نام:sleep,طعام:eat,تناول:eat,عمل:work,رياضة:exercise,تمرين:exercise,تعلم:study,دراسة:study,تسوق:shop,بحث:findJob,وظيفة:findJob,زواج:marry,تزوج:marry,إنجاب:haveChild,طفل:haveChild,سفر:travel,عيادة:doctor,طبيب:doctor,سيارة:buyCar,بيت:buyHouse,منزل:buyHouse,يوم:fullDay};

function doActivity(userId, activity){
  const data=loadData();
  const user=data[userId];
  if(!user)return {msg:"سجل أولاً! اكتب: حياة تسجيل",updated:false};
  activity=activity.toLowerCase().trim();
  if(!activities[activity])return {msg:`نشاط غير معروف: ${activity}\nاكتب: حياة قائمة`,updated:false};
  const msg=activities[activity](user);
  user.lastActivity=new Date().toISOString();
  saveData(data);
  return {msg,updated:true};
}

// ------------------- الموديول -------------------
module.exports.config = {
  name: "حياة",
  version: "2.2.0",
  hasPermssion: 0,
  credits: "مطور",
  description: "محاكاة الحياة الواقعية بدون زخرفة وإيموجي",
  commandCategory: "ألعاب",
  usages: "حياة",
  cooldowns: 2
};

module.exports.run = async function({api,event}){
  const {threadID,messageID,senderID,body}=event;
  const command=body.split(" ").slice(1).join(" ").toLowerCase();

  if(command==="تسجيل") return api.sendMessage(registerUser(senderID),threadID,messageID);
  if(command==="قائمة"){ 
    const menu=`
=== قائمة الأوامر ===

عرض الحالة: حياة

الأنشطة:
حياة نوم، حياة طعام، حياة بحث، حياة عمل، حياة رياضة
حياة تعلم، حياة تسوق، حياة سفر، حياة عيادة

العائلة:
حياة زواج، حياة إنجاب

الممتلكات:
حياة سيارة، حياة بيت

نشاط يومي: حياة يوم
===================`;
    return api.sendMessage(menu,threadID,messageID);
  }

  if(command){
    const result=doActivity(senderID,command);
    if(!result.updated)return api.sendMessage(result.msg,threadID,messageID);
    return api.sendMessage(result.msg+"\n\n"+showStatus(senderID),threadID,messageID);
  }

  return api.sendMessage(showStatus(senderID)+"\n\nاكتب: حياة قائمة",threadID,messageID);
};

module.exports.handleReply = async function({api,event}){
  const {threadID,messageID,senderID,body}=event;
  if(body.toLowerCase()==="تسجيل") return api.sendMessage(registerUser(senderID),threadID,messageID);
  const result=doActivity(senderID,body);
  if(!result.updated)return api.sendMessage(result.msg,threadID,messageID);
  return api.sendMessage(result.msg+"\n\n"+showStatus(senderID),threadID,messageID);
};
