// pages/useraction/useraction.js

function getUserActionData(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || '21340102030405999';
  var itemtimeid = that.data.queryitemid || 0;
  var funoptype = "queryaction";
  var pubOpenId = that.data.pubOpenId || '';
  var sendData =
    '{ "getType": "ItemUserInfo","getPlanId": ""' +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","itemTimeId": ' + itemtimeid +
    ',"queryDay": "' + queryday +
    '","pubOpenId": "' + pubOpenId +
    '"}';
  console.log(sendData)
  wx.request({
    url: 'https://cpross1.duapp.com/weixinsub6TrainPlan',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    data: { requestInfo: sendData },
    success: function (res) {
      console.log(res)
      var dd = res.data.length
      var todos = that.data.todos || [];
      var objectId = that.data.maxobjectId || 0;
      var reoperDate, retimeStamp, regetType, refunOpType;
      var reqItemTimeId = 0;
      var thisId = 0;
      if (dd > 0) {
        for (var i = 0; i < dd; i++) {
          var newarray = {
            reoperDate : res.data[i].operDate,
            retimeStamp : res.data[i].timeStamp,
            regetType : res.data[i].getType,
            refunOpType : res.data[i].funOpType,
            objectId: objectId++,
          };
          todos.push(newarray);
          if (queryday > res.data[i].timeStamp) {
            queryday = res.data[i].timeStamp
          } 
        }
        that.setData({
          todos: todos,
          maxobjectId: objectId,
          queryday: queryday,
        })
      }

      wx.showToast({
        title: '数据查询已完成',
        icon: 'success',
        duration: 1500
      });
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todos:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var pubOpenId = options.pubOpenId || '';
    this.setData({
      pubOpenId: pubOpenId,
    });
    getUserActionData(that);
    return;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    getUserActionData(this)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})