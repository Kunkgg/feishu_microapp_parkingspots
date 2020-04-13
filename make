#!/bin/bash

# A simple shell script for make config.js
# Write .token file for store tokens, never include this token file in git!
# ./token
# test_sheetToken="<test_sheetToken>"
# test_folderToken="<test_folderToken>"
# deploy_sheetToken="<deploy_sheetToken>"
# deploy_folderToken="<deploy_folderToken>"
#
# app_id="<app_id>"
# app_secret="<app_secret>"

# Usage: ./make [test|deploy]

source ./token

function _test(){
    sheetToken="${test_sheetToken}"
    folderToken="${test_folderToken}"

    _config
}

function _deploy(){
    sheetToken="${deploy_sheetToken}"
    folderToken="${deploy_folderToken}"

    _config
}

function _config(){
    sed -i "s/<app_id>/${app_id}/" config.js
    sed -i "s/<app_secret>/${app_secret}/" config.js
    sed -i "s/<sheetToken>/${sheetToken}/" config.js
    sed -i "s/<folderToken>/${folderToken}/" config.js
}

case $1 in
    test) _test; cat ./config.js ;;
    deploy) _deploy; cat ./config.js ;;
    *) echo "Usage: ./make [test|deploy]"; exit 1 ;;
esac
