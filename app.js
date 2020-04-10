const dwRequest = require("util/dw-request.js");
const ttCloudApi = require("util/tt-cloudApi.js");
// const apiUrl_code2session = require("config.js").apiUrl_code2session;

App({
  onLaunch() {
    Promise.all([dwRequest.ttLogin(), dwRequest.ttGetAppAccessToken()])
      .then((res) => {
        return dwRequest.ttCode2Session(
          res[0].code,
          res[1].data.app_access_token
        );
      })
      .then((res) => {
        console.log(`code: ${res.data.code}`);
        console.log(`msg: ${res.data.msg}`);
        console.log(`data: ${JSON.stringify(res.data.data)}`);
        console.log(`access_token: ${res.data.data.access_token}`);
        // console.log("");
        // return ttCloudApi.rootMeta(res.data.data.access_token);
        return ttCloudApi.sheetMeta(res.data.data.access_token);
        // return ttCloudApi.folderNew(res.data.data.access_token);
        // return dwRequest.ttGetUserInfo();
      })
      .then((res) => {
        console.log(`sheet data: ${JSON.stringify(res.data)}`);
        console.log(`sheet code: ${res.data.code}`);
        // console.log(`root data: ${JSON.stringify(res.data)}`);
        // console.log(`root code: ${res.data.code}`);
        // console.log(`Folder data: ${JSON.stringify(res.data)}`);
        // console.log(`Folder code: ${res.data.code}`);
        // console.log(`User: ${res.rawData}`);
      });
  },
});
