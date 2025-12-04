const axios = require("axios");

module.exports.config = {
  name: "كايروس",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "GPT",
  description: "ذكاء كايروس – مساعد غامض وقوي",
  commandCategory: "ذكاء اصطناعي",
  usages: "[رسالتك]",
  cooldowns: 3,
};

module.exports.run = async ({ api, event, args }) => {
  const msg = args.join(" ");
  if (!msg) return api.sendMessage("⚠️ | تحدث، ودع كايروس يجيبك.", event.threadID, event.messageID);

  try {
    // ✅ المفتاح تم دمجه هنا
    const apiKey = "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";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "أنت كايروس، شخصية قوية وهادئة وغامضة." },
          { role: "user", content: msg }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    api.sendMessage(response.data.choices[0].message.content, event.threadID, event.messageID);

  } catch (err) {
    console.log(err);
    api.sendMessage("⚠️ حدث خطأ في نظام كايروس.", event.threadID, event.messageID);
  }
};
