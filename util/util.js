function formatTime(time) {
  if (typeof time !== "number" || time < 0) {
    return time;
  }

  var hour = parseInt(time / 3600);
  time = time % 3600;
  var minute = parseInt(time / 60);
  time = time % 60;
  var second = time;

  return [hour, minute, second]
    .map(function (n) {
      n = n.toString();
      return n[1] ? n : "0" + n;
    })
    .join(":");
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === "string" && typeof latitude === "string") {
    longitude = parseFloat(longitude);
    latitude = parseFloat(latitude);
  }

  longitude = longitude.toFixed(2);
  latitude = latitude.toFixed(2);

  return {
    longitude: longitude.toString().split("."),
    latitude: latitude.toString().split("."),
  };
}

function dateTimeString(dt = "") {
  //return: current time format 'yyyy/MM/dd HH:mm:ss'
  //e.g. 2017/08/10 23:24:25
  function twoDigit(n) {
    if (n.toString().length == 1) {
      n = "0" + n;
    }
    return n;
  }

  if (!dt) {
    dt = new Date();
  }
  var date = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
  var time = [dt.getHours(), dt.getMinutes(), dt.getSeconds()]
    .map(twoDigit)
    .join(":");
  var dateTime = date + " " + time;

  return dateTime;
}

function columnCharName(n) {
  return String.fromCharCode(64 + n);
}

function logger(message, data = {}) {
  console.log(">>>>>>>>>>>>>>>>>");
  console.log(`${message}`);
  console.log(data);
  console.log("<<<<<<<<<<<<<<<<<");
}

module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,
  dateTimeString: dateTimeString,
  columnCharName: columnCharName,
  logger: logger,
};
