const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");

const rangeSpots = require("../../config.js").rangeSpots;
const rangeCars = require("../../config.js").rangeCars;
const ranges = [rangeSpots, rangeCars];

const app = getApp();

Page({
  onLoad: function () {
    var that = this;
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

  carOut: function (targetIndex) {
    var that = this;
    var spots = that.data.spots;
    var spot = spots[targetIndex];
    var prompt_title = "确认提示";
    var prompt_content = `将牌照  ${spot[2]} 车辆移出车位 ${spot[1]} ?`;
    console.log("Here is carOut...");
    console.log(`targetIndex: ${targetIndex}`);

    dwRequest
      .ttShowModal(prompt_title, prompt_content)
      .then(({ confirm, cancel }) => {
        if (confirm) {
          spots[targetIndex][2] = "";

          // TODO filter used plates
          // TODO set lastEditor and mtime
          that.setData({
            spots: spots,
          });
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
    console.log("Here is carIn...");
    console.log(`targetIndex: ${targetIndex}`);

    dwRequest
      .ttShowActionSheet(that.data.plates)
      .then((res) => {
        var spots = that.data.spots;
        spots[targetIndex][2] = that.data.plates[res.tapIndex];
        // TODO set lastEditor and mtime
        that.setData({
          spots: spots,
        });
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
