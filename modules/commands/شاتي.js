module.exports.config = {
  name: "شاتي",
  version: "1.0",
  hasPermission: 0,
  credits: "انجالاتي",
  description: "الدردشة مع البوت بالذكاء الاصطناعي",
  commandCategory: "ذكاء اصطناعي",
  usages: "<سؤالك هنا>"
};

const axios = require("axios");

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) return api.sendMessage("اكتب سؤالك لأجيبك بالذكاء الاصطناعي 🤖", event.threadID);

  const prompt = args.join(" ");
  
  // مثال باستخدام واجهة OpenAI API
  const OPENAI_API_KEY = "ضع_API_KEY هنا";

  try {
    const response = await axios.post("https://api.openai.com/v1/completions", {
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150
    }, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const answer = response.data.choices[0].text.trim();
    api.sendMessage(answer, event.threadID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ حدث خطأ أثناء التواصل مع AI.", event.threadID);
  }
};
