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
    hasLogin: false,
    openid: null,
  },
});
