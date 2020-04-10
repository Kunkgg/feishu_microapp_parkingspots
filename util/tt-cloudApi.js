const dwPromisify = require("./dw-request").dwPromisify;
const apiUrl_rootmeta =
  "https://open.feishu.cn/open-apis/drive/explorer/v2/root_folder/meta";

const defaultSheetToken = require("../config.js").sheetToken;
const defaultFolderToken = require("../config.js").folderToken;

// console.log(apiUrl_newFolder);
folderNew();

function apiUrl_sheetMeta(sheetToken) {
  return (
    "https://open.feishu.cn/open-apis/sheet/v2/spreadsheets/" +
    sheetToken +
    "/metainfo"
  );
}

function apiUrl_folderNew(parentFolderToken) {
  return (
    "https://open.feishu.cn/open-apis/drive/explorer/v2/folder/" +
    parentFolderToken
  );
}

// === API folder ===
function rootMeta(access_token) {
  var auth = `Bearer ${access_token}`;
  var getRequest = dwPromisify(tt.request);
  console.log(apiUrl_rootmeta);
  console.log(auth);
  return getRequest({
    url: apiUrl_rootmeta,
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function folderNew(access_token, parentFolderToken = defaultFolderToken) {
  var auth = `Bearer ${access_token}`;
  var postRequest = dwPromisify(tt.request);
  var data = {
    title: "ParkingLot",
  };
  console.log(apiUrl_folderNew(parentFolderToken));
  console.log(auth);
  return postRequest({
    url: apiUrl_folderNew(parentFolderToken),
    method: "POST",
    data: data,
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetMeta(access_token, sheetToken = defaultSheetToken) {
  var auth = `Bearer ${access_token}`;
  var getRequest = dwPromisify(tt.request);
  console.log(apiUrl_sheetMeta(sheetToken));
  console.log(auth);
  return getRequest({
    url: apiUrl_sheetMeta(sheetToken),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

// function postRequest(url, data = {}) {
//   var postRequest = dwPromisify(tt.request);
//   return postRequest({
//     url: url,
//     method: "POST",
//     data: data,
//     header: {
//       "content-type": "application/json"
//     }
//   });
// }

module.exports = {
  sheetMeta: sheetMeta,
  rootMeta: rootMeta,
  folderNew: folderNew,
  // getRequest: getRequest,
  // doThen: doThen,
  // ttLogin: ttLogin,
  // ttGetUserInfo: ttGetUserInfo,
  // ttGetSystemInfo: ttGetSystemInfo,
  // ttGetAppAccessToken: ttGetAppAccessToken,
  // ttCode2Session: ttCode2Session,
  // dwPromisify: dwPromisify
};
