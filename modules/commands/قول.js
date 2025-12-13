const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");

// إعداد العميل (تأكد من إعداد Google Cloud TTS)
const client = new textToSpeech.TextToSpeechClient();

module.exports.config = {
  name: "قول",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "انجالاتي",
  description: "البوت يحول الكلام لصوت ويرسله",
  commandCategory: "ترفيه",
  usages: "قول [الكلام]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, body } = event;

  // نحذف كلمة "قول" من بداية الرسالة تلقائياً
  const text = body.replace(/^قول\s+/i, "").trim();
  if(!text) return api.sendMessage("❌ أكتب الكلام اللي عايز البوت يقوله.", threadID);

  // إعدادات TTS
  const request = {
    input: { text: text },
    voice: { languageCode: "ar-XA", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3" }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const filePath = path.join(__dirname, "cache", `say_${Date.now()}.mp3`);
    fs.writeFileSync(filePath, response.audioContent, "binary");

    api.sendMessage({ attachment: fs.createReadStream(filePath) }, threadID, () => {
      fs.unlinkSync(filePath); // حذف الملف بعد الإرسال
    }, messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ حصل خطأ أثناء تحويل الكلام لصوت.", threadID);
  }
};
