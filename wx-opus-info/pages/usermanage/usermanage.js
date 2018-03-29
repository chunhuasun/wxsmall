// pages/publishinfo/publishinfo.js 

var sliderWidth = 96;

function getUserListData(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || '21340102030405999';
  var itemtimeid = that.data.queryitemid || 0;
  var funoptype = "query";
  var sendData =
    '{ "getType": "ItemUserInfo","getPlanId": ""' +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","itemTimeId": ' + itemtimeid +
    ',"queryDay": "' + queryday +
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
      var taskIcon, content, publishinfo, addtask = '', operDayId, reqOpenId;
      var reqItemTimeId = 0;
      var thisId = 0;
      if (dd > 0) {
        for (var i = 0; i < dd; i++) {
          // taskIcon = res.data[i].avatarUrl;
          // taskIcon = taskIcon.replace(/[\n\r\t\s]+/g, '');
          taskIcon = res.data[i].cosUrl;
          content = res.data[i].nickName + ' ' + res.data[i].userCareDate;
          publishinfo = 'city:' + res.data[i].city + '\n province:' + res.data[i].province + '\n gender:' + res.data[i].gender;
          operDayId = res.data[i].timeStamp;
          reqOpenId = res.data[i].OpenId;

          // if (parseInt(queryday) < parseInt(operDayId)){
          //    queryday = operDayId
          // }
          if (queryday > operDayId) {
            queryday = operDayId
          }

          var newarray = {
            // taskIcon: 'data:image/jpg;base64,' + taskIcon,
            taskIcon: taskIcon,
            content: content,
            publishinfo: publishinfo,
            operDayId: operDayId,
            reqOpenId: reqOpenId,
            objectId: objectId++,
          };
          todos.push(newarray);
          //todos.unshift(newarray);
        }
        that.setData({
          todos: todos,
          maxobjectId: objectId,
          refreshday: operDayId,
          queryday: queryday,
        }) 
      }
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }
  })
}
 
function setallowInfo(thatobj, funoptype, setinfo) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var todos = thatobj.data.todos || [];
  var iteminfo = thatobj.data.iteminfo || '';
  var addtaskId = thatobj.data.todosId;
  var todo = thatobj.data.todos[addtaskId];

  // var commentData = JSON.stringify(todos);
  var commentData = '"' + setinfo + '"';
  var sendData =
    '{ "getType": "ItemUserInfo","getPlanId": ""' +
    ',"getItemId": ""' +
    ',"reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","itemInfo": "' + iteminfo +
    '","pubOpenId": "' + todo.reqOpenId +
    '","SaveDataInfo": ' + commentData +
    ' }';
  console.log(sendData);
  wx.request({
    url: 'https://cpross1.duapp.com/weixinsub6TrainPlan',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    data: { requestInfo: sendData },
    success: function (res) {
      console.log("SaveItemInfo")
      console.log(res)

      thatobj.setData({
        loadhidden: true,
      })

      wx.showToast({
        title: '已完成',
        icon: 'success',
        duration: 1000
      });
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todos: [
      // { taskIcon: '../../images/working/notelist.png', objectId: 1, content: '评价维度管理', url: '../setangle/setangle?pages=setangle&planId=3&planName=评价维度管理', publishinfo: '此需求为客户重点感知问题，总部对省分有考核要求，务必在2017年12月31日前完成，请迪科重视。该需求的cBSS分析说明书见附件，供参考。 二、需求预期目标：a、客户认证： ', addtask: '', addtaskfocu: false },
      // { taskIcon: '../../images/working/anno.png', objectId: 2, content: '词语听写管理', url: '../setword/setword?pages=setword&planId=3&planName=听写词语管理', publishinfo: '此需\n求为', addtask: '', addtaskfocu: false },
      // { taskIcon: '../../images/working/3-2.png', objectId: 3, content: '音乐计时器', url: '../musiclist/musiclist?pages=musiclist&planId=3&planName=音乐计时器', publishinfo: '此需求为客户重点感知问题，总部对省分有考核要求，务必在2017年12月31日前完成，请迪科重视。该需求的cBSS分析说明书见附件，供参考。 二、需求预期目标：a、客户认证： ', addtask: '', addtaskfocu: false },
    ],
    pl_focus: false,
    ly_focus: false,
    inputinfoly: '',
    inputinfopl: '',
    todosId: 0,
    maxobjectId: 0,
    loadhidden: true,

    queryday: '',
    refreshday: '',
    queryitemid: 9999,
    refreshitemid: 9999,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    var mydate = new Date();
    //mydate.setDate(mydate.getDate() -14);
    var year = mydate.getFullYear();
    var month = mydate.getMonth() + 1;
    var date = mydate.getDate();
    if (parseInt(month) < 10) month = '0' + month
    if (parseInt(date) < 10) date = '0' + date
    var dayinfo = year.toString() + month.toString() + date.toString() + '235959' +'999';
    console.log('dayinfo', dayinfo)
    this.setData({
      queryday: dayinfo,
    });

    getUserListData(that);
  },
   

  setallow: function (e) {
    console.log(e);
    var newIndex = this.data.todos;
    var objectId = e.currentTarget.dataset.id;
    //objectId = newIndex.length - 1 - objectId;
    var setinfo = e.currentTarget.dataset.status;
    this.setData({
      todosId: objectId,
    }) 
    setallowInfo(this, 'setallow', setinfo);
  },
  
  setlvl: function (e) {
    console.log(e);
    var newIndex = this.data.todos;
    var objectId = e.currentTarget.dataset.id;
    //objectId = newIndex.length - 1 - objectId;
    var setinfo = e.currentTarget.dataset.status;
    this.setData({
      todosId: objectId,
    })
    setallowInfo(this, 'setlvl', setinfo);
  },

  queaction: function (e) {
    console.log(e);
    var addtaskId = e.currentTarget.dataset.id;
    var todo = this.data.todos[addtaskId];
    wx.navigateTo({
       url: '../useraction/useraction?pages=useraction&pubOpenId=' + todo.reqOpenId 
    })
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    getUserListData(this); 
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    getUserListData(this); 
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})