const dwRequest = require("util/dw-request.js");
const apiUrl_code2session = require("config.js").apiUrl_code2session;

App({
  onLaunch() {
    Promise.all([dwRequest.ttLogin(), dwRequest.ttGetAppAccessToken()])
      .then(res => {
        return dwRequest.ttCode2Session(
          res[0].code,
          res[1].data.app_access_token
        );
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
