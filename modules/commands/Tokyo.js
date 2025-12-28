const fs = require("fs");
const { OpenAI } = require("openai");

// 🌐 قاعدة بيانات محلية لحفظ محادثات المستخدمين
const dbPath = "./chatDB.json";
let DB = { users: {} };
if (fs.existsSync(dbPath)) DB = JSON.parse(fs.readFileSync(dbPath));

// 🔑 إعداد OpenAI
const client = new OpenAI({
  apiKey: "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"
});

// 💾 حفظ رسالة في قاعدة البيانات
function addMessage(senderID, role, content) {
  if (!DB.users[senderID]) DB.users[senderID] = [];
  DB.users[senderID].push({ role, content });

  // لتقليل حجم الملف، نخلي آخر 20 رسالة فقط
  if (DB.users[senderID].length > 20) DB.users[senderID] = DB.users[senderID].slice(-20);

  fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

// 📨 التعامل مع رسالة المستخدم
async function handleMessage(senderID, message, api, threadID) {
  addMessage(senderID, "user", message);

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
إنت بوت دردشة سوداني.
رد دائمًا باللهجة السودانية.
كلامك يكون بسيط، طبيعي، وما رسمي.
استخدم تعبيرات سودانية زي:
(والله، اها، زول، تمام، كدي، ما مشكلة، خلاص، شديد، ساي).
ما تستخدم فصحى.
`
        },
        ...(DB.users[senderID] || [])
      ],
      max_tokens: 180
    });

    const reply = completion.choices[0].message.content;
    addMessage(senderID, "assistant", reply);

    // إرسال الرد للمستخدم
    api.sendMessage(reply, threadID);
  } catch (err) {
    console.error("خطأ في الرد:", err);
    api.sendMessage("آسف يا زول، حصلت مشكلة في الرد.", threadID);
  }
}

// 🌟 مثال: كيف تستقبل رسالة
module.exports = async function({ api, event }) {
  const { senderID, body, threadID } = event;
  if (!body) return;

  await handleMessage(senderID, body, api, threadID);
};
