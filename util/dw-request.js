function dwPromisify(fn) {
  return function(obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function(res) {
        //成功
        resolve(res);
      };
      obj.fail = function(res) {
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
      "Content-Type": "application/json"
    }
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
      "content-type": "application/x-www-form-urlencoded"
    }
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

module.exports = {
  postRequest: postRequest,
  getRequest: getRequest,
  doThen: doThen,
  wxLogin: ttLogin,
  wxGetUserInfo: ttGetUserInfo,
  wxGetSystemInfo: ttGetSystemInfo
};
