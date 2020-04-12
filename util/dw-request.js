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

module.exports = {
  postRequest: postRequest,
  getRequest: getRequest,
  doThen: doThen,
  dwPromisify: dwPromisify,
};
