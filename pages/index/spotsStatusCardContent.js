var appLink = require("../../config.js").appLink;

var cardContent = {
  config: {
    wide_screen_mode: true,
  },
  // card_link: {
  //   url: "",
  //   // android_url: "https://developer.android.com/",
  //   // ios_url: "https://developer.apple.com/",
  //   // pc_url: "https://www.windows.com",
  // },
  header: {
    title: {
      tag: "plain_text",
      content: "车位状态更新提示",
    },
  },
  elements: [
    {
      tag: "action",
      actions: [
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: "进入小程序",
          },
          type: "primary",
          url: appLink,
        },
      ],
    },
  ],
};

var spot = {
  tag: "div",
  text: {
    tag: "lark_md",
    content: "",
  },
  fields: [
    {
      is_short: true,
      text: {
        tag: "plain_text",
        content: "",
      },
    },
  ],
};

const hr = {
  tag: "hr",
};

var moveInfo = {
  tag: "div",
  text: {
    tag: "lark_md",
    content: "",
  },
};

module.exports = {
  cardContent: cardContent,
  spot: spot,
  hr: hr,
  moveInfo: moveInfo,
};
