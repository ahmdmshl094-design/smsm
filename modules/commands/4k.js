const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

module.exports.config = {
    name: "4k",
    Auth: 0,
    Owner: "Hamody San",
    Info: "تحسين جودة الصورة إلى 4K",
    Class: "الأدوات",
    aliases: ["upscale", "4x", "تحسين", "جودة"]
};

module.exports.onPick = async ({ event, sh, args }) => {
    const { messageReply } = event;

    try {
        let imageUrl;

        // التحقق من وجود صورة
        if (messageReply && messageReply.attachments?.[0]) {
            if (messageReply.attachments[0].type === "photo") {
                imageUrl = messageReply.attachments[0].url;
            } else {
                return sh.reply("❌ يرجى الرد على صورة فقط!");
            }
        } else if (args[0]) {
            imageUrl = args.join(" ").trim();
        } else {
            return sh.reply("📸 استخدام الأمر:\n\n1️⃣ رد على صورة بالأمر: 4k\n2️⃣ أو اكتب: 4k [رابط الصورة]");
        }

        sh.react("⏳");

        // تحميل الصورة
        const { data: imageData } = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(imageData);

        // تحسين الصورة
        const upscaledImage = await upscaleImage(imageBuffer);

        // حفظ الصورة مؤقتًا
        const outputPath = `./cache/upscaled_${Date.now()}.png`;
        fs.writeFileSync(outputPath, upscaledImage);

        sh.react("✅");

        // إرسال الصورة المحسنة
        return sh.reply({
            body: "✨ تم تحسين جودة الصورة بنجاح إلى 4K!",
            attachment: fs.createReadStream(outputPath)
        }, () => {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("Error in 4k command:", error);
        sh.react("❌");
        return sh.reply(`❌ حدث خطأ أثناء تحسين الصورة!\n\n📝 التفاصيل: ${error.message}`);
    }
};

// ═══════════════════════════════════════════════════
// دالة تحسين الصورة
// ═══════════════════════════════════════════════════
async function upscaleImage(imageData, scale = 4) {
    const taskId = "35mgpvmkm2r8ytqchyj0y1rxgpp74f78hAccdrc2019n4rc8d2zxs7nbh69z3pb6g97bc0007rwlbcj3hfn11gzmf83h1gjnfdj0cd738ykfAgr6r479pz09n30fzpg0tc33vkvq6zhj11fbk5mjsrqAq90kn0hxmyAmys3yf0dcz5flrqxq";

    const { data: html } = await axios.get("https://www.iloveimg.com/upscale-image");
    const tokenMatch = html.match(/"toolText":"Upscale","token":"([^"]+)"/);

    if (!tokenMatch) throw new Error("فشل في الحصول على التوكن من الموقع");

    const token = tokenMatch[1];
    const authorization = `Bearer ${token}`;

    const uploadData = new FormData();
    const fileName = `image_${Date.now()}.jpg`;

    uploadData.append("name", fileName);
    uploadData.append("chunk", "0");
    uploadData.append("chunks", "1");
    uploadData.append("task", taskId);
    uploadData.append("preview", "1");
    uploadData.append("file", imageData, { filename: fileName });

    const uploadResponse = await axios.post("https://api12g.iloveimg.com/v1/upload", uploadData, {
        headers: { ...uploadData.getHeaders(), authorization },
    });

    const serverFilename = uploadResponse.data.server_filename;

    const upscaleData = new FormData();
    upscaleData.append("task", taskId);
    upscaleData.append("server_filename", serverFilename);
    upscaleData.append("scale", scale.toString());

    const upscaleResponse = await axios.post("https://api12g.iloveimg.com/v1/upscale", upscaleData, {
        headers: { ...upscaleData.getHeaders(), authorization },
        responseType: "arraybuffer",
    });

    return Buffer.from(upscaleResponse.data);
}