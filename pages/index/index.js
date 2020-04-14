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

// TODO: Mok fake data
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

      that.loadUserInfo();
      that.loadCloudData();
    } else {
      ttClientApi.login(app).then(() => {
        app.globalData.hasLogin = true;
        that.setData({
          hasLogin: true,
        });
        util.logger("Login Success");

        that.loadUserInfo();
        that.loadCloudData();
      });
    }
  },
  data: {
    // spots: [[id, name, status, lastEditor, lastEditorAvatar, mtime],...]
    // cars: [[id, plate],...]
    // plates: [plate1, plate2, ...]
    // hasLogin
    // hasUserInfo
    // userInfo
    // hasSheetMeta
    // sheetMeta
  },

  loadUserInfo: function () {
    var that = this;

    if (this.data.hasUserInfo) {
      util.logger("Already loaded userInfo");
    } else {
      // get userInfo
      ttClientApi.ttGetUserInfo().then((res) => {
        that.setData({
          hasUserInfo: true,
          userInfo: res.userInfo,
        });
        app.globalData.hasUserInfo = true;
        app.globalData.userInfo = res.userInfo;
        util.logger("Loaded userInfo Success");
      });
    }
  },

  loadSheetMeta: function () {
    var that = this;

    return ttCloudApi
      .sheetMeta(app.globalData.user_access_token)
      .then((res) => {
        var sheetMeta = res.data.data;

        // make spots and cars sheet range
        var lastColSpots = util.columnCharName(sheetMeta.sheets[0].columnCount);
        var lastRowSpots = sheetMeta.sheets[0].rowCount;
        var lastColCars = util.columnCharName(sheetMeta.sheets[1].columnCount);
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

        util.logger("Loaded sheetMeta Success");
      });
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
        util.logger("Loaded data from cloud", that.data);
        // stop loading animate
        // ttClientApi.ttHideToast();
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
        util.logger("Update spots success", that.data.spots);
        // reload page after update spots
        that.onLoad();
      });
  },

  _setSpotUserInfo: function (spot) {
    spot[3] = this.data.userInfo.nickName;
    spot[4] = this.data.userInfo.avatarUrl;
  },

  _setSpotStatus: function (spot, status) {
    spot[2] = status;
  },

  _setSpotDateTime: function (spot, fake = false) {
    if (fake) {
      var dateTime = this.fakeDateTime();
    } else {
      var dateTime = util.nowDateTime();
    }

    spot[5] = dateTime;
  },

  _setSpotHistory: function (spot, hisAction) {
    if (hisAction == "push") {
      spot[6] = this.data.sheetMeta.sheets[2].rowCount;
    } else if (hisAction == "pop") {
      spot[6] = "";
    }
  },

  _setSpotAll: function (spot, status, hisAction, fake = false) {
    this._setSpotStatus(spot, status);
    this._setSpotUserInfo(spot);
    this._setSpotDateTime(spot, fake);
    this._setSpotHistory(spot, hisAction);
  },

  setSpots: function (targetIndex, status, hisAction, fake = false) {
    var spots = this.data.spots;
    this._setSpotAll(spots[targetIndex], status, hisAction, fake);

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

  makePopHistoryParams: function (targetIndex, sheetMeta) {
    var spot = this.data.spots[targetIndex];
    var lastColHist = util.columnCharName(sheetMeta.sheets[2].columnCount);
    var targetUnitPosition = `${lastColHist}${spot[6] + 1}`;

    var rangeHist = `${sheetIdHistory}!${targetUnitPosition}:${targetUnitPosition}`;
    var popTime = util.nowDateTime();
    var valuesHist = [[popTime]];

    var d = { rangeHist: rangeHist, valuesHist: valuesHist };
    util.logger("Pop history params", d);

    return d;
  },

  carOut: function (targetIndex, fake = false) {
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
        var popHisParams = that.makePopHistoryParams(
          targetIndex,
          that.data.sheetMeta
        );

        if (confirm) {
          ttCloudApi
            .sheetWriteRange(
              app.globalData.user_access_token,
              popHisParams.rangeHist,
              popHisParams.valuesHist
            )
            .then((res) => {
              if (res.data.code == 0) {
                that.setSpots(targetIndex, "", "pop");
                that.updateCloudSpots();
                util.logger("carOut successed");
              }
              console.log(res.data);
            });
        }
        if (cancel) {
          util.logger("carOut canceled");
        }
      });
  },

  makePushHistoryParams: function (targetIndex, sheetMeta, plate) {
    // make history sheet range
    var lastColHist = util.columnCharName(sheetMeta.sheets[2].columnCount);
    var lastRowHist = sheetMeta.sheets[2].rowCount;
    var rangeHist = `${sheetIdHistory}!A${lastRowHist}:${lastColHist}${lastRowHist}`;
    var pushTime = util.nowDateTime();

    var valuesHist = [
      [lastRowHist, this.data.spots[targetIndex][1], plate, pushTime],
    ];

    var d = { rangeHist: rangeHist, valuesHist: valuesHist };
    util.logger("Push history params", d);

    return d;
  },

  randomPlateIndex: function (unUsedPlates) {
    var p = new Promise((resolve) => {
      return resolve(Math.floor(Math.random() * unUsedPlates.length));
    });

    return p;
  },

  carIn: function (targetIndex, fake = false) {
    var that = this;
    var unUsedPlates = this.unUsedPlates();
    console.log("Here is carIn...");
    console.log(`targetIndex: ${targetIndex}`);

    if (fake) {
      var selectPlate = this.randomPlate;
    } else {
      var selectPlate = ttClientApi.ttShowActionSheet;
    }

    Promise.all([selectPlate(unUsedPlates), that.loadSheetMeta()]).then(
      ([res, _]) => {
        var plate = unUsedPlates[res.tapIndex];
        var pushHisParams = that.makePushHistoryParams(
          targetIndex,
          that.data.sheetMeta,
          plate
        );

        ttCloudApi
          .sheetAppendData(
            app.globalData.user_access_token,
            pushHisParams.rangeHist,
            pushHisParams.valuesHist
          )
          .then((res) => {
            if (res.data.code == 0) {
              console.log("Created a new history item");
              console.log(res.data);
              that.setSpots(targetIndex, plate, "push", fake);
            }
          })
          .then(that.updateCloudSpots);
      }
    );
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

  fake: {
    costTime: 1 * 60,
    counter: 0,
    timer: 0,
  },

  fakeData: function () {
    var that = this;

    var random = Math.random() * 0.5;
    that.fake.timer += random;
    if (that.fake.timer <= that.fake.costTime) {
      console.log(
        `The ${Math.ceil(++that.fake.counter / 2)}th fake, timer is ${
          that.fake.timer
        } now`
      );
      if (that.fake.counter % 2 == 1) {
        console.log("Fake carIn");
      } else {
        console.log("Fake carOut");
      }

      setTimeout(that.fakeData, random * 1000);
    }
  },

  fakeCarIn: function (e) {
    console.log("------------------");
    console.log("Start fake CarIn...");
  },

  fakeCarOut: function (e) {
    console.log("------------------");
    console.log("Start fake CarIn...");
  },
});
