const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const ttBot = require("../../util/tt-msgbot");
const util = require("../../util/util.js");
var cardContent = require("./spotsStatusCardContent.js").cardContent;

const config = require("../../config.js").config;

const sheetIdSpots = config.sheetIds.spots;
const sheetIdCars = config.sheetIds.cars;
const sheetIdFakeHistory = config.sheetIds.fake_his;
var sheetIdHistory = config.sheetIds.history;

var msgReceiver = config.msgReceiver;
var appLink = require("../../config.js").appLink;

console.log("-----------------");
console.log("Loaded config ...");
console.log(sheetIdSpots);
console.log(sheetIdCars);
console.log(sheetIdHistory);
console.log("-----------------");

const app = getApp();

// TODO: get chat_id by whitelist
// TODO: show Action in msg title, CarOut or CarIn
Page({
  onLoad: function () {
    var that = this;

    if (config.showLoading) {
      // start loading animate
      ttClientApi.ttShowLoading("Loading...", true);
    }
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

  onPullDownRefresh: function () {
    console.log("onPullDownRefresh", new Date());

    this.onLoad();
    ttClientApi.ttStopPullDownRefresh();
  },

  data: {
    // spots: [[id, name, status, lastEditor, lastEditorAvatar, mtime],...]
    // cars: [[id, plate],...]
    // plates: [plate1, plate2, ...]
    // fakeMode:    bool
    // title:       string
    // title: "建衡技术车位信息共享",
    fakeMode: config.fakeMode,
  },

  loadUserInfo: function () {
    if (app.globalData.hasUserInfo) {
      util.logger("Already loaded userInfo");
    } else {
      // get userInfo
      ttClientApi.ttGetUserInfo().then((res) => {
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
        var sheetIndexSpots = util.sheetIndexById(sheetMeta, sheetIdSpots);
        var lastColSpots = util.columnCharName(
          sheetMeta.sheets[sheetIndexSpots].columnCount
        );
        var lastRowSpots = sheetMeta.sheets[sheetIndexSpots].rowCount;

        var sheetIndexCars = util.sheetIndexById(sheetMeta, sheetIdCars);
        var lastColCars = util.columnCharName(
          sheetMeta.sheets[sheetIndexCars].columnCount
        );
        var lastRowCars = sheetMeta.sheets[sheetIndexCars].rowCount;

        var rangeSpots = `${sheetIdSpots}!A2:${lastColSpots}${lastRowSpots}`;
        var rangeCars = `${sheetIdCars}!A2:${lastColCars}${lastRowCars}`;
        var ranges = {
          spots: rangeSpots,
          cars: rangeCars,
        };

        that.setData({
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
        var rangesSpotsAndCars = [
          that.data.ranges.spots,
          that.data.ranges.cars,
        ];
        // load data from cloud
        return ttCloudApi.sheetReadRanges(
          app.globalData.user_access_token,
          rangesSpotsAndCars
        );
      })
      .then((res) => {
        // extra plates from cars sheet
        var spotnames = [];
        var plates = [];
        res.data.data.valueRanges[0].values.forEach((spot) => {
          spotnames.push(spot[1]);
        });

        res.data.data.valueRanges[1].values.forEach((car) => {
          plates.push(car[1]);
        });

        app.globalData.spotnames = spotnames;
        app.globalData.plates = plates;

        that.setData({
          spots: res.data.data.valueRanges[0].values,
          cars: res.data.data.valueRanges[1].values,
          plates: plates,
        });
        util.logger("Loaded data from cloud", that.data);

        if (config.showLoading) {
          // stop loading animate
          ttClientApi.ttHideToast();
        }
      });
  },

  updateCloudData: function (hisParams) {
    var that = this;

    var ranges = [that.data.ranges.spots, hisParams.rangeHist];
    var valuesList = [that.data.spots, hisParams.valuesHist];

    return ttCloudApi
      .sheetWriteRanges(app.globalData.user_access_token, ranges, valuesList)
      .then((res) => {
        if (res.data.code == 0) {
          that.onLoad();
          that.sendSpotsStatusCard();
        }
      });
  },

  _setSpotUserInfo: function (spot) {
    spot[3] = app.globalData.userInfo.nickName;
    spot[4] = app.globalData.userInfo.avatarUrl;
  },

  _setSpotStatus: function (spot, status) {
    spot[2] = status;
  },

  _setSpotDateTime: function (spot, fake = false) {
    if (fake) {
      var dateTime = this.fakeDateTime();
    } else {
      var dateTime = util.dateTimeString();
    }

    spot[5] = dateTime;
  },

  _setSpotHistory: function (spot, hisAction) {
    var sheetMeta = app.globalData.sheetMeta;
    var sheetIndex = util.sheetIndexById(sheetMeta, sheetIdHistory);

    if (hisAction == "push") {
      spot[6] = sheetMeta.sheets[sheetIndex].rowCount;
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

  makePopHistoryParams: function (targetIndex, sheetMeta, fake = false) {
    if (fake) {
      var popTime = this.fakeDateTime();
      sheetIdHistory = sheetIdFakeHistory;
    } else {
      var popTime = util.dateTimeString();
      sheetIdHistory = config.sheetIds.history;
    }

    var sheetIndex = util.sheetIndexById(sheetMeta, sheetIdHistory);

    var spot = this.data.spots[targetIndex];
    var lastColHist = util.columnCharName(
      sheetMeta.sheets[sheetIndex].columnCount
    );
    if (spot[6] != 0 && spot[6] != null && spot[6] != "" && spot[6]) {
      var targetUnitPosition = `${lastColHist}${spot[6] + 1}`;
      var rangeHist = `${sheetIdHistory}!${targetUnitPosition}:${targetUnitPosition}`;
    } else {
      util.logger("Get pop history failed");
      return "";
    }

    var valuesHist = [[popTime]];

    var d = { rangeHist: rangeHist, valuesHist: valuesHist };
    util.logger("Pop history params", d);

    return d;
  },

  autoConfirm: function () {
    var p = new Promise((resolve) => {
      return resolve({ confirm: true, cancel: false });
    });

    return p;
  },

  carOut: function (targetIndex, fake = false) {
    var that = this;
    var spots = that.data.spots;
    var spot = spots[targetIndex];
    var prompt_title = "确认提示";
    var prompt_content = `将牌照 ${spot[2]} 车辆移出车位 ${spot[1]} ?`;
    console.log("Here is carOut...");
    console.log(`targetIndex: ${targetIndex}`);

    if (fake) {
      var selectConfirm = this.autoConfirm;
    } else {
      var selectConfirm = ttClientApi.ttShowModal;
    }

    selectConfirm(prompt_title, prompt_content).then(({ confirm, cancel }) => {
      if (confirm) {
        var popHisParams = that.makePopHistoryParams(
          targetIndex,
          app.globalData.sheetMeta,
          fake
        );
        that.setSpots(targetIndex, "", "pop", fake);

        if (popHisParams != "") {
          that.updateCloudData(popHisParams).then(() => {
            util.logger("Updated a carOut infos to cloud");
          });
        }
      }
      if (cancel) {
        util.logger("carOut canceled");
      }
    });
  },

  makePushHistoryParams: function (
    targetIndex,
    sheetMeta,
    plate,
    fake = false
  ) {
    if (fake) {
      var pushTime = this.fakeDateTime();
      sheetIdHistory = sheetIdFakeHistory;
    } else {
      var pushTime = util.dateTimeString();
      sheetIdHistory = config.sheetIds.history;
    }

    var sheetIndex = util.sheetIndexById(sheetMeta, sheetIdHistory);

    // make history sheet range
    var lastColHist = util.columnCharName(
      sheetMeta.sheets[sheetIndex].columnCount
    );
    var lastRowHist = sheetMeta.sheets[sheetIndex].rowCount + 1;
    var rangeHist = `${sheetIdHistory}!A${lastRowHist}:${lastColHist}${lastRowHist}`;

    var valuesHist = [
      [lastRowHist - 1, this.data.spots[targetIndex][1], plate, pushTime],
    ];

    var d = { rangeHist: rangeHist, valuesHist: valuesHist };
    util.logger("Push history params", d);

    return d;
  },

  randomPlateIndex: function (unUsedPlates) {
    var p = new Promise((resolve) => {
      return resolve({
        tapIndex: Math.floor(Math.random() * unUsedPlates.length),
      });
    });

    return p;
  },

  carIn: function (targetIndex, fake = false) {
    var that = this;
    var unUsedPlates = this.unUsedPlates();
    console.log("Here is carIn...");
    console.log(`targetIndex: ${targetIndex}`);

    if (fake) {
      var selectPlate = that.randomPlateIndex;
    } else {
      var selectPlate = ttClientApi.ttShowActionSheet;
    }

    Promise.all([selectPlate(unUsedPlates), that.loadSheetMeta()]).then(
      ([res, _]) => {
        var plate = unUsedPlates[res.tapIndex];
        var pushHisParams = that.makePushHistoryParams(
          targetIndex,
          app.globalData.sheetMeta,
          plate,
          fake
        );
        that.setSpots(targetIndex, plate, "push", fake);

        that.updateCloudData(pushHisParams).then(() => {
          util.logger("Updated a carIn infos to cloud");
        });
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

  _formatSpotStatus: function (spot) {
    var plateCase = "xAFxxxxx";
    var mtimeCase = "20/04/17 08:05";
    var lastEditorCase = "王大壮士";
    var spotName = spot[1];
    var spotStatus = "";
    var lastEditor = "";
    var mtime = "";

    if (spot[2]) {
      spotStatus = util.fixLengthString(spot[2], plateCase.length);
    } else {
      spotStatus = util.fixLengthString("空闲", plateCase.length);
    }
    if (spot[3]) {
      lastEditor = util.fixLengthString(spot[3], 3);
    } else {
      lastEditor = util.fixLengthString(lastEditor, lastEditorCase.length);
    }

    if (spot[5]) {
      mtime = util.shortTimeString(spot[5]);
    } else {
      mtime = util.fixLengthString(mtime, mtimeCase.length);
    }

    return `${spotName} | ${spotStatus} | ${lastEditor} | ${mtime}`;
  },

  spotsStatusMsg: function () {
    var msgHeader = "车位状态更新提示:\n";
    var msgBody = "";
    this.data.spots.forEach((x) => {
      msgBody = msgBody + this._formatSpotStatus(x) + "\n";
    });

    return msgHeader + msgBody;
    // return msgBody;
  },

  spotsStatusCard: function () {
    var spots = this.data.spots;
    cardContent.elements[0].fields[0].text.content = this._formatSpotStatus(
      spots[0]
    ).slice(6, -1);
    cardContent.elements[1].fields[0].text.content = this._formatSpotStatus(
      spots[1]
    ).slice(6, -1);

    cardContent.elements[2].actions[0].url = appLink;
  },

  sendSpotsStatusMsg: function () {
    if (config.msgBot) {
      var content = this.spotsStatusMsg();

      util.logger("spots status msg", content);
      util.logger("receiver", msgReceiver);
      return ttBot
        .sendTextMsg(app.globalData.tenant_access_token, content, msgReceiver)
        .then((res) => {
          util.logger("Bot msg sended...");
          util.logger("Bot msg res", res);
        });
    }
  },

  sendSpotsStatusCard: function () {
    if (config.msgBot) {
      this.spotsStatusCard();
      util.logger("spots status card", cardContent);
      util.logger("receiver", msgReceiver);

      return ttBot
        .sendCardMsg(
          app.globalData.tenant_access_token,
          cardContent,
          msgReceiver
        )
        .then((res) => {
          util.logger("Bot card sended...");
          util.logger("Bot card res", res);
        });
    }
  },
  fake: {
    costTime: 5 * 60,
    counter: 0,
    timer: 0,
    step: 0.7,
    delay: 1.2,
  },

  fakeData: function () {
    var that = this;

    var random = Math.random() * that.fake.step;
    that.fake.timer += random;
    if (that.fake.timer <= that.fake.costTime) {
      console.log(
        `The ${Math.ceil(++that.fake.counter / 2)}th fake, timer is ${
          that.fake.timer
        } now`
      );

      if (that.fake.counter % 2 == 1) {
        console.log("Fake carIn");
        this.carIn(1, true);
      } else {
        console.log("Fake carOut");
        this.carOut(1, true);
      }

      setTimeout(that.fakeData, (that.fake.delay + random) * 1000);
    }
  },

  fakeDateTime: function () {
    var now = new Date();
    var yearAgo = new Date();
    var yearAgo = yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    var dt = new Date(
      ((now - yearAgo) * this.fake.timer) / this.fake.costTime + yearAgo
    );

    var dt = util.dateTimeString(dt);
    console.log(`fake dateTime: ${dt}`);
    return dt;
  },

  fakeCarIn: function () {
    console.log("------------------");
    console.log("Start fake CarIn...");
    this.carIn(0, true);
  },

  fakeCarOut: function () {
    console.log("------------------");
    console.log("Start fake CarOut...");
    this.carOut(0, true);
  },
});
