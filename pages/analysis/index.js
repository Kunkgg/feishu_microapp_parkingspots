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
    // history: array
    // title:   string
    // usageRate: object
    title: "建衡技术车位信息统计",
    spotnames: ["D-100", "D-101"],
    plates: ["陕AF19967", "陕A5P0J7", "京MC7816"],
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
        // load history data from cloud
        return ttCloudApi.sheetReadRange(
          app.globalData.user_access_token,
          that.data.range
        );
      })
      .then((res) => {
        that.setData({
          history: that.cleanHistoryData(res.data.data.valueRange.values),
        });

        util.logger("Loaded history from cloud", that.data);

        that.statistics();
        // stop loading animate
        // ttClientApi.ttHideToast();
      });
  },

  cleanHistoryData: function (history) {
    return history.filter((x) => x[3] && x[4]);
  },

  usageRate: function (daysRange, spots, plates) {
    // days: 2 elements number array, [1, 7], from last day to last seven day
    // days: if the array only has two same element and it is a number, mean the
    // usage rate of the specific day
    // 1 = yesterday, 2 = the day before yesterday, and so on
    // spots: string array, [ spotname1, spotname2, ...]
    // plates: string array, [ carplate1, carplate2, ...]
    var that = this;

    var todayDateString = util.dateString();
    var todayDate = new Date(todayDateString);

    var startRangeTime = todayDate.getTime() - 3600 * 24 * 1000 * daysRange[1];

    var endRangeTime =
      todayDate.getTime() - 3600 * 24 * 1000 * (daysRange[0] - 1) - 1000;

    function stayTime(inTimeString, outTimeString, endRangeTime) {
      var inTime = new Date(inTimeString);
      var outTime = new Date(outTimeString);

      inTime = inTime.getTime();
      if (outTime.getTime() > endRangeTime) {
        outTime = endRangeTime;
      } else {
        outTime = outTime.getTime();
      }

      return outTime - inTime;
    }

    var targetHisList = that.data.history.filter((x) => {
      var d = new Date(x[3]);

      return (
        d.getTime() >= startRangeTime &&
        d.getTime() <= endRangeTime &&
        spots.includes(x[1]) &&
        plates.includes(x[2])
      );
    });

    var stayTimeSum = Math.floor(
      util.sum(targetHisList.map((x) => stayTime(x[3], x[4], endRangeTime))) /
        1000
    );

    var totalTime =
      (daysRange[1] - daysRange[0] + 1) * 24 * 3600 * spots.length;

    return stayTimeSum / totalTime;
  },

  statistics: function () {
    var usageRate = {};

    this.usageRateLastDay(usageRate);
    this.usageRateLastWeek(usageRate);
    this.usageRateLastMonth(usageRate);
    this.usageRateLastYear(usageRate);
    this.usageRateLast12Month(usageRate);

    this.setData({
      usageRate: usageRate,
    });
  },

  usageRateLastDay: function (usageRate) {
    var rangeStart = 1;
    var rangeEnd = 1;
    var timeRange = [rangeStart, rangeEnd];
    var ur = this.usageRate(timeRange, this.data.spotnames, this.data.plates);
    util.logger(`last ${rangeStart} to last ${rangeEnd}`, ur);
    usageRate["lastDay"] = ur;
  },
  usageRateLastWeek: function (usageRate) {
    var rangeStart = 1;
    var rangeEnd = 7;
    var timeRange = [rangeStart, rangeEnd];
    var ur = this.usageRate(timeRange, this.data.spotnames, this.data.plates);
    util.logger(`last ${rangeStart} to last ${rangeEnd}`, ur);
    usageRate["lastWeek"] = ur;
  },
  usageRateLastMonth: function (usageRate) {
    var rangeStart = 1;
    var rangeEnd = 30;
    var timeRange = [rangeStart, rangeEnd];
    var ur = this.usageRate(timeRange, this.data.spotnames, this.data.plates);
    util.logger(`last ${rangeStart} to last ${rangeEnd}`, ur);
    usageRate["lastMonth"] = ur;
  },
  usageRateLastYear: function (usageRate) {
    var rangeStart = 1;
    var rangeEnd = 365;
    var timeRange = [rangeStart, rangeEnd];
    var ur = this.usageRate(timeRange, this.data.spotnames, this.data.plates);
    util.logger(`last ${rangeStart} to last ${rangeEnd}`, ur);
    usageRate["lastYear"] = ur;
  },

  usageRateLast12Month: function (usageRate) {
    var monthRanges = [];
    var last12Month = [];

    for (var i = 0; i < 12; i++) {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today = today.getTime();
      var targetMonthDistance = i + 1;
      // notice Date().getMonth() start from 0
      // realmonth = Date().getMonth() + 1

      if (now.getMonth() < targetMonthDistance) {
        var y = now.getFullYear() - 1;
        var m = now.getMonth() - targetMonthDistance + 12;
        var mEnd = m + 1;
        var yEnd = y;
        if (mEnd > 11) {
          mEnd = 0;
          yEnd = y + 1;
        }
      } else {
        var y = now.getFullYear();
        var m = now.getMonth() - targetMonthDistance;
        var yEnd = y + 1;
        var mEnd = m + 1;
      }
      var targetMonthStart = new Date(y, m);
      targetMonthStart = targetMonthStart.getTime();
      var targetMonthEnd = new Date(yEnd, mEnd);
      targetMonthEnd = targetMonthEnd.getTime() - 1000;

      var rangeStart = Math.floor(
        (today - targetMonthEnd) / (3600 * 24 * 1000)
      );
      var rangeEnd = Math.floor(
        (today - targetMonthStart) / (3600 * 24 * 1000)
      );

      var range = [rangeStart, rangeEnd];
      monthRanges.push(range);
      // console.log(`range last ${i + 1} month`);
      // console.log(range);
      // var s = new Date(targetMonthStart);
      // var e = new Date(targetMonthEnd);
      // console.log(util.dateTimeString(s));
      // console.log(util.dateTimeString(e));
    }

    for (var i = 0; i < monthRanges.length; i++) {
      var timeRange = monthRanges[i];
      var ur = this.usageRate(timeRange, this.data.spotnames, this.data.plates);
      last12Month.push(ur);
      util.logger(`last ${i + 1} month`, ur);
    }

    usageRate[last12Month] = last12Month;
  },
});
