const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "ميمز",
  version: "1.0",
  hasPermission: 0,
  credits: "انجالاتي",
  description: "يرسل صورة ميم مضحكة",
  commandCategory: "ترفيه",
};

module.exports.run = async function({ api, event }) {
  const imageUrl = "https://i.ibb.co/6H0Kx9V/funny-meme.jpg"; // ضع رابط صورة ميم هنا
  const path = __dirname + "/temp_meme.jpg";
  
  if (!fs.existsSync(path)) {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(path, response.data);
  }

  api.sendMessage({ body: "😂 ميم عشوائي", attachment: fs.createReadStream(path) }, event.threadID);
};
