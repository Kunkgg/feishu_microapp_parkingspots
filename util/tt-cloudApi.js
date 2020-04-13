const dwPromisify = require("./dw-request").dwPromisify;

const defaultSheetToken = require("../config.js").sheetToken;
const defaultFolderToken = require("../config.js").folderToken;

// === Make api Url === {{{
const apiUrl_base = "https://open.feishu.cn/open-apis";
const apiUrl_baseFloder = `${apiUrl_base}/drive/explorer/v2/folder/`;
const apiUrl_baseFile = `${apiUrl_base}/drive/explorer/v2/file/`;
const apiUrl_basePerm = `${apiUrl_base}/drive/permission/`;
const apiUrl_baseSheet = `${apiUrl_base}/sheet/v2/spreadsheets/`;

const apiUrl_rootMeta = `${apiUrl_base}/drive/explorer/v2/root_folder/meta`;
const apiUrl_permList = `${apiUrl_basePerm}/member/list`;

function apiUrl_folderNew(parentFolderToken) {
  return apiUrl_baseFloder + parentFolderToken;
}

function apiUrl_folderMeta(FolderToken) {
  return apiUrl_baseFloder + FolderToken + "/meta";
}

function apiUrl_folderList(FolderToken) {
  return apiUrl_baseFloder + FolderToken + "/children";
}

function apiUrl_fileNew(parentFolderToken) {
  return apiUrl_baseFile + parentFolderToken;
}

function apiUrl_fileCopy(srcFileToken) {
  return apiUrl_baseFile + "copy/files/" + srcFileToken;
}

function apiUrl_fileDelDoc(docToken) {
  return apiUrl_baseFile + "docs/" + docToken;
}

function apiUrl_fileDelSheet(sheetToken) {
  return apiUrl_baseFile + "spreadsheets/" + sheetToken;
}

function apiUrl_sheetMeta(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/metainfo";
}

function apiUrl_sheetReadRange(range, sheetToken, toString = false) {
  var url = apiUrl_baseSheet + sheetToken + "/values/" + range;

  if (toString) {
    return url + "&valueRenderOption=ToString";
  } else {
    return url;
  }
}

function apiUrl_sheetReadRanges(ranges, sheetToken, toString = false) {
  ranges = "ranges=" + ranges.join(",");
  var url = apiUrl_baseSheet + sheetToken + "/values_batch_get?" + ranges;

  if (toString) {
    return url + "&valueRenderOption=ToString";
  } else {
    return url;
  }
}

function apiUrl_sheetWriteRange(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/values";
}

function apiUrl_sheetWriteRanges(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/values_batch_update";
}

function apiUrl_sheetInsertData(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/values_prepend";
}

function apiUrl_sheetAppendData(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/values_append";
}

function apiUrl_sheetInsertLines(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/insert_dimension_range";
}

function apiUrl_sheetLines(sheetToken) {
  return apiUrl_baseSheet + sheetToken + "/dimension_range";
}
// ======}}}

// === API folder === {{{

function rootMeta(access_token) {
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_rootMeta,
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function folderMeta(access_token, folderToken = defaultFolderToken) {
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_folderMeta(folderToken),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function folderNew(
  access_token,
  title = "ParkingSpots",
  parentFolderToken = defaultFolderToken
) {
  var auth = `Bearer ${access_token}`;
  var data = {
    title: title,
  };
  return dwPromisify(tt.request)({
    url: apiUrl_folderNew(parentFolderToken),
    method: "POST",
    data: data,
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function folderList(access_token, folderToken = defaultFolderToken) {
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_folderList(folderToken),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

// ======}}}

// === API file === {{{

function fileNew(
  access_token,
  title,
  type,
  parentFolderToken = defaultFolderToken
) {
  // type: "sheet" or "doc"
  var auth = `Bearer ${access_token}`;
  var data = {
    title: title,
    type: type,
  };
  return dwPromisify(tt.request)({
    url: apiUrl_fileNew(parentFolderToken),
    method: "POST",
    data: data,
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function fileCopy(
  access_token,
  srcFileToken,
  type,
  dstName,
  dstFolderToken = defaultFolderToken,
  permissionNeeded = true,
  CommentNeeded = true
) {
  // type: "sheet" or "doc"
  var auth = `Bearer ${access_token}`;
  var data = {
    type: type,
    dstFolderToken: dstFolderToken,
    dstName: dstName,
    permissionNeeded: permissionNeeded,
    CommentNeeded: CommentNeeded,
  };
  return dwPromisify(tt.request)({
    url: apiUrl_fileCopy(srcFileToken),
    method: "POST",
    data: data,
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function fileDel(access_token, fileToken, type) {
  // type: "sheet" or "doc"
  if (type == "doc") {
    var url = apiUrl_fileDelDoc(fileToken);
  } else if (type == "sheet") {
    var url = apiUrl_fileDelSheet(fileToken);
  } else {
    throw "fileDel failed: type Error";
  }
  console.log(url);

  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: url,
    method: "DELETE",
    data: {},
    header: {
      Authorization: auth,
    },
  });
}
// ======}}}

// === API permission === {{{
function permList(access_token, type = "sheet", fileToken = defaultSheetToken) {
  // type: "sheet" or "doc" or "file"
  var data = {
    token: fileToken,
    type: type,
  };
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_permList,
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

// ======}}}

// === API sheet === {{{
function sheetMeta(access_token, sheetToken = defaultSheetToken) {
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_sheetMeta(sheetToken),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetReadRange(
  access_token,
  range,
  sheetToken = defaultSheetToken,
  toString = false
) {
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_sheetReadRange(range, sheetToken, toString),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetReadRanges(
  access_token,
  ranges,
  sheetToken = defaultSheetToken,
  toString = false
) {
  // ranges: strings array
  var auth = `Bearer ${access_token}`;
  return dwPromisify(tt.request)({
    url: apiUrl_sheetReadRanges(ranges, sheetToken, toString),
    method: "GET",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetWriteRange(
  access_token,
  range,
  values,
  sheetToken = defaultSheetToken
) {
  // values: [[v, v, v...], [v, v, v...]]
  var data = {
    valueRange: {
      range: range,
      values: values,
    },
  };
  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sheetWriteRange(sheetToken),
    data: data,
    method: "PUT",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetWriteRanges(
  access_token,
  ranges,
  valuesList,
  sheetToken = defaultSheetToken
) {
  // values: [[v, v, v...], [v, v, v...]]
  // ranges.length should equal vaules_list.length
  var data = { valueRanges: [] };
  var i;
  for (i = 0; i < ranges.length; i++) {
    data.valueRanges.push({ range: ranges[i], values: valuesList[i] });
  }
  var auth = `Bearer ${access_token}`;

  console.log(JSON.stringify(data));
  console.log(apiUrl_sheetWriteRanges(sheetToken));

  return dwPromisify(tt.request)({
    url: apiUrl_sheetWriteRanges(sheetToken),
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetInsertData(
  access_token,
  range,
  values,
  sheetToken = defaultSheetToken
) {
  // values: [[v, v, v...], [v, v, v...]]
  var data = {
    valueRange: {
      range: range,
      values: values,
    },
  };
  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sheetInsertData(sheetToken),
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetAppendData(
  access_token,
  range,
  values,
  sheetToken = defaultSheetToken
) {
  // values: [[v, v, v...], [v, v, v...]]
  var data = {
    valueRange: {
      range: range,
      values: values,
    },
  };
  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sheetAppendData(sheetToken),
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

function sheetInsertLines(
  access_token,
  sheetId,
  startIndex,
  endIndex,
  majorDimension = "ROWS",
  inheritStyle = "",
  sheetToken = defaultSheetToken
) {
  // startIndex, endIndex: int
  // majorDimension: "ROWS" / "COLUMNS"
  // inheritStyle: "" / "BEFORE" / "AFTER"
  var data = {
    dimension: {
      sheetId: sheetId,
      majorDimension: majorDimension,
      startIndex: startIndex,
      endIndex: endIndex,
    },
    inheritStyle: inheritStyle,
  };
  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sheetInsertLines(sheetToken),
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}
function sheetAppendLines(
  access_token,
  sheetId,
  length,
  majorDimension = "ROWS",
  sheetToken = defaultSheetToken
) {
  // length: int
  // majorDimension: "ROWS" / "COLUMNS"
  var data = {
    dimension: {
      sheetId: sheetId,
      majorDimension: majorDimension,
      length: length,
    },
  };
  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sheetLines(sheetToken),
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

// ======}}}

module.exports = {
  rootMeta: rootMeta,
  folderNew: folderNew,
  folderMeta: folderMeta,
  folderList: folderList,
  fileNew: fileNew,
  fileCopy: fileCopy,
  fileDel: fileDel,
  permList: permList,
  sheetMeta: sheetMeta,
  sheetReadRange: sheetReadRange,
  sheetReadRanges: sheetReadRanges,
  sheetWriteRange: sheetWriteRange,
  sheetWriteRanges: sheetWriteRanges,
  sheetInsertData: sheetInsertData,
  sheetAppendData: sheetAppendData,
  sheetInsertLines: sheetInsertLines,
  sheetAppendLines: sheetAppendLines,
};
