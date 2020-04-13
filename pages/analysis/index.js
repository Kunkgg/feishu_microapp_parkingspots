const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const util = require("../../util/util.js");

const rangeSpots = require("../../config.js").rangeSpots;
const rangeCars = require("../../config.js").rangeCars;
const ranges = [rangeSpots, rangeCars];

const sheetIdHistory = "O8jw1C";
var rangeHistory = `${sheetIdHistory}!A2:E8`;
const sheetIdTest = "m1JeYR";
var rangeTest = `${sheetIdTest}!A2:E3`;

const app = getApp();

// TODO: record car move history
// TODO: Mok fake data
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

      ttCloudApi
        .sheetAppendLines(token, sheetIdTest, 5)
        .then((res) => {
          console.log(res.data);
          var str = JSON.stringify(res.data, undefined, 4);
          console.log(str);
        })
        .then(() => {
          return ttCloudApi.sheetMeta(token);
        })
        .then((res) => {
          console.log(res.data);
          var str = JSON.stringify(res.data, undefined, 4);
          console.log(str);

          that.setData({
            sheetMeta: res.data.data.sheets,
          });
        });
    }
  },
  data: {
    title: "建衡技术车位信息统计",
  },
});
