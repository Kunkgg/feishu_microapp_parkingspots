const app = getApp();
Page({
  data: {
    parking_spaces: [
      {
        id: "P1",
        status: ""
      },
      {
        id: "P2",
        status: ""
      }
    ],
    showmsg: false
  },
  carMove: function(e) {
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
      parking_spaces: parking_spaces
    });
    this.updateIdelCounter();
  },
  updateIdelCounter: function() {
    var idelCounter = 0;
    for (var i = 0, len = this.data.parking_spaces.length; i < len; ++i) {
      if (!this.data.parking_spaces[i].status) {
        idelCounter++;
      }
    }

    this.setData({
      idelCounter: idelCounter
    });
    // console.log(this.data.idelCounter)
  },
  getAppToken: function() {
    var appId = "cli_9e071c8f77b1d00d";
    var appSec = "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW";
    var apiUrl =
      "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/";

    let task = tt.request({
      url: apiUrl,
      data: {
        app_id: "cli_9e071c8f77b1d00d",
        app_secret: "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW"
      },
      header: {
        "content-type": "application/json"
      },
      success(res) {
        console.log(
          `getAppToken request 调用成功 ${res.data.app_access_token}`
        );
        this.setData({
          app_access_token: res.data.app_access_token
        });
      },
      fail(res) {
        console.log(`getAppToken request 调用失败`);
      }
    });
  },
  code2Session: function(code, app_access_token) {
    var apiUrl = "https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate";
    var auth = `Bearer ${app_access_token}`;
    console.log(`auth: ${auth}`);

    tt.request({
      url: apiUrl,
      data: {
        code: code
      },
      header: {
        "content-type": "application/json",
        "Authorization": auth
      },
      success(res) {
        console.log(`code2Session request 调用成功 ${res.data.code}`);
        console.log(`code2Session request 调用成功 ${res.data.msg}`);
        console.log(
          `code2Session request 调用成功 ${res.data.data.access_token}`
        );
        return res.data.code;
      },
      fail(res) {
        console.log(`code2Session request 调用失败`);
      }
    });
  },
  onLoad: function() {
    tt.login({
      success(res) {
        console.log(`login 调用成功 ${res.code}`);
        this.setData({
          code: res.data.code
        });
      },
      fail(res) {
        console.log(`login 调用失败`);
      }
    });

    this.getAppToken();
    console.log(`code: ${this.data.code}`)
    console.log(`appToken: ${this.data.appToken}`)
    this.code2Session(this.data.code, this.data.appToken);

    this.updateIdelCounter();
  }
});
