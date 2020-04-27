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
  //e.g. 2017/08/12 03:04:25
  function twoDigit(n) {
    n = n.toString();
    return n[1] ? n : "0" + n;
  }

  if (!dt) {
    dt = new Date();
  }
  var date =
    dt.getFullYear() +
    "/" +
    twoDigit(dt.getMonth() + 1) +
    "/" +
    twoDigit(dt.getDate());
  var time = [dt.getHours(), dt.getMinutes(), dt.getSeconds()]
    .map(twoDigit)
    .join(":");
  var dateTime = date + " " + time;

  return dateTime;
}

function dateString(dt = "") {
  if (!dt) {
    dt = new Date();
  }
  var date = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();

  return date;
}

function columnCharName(n) {
  // transform 1 -> 'A', 2 -> 'B'
  return String.fromCharCode(64 + n);
}

function sheetIndexById(sheetMeta, sheetId) {
  // get the index of sub sheet from the sheetMeta
  const sheets = sheetMeta.sheets;
  for (let i = 0; i < sheetMeta.sheets.length; i++) {
    if (sheets[i].sheetId == sheetId) {
      return i;
    }
  }
}

function sum(input) {
  if (toString.call(input) !== "[object Array]") return false;

  var total = 0;
  for (var i = 0; i < input.length; i++) {
    if (isNaN(input[i])) {
      continue;
    }
    total += Number(input[i]);
  }
  return total;
}

function logger(message, data = null) {
  console.log(">>>>>>>>>>>>>>>>>");
  console.log(`${message}`);
  if (data != null) {
    console.log(data);
  }
  console.log("<<<<<<<<<<<<<<<<<");
}

function fixLengthString(s, len) {
  if (s.length <= len) {
    for (let i = 0; i < len - s.length; i++) {
      s = s + " ";
    }
  }
  return s;
}

function shortTimeString(timeString) {
  //e.g. 2017/08/10 23:24:25 -> 17/08/10 23:24
  return timeString.slice(2, timeString.length - 3);
}
module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,
  dateTimeString: dateTimeString,
  dateString: dateString,
  shortTimeString,
  shortTimeString,
  columnCharName: columnCharName,
  sheetIndexById: sheetIndexById,
  logger: logger,
  sum: sum,
  fixLengthString: fixLengthString,
};
