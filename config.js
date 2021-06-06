// replace ids, secrets, keys before run code.

const sheetToken = "xxxxxxxxxxxxxxxxxxxxxxxxxxx";
const folderToken = "xxxxxxxxxxxxxxxxxxxxxxxxxxx";

var config = {
  app_id: "xxxxxxxxxxxxxxxxxxxx",
  app_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  sheetIds: {
    spots: "xxxxxx",
    cars: "xxxxxx",
    history: "xxxxxx",
    empty_his: "xxxxxx",
    fake_his: "xxxxxx",
    msgbot_whitelist: "xxxxxx",
    chat_ids: "xxxxxx",
  },
  fakeMode: false,
  showLoading: true,
  msgBot: true,
  msgReceiver: {
    chat_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
};

var appLink = `https://applink.feishu.cn/client/mini_program/open?appId=${config.app_id}&mode=window`;

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
  appLink: appLink,
};
