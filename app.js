const util = require("./util/util.js");

App({
  onLaunch: function (args) {
    console.log("App Launch");
    console.log(args.query);
    this.windowWidth();
  },
  onShow: function (args) {
    console.log("App Show");
    console.log(args);
    console.log("-------------");
  },
  onHide: function () {
    console.log("App Hide");
  },
  globalData: {
    // hasLogin:                bool
    // hasUserInfo:             bool
    // userInfo:                object
    // hasSheetMeta:            bool
    // sheetMeta:               object
    // user_access_token:       string
    // open_id:                 string
    // chatIds:                 2d-array
    // msgBotWhiteList          2d-array
    // windowWidth:             number
    hasLogin: false,
  },
  windowWidth: function () {
    if (this.globalData.windowWidth) {
      util.logger("Already had windowWidth");
    } else {
      try {
        var res = tt.getSystemInfoSync();
        var windowWidth = res.windowWidth;
        this.globalData.windowWidth = windowWidth;
        util.logger("windowWidth", windowWidth);
      } catch (e) {
        var windowWidth = 320;
        this.globalData.windowWidth = windowWidth;
        util.logger(
          "getSystemInfoSync failed!, using a backup value",
          windowWidth
        );
      }
    }
  },
});
