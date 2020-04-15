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

    // start loading animate
    // ttClientApi.ttShowLoading("Loading...", true);
    if (this.data.hasLogin) {
      util.logger("Already login");

      that.loadHistoryData();
    } else {
      ttClientApi.login(app).then(() => {
        app.globalData.hasLogin = true;
        that.setData({
          hasLogin: true,
        });
        util.logger("Login Success");

        that.loadHistoryData();
      });
    }
  },

  data: {
    title: "建衡技术车位信息统计",
  },

  loadSheetMeta: function () {
    var that = this;

    return ttCloudApi
      .sheetMeta(app.globalData.user_access_token)
      .then((res) => {
        var sheetMeta = res.data.data;

        // make spots and cars sheet range
        var lastColSpots = util.columnCharName(sheetMeta.sheets[2].columnCount);
        var lastRowSpots = sheetMeta.sheets[2].rowCount;
        var rangeHist = `${sheetIdHistory}!A2:${lastColSpots}${lastRowSpots}`;

        that.setData({
          range: rangeHist,
        });

        app.globalData.hasSheetMeta = true;
        app.globalData.sheetMeta = sheetMeta;

        util.logger("Loaded sheetMeta Success");
      });
  },

  loadHistoryData: function () {
    var that = this;

    // get sheetMeta for making data ranges
    that
      .loadSheetMeta()
      .then(() => {
        // load data from cloud
        return ttCloudApi.sheetReadRange(
          app.globalData.user_access_token,
          that.data.range
        );
      })
      .then((res) => {
        that.setData({
          history: res.data.data.valueRange.values,
        });
        util.logger("Loaded history from cloud", that.data);
        // stop loading animate
        // ttClientApi.ttHideToast();
      });
  },
});
