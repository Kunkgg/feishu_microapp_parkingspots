var apiUrl_app_access_token =
  "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/";
var apiUrl_code2session =
  "https://open.feishu.cn/open-apis/mina/v2/tokenLoginValidate";

var sheetToken = "shtcnTNuG88jU9y2Ldfp9ZgjjUb";
var apiUrl_sheetmeta = `https://open.feishu.cn/open-apis/sheet/v2/spreadsheets/:${sheetToken}/metainfo`;

var config = {
  app_id: "cli_9e071c8f77b1d00d",
  app_secret: "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW"
};

module.exports = {
  apiUrl_app_access_token: apiUrl_app_access_token,
  apiUrl_code2session: apiUrl_code2session,
  apiUrl_sheetmeta: apiUrl_sheetmeta,
  config: config
};
