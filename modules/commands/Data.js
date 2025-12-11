module.exports.config = {
  name: "بيانات",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "عمر + تنسيق محمد إدريس",
  description: "عرض جميع معلومات البوت",
  commandCategory: "خدمات",
  cooldowns: 5,
  dependencies: {
    "pidusage": ""
  }
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n = n / 1024;
  return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.run = async ({ api, event }) => {

  const time = process.uptime(),
    hours = Math.floor(time / (60 * 60)),
    minutes = Math.floor((time % (60 * 60)) / 60),
    seconds = Math.floor(time % 60);

  const pidusage = await global.nodemodule["pidusage"](process.pid);

  const timeStart = Date.now();

  // ===== ستايل 𝙑 =====
  const msg =
`╭───〔 𝙑 𝘽𝙤𝙩 𝘿𝙖𝙩𝙖 〕───
│
│ 𝙑 Uptime: ${hours}h : ${minutes}m : ${seconds}s
│
│ 𝙑 Users: ${global.data.allUserID.length}
│ 𝙑 Groups: ${global.data.allThreadID.length}
│
│ 𝙑 CPU: ${pidusage.cpu.toFixed(1)}%
│ 𝙑 RAM: ${byte2mb(pidusage.memory)}
│
│ 𝙑 Ping: ${Date.now() - timeStart}ms
│
╰───────────────────────`;

  return api.sendMessage("", event.threadID, () =>
    api.sendMessage(msg, event.threadID, event.messageID)
  );

};
