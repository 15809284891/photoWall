// pages/composeFile.js
var config = require('../../utils/config.js');

var Base64 = require('../../lib/base64.js').Base64;
var util = require('../../utils/util.js');
var cos = require('../../utils/util.js').getCOSInstance();



var ctx =null;

Page({
   
  /**
   * 页面的初始数据
   */
  data: {

    arrx:[],
    arry:[],
    arrz:[],
    showView:true,
    windowH:300,
    windowW: 300,
    ShowWatermerView:false,
    ShowFetchView:false,
    ShowComposeView:false,
    ImgUrl: "",
    WatermarImgUrl:"",
    FetchWatermerURL:"",
    ComposeImageURL:"",
    canvasw:30,
    canvash:30,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    var temp = false;
    this.setData({
      ImgUrl: options.ImgUrl,
      windowH: app.globalData.WINDOW_HEIGHT,
      windowW: app.globalData.WINDOW_WIDTH,
    })

  },
  onHide:function(){
   this.setData({
     ShowComposeView: false,
     ShowWatermerView: false,
     ShowFetchView: false,
   })
  },

  /**
   * 检测盲水印图片在不在
   *    不存在：显示创建盲水印界面
   *    存在：检测图片有没有被打过盲水印
   *        图片被打过盲水印?显示提取:显示合成
   */
  onShow: function () {
    var that = this;
    //检测盲水印在不在
    util.showLoading("检测盲水印...");
    
  },

  /**
  * 检测图片是不是被打过盲水印
  */
  handleDetectWatermer:function(){
    var that = this;
    that.setData({
      ShowWatermerView: false,
      WatermarImgUrl: config.CosHost + config.WatermerKey

    })
  },
  
  /**
   * 合成盲水印
   */
  onHandleEmbedWatermarkEvent: function (watermarKey) {
    util.showLoading("合成中");
    var that  =this;
  },
  
  /**
  *提取盲水印 
  */
  onHandleFetchWatermarEvent:function(){
    util.showLoading("提取中...");
    var that = this;
    
  },
  
  onHandleShowAddWaterViewEvent: function () {
    wx.navigateTo({
      //第一个不能忘 navigateTo:fail url "pages/fileDetail/pages/composeFile/composeFile" is not in app.json
      url: "/pages/watermerFile/watermerFile"

    })
  },


})