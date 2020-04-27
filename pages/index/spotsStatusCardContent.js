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
      tag: "div",
      text: {
        tag: "lark_md",
        content: "**D-101**",
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
    },
    {
      tag: "div",
      text: {
        tag: "lark_md",
        content: "**D-100**",
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
    },
    {
      tag: "action",
      actions: [
        {
          tag: "button",
          text: {
            tag: "plain_text",
            content: "进入小程序",
          },
          type: "default",
          url: appLink,
        },
      ],
    },
  ],
};

module.exports = {
  cardContent: cardContent,
};
