const sheetToken = "shtcnTNuG88jU9y2Ldfp9ZgjjUb";
const folderToken = "fldcnQ7Qa7RosZTqvzaHveun0og";

var config = {
  app_id: "cli_9e071c8f77b1d00d",
  app_secret: "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW",
  sheetIds: {
    spots: "5a3db1",
    cars: "pcnBE5",
    history: "2k97WA",
    empty_his: "MxrYrB",
    fake_his: "efOlXV",
    msgbot_whitelist: "AR7UbN",
    chat_ids: "v8hpjv",
  },
  fakeMode: false,
  showLoading: true,
  msgBot: true,
  msgReceiver: {
    chat_id: "oc_1f5ac5bd6569328f5db6819ad207d5bd",
  },
};

var appLink = `https://applink.feishu.cn/client/mini_program/open?appId=${config.app_id}&mode=window`;

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
  appLink: appLink,
};
