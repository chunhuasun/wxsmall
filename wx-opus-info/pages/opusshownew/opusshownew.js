// pages/opusshownew/opusshownew.js

function getListData(that, funoptype, querymode) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || 1;
  var querystamp = '';
  if (querymode == 'more') {
    querystamp = that.data.querymaxstamp || '';
  }
  var queryinfo = that.data.queryputinfo || '';
  // var funoptype = "queryList";
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryinfo": "' + queryinfo +
    '","queryDay": "' + queryday +
    '","querystamp": "' + querystamp +
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
      var newtodos = [];
      if (dd > 0) {
        var querymaxstamp = res.data[0].timeStamp;
        for (var i = 0; i < dd; i++) {
          var todos = res.data[i]
          var newarray = {
            objectId: i + 1,
            content: res.data[i].opustitle + ' (' + res.data[i].opusauthor + ':' + res.data[i].opusdate + ')',
            timestamp: res.data[i].timeStamp,
            animationData: '',
            opusurl: res.data[i].opusurl,
            opustitle: res.data[i].opustitle,
            opusdepict: res.data[i].opusdepict, 

          };
          newtodos.push(newarray)
          if (querymaxstamp > res.data[i].timeStamp) {
            querymaxstamp = res.data[i].timeStamp;
          }
        }
        if (querymode == 'new') {
          that.setData({
            todos: [],
          })
        }
        //使用动画效果进行插值
        that.setData({
          todosnew: newtodos,
          querymaxstamp: querymaxstamp,
          opusArr: newtodos,
          opusArrVer: newtodos,
          bg: newtodos[0].opusurl
        }) 
        //that.setanimation(0);
      }
      //wx.hideNavigationBarLoading() //完成停止加载
      //wx.stopPullDownRefresh() //停止下拉刷新
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  
  data: {
    title: '作品展示',
    loading: false,
    loadtxt: '正在加载',
    bg: '',
    opusArr: [],
    inputShowed: false,
    autoheight:400,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var autoheight = 350;
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res, res.windowHeight * 0.75)
        that.setData({
          autoheight: res.windowHeight * 0.75,
        });
      }
    });
    getListData(this, 'queryList', 'new')
  },
  
  inputSearch: function (e) {
    var inputVal = e.detail.value;
    console.log('inputVal', inputVal);
    this.setData({
      queryputinfo: inputVal
    });
    getListData(this, 'queryList', 'new');
    return;
    //搜索知识点条目
    wx.showToast({
      title: '已完成',
      icon: 'success',
      duration: 1000
    });
  },

  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },

  changeSwiper: function (e) { 
    var index = e.detail.current; 
    this.setData({
      bg: this.data.opusArr[index].opusurl
    })
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})