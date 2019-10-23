// pages/watermerFile/watermerFile.js
var config = require('../../utils/config.js');
var util = require('../../utils/util.js');
var cos = require('../../utils/util.js').getCOSInstance();
var isButtonDown = false;
var watermerKey = "watermer/watermer.png";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrx: [],
    arry: [],
    arrz: [],
    ctx: null,
    windowH: 300,
    windowW: 300,
    canvasw: 200,
    canvash: 200,
  },
  onLoad: function (options) {
    var that = this;
    var app = getApp();
    this.setData({
      windowH: app.globalData.WINDOW_HEIGHT,
      windowW: app.globalData.WINDOW_WIDTH
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.startCanvas();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.cleardraw();
  },

  //水印图上传到cos
  onHandleUploadWaterMarkEvent: function () {
    util.showLoading("生成中")
    var that = this;
    if (this.data.arrx.length != 0) {
      util.showLoading("生成中...");
      util.canvasToTempFilePath('customCanvas').then(res=>{
        var filePath = res.tempFilePath;
        //上传图片到cos
        cos.postObject({
          Bucket: config.Bucket,
          Region: config.Region,
          Key: watermerKey,
          FilePath: filePath,
          CacheControl: "no-cache"
        }, function (err, data) {
          util.hideLoading()
          if (err) {
            util.showToast("上传失败", false);


          } else {
            util.showToast("上传成功", true);
            that.setData({
              ShowMainView: true
            })
            wx.navigateBack({
              delta: 1
            })
          }
        })
      })

    } else {
      util.showToast("未绘制任何内容", false);
    }

  },



  startCanvas: function () {
    var that = this;
    var app = getApp();
    this.initCanvas();
    that.setData({
      canvasw: (app.globalData.WINDOW_HEIGHT - app.globalData.WINDOW_WIDTH * 0.618 - 40 - 58) * 0.8,
      canvash: (app.globalData.WINDOW_HEIGHT - app.globalData.WINDOW_WIDTH * 0.618 - 40 - 58) * 0.8
      ,

    })

  },

  initCanvas: function () {
    this.data.ctx = wx.createCanvasContext('customCanvas');
    this.data.ctx.beginPath();
    this.data.ctx.setStrokeStyle('#83adf5');
    this.data.ctx.setLineWidth(15);

  },

  //事件监听
  canvasIdErrorCallback: function (event) {
    console.error(event.detail.errMsg);
  },

  canvasStart: function (event) {
    isButtonDown = true;
    this.data.arrz.push(0);
    this.data.arrx.push(event.changedTouches[0].x);
    this.data.arry.push(event.changedTouches[0].y);
  },

  canvasMove: function (event) {

    if (isButtonDown) {
      this.data.arrz.push(1);
      this.data.arrx.push(event.changedTouches[0].x);
      this.data.arry.push(event.changedTouches[0].y);
    };

    for (var i = 0; i < this.data.arrx.length; i++) {
      if (this.data.arrz[i] == 0) {
        this.data.ctx.moveTo(this.data.arrx[i], this.data.arry[i]);
      } else {
        this.data.ctx.lineTo(this.data.arrx[i], this.data.arry[i]);
      };
    };
    this.data.ctx.clearRect(0, 0, this.data.canvasw, this.data.canvash);
    this.data.ctx.setStrokeStyle('#83adf5');
    this.data.ctx.setLineWidth(15);
    this.data.ctx.stroke();
    this.data.ctx.draw(false);
  },

  canvasEnd: function () {
    isButtonDown = false;
  },

  //清除画布
  cleardraw: function () {
    //清除画布
    this.data.arrx = [];
    this.data.arry = [];
    this.data.arrz = [];
    this.data.ctx.clearRect(0, 0, this.data.canvasw, this.data.canvash);
    this.data.ctx.draw(true);


  },
  clearCanvas: function () {
    this.cleardraw();
  }
})