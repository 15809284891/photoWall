//index.js
var config = require('../../utils/config.js');
var util = require('../../utils/util.js');
var cos = require('../../utils/util.js').getCOSInstance();
var watermerKey = "watermer/watermer.png";
var Base64 = require('../../lib/base64.js').Base64;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [
      '../../src/banner.jpg',
      '../../src/banner1.jpg'
     
    ],
    imageList: [
    ],
    warmerURL:"",
    windowH: 300,
    windowW: 300,
    clickedImageUrl:"",
    ShowMainView: true,
    ShowImageDetailView:false,
 
  },

  onLoad: function (options) {
    var that = this;
    var app = getApp();
    this.setData({
      windowH: app.globalData.WINDOW_HEIGHT,
      windowW:app.globalData.WINDOW_WIDTH
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
   this.handleRefreshData();
  },
  
  /**
   * 小程序跳转
   */
  onHandleOpenMiniEvent:function(e){
    var index = parseInt(e.currentTarget.dataset.index)
    var appID = (index == 0) ? "wx3b953c2fddbd890a" : "wxe2039b83454e49ed"
    wx.navigateToMiniProgram({
      appId: appID
    })
  },

  /**
  *上传文件
  */
  onHandleUploadFileEvent: function () {
    var that = this;
   
  },
  /**
   * 获取照片列表
   */
  handleRefreshData: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载;
    var that = this;
    var imgs = [];
    cos.getBucket({
      Bucket: config.Bucket, /* 必须 */
      Region: config.Region,    /* 必须 */
      Delimiter: '/'

    }, function (err, data) {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      let contents = data.Contents || [];
      if (contents.length) {
        contents.forEach(function (item, index) {
          var prefix = 'https://' + config.Bucket + '.cos.' + config.Region + '.myqcloud.com' + '/' + item.Key;
          //日期格式转换
          let time = util.timestampToString(item.LastModified, 'L');
          var dic = { "ImgUrl": prefix, "Date": time };
          imgs.push(dic)
        });
        that.setData({
          imageList: imgs,
          ShowMainView: true

        });
      } else {
        that.setData({
          ShowMainView: false
        });
      }

    });
  },
 
  /**
    * 删除图片
  */
  hanldeDeleteCurrentFile: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var dic = this.data.imageList[index];
    var that = this;


  },



  /**
  * 点击图片查看大图
  */
  onHandleShowImageDetailEvent:function(e){
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index)
    var dic = this.data.imageList[index];
    var showImageDetail = !that.data.ShowImageDetail;
    this.setData({
      clickedImageUrl: dic.ImgUrl,
      ShowImageDetail: true
    })
    
  },
  /**
   * 
   */
  onHandleHideImageDetail: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index)
    var dic = this.data.imageList[index];
    this.setData({
      clickedImageUrl: "",
      ShowImageDetail: false
    })

  },

  onHandleShowOperationView: function (e) {
    var that = this;

    wx.showActionSheet({
      itemList: ["盲水印", "保存", "删除"],
      itemColor: '#007aff',
      success(res) {
        if (res.tapIndex == 0) {
          that.handleWatermerEvent(e);
        } else if (res.tapIndex == 1) {
          that.handleSaveImage(e)

        } else {
          that.hanldeDeleteCurrentFile(e)
        }
      }
    })
  },

  handleWatermerEvent:function(e){

    var that = this;
    var index = parseInt(e.currentTarget.dataset.index)
    var dic = this.data.imageList[index];
    wx.navigateTo({
        url: "/pages/composeFile/composeFile?ImgUrl=" + dic.ImgUrl

    })  

  },


  handleSaveImage: function (e) {
    util.showLoading("保存中...");
    var index = parseInt(e.currentTarget.dataset.index);
    var dic = this.data.imageList[index];
    var key = util.getUrlRelativePath(dic.ImgUrl);

    wx.downloadFile({
      url: dic.ImgUrl,
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: res => {
            util.showToast("保存成功", true);
          },
          fail: function (err) {
            util.hideLoading();
            if (err.errMsg == "saveImageToPhotosAlbum:fail auth deny") {
              wx.openSetting({
                success(settingData) {
                  if (settingData.authSetting['scope.writePhotosAlbum']) {
                    util.showToast("获取权限成功，请再次点击保存", true);
                  } else {
                    util.showToast("获取权限失败，请授予权限，否则无法保存", false);
                  }
                }
              })
            }
          }
        })
      },
      fail(err) {
        util.showToast("下载失败", false);
      }
    })


  },
  
 
  
  

  onPullDownRefresh:function(){
    this.handleRefreshData();
  },
})







  

