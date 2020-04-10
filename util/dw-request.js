const config = require("../config.js").config;

var apiUrl_app_access_token =
  "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/";
var apiUrl_code2session =
  "https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate";

/**
 * 构造 Promise
 */
function dwPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res);
      };
      obj.fail = function (res) {
        //失败
        reject(res);
      };
      fn(obj);
    });
  };
}
/**
 * 飞书请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data = {}) {
  var getRequest = dwPromisify(tt.request);
  return getRequest({
    url: url,
    method: "GET",
    data: data,
    header: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * 飞书请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data = {}) {
  var postRequest = dwPromisify(tt.request);
  return postRequest({
    url: url,
    method: "POST",
    data: data,
    header: {
      "content-type": "application/json",
    },
  });
}

/**
 * 空方法
 */
function doThen(fn) {
  return dwPromisify(fn);
}

/**
 * 飞书用户登录,获取code
 */
function ttLogin() {
  return dwPromisify(tt.login)();
}

/**
 * 获取飞书用户信息
 * 注意:须在登录之后调用
 */
function ttGetUserInfo() {
  return dwPromisify(tt.getUserInfo)();
}

/**
 * 获取系统信息
 */
function ttGetSystemInfo() {
  return dwPromisify(tt.getSystemInfo);
}

function ttGetAppAccessToken() {
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
      // console.log(res[0].code);
      return ttCode2Session(res[0].code, res[1].data.app_access_token);
    })
    .then((res) => {
      // console.log(`in page, ${res.data.data.access_token}`);
      app.user_access_token = res.data.data.access_token;
      // console.log(`in app, ${res.data.data.access_token}`);
    });
}

module.exports = {
  postRequest: postRequest,
  getRequest: getRequest,
  doThen: doThen,
  ttLogin: ttLogin,
  ttGetUserInfo: ttGetUserInfo,
  ttGetSystemInfo: ttGetSystemInfo,
  ttGetAppAccessToken: ttGetAppAccessToken,
  ttCode2Session: ttCode2Session,
  dwPromisify: dwPromisify,
  login: login,
};
