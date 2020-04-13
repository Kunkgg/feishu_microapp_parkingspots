const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const util = require("../../util/util.js");

const config = require("../../config.js").config;

const sheetIdSpots = config.sheetIds.spots;
const sheetIdCars = config.sheetIds.cars;
const sheetIdTest = config.sheetIds.test;
const sheetIdHistory = config.sheetIds.history;

console.log("-----------------");
console.log("Loaded config ...");
console.log(sheetIdSpots);
console.log(sheetIdCars);
console.log(sheetIdTest);
console.log(sheetIdHistory);
console.log("-----------------");

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

    // start loading animate
    ttClientApi.ttShowLoading("Loading...", true);
    if (this.data.hasLogin) {
      console.log("Already login");

      that.loadUserInfo();
      that.loadCloudData();
    } else {
      ttClientApi.login(app).then(() => {
        that.setData({
          hasLogin: true,
        });
        app.globalData.hasLogin = true;
        console.log("Login Success");

        that.loadUserInfo();
        that.loadCloudData();
      });
    }
  },
  data: {
    // spots: [[id, name, status, lastEditor, lastEditorAvatar, mtime],...]
    // cars: [[id, plate],...]
    // hasLogin
    // userInfo
    // hasSheetMeta
  },

  loadUserInfo: function () {
    var that = this;

    if (this.data.hasUserInfo) {
      console.log("Already loaded userInfo");
    } else {
      // get userInfo
      ttClientApi.ttGetUserInfo().then((res) => {
        that.setData({
          hasUserInfo: true,
          userInfo: res.userInfo,
        });
        app.globalData.hasUserInfo = true;
        app.globalData.userInfo = res.userInfo;
        console.log("Loaded userInfo Success");
      });
    }
  },

  loadSheetMeta: function () {
    var that = this;

    if (!that.hasSheetMeta) {
      return ttCloudApi
        .sheetMeta(app.globalData.user_access_token)
        .then((res) => {
          var sheetMeta = res.data.data;

          // make spots and cars sheet range
          var lastColSpots = util.columnCharName(
            sheetMeta.sheets[0].columnCount
          );
          var lastRowSpots = sheetMeta.sheets[0].rowCount;
          var lastColCars = util.columnCharName(
            sheetMeta.sheets[1].columnCount
          );
          var lastRowCars = sheetMeta.sheets[1].rowCount;
          var rangeSpots = `${sheetIdSpots}!A2:${lastColSpots}${lastRowSpots}`;
          var rangeCars = `${sheetIdCars}!A2:${lastColCars}${lastRowCars}`;
          var ranges = [rangeSpots, rangeCars];

          that.setData({
            hasSheetMeta: true,
            sheetMeta: sheetMeta,
            ranges: ranges,
          });

          app.globalData.hasSheetMeta = true;
          app.globalData.sheetMeta = sheetMeta;
          console.log("Loaded sheetMeta Success");
        });
    } else {
      var p = new Promise(function (resolve) {
        resolve(console.log("Already had sheetMeta"));
      });
      return p;
    }
  },

  loadCloudData: function () {
    var that = this;

    // get sheetMeta for making data ranges
    that
      .loadSheetMeta()
      .then(() => {
        // load data from cloud
        return ttCloudApi.sheetReadRanges(
          app.globalData.user_access_token,
          that.data.ranges
        );
      })
      .then((res) => {
        // extra plates from cars sheet
        var plates = [];
        res.data.data.valueRanges[1].values.forEach((car) => {
          plates.push(car[1]);
        });

        that.setData({
          spots: res.data.data.valueRanges[0].values,
          cars: res.data.data.valueRanges[1].values,
          plates: plates,
        });
        console.log("-----------------");
        console.log("Loaded data from cloud:");
        console.log(that.data);
        console.log("-----------------");
        // stop loading animate
        ttClientApi.ttHideToast();
      });
  },

  updateCloudSpots: function () {
    var that = this;

    // write current spots to cloud
    ttCloudApi
      .sheetWriteRange(
        app.globalData.user_access_token,
        that.data.ranges[0],
        that.data.spots
      )
      .then(() => {
        console.log("-----------------");
        console.log("Update spots success:");
        console.log(that.data.spots);
        console.log("-----------------");
        // reload page after update spots
        that.onLoad();
      });
  },

  updateSpotUserInfo: function (spot) {
    spot[3] = this.data.userInfo.nickName;
    spot[4] = this.data.userInfo.avatarUrl;
  },

  updateSpotStatus: function (spot, status) {
    spot[2] = status;
  },

  updateSpotDateTime: function (spot) {
    var dateTime = util.nowDateTime();

    spot[5] = dateTime;
  },
  updateSpotAll: function (spot, status) {
    this.updateSpotStatus(spot, status);
    this.updateSpotUserInfo(spot);
    this.updateSpotDateTime(spot);
  },

  updateSpots: function (targetIndex, status) {
    var spots = this.data.spots;
    this.updateSpotAll(spots[targetIndex], status);

    this.setData({
      spots: spots,
    });
  },

  unUsedPlates: function () {
    var usedPlates = this.data.spots.map((spot) => {
      return spot[2];
    });

    return this.data.plates.filter((plate) => {
      return !usedPlates.includes(plate);
    });
  },

  carOut: function (targetIndex) {
    var that = this;
    var spots = that.data.spots;
    var spot = spots[targetIndex];
    var prompt_title = "确认提示";
    var prompt_content = `将牌照 ${spot[2]} 车辆移出车位 ${spot[1]} ?`;
    console.log("Here is carOut...");
    console.log(`targetIndex: ${targetIndex}`);

    ttClientApi
      .ttShowModal(prompt_title, prompt_content)
      .then(({ confirm, cancel }) => {
        if (confirm) {
          that.updateSpots(targetIndex, "");

          console.log("carOut successed");
        }
        if (cancel) {
          console.log("carOut canceled");
        }
      })
      .then(that.updateCloudSpots);
  },

  carIn: function (targetIndex) {
    var that = this;
    var unUsedPlates = this.unUsedPlates();
    console.log("Here is carIn...");
    console.log(`targetIndex: ${targetIndex}`);

    ttClientApi
      .ttShowActionSheet(unUsedPlates)
      .then((res) => {
        that.updateSpots(targetIndex, unUsedPlates[res.tapIndex]);
      })
      .then(that.updateCloudSpots);
  },

  carMove: function (e) {
    var that = this;
    var targetIndex = e.currentTarget.id[1] - 1;
    var spots = that.data.spots;
    console.log(`targetIndex: ${targetIndex}`);

    if (spots[targetIndex][2]) {
      that.carOut(targetIndex);
    } else {
      that.carIn(targetIndex);
    }
  },
});
