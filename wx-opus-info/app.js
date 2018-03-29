//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    console.info('onLaunch logs', logs);
    var that = this
    var user = wx.getStorageSync('user') || {};
    var userInfo = wx.getStorageSync('userInfo') || {};
    console.log(user)
    if ((!user.openid || (user.expires_in || Date.now()) < (Date.now() + 600)) && (!userInfo.nickName)) {
      this.getmyuserinfo();
    }
  },

  getmyuserinfo: function () {
    var userSystemInfo='';
    wx.getSystemInfo({
      success: function (res) {
        console.log('getSystemInfo', res)
        userSystemInfo = JSON.stringify(res);
      }
    });
    wx.login({
      success: function (res) {
        console.log(res)
        if (res.code) {
          getApp().globalData.logcode = res.code
          wx.getUserInfo({
            success: function (res) {
              var objz = {};
              objz.avatarUrl = res.userInfo.avatarUrl;
              objz.nickName = res.userInfo.nickName;
              wx.setStorageSync('userInfo', objz);//存储userInfo  
              //调用服务存储用户的openid和用户信息
              var sendData = '{ "js_code": "' + getApp().globalData.logcode +
                '","avatarUrl": "' + res.userInfo.avatarUrl +
                '","city": "' + res.userInfo.city +
                '","country": "' + res.userInfo.country +
                '","gender": "' + res.userInfo.gender +
                '","nickName": "' + res.userInfo.nickName +
                '","province": "' + res.userInfo.province +
                '","userSystemInfo": ' + userSystemInfo +
                ' }';
              console.log(sendData)
              wx.request({
                url: 'https://cpross1.duapp.com/weixinsub6GetOpenId',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                method: "POST",
                data: { requestInfo: sendData },
                success: function (res) {
                  console.log(res)
                  var obj = {};
                  obj.openid = res.data.openid ;
                  // if (res.data.openid =='oA5QN0aupBJ-vP_pgz9of6MIaeW0'){
                  //    obj.openid = res.data.openid + 'VIP';
                  // }
                  obj.expires_in = Date.now() + res.data.expires_in;
                  wx.setStorageSync('user', obj);
                }
              })
            },
            fail: function () {
              console.info("授权失败");
              var obj = {};
              obj.openid = '00';
              obj.expires_in = Date.now() ;
              wx.setStorageSync('user', obj);
            }
          });
        } else { 
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  globalData: {
    userInfo: null,
    logcode: '',
  }
})