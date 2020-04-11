const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");

const rangeSpots = require("../../config.js").rangeSpots;
const rangeCars = require("../../config.js").rangeCars;
const ranges = [rangeSpots, rangeCars];

const app = getApp();

Page({
  onLoad: function () {
    var that = this;
    dwRequest.ttShowLoading("Loading...", true);
    dwRequest.login(app).then(() => {
      that.setData({
        hasLogin: true,
      });
      app.globalData.hasLogin = true;
      console.log("Login Success");

      // get userInfo
      dwRequest.ttGetUserInfo().then((res) => {
        that.setData({
          hasUserInfo: true,
          userInfo: res.userInfo,
        });
        console.log("Got userInfo Success");
      });

      // load data from cloud
      ttCloudApi
        .sheetReadRanges(app.globalData.user_access_token, ranges)
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
          console.log("Loaded data from cloud:");
          console.log(that.data);
          dwRequest.ttHideToast();
        });
    });
  },
  data: {
    // spots: [[id, name, status, lastEditor, lastEditorAvatar, mtime],...]
    // cars: [[id, plate],...]
    // hasLogin
    // userInfo
  },

  updateCloudSpots: function () {
    var that = this;
    // write current spots to cloud
    ttCloudApi
      .sheetWriteRange(
        app.globalData.user_access_token,
        rangeSpots,
        that.data.spots
      )
      .then(() => {
        console.log("Update spots success:");
        console.log(that.data.spots);
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
    var today = new Date();
    var date =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;

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

  carOut: function (targetIndex) {
    var that = this;
    var spots = that.data.spots;
    var spot = spots[targetIndex];
    var prompt_title = "确认提示";
    var prompt_content = `将牌照 ${spot[2]} 车辆移出车位 ${spot[1]} ?`;
    console.log("Here is carOut...");
    console.log(`targetIndex: ${targetIndex}`);

    dwRequest
      .ttShowModal(prompt_title, prompt_content)
      .then(({ confirm, cancel }) => {
        if (confirm) {
          that.updateSpots(targetIndex, "");

          // TODO filter used plates
          console.log("carOut successed");
        }
        if (cancel) {
          console.log("carOut canceled");
        }
      })
      .then(that.updateCloudSpots)
      .then(that.onLoad);
  },

  carIn: function (targetIndex) {
    var that = this;
    console.log("Here is carIn...");
    console.log(`targetIndex: ${targetIndex}`);

    dwRequest
      .ttShowActionSheet(that.data.plates)
      .then((res) => {
        that.updateSpots(targetIndex, that.data.plates[res.tapIndex]);
      })
      .then(that.updateCloudSpots)
      .then(that.onLoad);
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
