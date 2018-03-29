// obtainintegral.js
var that;

function checkmyuserinfo(that) {

  var time = setTimeout(function () {
    var user = wx.getStorageSync('user') || {};
    var userInfo = wx.getStorageSync('userInfo') || {};
    console.log(user)
    if ((!user.openid || (user.expires_in || Date.now()) < (Date.now() + 600)) && (!userInfo.nickName)) {
      getApp().getmyuserinfo();
    } else {
      that.setData({
        userInfo: {
          avatarUrl: wx.getStorageSync('userInfo').avatarUrl,
          nickName: wx.getStorageSync('userInfo').nickName,
        }
      })
      return;
    }
  }, 500)
}

function getUserLimit(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || 1;
  var funoptype = "getObtain";
  var sendData =
    '{ "getType": "UserServLimit","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryDay": "' + queryday +
    '"}';
  console.log(sendData)
  var url = 'https://cpross1.duapp.com/weixinsub6TrainPlan';
  //url =  'http://127.0.0.1:8080/sw/weixinsub6TrainPlan';
  wx.request({
    url: url,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    data: { requestInfo: sendData },
    success: function (res) {
      console.log('res', res)
      var dd = res.data.length
      if (dd > 0) {
        var todos = [];
        for (var i = 0; i < dd; i++) {
          var userServInfo = res.data[i].userServInfo;
          todos.push(userServInfo);
        }
        console.log('todos', todos)
        that.setData({
          todos: todos,
          hidden: !that.data.hidden,
        })
        that.mypageheight(that);
      }
    },
    fail: function (res) {
      console.log('fail', res)
    }
  })
}

function getHomeInfo(thatobj, windowWidth) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var funoptype = 'getHome';
  var commentData = '';
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ""' +
    ',"getItemId": ""' +
    ',"reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","SaveDataInfo": "' + commentData +
    '"}';
  console.log('saveOpusInfo', sendData);
  wx.request({
    url: 'https://cpross1.duapp.com/weixinsub6TrainPlan',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    data: { requestInfo: sendData },
    success: function (res) {
      console.log(res)
      console.log(res.data)

      if (res.data.length > 0) {
        var baseinfo = res.data[0].baseinfo;
        var heightscale = res.data[0].heightscale * 1;
        var imagemode = res.data[0].imagemode;

        //通过屏幕宽度和宽高比例计算实际高度
        var imageheight = Math.floor(heightscale * windowWidth / 100);

        thatobj.setData({
          baseinfo: baseinfo,
          heightscale: heightscale,
          swiperboxheight: imageheight * 1 + 20,
          boximageheight: imageheight,
          imagemode: imagemode,
        })

        var cosimageurls = res.data[0].cosimageurls || []
        if (cosimageurls.length > 0) {
          var opusArr = [];
          for (var i = 0; i < cosimageurls.length; i++) {
            var newarray = {
              timeStamp: i,
              opusurl: cosimageurls[i],
            };
            opusArr.push(newarray);
          }
          thatobj.setData({
            opusArr: opusArr,
          })
        }
      }
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    alltodos: [
      { taskIcon: '../../images/working/task.png', objectId: '1', content: '日日评', url: '../planlist/planlist?pages=planlist&planId=3&planName=日常评价' },
      { taskIcon: '../../images/working/note.png', objectId: '2', content: '日日测', url: '../timedetection/timedetection?pages=timedetection&planId=3&planName=日常测试' },
      { taskIcon: '../../images/working/document.png', objectId: '3', content: '日日练', url: '../planpro/planpro?pages=planpro&planId=3&planName=日常训练' },
      { taskIcon: '../../images/working/signin.png', objectId: '4', content: '时时观', url: '../timetraveler/timetraveler?pages=timetraveler' },
    ],
    todos: [],
    // action: { method: 'pause' } ,
    userInfo: {
      avatarUrl: 'http://mycosgz-1253822284.cosgz.myqcloud.com/mycosgz/trainPlan/jpg/back.jpg',
      nickName: '',
    },
    hidden: true,
    dayinfo: '',
    weekinfo: '',


    bg: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180124105739c8.jpg',

    opusArr: [
      { timeStamp: '20180124105748759', opusurl: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180124123130f1.jpg' },
      { timeStamp: '20180124105748769', opusurl: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180124123127a8.jpg' },
      { timeStamp: '20180124105748779', opusurl: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180124111932c9.jpg' },
      { timeStamp: '20180124105748789', opusurl: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180124123134cc.jpg' },
      { timeStamp: '20180124105748799', opusurl: 'http://mycosgz-1253822284.file.myqcloud.com/mycosgz/trainPlan/opusFile/20180130101022f3.jpg' }
    ],

    baseinfoold: '古来画家皆寂寞，忙碌一生收入低。压力累死拉斐尔，列昂纳多爱搅基。米开朗琪颈椎病，梵高享年三十七。----------',
    baseinfo: '古来画家皆寂寞，忙碌一生收入低。压力累死拉斐尔，列昂纳多爱搅基。米开朗琪颈椎病，梵高享年三十七。',
    messageinfo: '',
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marqueeDistance2: 14,
    marquee2copy_status: false,
    marquee2_margin: 40,
    size: 14,
    orientation: 'left',//滚动方向
    interval: 20, // 时间间隔
    startset: 0,  //头部字符位置
    endset: 0,  //尾部字符位置
    showwidth: 0, //显示的长度
    endinfosize: 0,//从字符串取值长度
    widthreduce: 28, //宽度缩进量，防止溢出

    heightscale: 50,
    swiperboxheight: 180,
    boximageheight: 160,
    imagemode: 'aspectFill',
    picbgheight: 320,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var windowWidth = wx.getSystemInfoSync().windowWidth // 屏幕宽度
    getHomeInfo(this, windowWidth);
    //获取用户信息
    this.setData({ hidden: !this.data.hidden });
    this.runstart();
    checkmyuserinfo(this);
    getUserLimit(this);
  },

  changeSwiper: function (e) {
    var index = e.detail.current;
  },

  runstart: function () {
    var vm = this;
    var length = vm.data.baseinfo.length * vm.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth - vm.data.widthreduce;// 屏幕宽度

    //处理内容超长的情况
    if (length > windowWidth) {
      var startset = vm.data.startset;
      var endset = Math.floor(windowWidth / vm.data.size);
      var showinfo = vm.data.baseinfo.substring(startset, endset);
      vm.setData({
        messageinfo: showinfo,
        startset: startset,
        endset: endset,
      });
      length = showinfo.length * vm.data.size;
    }

    vm.setData({
      length: length,
      showwidth: windowWidth,
    });
    //vm.runmessage();//启动滚动
  },

  runmessage: function () {
    var vm = this;
    var interval = setInterval(function () {
      if (-vm.data.marqueeDistance2 < vm.data.size) {
        // 如果文字滚动小于一个字符的长度，继续滚动
        vm.setData({
          marqueeDistance2: vm.data.marqueeDistance2 - vm.data.marqueePace,
        });
      } else {
        //修改内容，去掉首字符，增加尾字符，重置偏移量
        var endset = vm.data.endset;
        var endinfosize = vm.data.endinfosize;
        var showinfo1 = '';
        var showinfo2 = '';
        var showinfo = '';
        var startset = vm.data.startset + 1;
        if (startset < vm.data.baseinfo.length) {
          //头字符还在字符串中
          if (vm.data.baseinfo.length > endset) {
            //尾字符还在字符串中
            endset = endset + 1;
            showinfo = vm.data.baseinfo.substring(startset, endset);
          } else {
            //从字符串入场，需要进行二次拼接
            endinfosize += 1;
            showinfo1 = vm.data.baseinfo.substring(startset, vm.data.baseinfo.length); //主字符串的尾部字符
            showinfo2 = vm.data.baseinfo.substring(0, endinfosize);  //从字符串的头部字符
            showinfo = showinfo1 + showinfo2;
          }
        } else {
          //主字符滚动结束，将从字符串晋升为主字符串
          startset = 0;
          endinfosize = 0;
          endset = Math.floor(vm.data.showwidth / vm.data.size);
          showinfo = vm.data.baseinfo.substring(startset, endset);
        }

        vm.setData({
          messageinfo: showinfo,
          marqueeDistance2: 0,
          startset: startset,
          endset: endset,
          endinfosize: endinfosize,
        });

      }
    }, vm.data.interval);
  },

  runmessageold: function () {
    var vm = this;
    var interval = setInterval(function () {
      if (-vm.data.marqueeDistance2 < vm.data.length) {
        // 如果文字滚动到出现marquee2_margin=30px的白边，就接着显示
        vm.setData({
          marqueeDistance2: vm.data.marqueeDistance2 - vm.data.marqueePace,
          // marquee2copy_status: vm.data.length + vm.data.marqueeDistance2 <= vm.data.windowWidth + vm.data.marquee2_margin,
        });
      } else {
        if (-vm.data.marqueeDistance2 >= vm.data.marquee2_margin) { // 当第二条文字滚动到最左边时
          vm.setData({
            marqueeDistance2: vm.data.marquee2_margin // 直接重新滚动
          });
          clearInterval(interval);
          vm.runmessage();
        } else {
          clearInterval(interval);
          vm.setData({
            marqueeDistance2: -vm.data.windowWidth
          });
          vm.runmessage();
        }
      }
    }, vm.data.interval);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  mypageheight: function (vm) {
    var time = setTimeout(function () {
      console.log('mypageheight')
      var query = wx.createSelectorQuery();
      query.select('#mypage').boundingClientRect()
      query.exec(function (res) {
        //res就是 所有标签为mjltest的元素的信息 的数组
        console.log(res);
        //取高度
        console.log(res[0].height); 
        vm.setData({ 
          picbgheight: res[0].height+10
        });
      })
    }, 500)
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