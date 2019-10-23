const moment = require('../lib/moment.min.js');
var COS = require('../lib/cos-wx-sdk-v5.js');
var CIAuth = require('../lib/cos-auth.js');
//xml解析
var DOMParser = require('../lib/dom-parser.js').DOMParser;
var XMLParser = new DOMParser();
const etagListKey = "etagList";
wx.cloud.init();
function getCOSInstance(){
  
  var cos = new COS({
    getAuthorization: function (options, callback) {
      wx.cloud.callFunction({
        // 云函数名称
        name: 'sts',
        // 传给云函数的参数
        data: {
        },
        complete: res => {
          console.log('callFunction test result: ', res)
          var credential = res.result.credential;

          callback({
            TmpSecretId: credential.credentials.tmpSecretId,
            TmpSecretKey: credential.credentials.tmpSecretKey,
            XCosSecurityToken: credential.credentials.sessionToken,
            ExpiredTime: credential.expiredTime,
            ScopeLimit: true, // 细粒度控制权限需要设为 true，会限制密钥只在相同请求时重复使用

          });
        }
      });
    }
  });
  return cos;
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function showLoading(message) {
  if (wx.showLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else {
    // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }

}


function timestampToString(timestamp) {
  moment.locale('en', {
    longDateFormat: {
      l: "YYYY-MM-DD",
      L: "YYYY-MM-DD HH:mm"
    }
  });
  return moment(timestamp).format('L');
}


function parseExtractBlindWatermarkResponse(response){
  const XMLResponse = XMLParser.parseFromString(response)

  const originalNode = XMLResponse.getElementsByTagName('OriginalInfo')[0]
  const originalKeyNode = originalNode.getElementsByTagName('Key')[0].childNodes[0]
  const originalLocationNode = originalNode.getElementsByTagName('Location')[0].childNodes[0]

  const processResultsNode = XMLResponse.getElementsByTagName('ProcessResults')[0]
  const processObjectNode = processResultsNode.getElementsByTagName('Object')[0]
  const processObjectKeyNode = processObjectNode.getElementsByTagName('Key')[0].childNodes[0]
  const processObjectLocationNode = processObjectNode.getElementsByTagName('Location')[0].childNodes[0]
  const processObjectFormatNode = processObjectNode.getElementsByTagName('Format')[0].childNodes[0]
  const processObjectWidthNode = processObjectNode.getElementsByTagName('Width')[0].childNodes[0]
  const processObjectHeightNode = processObjectNode.getElementsByTagName('Height')[0].childNodes[0]
  const processObjectSizeNode = processObjectNode.getElementsByTagName('Size')[0].childNodes[0]
  const processObjectQualityNode = processObjectNode.getElementsByTagName('Quality')[0].childNodes[0]
  const processObjectWatermarkStatusNode = processObjectNode.getElementsByTagName('WatermarkStatus')[0].childNodes[0]

  return {
    'OriginalInfo': {
      'Key': originalKeyNode.nodeValue,
      'Location': originalLocationNode.nodeValue
    },
    'ProcessResults': {
      'Key': processObjectKeyNode.nodeValue,
      'Location': processObjectLocationNode.nodeValue,
      'Format': processObjectFormatNode.nodeValue,
      'Width': processObjectWidthNode.nodeValue,
      'Height': processObjectHeightNode.nodeValue,
      'Size': processObjectSizeNode.nodeValue,
      'Quality': processObjectQualityNode.nodeValue,
      'WatermarkStatus': processObjectWatermarkStatusNode.nodeValue
    }
  }
}



function  parseEmbedBlindWatermarkResponse(response) {
  var XMLResponse = XMLParser.parseFromString(response);

  var originalNode = XMLResponse.getElementsByTagName('OriginalInfo')[0];
  var originalKeyNode = originalNode.getElementsByTagName('Key')[0].childNodes[0];
  var originalLocationNode = originalNode.getElementsByTagName('Location')[0].childNodes[0];

  var processResultsNode = XMLResponse.getElementsByTagName('ProcessResults')[0];
  var processObjectNode = processResultsNode.getElementsByTagName('Object')[0];
  var processObjectKeyNode = processObjectNode.getElementsByTagName('Key')[0].childNodes[0];
  var processObjectLocationNode = processObjectNode.getElementsByTagName('Location')[0].childNodes[0];
  var processObjectFormatNode = processObjectNode.getElementsByTagName('Format')[0].childNodes[0];
  var processObjectWidthNode = processObjectNode.getElementsByTagName('Width')[0].childNodes[0];
  var processObjectHeightNode = processObjectNode.getElementsByTagName('Height')[0].childNodes[0];
  var processObjectSizeNode = processObjectNode.getElementsByTagName('Size')[0].childNodes[0];
  var processObjectQualityNode = processObjectNode.getElementsByTagName('Quality')[0].childNodes[0];
  

  return {
    'OriginalInfo': {
      'Key': originalKeyNode.nodeValue,
      'Location': originalLocationNode.nodeValue
    },
    'ProcessResults': {
      'Key': processObjectKeyNode.nodeValue,
      'Location': processObjectLocationNode.nodeValue,
      'Format': processObjectFormatNode.nodeValue,
      'Width': processObjectWidthNode.nodeValue,
      'Height': processObjectHeightNode.nodeValue,
      'Size': processObjectSizeNode.nodeValue,
      'Quality': processObjectQualityNode.nodeValue,
    }
  }
}


function getAuthorization(options,callback){
  wx.cloud.callFunction({
    // 云函数名称
    name: 'sts',
    // 传给云函数的参数
    data: {
    },
    complete: res => {
      console.log('callFunction test result: ', res)
      var credential = res.result.credential;

      callback({
        XCosSecurityToken: credential.credentials.sessionToken,
        Authorization: CIAuth({
          SecretId: credential.credentials.tmpSecretId,
          SecretKey: credential.credentials.tmpSecretKey,
          Method: options.Method,
          Pathname: options.Pathname,
        })
      });
    }
  });
}

function getUrlRelativePath(fileURL) {
  var arrUrl = fileURL.split("//");
  var start = arrUrl[1].indexOf("/");
  var relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符

  if (relUrl.indexOf("?") != -1) {
    relUrl = relUrl.split("?")[0];
  }
  return relUrl.substr(1);
}

function saveComposedImage(key,value) {
  var etagsList = wx.getStorageSync(etagListKey)||{};
  etagsList[key]=value;
  console.log("saveComposedImage", etagsList);
  wx.setStorageSync(etagListKey, etagsList);
  console.log("savedComposedImage etagsList", wx.getStorageSync(etagListKey));
}

function getComposedImageWarmerURL(etag) {
  var warmerURL;
  var etagsList = wx.getStorageSync(etagListKey) || {};
  return etagsList['etag'];
}

function showToast(title,status){
  wx.showToast({
    title: title,
    icon: status?'success':'none',
    duration: 2000
  })
}

function post(url,header){
  var promise = new Promise((resolve,reject) => {
    wx.request({
      url: url,
      header:header,
      method:'POST',
      success:function(res){
        hideLoading();
        if(res.statusCode == 200){
          resolve(res);
        }else{
          reject(res.data);
        }
      },
      fail:function(errMsg){
        hideLoading();
        reject(errMsg);
      }
    })
  })
  return promise;
}
function chooseImage(){
  var p = new Promise(function (resolve, reject) {
    wx.chooseImage({
      count: 10,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        resolve(res);
      },
      fail: function (errMsg) {
        reject(errMsg);
      }
    })
  });
  return p;
}

function getImageInfo(filePath) {
  var promise = new Promise(function (resolve, reject) {
    wx.getImageInfo({
      src: filePath,
      success: function (res) {
        if (res.height > 800 && res.width > 800) {
          resolve(res);
        } else {
          showToast("上传的文件宽高应大于800*800", false);
          reject();
        }
      }
    })
  });
  return promise;
}

function getImageInfo(filePath) {
  var promise = new Promise(function (resolve, reject) {
    wx.getImageInfo({
      src: filePath,
      success: function (res) {
        if (res.height > 800 && res.width > 800) {
          resolve(res);
        } else {
          showToast("上传的文件宽高应大于800*800", false);
          reject();
        }
      }
    })
  });
  return promise;
}
function canvasToTempFilePath(canvasID){
  var p = new Promise(function(resolve,reject){
    wx.canvasToTempFilePath({
      canvasId: canvasID,
      destHeight:100,
      destWidth:100,
      fileType:'png',
      success:function(res){
        resolve(res)
      },
      fail:function(err){
        reject(err)
      }
    }, this)
  })
  return p;
}
function downloadFile(url){
  var p = new Promise(function (resolve,reject){
    wx.downloadFile({
      url:url,
      success:function(res){
        resolve(res);
      },
      fail:function(err){
        reject(res)
      }
    })
  })
  return p;
}

function saveImageToPhotosAlbum(path){
  var p = new Promise(function(resolve,reject){
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    })
  })
  return p; 
}

module.exports = {
  formatTime: formatTime,
  getCOSInstance: getCOSInstance,
  showLoading:showLoading,
  hideLoading:hideLoading,
  parseExtractBlindWatermarkResponse: parseExtractBlindWatermarkResponse,
  parseEmbedBlindWatermarkResponse: parseEmbedBlindWatermarkResponse,
  getAuthorization: getAuthorization,
  getUrlRelativePath: getUrlRelativePath,
  saveComposedImage: saveComposedImage,
  getComposedImageWarmerURL: getComposedImageWarmerURL,
  showToast: showToast,
  post:post,
  chooseImage:chooseImage,
  getImageInfo: getImageInfo,
  timestampToString: timestampToString,
  canvasToTempFilePath: canvasToTempFilePath,
  downloadFile:downloadFile,
  saveImageToPhotosAlbum: saveImageToPhotosAlbum
}

