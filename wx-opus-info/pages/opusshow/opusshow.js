// pages/timetraveler/timetraveler.js
import { $wuxButton } from '../../components/wux'

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
    url: 'https://cpross1.duapp.com/weixinsub4TrainPlan',
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
          };
          newtodos.push(newarray)
          if (querymaxstamp > res.data[i].timeStamp){
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
        })
        that.setanimation(0);
      }
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todos: [
      // { done: 'success_circle', objectId: '109', content: '数的认识', animationData: '' },
      // { done: 'circle', objectId: '2', content: '数的运算',animationData: '' },
      // { done: '', objectId: '3', content: '度量衡',animationData: '' },
      // { done: '', objectId: '4', content: '空间几何',animationData: '' },
      // { done: 'success_circle', objectId: '5', content: '数的应用',animationData: '' },
    ],
    planName: '日期列表',
    planId: '0',
    queryday: '',
    showdate: '',
    showdateend: '',

    inputShowed: false,
    inputVal: '',
    queryputinfo: '',
    querymaxstamp: '',
    type: 'table', 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.initButton()
    //查询分类汇总信息
    getListData(this, 'queryList', 'new')
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

  pagereback: function (optype) {
    console.log('pagereback', optype)
    // getListData(this);
  },


  bindDateChange: function (e) {
    var showdate = e.detail.value
    var year = showdate.substring(0, 4)
    var month = showdate.substring(5, 7)
    var date = showdate.substring(8, 10)
    var queryday = year.toString() + month.toString() + date.toString()

    this.setData({
      showdate: showdate,
      queryday: queryday
    })
    console.log(year, month, date, showdate, queryday)
    // getListData(this);
  },

  initButton(position = 'bottomRight') {
    var that = this
    this.button = $wuxButton.init('br', {
      position: position,
      buttons: [{
        label: '添加知识',
        icon: "../../images/working/signin.png",
      },
      ],
      buttonClicked(index, item) {
        console.log('index', index)
        if (index == 0) {
          that.toknowinfo();
        }
        return true
      },
      callback(vm, opened) {
        console.log('callback', vm)
      },
    })
  },

  modSwitch(e) {
    this.setData({
      type: e.currentTarget.dataset.type,
      todos: [],
    })
    if (e.currentTarget.dataset.type =='table'){
      this.setanimation(0);
    }else{
      this.setanimation2(0);
    }
  },

  toknowinfo: function () {
    wx.navigateTo({
      url: '../knowinfo/knowinfo?pages=knowinfo'
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    getListData(this, 'queryList', 'more');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    getListData(this, 'queryList', 'more');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  jumpToPage: function (e) {
    var timestamp = e.target.dataset.timestamp; 
    var objectId = e.target.dataset.id; 
    wx.navigateTo({
      url: '../opusshowinfo/opusshowinfo?pages=opusshowinfo&timestamp=' + timestamp + '&opusid=' + objectId
    })
    return;
    // var todos = this.data.todos || [];
    // for (var i = 0; i < todos.length; i++) {
    //   this.jumpaction(i);
    // }
  },

  opusinfocallback: function (callbackid, timestamp) {
    console.log('opusinfocallback pagereback', callbackid)
    if (callbackid>0){
       //删除数组中的元素
       //删除展现数组
       var todos = this.data.todos || [];
       if (callbackid-1 > todos.length ) {
          return;
       }
       var todo = todos[callbackid - 1];
       if (todo.timestamp == timestamp){
        todos.splice(callbackid - 1,1);
         this.setData({
           todos: todos,
         })
       }
 
       //删除动画数组
      var todosquery = this.data.todosnew || [];
      if (callbackid - 1 > todosquery.length) {
        return;
      }
      var todoqry = todosquery[callbackid - 1];
      if (todoqry.timestamp == timestamp) {
        todosquery.splice(callbackid - 1, 1);
        this.setData({
          todosnew: todosquery,
        })
      }
       
    } 
  },

  /**设置动画效果 */
  setanimation: function (objectId) {
    //获取查询出来的数据
    var todosquery = this.data.todosnew || [];
    if (objectId > todosquery.length - 1) {  //全部数据都已经插入展现数组中
      return;
    }
    var todos = this.data.todos || [];
    var animation = wx.createAnimation({
      duration: 250,  //动画时长  
      timingFunction: "ease-in-out",   //线性  
      delay: 0,  //0则不延迟  
      // success: this.jumpaction(objectId+1),
    })
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;
    // animation.translateY(300).step();
    // 第3步：执行第一组动画  
    //animation.translateX(-100).step().opacity(1).translateX(0).step();
    animation.translateX(-100).step(); 

    var newtodo;
    newtodo = todosquery[objectId];
    newtodo.objectId = todos.length + 1;
    //console.log('newtodo', newtodo, todos);
    todos.push(newtodo);
    for (var i = 0; i < todos.length; i++) {
      newtodo = todos[i];
      newtodo.animationData = '';
      todos.splice(i, 1, newtodo);
    }
    this.setData({
      todos: todos,
    })

    newtodo = todos[todos.length - 1];
    newtodo.animationData = animation.export();
    todos.splice(todos.length - 1, 1, newtodo);

    this.setData({
      todos: todos,
    })
    setTimeout(() => {
      animation.opacity(1).translateX(0).step();
      newtodo.animationData = animation.export();
      todos.splice(todos.length - 1, 1, newtodo);
      this.setData({
        todos: todos,
      })
    }, 300)
    setTimeout(() => {
      this.setanimation(objectId + 1)
    }, 600)
  },
  
  /**设置动画效果 */
  setanimation2: function (objectId) {
    //获取查询出来的数据
    var todosquery = this.data.todosnew || [];
    if (objectId > todosquery.length - 1) {  //全部数据都已经插入展现数组中
      return;
    }
    var todos = this.data.todos || [];
    var animation = wx.createAnimation({
      duration: 250,  //动画时长  
      timingFunction: "ease-in-out",   //线性  
      delay: 0,  //0则不延迟  
      // success: this.jumpaction(objectId+1),
      transformOrigin: '0% 0%'
    })
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;
    // animation.translateY(300).step();
    // 第3步：执行第一组动画  
    //animation.translateX(-100).step().opacity(1).translateX(0).step();
    // animation.translateX(-100).step();

    animation.rotateY(90).step();

    var newtodo;
    newtodo = todosquery[objectId];
    newtodo.objectId = todos.length + 1;
    //console.log('newtodo', newtodo, todos);
    todos.push(newtodo);
    for (var i = 0; i < todos.length; i++) {
      newtodo = todos[i];
      newtodo.animationData = '';
      todos.splice(i, 1, newtodo);
    }
    this.setData({
      todos: todos,
    })

    newtodo = todos[todos.length - 1];
    newtodo.animationData = animation.export();
    todos.splice(todos.length - 1, 1, newtodo);

    this.setData({
      todos: todos,
    })
    setTimeout(() => {
      //animation.opacity(1).translateX(0).step();

      animation.opacity(1).rotateY(0).step();

      newtodo.animationData = animation.export();
      todos.splice(todos.length - 1, 1, newtodo);
      this.setData({
        todos: todos,
      })
    }, 300)
    setTimeout(() => {
      this.setanimation2(objectId + 1)
    }, 600)
  },

  /*
  jumpaction: function (objectId) {
      //var objectId = e.target.dataset.id - 1;
      var todos = this.data.todos || [];
      if (objectId > todos.length){
         return;
      }
      console.log('jumpToPage', objectId)
      var animation = wx.createAnimation({
        duration: 200,  //动画时长
        timingFunction: "linear",   //线性
        delay: 100,  //0则不延迟
        // success: this.jumpaction(objectId+1),
      })
      // 第2步：这个动画实例赋给当前的动画实例
      this.animation = animation;
      // animation.translateY(300).step();
      // 第3步：执行第一组动画
      animation.opacity(0).translateX(-100).step().opacity(1).translateX(0).step();
  
      var newtodo;
      for (var i = 0; i < todos.length; i++) {
        newtodo = todos[i];
        if (i == objectId) {
          newtodo.animationData = animation.export();
        } else {
          newtodo.animationData = '';
        }
        todos.splice(i, 1, newtodo);
      }
      this.setData({
        todos: todos,
      })
  
      setTimeout(() => {
        this.jumpaction(objectId + 1)
      }, 500)
    },
  
    jumpaction: function (objectId) { 
      //var objectId = e.target.dataset.id - 1;
      var todos = this.data.todos || [];
      console.log('jumpToPage', objectId) 
      var animation = wx.createAnimation({
        duration: 200,  //动画时长  
        timingFunction: "linear",   //线性  
        delay: 100,  //0则不延迟  
      })
      // 第2步：这个动画实例赋给当前的动画实例  
      this.animation = animation;
      // animation.translateY(300).step();
      // 第3步：执行第一组动画  
      animation.opacity(0).translateX(-100).step().opacity(1).translateX(0).step();
       
      var newtodo;
      for (var i = 0; i < todos.length; i++) {
        newtodo = todos[i];
        if (i == objectId) {
          newtodo.animationData = animation.export();
        } else {
          newtodo.animationData = '';
        }
        todos.splice(i, 1, newtodo);
      }
      this.setData({
        todos: todos,
      })
    },
  */
})