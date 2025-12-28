const fs = require("fs-extra");
const path = require("path");

/* ================== CONFIG ================== */
module.exports.config = {
  name: "بنك",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "عمر + تعديل عباس",
  description: "نظام بنك سوداني باللهجة السودانية بدون إيموجيات، مع نصوص العمل القديمة",
  commandCategory: "الاموال",
  usages: "تسجيل | عمل | تنقيب | حول | كشف | قرض | توب",
  cooldowns: 0
};

/* ================== PATH ================== */
const bankingDir = path.join(__dirname, "banking");
const dataPath = path.join(bankingDir, "banking.json");

/* ================== DATA ================== */
function loadData() {
  if (!fs.existsSync(bankingDir)) fs.mkdirSync(bankingDir);
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]");
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getUser(data, id) {
  return data.find(u => u.id === id);
}

/* ================== FUNCTIONS ================== */
function register(id, name) {
  const data = loadData();
  if (getUser(data, id)) return "انت مسجل اصلاً في البنك";

  data.push({
    id,
    name,
    money: 0,
    debt: 0,
    lastMine: 0,
    transfers: []
  });

  saveData(data);
  return `مبروك يا ${name}! اتسجلت في البنك بنجاح. ممكن تبدأ العمل والتنقيب والتحويل.`;
}

function balance(id) {
  const data = loadData();
  const user = getUser(data, id);
  if (!user) return "لازم تسجل اولاً: تسجيل <اسمك>";
  return `رصيدك الحالي: ${user.money}$\nدينك الحالي: ${user.debt}$`;
}

function work(id) {
  const data = loadData();
  const user = getUser(data, id);
  if (!user) return "لازم تسجل اولاً";

  const jobs = [
    "عملت قونة لفنان وحصلت على",
    "عملت في بيت فدادية وبعت 40 جالون عرقي وحصلت على",
    "نمت ليلة في الفراش وبعت القضية وحصلت على",
    "عملت بياع عبيد وحصلت على",
    "عملت في مدرسة وحصلت على",
    "عملت كمبرمج وحصلت على"
  ];

  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const amount = Math.floor(Math.random() * 300) + 50; // مبلغ عشوائي لكل عمل
  user.money += amount;
  saveData(data);

  return `${job} ${amount}$`;
}

function mine(id) {
  const data = loadData();
  const user = getUser(data, id);
  if (!user) return "لازم تسجل اولاً";

  const now = Date.now();
  if (now - user.lastMine < 600000)
    return "التنقيب ممكن كل 10 دقايق";

  const amount = Math.floor(Math.random() * 150) + 50;
  user.money += amount;
  user.lastMine = now;
  saveData(data);

  return `عملت تنقيب وكسبت ${amount}$`;
}

function transfer(fromID, toID, amount) {
  const data = loadData();
  const from = getUser(data, fromID);
  const to = getUser(data, toID);

  if (!from) return "لازم تسجل اولاً";
  if (!to) return "الشخص المستفيد ما مسجل";
  if (from.money < amount) return "رصيدك ما بكفي";

  from.money -= amount;
  to.money += amount;

  from.transfers.push({ type: "out", amount, to: to.name });
  to.transfers.push({ type: "in", amount, from: from.name });

  saveData(data);
  return `حوّلت ${amount}$ لي ${to.name}`;
}

function statement(id) {
  const data = loadData();
  const user = getUser(data, id);
  if (!user) return "لازم تسجل اولاً";
  if (!user.transfers.length) return "ما عندك أي تحويلات";

  let msg = "آخر التحويلات:\n";
  user.transfers.slice(-5).forEach(t => {
    msg += t.type === "out"
      ? `أرسلت ${t.amount}$ لي ${t.to}\n`
      : `استلمت ${t.amount}$ من ${t.from}\n`;
  });

  return msg;
}

function loan(id, amount) {
  const data = loadData();
  const user = getUser(data, id);
  if (!user) return "لازم تسجل اولاً";

  user.money += amount;
  user.debt += amount;
  saveData(data);

  return `اخدت قرض ${amount}$\nدينك الآن: ${user.debt}$`;
}

function top() {
  const data = loadData();
  if (!data.length) return "ما في زول مسجل";

  const sorted = [...data].sort((a,b) => b.money - a.money);
  let msg = "أغنى الناس:\n";
  sorted.slice(0,10).forEach((u,i) => {
    msg += `${i+1}. ${u.name} → ${u.money}$\n`;
  });

  return msg;
}

/* ================== RUN ================== */
module.exports.run = async function({ api, event, args, mentions }) {
  const { senderID, threadID, messageID } = event;
  if (!args[0]) return;

  const cmd = args[0].toLowerCase();
  let reply = null;

  switch (cmd) {
    case "تسجيل":
      reply = register(senderID, args.slice(1).join(" "));
      break;
    case "عرض":
      reply = balance(senderID);
      break;
    case "عمل":
      reply = work(senderID);
      break;
    case "تنقيب":
      reply = mine(senderID);
      break;
    case "حول":
      const targetID = Object.keys(mentions || {})[0];
      const amount = parseInt(args[1]);
      if (!targetID || !amount) reply = "استعمل: حول @الشخص <المبلغ>";
      else reply = transfer(senderID, targetID, amount);
      break;
    case "كشف":
      reply = statement(senderID);
      break;
    case "قرض":
      if (!args[1]) reply = "استعمل: قرض <المبلغ>";
      else reply = loan(senderID, parseInt(args[1]));
      break;
    case "توب":
      reply = top();
      break;
    default:
      return;
  }

  if (reply) api.sendMessage(reply, threadID, messageID);
};
