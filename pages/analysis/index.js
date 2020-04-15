const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const util = require("../../util/util.js");

const config = require("../../config.js").config;

const sheetIdSpots = config.sheetIds.spots;
const sheetIdCars = config.sheetIds.cars;
const sheetIdTest = config.sheetIds.test;
const sheetIdHistory = config.sheetIds.history;

const app = getApp();

// TODO: tab for chart of car move history
// TODO: data chart for using rate of paking spots
// TODO: management tab for adding or delete information of car and spot by admin
// TODO: make full feishu api

Page({
  onLoad: function () {
    var that = this;
    var token = app.globalData.user_access_token;

    if (app.globalData.hasLogin) {
      // var values = [
      //   [300, "", "", "time", "time"],
      //   [301, "p1", "c2", "time", "time"],
      // ];
      // ttCloudApi.sheetAppendData(token, rangeTest, values).then((res) => {
      //   console.log(res.data);
      //   var str = JSON.stringify(res.data, undefined, 4);
      //   console.log(str);
      // });
      // ttCloudApi
      //   .sheetDelLines(token, sheetIdTest, 15, 18)
      //   .then((res) => {
      //     console.log(res.data);
      //     var str = JSON.stringify(res.data, undefined, 4);
      //     console.log(str);
      //   })
      //   .then(() => {
      //     return ttCloudApi.sheetMeta(token);
      //   })
      //   .then((res) => {
      //     console.log(res.data);
      //     var str = JSON.stringify(res.data, undefined, 4);
      //     console.log(str);
      //     that.setData({
      //       sheetMeta: res.data.data.sheets,
      //     });
      //   });

      console.log(app);
    }
  },
  data: {
    title: "建衡技术车位信息统计",
  },
});
