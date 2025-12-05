const fs = require("fs");
const path = __dirname + "/learned.json";

// إنشاء قاعدة البيانات إذا غير موجودة
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

let learned = JSON.parse(fs.readFileSync(path));

module.exports.config = {
  name: "تعلم",
  version: "1.1.0",
  credits: "GPT + محمد إدريس",
  description: "نظام تعليم الردود",
  commandCategory: "النظام",
  usages: "تعلم الكلمة => الرد",
};

// حفظ التعديلات
function save() {
  fs.writeFileSync(path, JSON.stringify(learned, null, 2));
}

// ID المطور الوحيد
const devID = "61570782968645";

module.exports.run = function ({ api, event, args }) {
  const sender = event.senderID;
  const text = args.join(" ");

  // لو كتب فقط "تعلم"
  if (args.length === 0)
    return api.sendMessage(
      "استخدم:\nتعلم الكلمة => الرد\n\nأوامر المطور فقط:\nتعلم تعديل الكلمة => الرد الجديد\nتعلم حذف الكلمة\nتعلم قائمة",
      event.threadID,
      event.messageID
    );

  // عرض القائمة - للمطور فقط
  if (text === "قائمة") {
    if (sender !== devID)
      return api.sendMessage("❌ هذا الأمر للمطور فقط.", event.threadID);

    if (Object.keys(learned).length === 0)
      return api.sendMessage("مافي كلمات متعلمة.", event.threadID);

    let msg = "📚 قائمة الكلمات المتعلمة:\n\n";
    let i = 1;
    for (let word in learned) {
      msg += `${i}. ${word} => ${learned[word]}\n`;
      i++;
    }
    return api.sendMessage(msg, event.threadID);
  }

  // حذف - فقط المطور
  if (text.startsWith("حذف ")) {
    if (sender !== devID)
      return api.sendMessage("❌ الحذف متاح للمطور فقط.", event.threadID);

    const word = text.replace("حذف ", "").trim();

    if (!learned[word])
      return api.sendMessage("❌ الكلمة غير موجودة.", event.threadID);

    delete learned[word];
    save();
    return api.sendMessage(`✔ تم حذف "${word}"`, event.threadID);
  }

  // تعديل - فقط المطور
  if (text.startsWith("تعديل ")) {
    if (sender !== devID)
      return api.sendMessage("❌ التعديل للمطور فقط.", event.threadID);

    const parts = text.replace("تعديل ", "").split("=>");
    if (parts.length !== 2)
      return api.sendMessage("❌ الصيغة:\nتعديل الكلمة => الرد الجديد", event.threadID);

    const word = parts[0].trim();
    const reply = parts[1].trim();

    if (!learned[word])
      return api.sendMessage("❌ الكلمة غير موجودة.", event.threadID);

    learned[word] = reply;
    save();
    return api.sendMessage(`✔ تم تعديل "${word}"`, event.threadID);
  }

  // التعليم الطبيعي (للجميع)
  const parts = text.split("=>");
  if (parts.length !== 2)
    return api.sendMessage("❌ الصيغة:\nتعلم الكلمة => الرد", event.threadID);

  const word = parts[0].trim();
  const reply = parts[1].trim();

  learned[word] = reply;
  save();

  return api.sendMessage(`✔ تم تعلم الكلمة "${word}"`, event.threadID);
};

// الرد على الرسائل: كايروس الكلمة
module.exports.handleEvent = function ({ api, event }) {
  const msg = event.body;
  if (!msg) return;

  if (msg.startsWith("كايروس ")) {
    const word = msg.replace("كايروس ", "").trim();
    if (learned[word]) {
      return api.sendMessage(learned[word], event.threadID, event.messageID);
    }
  }
};
