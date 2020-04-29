const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");
const ttClientApi = require("../../util/tt-clientApi.js");
const ttBot = require("../../util/tt-msgbot");
const util = require("../../util/util.js");
var cardContentTemp = require("./spotsStatusCardContent.js").cardContent;
var cardSpotTemp = require("./spotsStatusCardContent.js").spot;
var cardMoveInfoTemp = require("./spotsStatusCardContent.js").moveInfo;
const cardHr = require("./spotsStatusCardContent.js").hr;

const config = require("../../config.js").config;

const sheetIdSpots = config.sheetIds.spots;
const sheetIdCars = config.sheetIds.cars;
const sheetIdFakeHistory = config.sheetIds.fake_his;
const sheetIdMsgBotWhiteList = config.sheetIds.msgbot_whitelist;
const sheetIdChatIds = config.sheetIds.chat_ids;
var sheetIdHistory = config.sheetIds.history;

var msgReceiver = config.msgReceiver;

console.log("-----------------");
console.log("Loaded config ...");
console.log(sheetIdSpots);
console.log(sheetIdCars);
console.log(sheetIdHistory);
console.log("-----------------");

const app = getApp();

// TODO: get chat_id by whitelist
// TODO: deal with has more than 6 plates, picker
Page({
  onLoad: function () {
    var that = this;

    if (config.showLoading) {
      // start loading animate
      ttClientApi.ttShowLoading("Loading...", true);
    }
    if (this.data.hasLogin) {
      util.logger("Already login");

      Promise.all([
        that.loadUserInfo(),
        that.loadCloudData(),
        that.loadGroupsInfo(),
      ]).then(that.updateCloudNewId);
    } else {
      ttClientApi.login(app).then(() => {
        app.globalData.hasLogin = true;
        that.setData({
          hasLogin: true,
        });
        util.logger("Login Success");

        Promise.all([
          that.loadUserInfo(),
          that.loadCloudData(),
          that.loadGroupsInfo(),
        ]).then(that.updateCloudNewId);
      });
    }
  },

  // onReady: function () {
  //   this.updateCloudNewId();
  // },

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
      var p = new Promise((resolve) => {
        return resolve("Already loaded userInfo");
      });

      return p;
    } else {
      // get userInfo
      return ttClientApi.ttGetUserInfo().then((res) => {
        app.globalData.hasUserInfo = true;
        app.globalData.userInfo = res.userInfo;
        util.logger("Loaded userInfo Success", app.globalData.userInfo);
      });
    }
  },

  loadSheetMeta: function () {
    var that = this;

    function makeRange(sheetMeta, sheetId) {
      var sheetIndex = util.sheetIndexById(sheetMeta, sheetId);
      var lastCol = util.columnCharName(
        sheetMeta.sheets[sheetIndex].columnCount
      );
      var lastRow = sheetMeta.sheets[sheetIndex].rowCount;

      return `${sheetId}!A2:${lastCol}${lastRow}`;
    }

    return ttCloudApi
      .sheetMeta(app.globalData.user_access_token)
      .then((res) => {
        var sheetMeta = res.data.data;

        var ranges = {
          spots: makeRange(sheetMeta, sheetIdSpots),
          cars: makeRange(sheetMeta, sheetIdCars),
          msgBotWhiteList: makeRange(sheetMeta, sheetIdMsgBotWhiteList),
          chatIds: makeRange(sheetMeta, sheetIdChatIds),
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
    // load spots, cars, msgBotWhiteList and chatIds from cloud
    var that = this;

    // get sheetMeta for making data ranges
    return that
      .loadSheetMeta()
      .then(() => {
        var ranges = [
          that.data.ranges.spots,
          that.data.ranges.cars,
          that.data.ranges.msgBotWhiteList,
          that.data.ranges.chatIds,
        ];
        // load data from cloud
        return ttCloudApi.sheetReadRanges(
          app.globalData.user_access_token,
          ranges
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
        app.globalData.msgBotWhiteList = res.data.data.valueRanges[2].values;
        app.globalData.chatIds = res.data.data.valueRanges[3].values;

        util.logger("Loaded data from cloud", that.data);
        util.logger("msgBotWhiteList", app.globalData.msgBotWhiteList);
        util.logger("chatIds", app.globalData.chatIds);

        if (config.showLoading) {
          // stop loading animate
          ttClientApi.ttHideToast();
        }
      });
  },

  updateCloudData: function (hisParams, moveInfo) {
    var that = this;

    var ranges = [that.data.ranges.spots, hisParams.rangeHist];
    var valuesList = [that.data.spots, hisParams.valuesHist];

    return ttCloudApi
      .sheetWriteRanges(app.globalData.user_access_token, ranges, valuesList)
      .then((res) => {
        if (res.data.code == 0) {
          that.onLoad();
          that.sendSpotsStatusCard(moveInfo);
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
    var userInfo = app.globalData.userInfo;

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

        var moveInfo = `${userInfo.nickName}刚刚将牌照 [${spot[2]}] 车辆**移出**车位 [${spot[1]}]`;
        that.setSpots(targetIndex, "", "pop", fake);

        if (popHisParams != "") {
          that.updateCloudData(popHisParams, moveInfo).then(() => {
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
    var unUsedPlates = that.unUsedPlates();
    if (unUsedPlates.length == 0) {
      ttClientApi
        .ttShowModal("提示", "没有可用的车牌", "确定", "取消", false)
        .then(() => {
          util.logger("Don't have any unUsed plates");
          return;
        });
    } else {
      var userInfo = app.globalData.userInfo;

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

          var moveInfo = `${userInfo.nickName}刚刚将牌照 [${plate}] 车辆**移入**车位 [${that.data.spots[targetIndex][1]}]`;

          that.updateCloudData(pushHisParams, moveInfo).then(() => {
            util.logger("Updated a carIn infos to cloud");
          });
        }
      );
    }
  },

  carMove: function (e) {
    var that = this;
    var targetIndex = e.currentTarget.id.slice(1) - 1;
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

    return `${spotStatus} | ${lastEditor} | ${mtime}`;
  },

  spotsStatusCard: function (moveInfo) {
    var spots = this.data.spots;

    var cardContent = JSON.parse(JSON.stringify(cardContentTemp));
    var cardMoveInfo = JSON.parse(JSON.stringify(cardMoveInfoTemp));
    cardMoveInfo.text.content = moveInfo;

    for (let i = spots.length - 1; i >= 0; i--) {
      var cardSpot = JSON.parse(JSON.stringify(cardSpotTemp));
      cardSpot.text.content = `**${spots[i][1]}**`;
      cardSpot.fields[0].text.content = this._formatSpotStatus(spots[i]);
      cardContent.elements.unshift(cardSpot);
    }
    cardContent.elements.unshift(cardHr);
    cardContent.elements.unshift(cardMoveInfo);

    return cardContent;
  },

  sendSpotsStatusCard: function (moveInfo) {
    if (config.msgBot) {
      var cardContent = this.spotsStatusCard(moveInfo);
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
    currentSpotIndex: 0,
    counter: 0,
    timer: 0,
    step: 0.7,
    delay: 0.9,
  },

  fakeLoop: function () {
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
        this.carIn(that.fake.currentSpotIndex, true);
      } else {
        console.log("Fake carOut");
        this.carOut(that.fake.currentSpotIndex, true);
      }

      setTimeout(that.fakeLoop, (that.fake.delay + random) * 1000);
    } else if (that.fake.currentSpotIndex < that.data.spots.length) {
      if (that.fake.counter % 2 == 0) {
        this.carOut(that.fake.currentSpotIndex, true);
      }
      that.fake.timer = 0;
      that.fake.counter = 0;
      that.fake.currentSpotIndex += 1;
      setTimeout(that.fakeLoop, (that.fake.delay + random) * 1000);
    }
  },

  fakeClean: function () {
    var that = this;

    return that
      .loadSheetMeta()
      .then(() => {
        var sheetMeta = app.globalData.sheetMeta;
        var sheetIndex = util.sheetIndexById(sheetMeta, sheetIdFakeHistory);

        ttCloudApi.sheetDelLines(
          app.globalData.user_access_token,
          sheetIdFakeHistory,
          2,
          sheetMeta.sheets[sheetIndex].rowCount
        );
      })
      .then(() => {
        util.logger("Cleaned fake history");
      });
  },

  quickFake: function () {
    var that = this;

    if (config.showLoading) {
      // start loading animate
      ttClientApi.ttShowLoading("Faking data...", true);
    }

    var spotnames = app.globalData.spotnames;
    var unUsedPlates = that.unUsedPlates();
    var fakeHist = [];
    var id = 0;

    for (let i = 0; i < spotnames.length; i++) {
      that.fake.timer = 0;

      while (that.fake.timer <= that.fake.costTime) {
        var randomUnUsedPlate =
          unUsedPlates[Math.floor(Math.random() * unUsedPlates.length)];
        var item = [
          ++id,
          spotnames[i],
          randomUnUsedPlate,
          that.fakeDateTime(),
          "",
        ];

        var random = Math.random() * that.fake.step;
        that.fake.timer += random;
        item[4] = that.fakeDateTime();
        that.fake.timer += Math.random();
        fakeHist.push(item);
      }
    }

    // util.logger("Quick fake history length", fakeHist.length);
    // util.logger("Quick fake 1", fakeHist[0]);
    // util.logger("Quick fake 100", fakeHist[99]);
    // util.logger("Quick fake 500", fakeHist[499]);
    // util.logger("Quick fake 1000", fakeHist[999]);
    // util.logger("Quick fake 2000", fakeHist[1999]);

    var range = `${sheetIdFakeHistory}!A2:E${fakeHist.length + 1}`;

    that.fakeClean().then(() => {
      ttCloudApi
        .sheetWriteRange(app.globalData.user_access_token, range, fakeHist)
        .then((res) => {
          if (res.data.code == 0) {
            util.logger(
              `Quick fake history successed, generated ${fakeHist.length} history items`,
              res.data
            );

            if (config.showLoading) {
              // stop loading animate
              ttClientApi.ttHideToast();
            }
          }
        });
    });
  },

  fakeDateTime: function () {
    var now = new Date();
    var yearAgo = new Date();
    var yearAgo = yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    var dt = new Date(
      ((now - yearAgo) * this.fake.timer) / this.fake.costTime + yearAgo
    );

    var dt = util.dateTimeString(dt);
    // console.log(`fake dateTime: ${dt}`);
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

  isNewId: function (id) {
    return app.globalData.chatIds.every((element) => element[3] != id);
  },

  updateCloudNewId: function () {
    var that = this;
    var newId = [];

    util.logger("Here is in updateCloudNewId", app.globalData.sheetMeta);
    var [lastRow, lastCol] = util.sheetSizeById(
      app.globalData.sheetMeta,
      sheetIdChatIds
    );
    var lastRowTmp = lastRow;

    // get new open_id
    if (that.isNewId(app.globalData.open_id)) {
      var newOpenId = [
        lastRow,
        app.globalData.userInfo.nickName,
        "open_id",
        app.globalData.open_id,
      ];

      newId.push(newOpenId);
      lastRow++;
    }

    // get new chat_id
    for (let i = 0; i < app.globalData.groupsInfo.length; i++) {
      if (that.isNewId(app.globalData.groupsInfo[i].chat_id)) {
        var newChatId = [
          lastRow,
          app.globalData.groupsInfo[i].name,
          "chat_id",
          app.globalData.groupsInfo[i].chat_id,
        ];

        newId.push(newChatId);
        lastRow++;
      }
    }

    // update newId to local app
    app.globalData.chatIds = app.globalData.chatIds.concat(newId);

    // update newId to cloud
    if (newId.length > 0) {
      var range = `${sheetIdChatIds}!A${lastRowTmp + 1}:D${lastRow}`;

      ttCloudApi
        .sheetWriteRange(app.globalData.user_access_token, range, newId)
        .then((res) => {
          if (res.data.code == 0) {
            util.logger("Updated newId Success", res.data);
          }
        });
    } else {
      util.logger("Don't have any newId");
    }
  },

  loadGroupsInfo: function () {
    // load chatIds of groups which the micro app joined
    return ttBot.groupList(app.globalData.tenant_access_token).then((res) => {
      app.globalData.groupsInfo = res.data.data.groups;
      util.logger("Loaded chat groupsInfo Success", app.globalData.groupsInfo);
    });
  },
  msgBotReceiver: function () {},
});
