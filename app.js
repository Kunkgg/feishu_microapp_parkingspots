const dwRequest = require("util/dw-request.js");
const apiUrl_code2session = require("config.js").apiUrl_code2session;

App({
  onLaunch() {
    Promise.all([dwRequest.ttLogin(), dwRequest.ttGetAppAccessToken()])
      .then(res => {
        var data = { code: res[0].code };
        var auth = `Bearer ${res[1].data.app_access_token}`;
        var postRequest = dwRequest.dwPromisify(tt.request);
        return postRequest({
          url: apiUrl_code2session,
          method: "POST",
          data: data,
          header: {
            "content-type": "application/json",
            Authorization: auth
          }
        });
      })
      .then(res => {
        console.log(`code: ${res.data.code}`);
        console.log(`msg: ${res.data.msg}`);
        console.log(`data: ${JSON.stringify(res.data.data)}`);
      });

    // dwRequest.ttCode2Session().then(res => {
    //   console.log(`code: ${res.data.code}`);
    // console.log(`app_access_token: ${res.data.app_access_token}`);
    // });
  }
});
