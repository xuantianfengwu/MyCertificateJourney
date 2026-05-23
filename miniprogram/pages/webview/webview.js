// pages/webview/webview.js
Page({
  data: {
    url: ''
  },

  onLoad: function(options) {
    // 获取传递的URL参数
    if (options.url) {
      this.setData({
        url: decodeURIComponent(options.url)
      });
    }
  }
});