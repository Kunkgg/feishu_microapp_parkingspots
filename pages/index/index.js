const app = getApp();
Page({
  data: {
    parking_spaces: [
      {
        id: 'P1',
        status: '',
      },
      {
        id: 'P2',
        status: '',
      },
    ],
    showmsg: false,
  },
  carMove: function(e) {
    var id = e.currentTarget.id, parking_spaces = this.data.parking_spaces;

    for(var i = 0, len = parking_spaces.length; i < len; ++i) {
      if (parking_spaces[i].id == id) {
        if (parking_spaces[i].status) {
          parking_spaces[i].status = ''
        } else {
          parking_spaces[i].status = 'busy'
        }
      }
    }
    this.setData({
        parking_spaces: parking_spaces,
      })
    this.updateIdelCounter()

    tt.login({
    success (res) {
        console.log(`login 调用成功 ${res.code} ${res.anonymousCode}`);
    },
    fail (res) {
        console.log(`login 调用失败`);
    }
    });
  },
  updateIdelCounter: function(){
    var idelCounter = 0;
    for (var i = 0, len = this.data.parking_spaces.length; i < len; ++i) {
      if (! this.data.parking_spaces[i].status) {
        idelCounter++
    }
    };

    this.setData({
        idelCounter: idelCounter,
      });
    // console.log(this.data.idelCounter)
  },
  onLoad: function(options) {
    tt.login({
    success (res) {
        console.log(`login 调用成功 ${res.code} ${res.anonymousCode}`);
    },
    fail (res) {
        console.log(`login 调用失败`);
    }
    });
    this.updateIdelCounter()
  }
  });
