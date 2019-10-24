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
    ShowWatermerView:false,//显示创建盲水印页面
    ShowComposeView: false,//显示合成盲水印图片的页面
    ShowFetchView:false,//显示提取页面
   
    ImgUrl: "",//原图的地址
    WatermarImgUrl:"",//嵌入的盲水印的地址
    FetchWatermerURL:"",//从合成图中提取出来的盲水印的地址
    ComposedImageURL:"",//合成图的地址

    canvasw:30,
    canvash:30,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    var temp = false;
    //初始化页面数据
    this.setData({
      ImgUrl: options.ImgUrl,
      windowH: app.globalData.WINDOW_HEIGHT,
      windowW: app.globalData.WINDOW_WIDTH,
    })

  },
  

  onShow: function () {
    var that = this;
    /**检测盲水印是否存在:headObject
     * true:检测图片有没有盲水印
     * false:显示创建盲水印view
     */
    util.showLoading("检测盲水印...");
  
  },
  
  /**
   * 检测图片有没有盲水印
   * >=80:有盲水印、显示提取页面
   * <80:没有盲水印、显示合成页面
   * 规则:`{"rules": [{ "fileid": "/FetchImage/extract-${oringeFilekey}", "rule": "watermark/4/type/2/image/${Base64.encode(config.CiWatermerHttpHost)}" }]}`
   */
  handleDetectWatermer:function(){
    util.showLoading("检测盲水印...");
    var that = this;
    var oringeFilekey = util.getUrlRelativePath(this.data.ImgUrl);
    var composeKey = '/'+oringeFilekey;
    this.setData({
      ShowWatermerView: false,
      WatermarImgUrl: config.CosHost + config.WatermerKey

    });
    
    var url = config.CiV5Host + composeKey + '?image_process';
    
  },
  
  

  /**
  * 合成盲水印
  * success:显示提取盲水印的页面
  * failed:提示错误
  * rule: `{"rules":[{"fileid":"${oringeFilekey}","rule":"watermark/3/type/2/image/${Base64.encode(watermarkUrl)}"}]}`
  */
  onHandleEmbedWatermarkEvent: function (watermarKey) {
    util.showLoading("合成中");
    var that  =this;
    var oringeFilekey = util.getUrlRelativePath(this.data.ImgUrl);
    var watermarkUrl = config.CiWatermerHttpHost;
 
  },
  

  /**
   * 提取盲水印
   * rule :`{"rules":[{"fileid":"/FetchImage/extract-${oringeFilekey}","rule":"watermark/4/type/2/image/${Base64.encode(config.CiWatermerHttpHost)}"}]}`;
   * 提取成功之后更新handleFetchView
   */
  onHandleFetchWatermarEvent:function(){
    util.showLoading("提取中...");
   

  },
  
  
//统一处理盲水印事件
  handleWatermerEvent: function(rule,callback){
   
   
  },

  /**
   * 跳转到盲水印页面
   */
  onHandleShowAddWaterViewEvent: function () {
    wx.navigateTo({
      //第一个不能忘 navigateTo:fail url "pages/fileDetail/pages/composeFile/composeFile" is not in app.json
      url: "/pages/watermerFile/watermerFile"

    })
  },
  handleFetchView:function(){
    this.setData({
      FetchWatermerURL: "https://" + result.ProcessResults.Location,
      showView: false
    })
  },
  handleShowFetchView: function (composeURL) {
    this.setData({
      ShowComposeView: false,
      ShowWatermerView: false,
      ShowFetchView: true,
      ComposedImageURL: composeURL
    })
  },
  handleShowComposeView: function ( watermarImgUrl) {
    this.setData({
      ShowComposeView: true,
      ShowWatermerView: false,
      ShowFetchView: false,
      WatermarImgUrl: watermarImgUrl
    })
  },
  handleShowWatermerView: function () {
    this.setData({
      ShowComposeView: true,
      ShowWatermerView: true,
      ShowFetchView: false,

    })
  },
  onHide: function () {
   this.handleClearView();
  },
  handleClearView:function(){
    this.setData({
      ShowComposeView: false,
      ShowWatermerView: false,
      ShowFetchView: false,
    })
  }
})

