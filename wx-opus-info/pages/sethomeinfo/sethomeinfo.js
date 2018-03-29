// obtainintegral.js
import { $wuxGallery } from '../../components/wux'
var sliderWidth = 96;
var that;
  
function fileSaveCos(fileUrls, fromUser, thatobj, fileidx, funoptype) {
  console.log('fileUrls', fileUrls, 'fromUser', fromUser);
  if (fileUrls.length > fileidx) {
    var fileUrl = fileUrls[fileidx].url;
    wx.uploadFile({
      url: 'https://cpross1.duapp.com/weixinsub6FileSaveCos',
      filePath: fileUrl,
      name: 'send_file',
      method: "POST",
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        fromUser: fromUser,
        tcontent: 'baiduopusAPi'
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode != 200) {
          return 0;
        }
        var result = JSON.parse(res.data);
        var opertype = result.opertype;
        var operinfo = result.operinfo;
        var cosurl = result.cos_url; 
        if (opertype == '1') {
          thatobj.setData({ hidden: true })
          //操作提前结束
          wx.showModal({
            content: operinfo,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          });
        } else {
          var newimage = fileUrls[fileidx];
          newimage.icon = 'icon';
          fileUrls.splice(fileidx, 1, newimage);

          thatobj.setData({  //存储地址信息
            cosimageurls: thatobj.data.cosimageurls.concat(cosurl),
            saveimageurls: fileUrls
          })
          //继续循环调用
          fileidx = parseInt(parseInt(fileidx) + 1);
          if (fileUrls.length > fileidx) {
            fileSaveCos(fileUrls, fromUser, thatobj, fileidx, funoptype)
          } else {
            //存储信息
            saveHomeInfo(thatobj, funoptype)
          }
        }
      },
      fail: function (e) {
        console.log(e);
        return 0;
      },
    })
  }
  console.log('cosimageurls end', thatobj.data.cosimageurls);
  return 1;
}

function saveHomeInfo(thatobj, funoptype) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid; 
  var commentData =
    '{"baseinfo": "' + thatobj.data.baseinfo +  //提示信息
    '","heightscale": "' + thatobj.data.heightscale +  //高宽比例
    '","imagemode": "' + thatobj.data.arraymode[thatobj.data.modeindex] +  //图片类别
    '","cosimageurls": ' + JSON.stringify(thatobj.data.cosimageurls) +  //图片地址信息
    '}'; 
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ""' +
    ',"getItemId": ""' +
    ',"reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","SaveDataInfo": ' + commentData +
    ' }';
  //console.log('saveOpusInfo',sendData);
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
      thatobj.setData({
        loadhidden: true,
        imagechooseflag: true,
        begdisfalg: false,
        hidden: true,
      })

      if (res.data != 'OK') {
        thatobj.showToptips(res.data);
      } else {
        wx.showToast({
          title: '已完成',
          icon: 'success',
          duration: 1000
        });
      }
    }
  })
}

function getHomeInfo(thatobj) {
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
  console.log('saveOpusInfo',sendData);
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

      if (res.data.length>0){
        var baseinfo = res.data[0].baseinfo;
        var heightscale = res.data[0].heightscale*1;
        var modeinfo = res.data[0].imagemode;
        var modeindex = 0;
        if (modeinfo =='aspectFit'){
          modeindex = 1;
        } else if (modeinfo == 'aspectFill') {
          modeindex = 2;
        } else if (modeinfo == 'widthFix') {
          modeindex = 3;
        }

        thatobj.setData({
          baseinfo: baseinfo,
          heightscale: heightscale,
          modeindex: modeindex,
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
    endinfosize:0,//从字符串取值长度
    widthreduce:28, //宽度缩进量，防止溢出

    saveimageurls: [],
    cosimageurls: [],
    heightscale:50,
    swiperboxheight:180,
    boximageheight:160,

    modeindex:0,
    arraymode: ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix'],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取用户信息
    //this.setData({ hidden: !this.data.hidden });
    getHomeInfo(this);
    this.runstart();
    //checkmyuserinfo(this);
  },
   
  changeSwiper: function (e) {
    var index = e.detail.current;
  },

  bindchangemode: function (e) {
    this.setData({
      modeindex: e.detail.value
    })
  },

  bindsetinfo: function (e) {
    this.setData({ hidden: !this.data.hidden });
    fileSaveCos(this.data.saveimageurls, wx.getStorageSync('user').openid, this, 0, 'setHome');
  },

  runstart: function () {
    var vm = this;
    var length = vm.data.baseinfo.length * vm.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth - vm.data.widthreduce;// 屏幕宽度

    //通过屏幕宽度和宽高比例计算实际高度
    var heightscale = Math.floor(vm.data.heightscale * wx.getSystemInfoSync().windowWidth/100) ;
    vm.setData({
      swiperboxheight: heightscale*1+20,
      boximageheight: heightscale,
    });
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
    }else{
      vm.setData({
        messageinfo: vm.data.baseinfo,
      });
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
        var startset = vm.data.startset+1;
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
          marqueeDistance2:0,
          startset: startset,
          endset: endset,
          endinfosize: endinfosize,
        });
 
      }
    }, vm.data.interval);
  },

  bindInputOpus: function (e) {
    console.log(e); 
    var operitem = e.currentTarget.dataset.item;
    if (operitem =='baseinfo'){
      this.setData({
        baseinfo: e.detail.value,
      })
      this.runstart();
    } else if (operitem =='heightscale'){
      //修改宽高比例
      this.setData({
        heightscale: e.detail.value,
      })
      this.runstart();
    }
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

  },
  showGallery(e) {
    const dataset = e.currentTarget.dataset
    const current = dataset.current
    const urls = this.data.saveimageurls

    console.log('dataset', dataset, 'current', current, urls)

    $wuxGallery.show({
      current: current,
      urls: urls,
      [`delete`](current, urls) {
        urls.splice(current, 1)
        this.setData({
          saveimageurls: urls,
        })
        return !0
      },
      cancel: () => console.log('Close gallery')
    })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        //用于展现处理
        var opusArr = [];
        var vmImage = [];
        for (var i = 0; i < res.tempFilePaths.length; i++){
          var newarray = {
            timeStamp: i,
            opusurl: res.tempFilePaths[i],
          };
          opusArr.push(newarray);
          
          newarray = {
            icon: '',
            url: res.tempFilePaths[i],
          };
          vmImage.push(newarray);
        }
        console.log('res.tempFilePaths', res.tempFilePaths)
        that.setData({
          opusArr: opusArr,
          saveimageurls: that.data.saveimageurls.concat(vmImage)
        });
        that.runstart();
      }
    })
  },
  previewImage(e) { 
    const dataset = e.currentTarget.dataset
    const current = dataset.current
    const urls = this.data.saveimageurls
  
    wx.previewImage({
      current: current,   // 当前显示图片的http链接
      urls: urls,         // 需要预览的图片http链接列表
    })
  },
})