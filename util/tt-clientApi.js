const dwPromisify = require("./dw-request").dwPromisify;

const config = require("../config.js").config;
const apiUrl_app_access_token =
  "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/";
const apiUrl_code2session =
  "https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate";

/**
 * 飞书用户登录,获取code
 */
function ttLogin() {
  console.log("Getting login code...");
  return dwPromisify(tt.login)();
}

/**
 * 获取飞书用户信息
 * 注意:须在登录之后调用
 */
function ttGetUserInfo() {
  console.log("Getting userInfo...");
  return dwPromisify(tt.getUserInfo)();
}

/**
 * 获取系统信息
 */
function ttGetSystemInfo() {
  return dwPromisify(tt.getSystemInfo)();
}

function ttGetAppAccessToken() {
  console.log("Getting app_access_token...");
  var postRequest = dwPromisify(tt.request);
  return postRequest({
    url: apiUrl_app_access_token,
    method: "POST",
    data: config,
    header: {
      "content-type": "application/json",
    },
  });
}

function ttCode2Session(code, app_access_token) {
  var data = { code: code };
  var auth = `Bearer ${app_access_token}`;
  var postRequest = dwPromisify(tt.request);
  return postRequest({
    url: apiUrl_code2session,
    method: "POST",
    data: data,
    header: {
      "content-type": "application/json",
      Authorization: auth,
    },
  });
}

function login(app) {
  return Promise.all([ttLogin(), ttGetAppAccessToken()])
    .then((res) => {
      console.log("Got login code and app_access_token");
      return ttCode2Session(res[0].code, res[1].data.app_access_token);
    })
    .then((res) => {
      // console.log(`in page, ${res.data.data.access_token}`);
      app.globalData.user_access_token = res.data.data.access_token;
      // console.log(`in app, ${res.data.data.access_token}`);
    });
}

function ttShowActionSheet(itemList) {
  console.log("Showing action sheet...");
  return dwPromisify(tt.showActionSheet)({ itemList });
}

function ttShowModal(
  title,
  content,
  confirmText = "确定",
  cancelText = "取消",
  showCancel = true
) {
  console.log("Showing modal...");
  return dwPromisify(tt.showModal)({
    title: title,
    content: content,
    confirmText: confirmText,
    cancelText: cancelText,
    showCancel: showCancel,
  });
}

function ttShowLoading(title, mask = false) {
  console.log("Showing loading...");
  return dwPromisify(tt.showLoading)({
    title: title,
    mask: mask,
  });
}

function ttHideToast() {
  console.log("Hide Toast");
  return dwPromisify(tt.hideToast)();
}

module.exports = {
  ttLogin: ttLogin,
  ttGetUserInfo: ttGetUserInfo,
  ttGetSystemInfo: ttGetSystemInfo,
  ttGetAppAccessToken: ttGetAppAccessToken,
  ttCode2Session: ttCode2Session,
  login: login,
  ttShowActionSheet: ttShowActionSheet,
  ttShowModal: ttShowModal,
  ttShowLoading: ttShowLoading,
  ttHideToast: ttHideToast,
};
