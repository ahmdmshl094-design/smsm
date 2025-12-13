module.exports.config = {
  name: "انشئ",
  version: "1.0",
  hasPermission: 0,
  credits: "انجالاتي",
  description: "إنشاء صورة بواسطة الذكاء الاصطناعي",
  commandCategory: "ذكاء اصطناعي",
  usages: "<اكتب وصف للصورة>"
};

const axios = require("axios");
const fs = require("fs");

module.exports.run = async function({ api, event, args }) {
  if (!args[0]) return api.sendMessage("اكتب وصف الصورة التي تريد إنشاؤها 🎨", event.threadID);

  const prompt = args.join(" ");
  const OPENAI_API_KEY = "ضع_API_KEY هنا";
  const path = __dirname + "/ai_image.png";

  try {
    const response = await axios.post("https://api.openai.com/v1/images/generations", {
      prompt: prompt,
      n: 1,
      size: "512x512"
    }, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const imageUrl = response.data.data[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(path, imageResponse.data);

    api.sendMessage({ body: "🖼️ صورة AI تم إنشاؤها", attachment: fs.createReadStream(path) }, event.threadID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ حدث خطأ أثناء إنشاء الصورة.", event.threadID);
  }
};
