// pages/components/waterfall/waterfall.js

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
      var stocklist = that.data.list;
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

            url: res.data[i].opusurl,
            name: res.data[i].opustitle,
          };
          newtodos.push(newarray)
          if (querymaxstamp > res.data[i].timeStamp) {
            querymaxstamp = res.data[i].timeStamp;
          }
        }
        if (querymode == 'new' || querymode == 'search') {
          that.setData({
            todos: [],
            nextshowtoplef: 0,
            nextshowtoprig: 0,
          })
          stocklist = newtodos;
        } else if (querymode == 'more') {
          var stocklistmore = stocklist.concat(newtodos);
          stocklist = stocklistmore;
        }

        //使用动画效果进行插值
        that.setData({
          todosnew: newtodos,
          querymaxstamp: querymaxstamp,
          opusArr: newtodos,
          opusArrVer: newtodos,
          bg: newtodos[0].opusurl,

          list: stocklist,
        })
        //that.setanimation(0);
      } else {
        if (querymode == 'search') {
          //搜索知识点条目
          wx.showToast({
            title: '无相关作品',
            icon: 'success',
            duration: 1000
          });
          that.setData({
            queryputinfo: '',
            inputVal: '',
          });
        }
      }
      //wx.hideNavigationBarLoading() //完成停止加载
      //wx.stopPullDownRefresh() //停止下拉刷新
    }
  })
}

Page({
  data: {
    inputShowed: false,

    list: [
      // {
      //     url: '/images/example0.png',
      //     name: '《火焰》'
      // },
    ],

    descHeight: 30, //图片文字描述的高度
    pageStatus: true,
    nextshowtoplef: 0,//左侧列的顶坐标
    nextshowtoprig: 0,//右侧列的顶坐标
  },
  onLoad: function (options) {
    // var autoheight = 350;
    // var that = this;
    // wx.getSystemInfo({
    //   success: function (res) {
    //     console.log(res, res.windowHeight * 0.75)
    //     that.setData({
    //       autoheight: res.windowHeight * 0.75,
    //     });
    //   }
    // });
    getListData(this, 'queryList', 'new')
  },

  inputSearch: function (e) {
    var inputVal = e.detail.value;
    console.log('inputVal', inputVal);
    this.setData({
      queryputinfo: inputVal
    });
    getListData(this, 'queryList', 'search');
    return;
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

  onShow: function () {
    this.setData({
      list2: this.data.list
    })
  },
  loadImage: function (e) {
    // console.log(e);
    var vm = this;
    // 设备屏幕宽度
    var windowWidth = wx.getSystemInfoSync().windowWidth;
    var index = e.currentTarget.dataset.index;
    var showimage = vm.data.list[index];

    if (showimage.showflag == '1') {
      return;
    }
    showimage.showflag = '1';
    showimage.height = windowWidth / 2 / e.detail.width * e.detail.height;
    //只处理本图片然后记录图片加载后的相关坐标信息 
    var nextshowleftlef = windowWidth * 0.005;         //左侧列的左偏移量
    var nextshowleftrig = windowWidth / 2 - windowWidth * 0.005;     //右侧列的左偏移量
    var nextshowtoplef = vm.data.nextshowtoplef;
    var nextshowtoprig = vm.data.nextshowtoprig;

    //增加宽度图片的双列展现  //暂时设置为宽为高的2倍时候占据双列 后续直接调整倍数即可
    if (e.detail.width > e.detail.height*2) {
      showimage.width = 100;
      showimage.height = windowWidth / 1 / e.detail.width * e.detail.height;
      //使用最高顶为当前的顶
      if (nextshowtoplef > nextshowtoprig) {
        showimage.top = nextshowtoplef;
        showimage.left = nextshowleftlef;
        nextshowtoplef = nextshowtoplef + vm.data.descHeight + showimage.height;
      } else {
        showimage.top = nextshowtoprig;
        showimage.left = nextshowleftlef;
        nextshowtoplef = nextshowtoprig + vm.data.descHeight + showimage.height;
      }
      nextshowtoprig = nextshowtoplef;
    } else {
      showimage.width = 50;
      //先判断展示列位置 左侧列、右侧列
      if (nextshowtoplef - nextshowtoprig > 20) {
        //左侧高于右侧20px 使用右侧展现
        showimage.top = nextshowtoprig;
        showimage.left = nextshowleftrig;
        nextshowtoprig = nextshowtoprig + vm.data.descHeight + showimage.height;
      } else {
        //左侧展现
        showimage.top = nextshowtoplef;
        showimage.left = nextshowleftlef;
        nextshowtoplef = nextshowtoplef + vm.data.descHeight + showimage.height;
      }
    }

    var showlist = vm.data.list;
    showlist.splice(index, 1, showimage)
    vm.setData({
      list: showlist,
      nextshowtoplef: nextshowtoplef,
      nextshowtoprig: nextshowtoprig,
    })
  },
  onReachBottom: function () {
    console.log('onReachBottom');
    var vm = this;
    vm.setData({
      pageStatus: true
    });
    getListData(this, 'queryList', 'more');
    setTimeout(function () {
      vm.setData({
        pageStatus: false
      })
    }, 1500)
  }
})