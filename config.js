const sheetToken = "shtcniUwsF4rGBfJTenE7JuNmWg";
const folderToken = "fldcnQ7Qa7RosZTqvzaHveun0og";

const sheetIdSpots = "5a3db1";
const sheetIdCars = "pcnBE5";
const sheetIdHistory = "O8jw1C";

var rangeSpots = `${sheetIdSpots}!A2:F3`;
var rangeCars = `${sheetIdCars}!A2:B4`;

var config = {
  app_id: "cli_9e071c8f77b1d00d",
  app_secret: "lnIhLD4fMTU467ufS3VAqgDv6eliG2mW",
};

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
  rangeSpots: rangeSpots,
  rangeCars: rangeCars,
};
