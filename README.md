# photoWall
腾讯云照片墙小程序

> 请各位同学参加微信小程序 workshop（线下/直播）之前务必完成以下开发准备步骤，并将手机电脑充满电哦。



## 开发准备：

### 1. [注册腾讯云账号](https://cloud.tencent.com/register)

> 已注册过腾讯云账号的用户请登陆。
>

### 2. [购买COS 1元新手包](https://cloud.tencent.com/act/pro/cos )

> COS为面向企业的高性能存储，1元新手包方便用户以极低的成本体验COS丰富的功能。
>
> 已购买过COS资源包的用户不可购买COS 1元新手包。

### 3. 申请永久密钥
> 登录控制台->账户->访问管理->API密钥管理->新建密钥
### 4. 创建Bucket
> 对象存储->存储桶列表->创建Bucket->访问权限(公有读私有写)
### 5. 在数据万象控制台绑定Bucket
> 数据万象->Bucket管理->绑定Bucket->绑定已有Bucket
### 6. [下载安装微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html   )
### 7. [GitHub下载照片墙demo](https://github.com/15809284891/photoWall )



## 开发过程：

> 以下内容会现场教学

#### 配置域名:
小程序里请求cos需要登录到[微信公众平台](https://mp.weixin.qq.com/wxamp/devprofile/get_profile?token=196154795&lang=zh_CN)，在”开发”->”开发设置”中，配置域名白名单

> 一个存储桶:可以配置bucket域名作为白名单域名，例如examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com,项目中需要配置的域名如下(request、downloadFile、uploadFile中都要配置):

>>!注意请替换下面exampleBucketName-appId为你自己的bucketname-appId，ap-chengdu修改为bucketname-appId所在的region
>>
>>https://exampleBucketName-appId.cos.ap-chengdu.myqcloud.com
>>
>>https://exampleBucketName-appId.pic.ap-chengdu.myqcloud.com
>>
>>https://exampleBucketName-appId.piccd.myqcloud.com
>
> 多个存储桶：可以选择后缀式请求cos，把bucket放在pathname中请求，这种方式需要配置地域域名作为白名单，例如cos.ap-guangzhou.myqcloud.com
#### 访问控制权限
  Bucket是公有读私有写的，意味着我们在上传文件的时候要携带签名：签名的计算需要密钥的参与，为了安全起见，签名使用临时密钥，获取临时密钥需要我们使用固定密钥向sts服务发个请求来获取,我们可以可以利用云函数的功能，将永久密钥配置在云函数的环境变量中
  - 控制台开通云函数
  -	新建文件夹functions
  - Project.config.json中配置:"cloudfunctionRoot": "functions/"
  - 新建函数sts:
  - 在云开发控制台给云函数配置环境变量secretKey、secretId
  - json 中添加如下代码
  ```
  "dependencies": {    
  "qcloud-cos-sts": "^3.0.2",
   "wx-server-sdk": "^0.8.1"
 }
  ```
  - 编写云函数:

```
  cloud.init()
// 云函数入口函数
  exports.main = async (event, context) => new Promise((resolve, reject) => {
    const wxContext = cloud.getWXContext()
    const cosOptions = {
      secretId: process.env.secretId,
      secretKey: process.env.secretKey,
      bucket: 'karisphotos-1253653367',
      region: 'ap-chengdu',
      policy: {
        'version': '2.0',
        'statement': [{
          'action': [
            "name/cos:GetBucket",
            "name/cos:PutObject",
            "name/cos:PostObject",
            "name/cos:DeleteObject",
            "name/cos:HeadObject",
            "name/cos:GetObject",
            ],
            'effect': 'allow',
            'principal': { 'qcs': ['*'] },
            'resource': [
            'qcs::cos:ap-chengdu:uid/1253653367:prefix//1253653367/karisphotos/*',
            ],
        }]
      }
    }

```
  - 获取临时密钥

  ```
  const sts = require('qcloud-cos-sts');
  sts.getCredential({
    secretId: cosOptions.secretId,
    secretKey: cosOptions.secretKey,
    policy: cosOptions.policy,
    durationSeconds: 3600
  }, function (err, credential) {
    if (err) {
      console.error(err)
      resolve({
        event,
        err
      })
    } else {
      console.log(credential)
      resolve({
        event,
        credential
      })
    }
  })
  ```

  - 上传并部署云端依赖

  ### 接口文档
  - [提取盲水印](https://cloud.tencent.com/document/product/460/19017#.E6.8F.90.E5.8F.96.E7.9B.B2.E6.B0.B4.E5.8D.B0):
    Pic-Operations:`{"rules":[{"fileid":"/FetchImage/extract-${oringeFilekey}","rule":"watermark/4/type/2/image/${Base64.encode(config.CiWatermerHttpHost)}"}]}`
  - [合成盲水印](https://cloud.tencent.com/document/product/460/18147):
      Pic-Operations:`{"rules":[{"fileid":"${oringeFilekey}","rule":"watermark/3/type/2/image/${Base64.encode(watermarkUrl)}"}]}`
