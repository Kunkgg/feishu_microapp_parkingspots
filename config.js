const sheetToken = "shtcniUwsF4rGBfJTenE7JuNmWg";
const folderToken = "fldcnQ7Qa7RosZTqvzaHveun0og";

var config = {
  app_id: "cli_9e071c8f77b1d00d",
  app_secret: "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW",
  fakeMode: true,
  sheetIds: {
    spots: "5a3db1",
    cars: "pcnBE5",
    history: "O8jw1C",
    empty_his: "m1JeYR",
    fake_his: "fyfzjB",
  },
  showLoading: true,
  msgBot: true,
  msgReceiver: {
  open_id: "ou_5f8204530f3c01385c20a4babfc09936",
  },
};

var appLink = `https://applink.feishu.cn/client/mini_program/open?appId=${config.app_id}&mode=window`;

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
  appLink: appLink,
};
