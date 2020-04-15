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
    // hasLogin
    // hasUserInfo
    // userInfo
    // hasSheetMeta
    // sheetMeta
    // user_access_token
    // openid
    hasLogin: false,
  },
});
