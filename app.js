App({
  onLaunch: function (args) {
    console.log("App Launch");
    console.log(args.query);
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
    // hasLogin:            bool
    // hasUserInfo:         bool
    // userInfo:            object
    // hasSheetMeta:        bool
    // sheetMeta:           object
    // user_access_token:   string
    // openid:              string
    hasLogin: false,
  },
});
