const dwRequest = require("../../util/dw-request.js");
const ttCloudApi = require("../../util/tt-cloudApi.js");

const app = getApp();
Page({
  data: {
    parking_spaces: [
      {
        id: "P1",
        status: "",
      },
      {
        id: "P2",
        status: "",
      },
    ],
    showmsg: false,
  },
  carMove: function (e) {
    var id = e.currentTarget.id,
      parking_spaces = this.data.parking_spaces;

    for (var i = 0, len = parking_spaces.length; i < len; ++i) {
      if (parking_spaces[i].id == id) {
        if (parking_spaces[i].status) {
          parking_spaces[i].status = "";
        } else {
          parking_spaces[i].status = "busy";
        }
      }
    }
    this.setData({
      parking_spaces: parking_spaces,
    });
    this.updateIdelCounter();
  },
  updateIdelCounter: function () {
    var idelCounter = 0;
    for (var i = 0, len = this.data.parking_spaces.length; i < len; ++i) {
      if (!this.data.parking_spaces[i].status) {
        idelCounter++;
      }
    }

    this.setData({
      idelCounter: idelCounter,
    });
    // console.log(this.data.idelCounter)
  },
  onLoad: function () {
    dwRequest.login(app);

    this.updateIdelCounter();
  },
});
