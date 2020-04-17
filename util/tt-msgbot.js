const dwPromisify = require("./dw-request").dwPromisify;

// === Make api Url === {{{
const apiUrl_sendTextMsg = "https://open.feishu.cn/open-apis/message/v4/send/";
// }}}

function sendTextMsg(access_token, content, receiver) {
  // tentant_token: string, tenant_token and access_token are response of code2session
  // a test result is that, tentant_access_token == app_access_token is true
  // content: string, the content of message. can at some one or all
  // e.g.  'text content<at user_id="ou_88a56e7e8e9f680b682f6905cc09098e">test</at>',
  // reciever: object, at least has one of following kinds of id
  // e.g. {
  // open_id: "ou_5ad573a6411d72b8305fda3a9c15c70e",
  // root_id: "om_40eb06e7b84dc71c03e009ad3c754195",
  // chat_id: "oc_5ad11d72b830411d72b836c20",
  // user_id: "92e39a99",
  // email: "fanlv@gmail.com",
  // }

  var data = {
    msg_type: "text",
    content: {
      text: content,
    },
  };
  Object.assign(data, receiver);

  var auth = `Bearer ${access_token}`;

  return dwPromisify(tt.request)({
    url: apiUrl_sendTextMsg,
    data: data,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
  });
}

module.exports = {
  sendTextMsg: sendTextMsg,
};
