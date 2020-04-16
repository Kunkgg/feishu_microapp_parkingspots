#!/bin/bash

# A simple shell script for make config.js
# Write .token file for store tokens, never include this token file in git!
# ./token
# test_sheetToken="<test_sheetToken>"
# test_folderToken="<test_folderToken>"
# test_sheetIdSpots="<test_sheetIdSpots>"
# test_sheetIdCars="<test_sheetIdCars>"
# test_sheetIdHist="<test_sheetIdHist>"
# test_sheetIdEmptyHist="<test_sheetIdEmptyHist>"
# test_sheetIdFakeHist="<test_sheetIdFakeHist>"

# deploy_sheetToken="<deploy_sheetToken>"
# deploy_folderToken="<deploy_folderToken>"
# deploy_sheetIdSpots="<deploy_sheetIdSpots>"
# deploy_sheetIdCars="<deploy_sheetIdCars>"
# deploy_sheetIdHist="<deploy_sheetIdHist>"
# deploy_sheetIdEmptyHist="<deploy_sheetIdEmptyHist>"
# deploy_sheetIdFakeHist="<deploy_sheetIdFakeHist>"
#
# app_id="<app_id>"
# app_secret="<app_secret>"

# Usage: ./make [test|deploy]

source ./token

cat >./config.js <<EOF
const sheetToken = "<sheetToken>";
const folderToken = "<folderToken>";

var config = {
  app_id: "<app_id>",
  app_secret: "<app_secret>",
  fakeMode: true,
  sheetIds: {
    spots: "<sheetIdSpots>",
    cars: "<sheetIdCars>",
    history: "<sheetIdHist>",
    empty_his: "<sheetIdEmptyHist>",
    fake_his: "<sheetIdFakeHist>",
  },
  showLoading: true,
};

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
};
EOF

function _test(){
    sheetToken="${test_sheetToken}"
    folderToken="${test_folderToken}"
    sheetIdSpots="${test_sheetIdSpots}"
    sheetIdCars="${test_sheetIdCars}"
    sheetIdHist="${test_sheetIdHist}"
    sheetIdEmptyHist="${test_sheetIdEmptyHist}"
    sheetIdFakeHist="${test_sheetIdFakeHist}"

    _config
}

function _deploy(){
    sheetToken="${deploy_sheetToken}"
    folderToken="${deploy_folderToken}"
    sheetIdSpots="${deploy_sheetIdSpots}"
    sheetIdCars="${deploy_sheetIdCars}"
    sheetIdHist="${deploy_sheetIdHist}"
    sheetIdEmptyHist="${deploy_sheetIdEmptyHist}"
    sheetIdFakeHist="${deploy_sheetIdFakeHist}"

    _config
}

function _config(){
    sed -i "s/<app_id>/${app_id}/" config.js
    sed -i "s/<app_secret>/${app_secret}/" config.js
    sed -i "s/<sheetToken>/${sheetToken}/" config.js
    sed -i "s/<folderToken>/${folderToken}/" config.js
    sed -i "s/<sheetIdSpots>/${sheetIdSpots}/" config.js
    sed -i "s/<sheetIdCars>/${sheetIdCars}/" config.js
    sed -i "s/<sheetIdHist>/${sheetIdHist}/" config.js
    sed -i "s/<sheetIdEmptyHist>/${sheetIdEmptyHist}/" config.js
    sed -i "s/<sheetIdFakeHist>/${sheetIdFakeHist}/" config.js
}

case $1 in
    test) _test; cat ./config.js ;;
    deploy) _deploy; cat ./config.js ;;
    *) echo "Usage: ./make [test|deploy]"; exit 1 ;;
esac
