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
          that.setData({
            spots: res.data.data.valueRanges[0].values,
            cars: res.data.data.valueRanges[1].values,
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

  carMove: function (e) {
    var that = this;
    var id = e.currentTarget.id;
    var spots = that.data.spots;

    for (var i = 0, len = spots.length; i < len; ++i) {
      if (spots[i][0] == id) {
        if (spots[i][2]) {
          spots[i][2] = "";
        } else {
          spots[i][2] = "busy";
        }
      }
    }
    that.setData({
      spots: spots,
    });

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
});
