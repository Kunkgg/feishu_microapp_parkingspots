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
# test_receiverIdKind="<test_receiverIdKind>"
# test_receiverId="<test_receiverId>"

# deploy_sheetToken="<deploy_sheetToken>"
# deploy_folderToken="<deploy_folderToken>"
# deploy_sheetIdSpots="<deploy_sheetIdSpots>"
# deploy_sheetIdCars="<deploy_sheetIdCars>"
# deploy_sheetIdHist="<deploy_sheetIdHist>"
# deploy_sheetIdEmptyHist="<deploy_sheetIdEmptyHist>"
# deploy_sheetIdFakeHist="<deploy_sheetIdFakeHist>"
# deploy_receiverIdKind="<deploy_receiverIdKind>"
# deploy_receiverId="<deploy_receiverId>"
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
  msgBot: true,
  msgReceiver: {
  <receiverIdKind>: "<receiverId>",
  },
};

var appLink = \`https://applink.feishu.cn/client/mini_program/open?appId=\${config.app_id}&mode=window\`;

module.exports = {
  config: config,
  sheetToken: sheetToken,
  folderToken: folderToken,
  appLink: appLink,
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
    receiverIdKind="${test_receiverIdKind}"
    receiverId="${test_receiverId}"

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
    receiverIdKind="${deploy_receiverIdKind}"
    receiverId="${deploy_receiverId}"

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
    sed -i "s/<receiverIdKind>/${receiverIdKind}/" config.js
    sed -i "s/<receiverId>/${receiverId}/" config.js
}

function _check(){
    current_sheetToken="$(cat config.js | head -n1 | grep -E -o \"\.\*\" | tr -d '"')"
    if [[ "${current_sheetToken}" == "${test_sheetToken}" ]]; then
        echo "test config is using"
    elif [[ "${current_sheetToken}" == "${deploy_sheetToken}" ]]; then
        echo "deploy config is using"
    else
        echo "unkown config is using"
    fi
}

case $1 in
    test) _test; _check ;;
    deploy) _deploy; _check ;;
    check) _check;;
    *) echo "Usage: ./make [test|deploy]"; exit 1 ;;
esac
