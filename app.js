App({
  onLaunch: function (args) {
    console.log("App Launch");
    console.log(args.query);
  },
  onShow: function (args) {
    console.log("App Show");
    console.log(args);
    console.log("-------------");
    // check the update of mini program
    let updateManager = tt.getUpdateManager();
    updateManager.onCheckForUpdate((result) => {
      console.log("is there any update?：" + result.hasUpdate);
    });
    updateManager.onUpdateReady((result) => {
      tt.showModal({
        title: "Update infomation",
        content: "new version is ready, do you want to restart app?",
        success: (res) => {
          console.log(JSON.stringify(res));
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });
    updateManager.onUpdateFailed((result) => {
      console.log("mini program update failed");
    });
  },
  onHide: function () {
    console.log("App Hide");
  },
  globalData: {
    hasLogin: false,
    openid: null,
  },
});

// console.log(`code: ${res.data.code}`);
// console.log(`msg: ${res.data.msg}`);
// console.log(`data: ${JSON.stringify(res.data.data)}`);
// console.log(`access_token: ${res.data.data.access_token}`);
// console.log("");
// return ttCloudApi.rootMeta(res.data.data.access_token);
// return ttCloudApi.fileNew(res.data.data.access_token, "new", "doc");
// var rangeSpots = "5a3db1!A2:E3";
// var rangeCars = "pcnBE5!C1:C4";
// var ranges = [rangeSpots, rangeCars];
// var values1 = [
//   ["P1", "D-101", "", "", ""],
//   ["P2", "D-100", "", "", ""],
// ];
// var values2 = [["cc1"], ["cc2"], ["cc3"], ["cc4"]];

// var valuesList = [values1, values2];
// ttCloudApi
//   .sheetWriteRanges(res.data.data.access_token, ranges, valuesList)
//   .then((res) => {
//     console.log(`data: ${JSON.stringify(res.data)}`);
//     console.log(`code: ${res.data.code}`);
//   });
// ttCloudApi
//   .sheetWriteRange(res.data.data.access_token, rangeSpots, values1)
//   .then((res) => {
//     console.log(`data: ${JSON.stringify(res.data)}`);
//     console.log(`code: ${res.data.code}`);
//   });
// return ttCloudApi.fileDel(
//   res.data.data.access_token,
//   srcFileToken,
//   "sheet",
//   "copyNew"
// );
// return ttCloudApi.sheetMeta(res.data.data.access_token);
// return dwRequest.ttGetUserInfo();
// .then((res) => {
//   // console.log(`sheet data: ${JSON.stringify(res.data)}`);
//   // console.log(`sheet code: ${res.data.code}`);
//   // console.log(`root data: ${JSON.stringify(res.data)}`);
//   // console.log(`root code: ${res.data.code}`);
//   console.log(`del1 data: ${JSON.stringify(res[0].data)}`);
//   console.log(`del1 code: ${res[0].data.code}`);
//   console.log(`del2 data: ${JSON.stringify(res[1].data)}`);
//   console.log(`del2 code: ${res[1].data.code}`);
//   // console.log(`User: ${res.rawData}`);
// });
