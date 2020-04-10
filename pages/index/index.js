const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");

const rangeSpots = require("../../config.js").rangeSpots;
const rangeCars = require("../../config.js").rangeCars;
const ranges = [rangeSpots, rangeCars];

const app = getApp();

Page({
  data: {
    // spots: spots,
    // cars: cars,
  },
  // parking_spaces: [
  //   {
  //     id: "P1",
  //     status: "",
  //   },
  //   {
  //     id: "P2",
  //     status: "",
  //   },
  // ],
  // showmsg: false,
  // carMove: function (e) {
  //   var id = e.currentTarget.id,
  //     parking_spaces = this.data.parking_spaces;

  //   for (var i = 0, len = parking_spaces.length; i < len; ++i) {
  //     if (parking_spaces[i].id == id) {
  //       if (parking_spaces[i].status) {
  //         parking_spaces[i].status = "";
  //       } else {
  //         parking_spaces[i].status = "busy";
  //       }
  //     }
  //   }
  //   this.setData({
  //     parking_spaces: parking_spaces,
  //   });
  //   this.updateIdelCounter();
  // },
  // updateIdelCounter: function () {
  //   var idelCounter = 0;
  //   for (var i = 0, len = this.data.spots.length; i < len; ++i) {
  //     if (!this.data.spots[i][2]) {
  //       idelCounter++;
  //     }
  //   }

  //   this.setData({
  //     idelCounter: idelCounter,
  //   });
  //   // console.log(this.data.idelCounter)
  // },
  onLoad: function () {
    dwRequest
      .login(app)
      .then(() => {
        return ttCloudApi.sheetReadRanges(app.user_access_token, ranges);
      })
      .then((res) => {
        var spots = res.data.data.valueRanges[0].values;
        var cars = res.data.data.valueRanges[1].values;
        this.setData({
          spots: spots,
          cars: cars,
        });
        console.log(this.data);
      });
  },
});
