const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const util = require("../../util/util.js");
const wxCharts = require("../../util/wxcharts.js");
const config = require("../../config.js").config;

const sheetIdEmptyHistory = config.sheetIds.empty_his;
const sheetIdFakeHistory = config.sheetIds.fake_his;
const sheetIds = {
  history: config.sheetIds.history,
  emptyHist: sheetIdEmptyHistory,
  fakeHist: sheetIdFakeHistory,
};

var sheetIdHistory = config.sheetIds.history;

const mSecondsOneDay = 3600 * 24 * 1000;

// TODO: refactor
// TODO: change the method of computing total time for usage rate
// TODO: auto generate fake data
// TODO: display the method of useage rate
// TODO: introduce of usage
// TODO: in18

const app = getApp();

var last12MonthlineChart = null;

Page({
  onLoad: function () {
    var that = this;

    if (config.showLoading) {
      // start loading animate
      ttClientApi.ttShowLoading("Loading...", true);
    }
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

  onPullDownRefresh: function () {
    console.log("onPullDownRefresh", new Date());

    this.onLoad();
    ttClientApi.ttStopPullDownRefresh();
  },

  data: {
    // history:     array
    // title:       string
    // usageRate:   object
    // title: "建衡技术车位使用率统计",
    spotnames: app.globalData.spotnames,
    plates: app.globalData.plates,
    fakeMode: config.fakeMode,
    ringChartRanges: [3, 7, 30, 365],
  },

  loadSheetMeta: function () {
    var that = this;

    return ttCloudApi
      .sheetMeta(app.globalData.user_access_token)
      .then((res) => {
        var sheetMeta = res.data.data;

        var sheetHistMeta = sheetMeta.sheets.filter((x) => {
          return x.sheetId == sheetIdHistory;
        })[0];
        util.logger("sheetHistMeta", sheetHistMeta);

        // make spots and cars sheet range
        var lastRowSpots = sheetHistMeta.rowCount;

        if (lastRowSpots > 1) {
          var lastColSpots = util.columnCharName(sheetHistMeta.columnCount);
          var rangeHist = `${sheetIdHistory}!A2:${lastColSpots}${lastRowSpots}`;
        } else {
          rangeHist = "";
        }

        that.setData({
          rangeHist: rangeHist,
        });

        app.globalData.hasSheetMeta = true;
        app.globalData.sheetMeta = sheetMeta;

        util.logger("Loaded sheetMeta Success");
      });
  },

  currentHistoryName: function () {
    for (let [key, value] of Object.entries(sheetIds)) {
      if (value == sheetIdHistory) {
        return key;
      }
    }
  },

  loadHistoryData: function () {
    var that = this;

    util.logger("Current sheetIdHistory Name", that.currentHistoryName());
    util.logger("Current sheetIdHistory", sheetIdHistory);
    // get sheetMeta for making data ranges
    that
      .loadSheetMeta()
      .then(() => {
        if (that.data.rangeHist != "") {
          // load history data from cloud
          return ttCloudApi.sheetReadRange(
            app.globalData.user_access_token,
            that.data.rangeHist
          );
        } else {
          var p = new Promise((resolve) => {
            util.logger("The history in cloud is empty");
            return resolve(false);
          });
          return p;
        }
      })
      .then((res) => {
        if (res) {
          that.setData({
            history: that.cleanHistoryData(res.data.data.valueRange.values),
          });
        } else {
          that.setData({
            history: [],
          });
        }

        util.logger("Loaded history from cloud", that.data);

        that.statistics();
        if (config.showLoading) {
          // stop loading animate
          ttClientApi.ttHideToast();
        }
      });
  },

  cleanHistoryData: function (history) {
    // clean the history items, reserve the completed history items only
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

    var startRangeTime = todayDate.getTime() - mSecondsOneDay * daysRange[1];

    var endRangeTime =
      todayDate.getTime() - mSecondsOneDay * (daysRange[0] - 1) - 1000;

    function stayTime(
      inTimeString,
      outTimeString,
      startRangeTime,
      endRangeTime
    ) {
      var inTime = new Date(inTimeString);
      var outTime = new Date(outTimeString);

      inTime =
        inTime.getTime() < startRangeTime ? startRangeTime : inTime.getTime();

      outTime =
        outTime.getTime() > endRangeTime ? endRangeTime : outTime.getTime();

      return outTime - inTime;
    }

    var targetHisList = that.data.history.filter((x) => {
      var d1 = new Date(x[3]);
      var d2 = new Date(x[4]);

      return (
        d1.getTime() <= endRangeTime &&
        d2.getTime() >= startRangeTime &&
        spots.includes(x[1]) &&
        plates.includes(x[2])
      );
    });

    var stayTimeSum = util.sum(
      targetHisList.map((x) =>
        stayTime(x[3], x[4], startRangeTime, endRangeTime)
      )
    );

    if (spots.length == 0) {
      return 0;
    }

    var totalTime =
      (daysRange[1] - daysRange[0] + 1) * mSecondsOneDay * spots.length;

    return {
      ur: stayTimeSum / totalTime,
      stayTimeSum: stayTimeSum,
      totalTime: totalTime,
    };
  },

  statistics: function () {
    var that = this;
    var usageRates = {};
    var nDaysList = that.data.ringChartRanges;

    nDaysList.forEach((nDays) => {
      that.usageRateLastNDays(usageRates, nDays);
    });

    that.usageRateLast12Month(usageRates);

    that.setData({
      usageRates: usageRates,
    });

    nDaysList.forEach((nDays) => {
      var chartId = "last" + nDays.toString();

      that.ringChart(usageRates[chartId].ur, chartId);
    });

    that.lineChart(usageRates["last12Month"], "last12Month");
  },

  usageRateLastNDays: function (usageRates, nDays) {
    var rangeStart = 1;
    var rangeEnd = nDays;
    var timeRange = [rangeStart, rangeEnd];
    var usageRateRes = this.usageRate(
      timeRange,
      this.data.spotnames,
      this.data.plates
    );
    // util.logger(`last ${rangeStart} to last ${rangeEnd}`, ur);

    var chartId = "last" + nDays.toString();
    usageRates[chartId] = usageRateRes;
  },

  ringChart: function (ur, canvasId) {
    var windowWidth = app.globalData.windowWidth;

    var usedPercent = (ur * 100).toFixed(2);
    var unUsedPercent = 100 - usedPercent;

    new wxCharts({
      animation: true,
      canvasId: canvasId,
      type: "ring",
      extra: {
        ringWidth: 25,
        pie: {
          // offsetAngle: -45,
          offsetAngle: -90,
        },
      },
      background: "#f5f6f7",
      title: {
        name: `${usedPercent}%`,
        // blue
        color: "#3370ff",
        fontSize: 18,
      },
      series: [
        {
          name: "Used",
          data: usedPercent * 1,
          // red
          color: "#ea514d",
          stroke: false,
        },
        {
          name: "unUsed",
          // green
          // color: "#34c724",
          color: "#59d549",
          data: unUsedPercent,
          stroke: false,
        },
      ],
      disablePieStroke: true,
      width: Math.floor(windowWidth / 2),
      height: 200,
      // dataLabel: true,
      dataLabel: false,
      legend: false,
      padding: 0,
    });
  },

  usageRateLast12Month: function (usageRates) {
    var last12Month = [];

    function last12MonthRanges() {
      var monthRanges = [];
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
          var yEnd = y;
          var mEnd = m + 1;
        }
        var targetMonthStart = new Date(y, m);
        targetMonthStart = targetMonthStart.getTime();
        var targetMonthEnd = new Date(yEnd, mEnd);
        targetMonthEnd = targetMonthEnd.getTime() - 1000;

        var rangeStart = Math.floor((today - targetMonthEnd) / mSecondsOneDay);
        var rangeEnd = Math.floor((today - targetMonthStart) / mSecondsOneDay);

        var start = new Date(targetMonthStart);
        var range = [rangeStart, rangeEnd];
        var monthString = `${start.getFullYear()}-${start.getMonth() + 1}`;
        var rangeDesc = { range: range, monthString: monthString };

        monthRanges.push(rangeDesc);

        // var end = new Date(targetMonthEnd);
        // console.log(`range last ${i + 1} month`);
        // console.log(range);
        // console.log(util.dateTimeString(start));
        // console.log(util.dateTimeString(end));
      }

      return monthRanges;
    }

    var monthRanges = last12MonthRanges();

    for (var i = 0; i < monthRanges.length; i++) {
      var timeRange = monthRanges[i].range;
      var usageRateRes = this.usageRate(
        timeRange,
        this.data.spotnames,
        this.data.plates
      );
      last12Month.push([monthRanges[i].monthString, usageRateRes]);
      // util.logger(`last ${i + 1} monthString`, monthRanges[i].monthString);
      // util.logger(`last ${i + 1} month`, ur);
    }

    usageRates["last12Month"] = last12Month;
  },

  formatLineChartData: function (datas) {
    var categories = datas.map((x) => x[0]);
    var data = datas.map((x) => x[1].ur);

    return {
      categories: categories,
      data: data,
    };
  },

  touchHandler: function (e) {
    var that = this;
    var last12MonthData = that.data.usageRates.last12Month;
    var currentDataIndex = last12MonthlineChart.getCurrentDataIndex(e);
    console.log(last12MonthlineChart.getCurrentDataIndex(e));
    last12MonthlineChart.showToolTip(e, {
      mutiLineMode: true,
      format: function () {
        // return category + " " + item.name + ":" + item.data;
        // var info = `${category}
        // 使用率: ${item.data}
        // 占用时间: ${last12MonthData[currentDataIndex][1].stayTimeSum}`;
        var info = [
          last12MonthData[currentDataIndex][0],
          `使用率: ${last12MonthData[currentDataIndex][1].ur}`,
          `占用时间: ${last12MonthData[currentDataIndex][1].stayTimeSum}`,
        ];
        console.log(info);
        return info;
      },
    });
  },

  lineChart: function (datas, canvasId) {
    var windowWidth = app.globalData.windowWidth;
    var formatedData = this.formatLineChartData(datas);

    // util.logger("UnformatedData", datas);
    // util.logger("formatedData", formatedData);

    last12MonthlineChart = new wxCharts({
      canvasId: canvasId,
      type: "line",
      categories: formatedData.categories,
      animation: true,
      // background: "transparent",
      series: [
        {
          name: "月份",
          data: formatedData.data,
          format: function (val, name) {
            return (val * 100).toFixed(2) + "%";
          },
          color: "#3370ff",
        },
      ],
      xAxis: {
        disableGrid: true,
        titleFontColor: "#f5f6f7",
        fontColor: "#f5f6f7",
      },
      yAxis: {
        title: "使用率 (%)",
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0,
        titleFontColor: "#f5f6f7",
        fontColor: "#f5f6f7",
        gridColor: "#666666",
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: "curve",
        legendTextColor: "#f5f6f7",
      },
    });
  },

  importFake: function () {
    sheetIdHistory = sheetIdFakeHistory;

    util.logger("Start Import fake data...");
    this.onLoad();
  },

  clearData: function () {
    sheetIdHistory = sheetIdEmptyHistory;

    this.data.history = [];
    util.logger("Clear display data...");
    this.onLoad();
  },

  realData: function () {
    sheetIdHistory = config.sheetIds.history;

    util.logger("Start Real data...");
    this.onLoad();
  },
});

// /* background: #fde2e2; */ /* red light */
// /* background: #faf1d1; */ /* yellow light */
// /* background: #d9f5d6; */ /* green light */
// /* background: #e1eaff; */ /* blue light */
// background: #34c724; /* green */
// background: #ffc60a; /* yellow */
// background: #3370ff; /* blue */
// background: #f5f6f7; /* grey */
// background: #f54a45; /* red */
