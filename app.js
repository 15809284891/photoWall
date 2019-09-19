//app.js
App({
  onLaunch: function () {

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.WINDOW_HEIGHT = res.windowHeight,
          that.globalData.WINDOW_WIDTH = res.windowWidth
      },
    })
  },

  
  globalData: {
    userInfo: null,
    WINDOW_WIDTH:300,
    WINDOW_HEIGHT:300
  }
  
})