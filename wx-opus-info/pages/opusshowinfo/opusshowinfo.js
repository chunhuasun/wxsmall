// pages/timerecord/timerecord.js
import { $wuxGallery } from '../../components/wux'
import { $wuxDialog } from '../../components/wux'
import { $wuxToptips } from '../../components/wux'

var sliderWidth = 96;

function getUserToken(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId;
  var sendData = '{"fromUser": "' + openid + '" }';
  wx.request({
    url: 'https://cpross1.duapp.com/weixinsub6GetBaiduToken',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: "POST",
    data: { requestInfo: sendData },
    success: function (res) {
      console.log(res)
      var dd = res.data.length
      if (dd > 0) {
        that.setData({
          accessToken: res.data,
        });
      }
    }
  })
}
 
function getListData(that, funoptype, querystamp) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || 1; 
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryinfo": "'+
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
      var opusinfo = that.data.opusinfo || [];
      if (dd > 0) {
        //拼装结构体
        var newarray = {
          opustitle: res.data[0].opustitle,
          opusurl: res.data[0].opusurl,
          objectId: opusinfo.length + 1,
          opusauthor: res.data[0].opusauthor.substring(0, 10).replace(new RegExp('↓', 'g'), ''),
          opusdate: res.data[0].opusdate,
          opusdepict: res.data[0].opusdepict.substring(10, 40).replace(new RegExp('↓', 'g'), '\r\n'),
          opustype: '',
        };
        opusinfo.push(newarray); 
        that.setData({  //存储信息
          opusinfo: opusinfo,
          timestamp: querystamp,
        })
        getCommentData(that, 'queryComment',0);
      }
    }
  })
}

function savePublishInfo(that, funoptype, pubinfo) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var reqItemTimeId = that.data.reqItemTimeId || 1;
  var publishId = that.data.publishId || 0; 
  var querystamp = that.data.timestamp || '';
  var commentData = '"' + pubinfo + '"';
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryinfo": "' +
    '","reqItemTimeId": "' + reqItemTimeId +
    '","publishId": "' + publishId +
    '","querystamp": "' + querystamp +
    '","SaveDataInfo": ' + commentData +
    '}';
  console.log(sendData) 
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
      console.log(res.data)
      that.setData({
        loadhidden: true,
        showModalStatus: false,
        inputinfoly: '',
        showplModalStatus: false,
        inputinfopl: '',
      })
      if (res.data != 'OK') {
        that.showToptips(res.data);
      } else {
        wx.showToast({
          title: '已完成',
          icon: 'success',
          duration: 1000
        });
        if (funoptype =='killopus'){
          returnPrevPage(that);
        }else{
          getCommentData(that, 'queryComment', 0);
        }
      }
    }
  })
}

function getCommentData(that, funoptype, querymaxid) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var querystamp = that.data.timestamp || '';
  // var querymaxid = that.data.querymaxid || 0;
  var sendData =
    '{ "getType": "ItemOpusInfo","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryinfo": "' +
    '","querystamp": "' + querystamp +
    '","querymaxid": "' + querymaxid +
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
      console.log('getCommentData',res)
      var dd = res.data.length
      var todos = [];
      if (querymaxid>0){
        todos = that.data.todos || [];
      }
      var objectId = 0;
      
      var taskIcon, content, publishinfo, addtask = [], operDayId, reqOpenId, pubStamp;
      var reqItemTimeId = 0;
      var thisId = 0;
      if (dd > 0) {
        for (var i = 0; i < dd; i++) {
          if (res.data[i].pubFlag == 'publish') {
            if (reqItemTimeId == 0 || reqItemTimeId == res.data[i].reqItemTimeId) {
              reqItemTimeId = res.data[i].reqItemTimeId;
              taskIcon = res.data[i].pubAvatarUrl;
              taskIcon = taskIcon.replace(/[\n\r\t\s]+/g, '');
              content = res.data[i].pubNickName + ' ' + res.data[i].operDay;
              publishinfo = res.data[i].publishInfo;
              publishinfo = publishinfo.replace(new RegExp('↓', 'g'), '\n');
              addtask = [];
              operDayId = res.data[i].operDayId;
              reqOpenId = res.data[i].reqOpenId;
              pubStamp = res.data[i].timeStamp;
            } else {
              //存储之前的信息 
              var newarray = {
                //taskIcon: 'data:image/jpg;base64,' + taskIcon,
                taskIcon: taskIcon,
                content: content,
                publishinfo: publishinfo,
                addtask: addtask,
                operDayId: operDayId,
                reqOpenId: reqOpenId,
                reqItemTimeId: reqItemTimeId,
                objectId: objectId++,
                pubStamp: pubStamp,
              };
              if (querymaxid > reqItemTimeId || querymaxid==0){
                querymaxid = reqItemTimeId;
              }
              todos.push(newarray);
              //todos.unshift(newarray);
              reqItemTimeId = res.data[i].reqItemTimeId;

              taskIcon = res.data[i].pubAvatarUrl;
              taskIcon = taskIcon.replace(/[\n\r\t\s]+/g, '');
              content = res.data[i].pubNickName + ' ' + res.data[i].operDay;
              publishinfo = res.data[i].publishInfo;
              publishinfo = publishinfo.replace(new RegExp('↓', 'g'), '\n');
              addtask = [];
              operDayId = res.data[i].operDayId;
              reqOpenId = res.data[i].reqOpenId;
              pubStamp = res.data[i].timeStamp;
            }
          } else {
            //addtask += res.data[i].pubNickName + '：' + res.data[i].publishInfo.replace(new RegExp('↓', 'g'), '\n') + '\n';
            var newtask = {
              taskinfo: res.data[i].pubNickName + '：' + res.data[i].publishInfo.replace(new RegExp('↓', 'g'), '\n') ,
              taskStamp: res.data[i].timeStamp,
            };
            addtask.push(newtask);
          }
        }
        var newarray = {
          taskIcon: taskIcon,
          content: content,
          publishinfo: publishinfo,
          addtask: addtask,
          operDayId: operDayId,
          reqOpenId: reqOpenId,
          reqItemTimeId: reqItemTimeId,
          objectId: objectId++,
          pubStamp: pubStamp,
        };
        if (querymaxid > reqItemTimeId || querymaxid == 0) {
          querymaxid = reqItemTimeId;
        }
        todos.push(newarray);
        //todos.unshift(newarray);
        console.log('todos', todos)
        that.setData({
          todos: todos,
          maxobjectId: objectId,
          refreshday: operDayId,
          refreshitemid: reqItemTimeId,
          querymaxid: querymaxid,
        })
      }
    }
  })
}

function returnPrevPage(that) {
  var pages = getCurrentPages()
  var prevPage = pages[pages.length - 2]  //上一个页面 
  var opusId = that.data.opusId || 0;
  var timestamp = that.data.timestamp || '';
  prevPage.opusinfocallback(opusId, timestamp);
  wx.navigateBack({
    delta: 1
  })
}

Page({
  data: {
    starttime: '',
    endtime: '',
    costtime: '0',
    degrees: ["重要", "一般", "舍弃"],
    degreeIndex: 0,
    optypes: ["学习", "生活", "娱乐"],
    optypeIndex: 0,

    itemtitletype: '未分类',
    itemtitle: '',
    iteminfo: '',
    itemaddinfo: '',
    saveimageurls: [],
    cosimageurls: [],

    itemtimeid: 0,
    plInputInfo: '请输入文本',
    planId: 1,
    itemId: 0,
    queryday: '',
    showDayInfo: '记录日期',

    begdisfalg: false,
    enddisfalg: false,
    loadhidden: true,
    iteminfoinput: true,

    titletabs: [
      // "学习", "生活", "娱乐"
    ],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    xxitemtitles: ['学习'],
    shitemtitles: ['生活'],
    ylitemtitles: ['娱乐'],

    typetabs: ["扬长/精华", "避短/糟粕"],
    activeplIndex: 0,
    sliderplOffset: 0,
    sliderplLeft: 0,
    keepangle: [],
    throwangle: [],
    scoreinfo: '评价积分',
    scoretimeinfo: '评价时间',

    readinfo: '',
    accessToken: '',
 
    opusinfo: [
      // {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.6802a99e5e2a9e3b0f114ea0cc21888b.jpg', objectId: 1, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // }, {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.1bf9678f4cccea4ac298573102a066f8.jpg', objectId: 2, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // }, {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.a12ab4eedb69ea182b0d89af169bfc76.jpg', objectId: 3, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // },
    ],
    inputinfoly: '',
    inputinfopl: '',
    timestamp:'',
    todosId: 0,
    publishId:0,
    opusId:0,

  },
  bindimagesave: function () {
    var that = this;
    this.setData({
      begdisfalg: true,
      loadhidden: false,
    })
    console.log('bindimagesave');
    if (this.data.saveimageurls.length > 0) {
      fileSaveCos(this.data.saveimageurls, wx.getStorageSync('user').openid, this, 0, 'begin');
    } else {
      this.showToptips('先选择作品才能上传');
      this.setData({
        begdisfalg: false,
        loadhidden: true,
      }) 
      // this.setData({
      //   imagechooseflag: false,
      // })
      return;
    }
    return;
  },

  bindtapappear: function (e) {
    var that = this;
    this.setData({
      enddisfalg: true,
      loadhidden: false,
    })
    console.log('bindtapappear');
    saveOpusInfo(that, 'opusappear');
    return;
  },


  showToptips(error) {
    const hideToptips = $wuxToptips.show({
      timer: 2000,
      text: error || '请填写正确的字段',
      success: () => console.log('toptips', error)
    })
  },
  bindtapend: function () {
    var that = this;
    var itemtitle = this.data.itemtitle || '';
    var iteminfo = this.data.iteminfo || '';

    if (itemtitle.length < 1) {
      this.showToptips('知识点简称还未填写');
      return;
    }
    if (iteminfo.length < 1) {
      this.showToptips('知识点详细描述还未填写');
      return;
    }
    this.setData({
      begdisfalg: true,
      enddisfalg: true,
      loadhidden: false,
    })
    console.log('bindtapend');
    if (this.data.saveimageurls.length > 0) {
      fileSaveCos(this.data.saveimageurls, wx.getStorageSync('user').openid, this, 0, 'end');
    } else {
      saveCordInfo(this, 'new');
    }
    return;
  },

  bindQueryHistory: function () {
    var that = this;
    console.log('bindQueryHistory');
    var itemtimeid = this.data.itemtimeid || 0;
    var queryday = this.data.queryday || 0;
    if (itemtimeid != 0) {
      wx.navigateTo({
        url: '../hischarts/hischarts?pages=hischarts&itemId=' + itemtimeid + '&queryday=' + queryday
      })
    } else {
      wx.showModal({
        content: '无法查询到历史记录',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      });
    }

    return;
  },

  bindInputOpus: function (e) {
    console.log(e);
    var newopusinfo = this.data.opusinfo;
    var objectId = e.currentTarget.dataset.id - 1;
    var newopus = newopusinfo[objectId];
    var opusitem = e.currentTarget.dataset.item;
    var newvalue = e.detail.value;
    newvalue = newvalue.replace(/[\n\r\t\s]+/g, '↓');
    newopus[opusitem] = newvalue;   //使用 newopus.opusitem opusitem被当作常量KEY, newopus[opusitem] opusitem视为变量 他的值才是KEY。
    //如果修改的为第一条则直接替换后续的所有内容
    if (objectId == 0 && opusitem != 'opusauthor') {
      for (var i = 0; i < newopusinfo.length; i++) {
        newopus = newopusinfo[i];
        newopus[opusitem] = newvalue;
        newopusinfo.splice(i, 1, newopus);
      }
    } else {
      newopusinfo.splice(objectId, 1, newopus)
    }
    this.setData({
      opusinfo: newopusinfo,
    })
  },


  bindSelectTitle: function (e) {
    console.log('bindSelectTitle', this.data.begdisfalg);
    if (this.data.begdisfalg == true) {
      return;
    }
    const that = this
    $wuxDialog.prompt({
      title: '类别名称',
      content: ' ',
      fieldtype: 'text',
      password: 0,
      defaultText: '',
      placeholder: '请输入简短说明',
      maxlength: 16,
      onConfirm(e) {
        const value = that.data.$wux.dialog.prompt.response
        that.setData({
          itemtitle: value,
        })
      },
    })
  },

  bindInputInfo: function (e) {
    this.setData({
      iteminfo: e.detail.value,
    })
  },

  bindInputAddInfo: function (e) {
    this.setData({
      itemaddinfo: e.detail.value,
    })
  },

  readtext: function (e) {
    console.log(e.currentTarget.dataset.status);
    var itemname = this.data.iteminfo;
    if (e.currentTarget.dataset.status == 2) {
      itemname = this.data.itemaddinfo;
    }

    this.setData({
      readinfo: itemname,
    });
    this.getsound();
  },
  getsound: function (e) {
    var itemname = this.data.readinfo;
    var readinfo = '';
    if (itemname.length > 400) {
      readinfo = itemname.substring(400);
      itemname = itemname.substring(0, 400);
    }
    this.setData({
      readinfo: readinfo,
    });
    console.log(itemname);
    var audioSrc = 'http://mycosgz-1253822284.cosgz.myqcloud.com/mycosgz/trainPlan/void/lady%20read%20go.mp3';

    var user = wx.getStorageSync('user') || {};
    var openid = user.openid;
    var accessToken = this.data.accessToken;
    var playSpd = '5';
    var Area_b_text = encodeURI(encodeURI(itemname));   //强制转码
    itemname = Area_b_text;

    //拼接百度语音合成API地址信息
    var tsnBaiduUrl = "http://tsn.baidu.com/text2audio?";
    tsnBaiduUrl += "spd=" + playSpd;          //spd 选填 语速，取值0-9，默认为5中语速 
    tsnBaiduUrl += "&tex=" + itemname;     //tex 必填 合成的文本，使用UTF-8编码，请注意文本长度必须小于1024字节 
    tsnBaiduUrl += "&lan=zh";               //lan 必填 语言选择,填写zh 
    tsnBaiduUrl += "&cuid=" + openid;       //cuid 必填 用户唯一标识，用来区分用户，填写机器 MAC 地址或 IMEI 码，长度为60以内 
    tsnBaiduUrl += "&ctp=1";                //客户端类型选择，web端填写1
    tsnBaiduUrl += "&vol=9";                //音量，取值0-9，默认为5中音量
    tsnBaiduUrl += "&tok=" + accessToken;     //tok 必填 开放平台获取到的开发者access_token  
    //pit 选填 音调，取值0-9，默认为5中语调 
    //per 选填 发音人选择，取值0-1, 0为女声，1为男声，默认为女声  
    audioSrc = tsnBaiduUrl;  //播放源  
    // console.log(audioSrc); 
    this.setData({
      audioSrc: audioSrc,
    });
    this.setData({
      action: { method: 'play' },
    });
  },
  audioended: function (e) {
    this.setData({
      audioSrc: '',
    });
    var itemname = this.data.iteminfo;
    if (itemname.length > 390) {
      this.getsound();
    }
  },
 

  bindDegreeChange: function (e) {
    console.log('picker degreeIndex 发生选择改变，携带值为', e.detail.value);

    this.setData({
      degreeIndex: e.detail.value
    })
  },
  bindOptypeChange: function (e) {
    console.log('picker optypeIndex 发生选择改变，携带值为', e.detail.value);

    this.setData({
      optypeIndex: e.detail.value
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  tabplClick: function (e) {
    this.setData({
      sliderplOffset: e.currentTarget.offsetLeft,
      activeplIndex: e.currentTarget.id
    });
  },
  setitemtitle: function (e) {
    console.log(e);
    console.log(e.currentTarget.dataset.name);
    this.setData({
      showModalStatus: false,
      itemtitletype: e.currentTarget.dataset.name,
    })
  },  

  additem: function (e) {
    const that = this
    $wuxDialog.prompt({
      title: '项目名称',
      content: ' ',
      fieldtype: 'text',
      password: 0,
      defaultText: '',
      placeholder: '请输入简短说明',
      maxlength: 16,
      onConfirm(e) {
        const value = that.data.$wux.dialog.prompt.response
        if (value.length < 1) {
          return;
        }
        var activeIndex = that.data.activeIndex;
        if (activeIndex == 0) {
          var newitem = that.data.xxitemtitles;
          newitem.push(value);
          console.log(newitem);
          that.setData({
            xxitemtitles: newitem,
          })
        } else if (activeIndex == 1) {
          var newitem = that.data.shitemtitles;
          newitem.push(value);
          console.log(newitem);
          that.setData({
            shitemtitles: newitem,
          })
        } else if (activeIndex == 2) {
          var newitem = that.data.ylitemtitles;
          newitem.push(value);
          console.log(newitem);
          that.setData({
            ylitemtitles: newitem,
          })
        }
      },
    })
  },
  addangle: function (e) {
    this.setData({
      showplModalStatus: false,
    })
  },
 
  onLoad: function (options) {

    var that = this;
    var timestamp = options.timestamp || '';
    var opusId = options.opusid || 0;
    this.setData({
      opusId: opusId,
    })
    getListData(that, 'queryStamp', timestamp);
    return; 
    //getUserToken(this); 
  },

  onUnload: function () {
    console.log("onUnload  timerecord");
    var pages = getCurrentPages()
    var presPage = pages[pages.length - 1]  //当前界面
    var prevPage = pages[pages.length - 2]  //上一个页面
    var that = this;
    // prevPage.pagereback('ooooo');
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
    var querymaxid = this.data.querymaxid || 0;
    getCommentData(this, 'queryComment', querymaxid)
  },

  showGallery(e) {
    const dataset = e.currentTarget.dataset
    const current = dataset.current
    const urls = this.data.saveimageurls

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
        var vmImage = [];
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          newarray = {
            icon: '',
            url: res.tempFilePaths[i],
          };
          vmImage.push(newarray);
        }
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          saveimageurls: that.data.saveimageurls.concat(vmImage)
        });
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

  bindInputInfoly: function (e) {
    this.setData({
      inputinfoly: e.detail.value,
    })
  },
  bindInputInfopl: function (e) {
    this.setData({
      inputinfopl: e.detail.value,
    })
  },
  addinfoendly: function (e) {
    var inputinfoly = this.data.inputinfoly;
    this.setData({
      loadhidden: false,
    })
    inputinfoly = inputinfoly.replace(/[\n\r\t\s]+/g, '↓');
    savePublishInfo(this, 'opuspublish', inputinfoly);
  },

  addinfoendpl: function (e) {
    var inputinfopl = this.data.inputinfopl;
    this.setData({
      loadhidden: false,
    })
    inputinfopl = inputinfopl.replace(/[\n\r\t\s]+/g, '↓');
    savePublishInfo(this, 'opustask', inputinfopl);
  },

  bindtaskdelete: function (e) {
    var killstamp = e.currentTarget.dataset.stamp;
    var killtype = e.currentTarget.dataset.type;
    var deleinfo = '';
    if (killtype=='pub'){
      deleinfo = '删除留言'
    }else{
      deleinfo = '删除评论'
    }
    var that = this;
    wx.showModal({
      title: deleinfo,
      content: deleinfo+'信息\r\n【' + e.currentTarget.dataset.info + '】',
      confirmText: "删除",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击主操作')
          savePublishInfo(that, killtype, killstamp);
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });

  },

  bindDeleteOpus: function (e) {
    var killstamp = this.data.timestamp;
    var killtype = 'killopus';
    var deleinfo = '删除作品';
    var that = this;
    wx.showModal({
      title: deleinfo,
      content: deleinfo ,
      confirmText: "删除",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击主操作')
          savePublishInfo(that, killtype, killstamp);
        } else {
          console.log('用户点击辅助操作')
        }
      }
    });
  },

  setModalStatus: function (e) {
    if (this.data.begdisfalg == true) {
      return;
    }
    console.log(e);
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear",   //线性  
      delay: 0  //0则不延迟  
    })
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;
    // animation.translateY(300).step();
    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();
    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      animationData: animation.export()
    });
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModalStatus: true,
        ly_focus: true,
      })
    }
    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // animation.translateY(0).step();
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      });
      //关闭 
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false,
          ly_focus: false,
        })
      }
    }.bind(this), 200)
  },

  setplModalStatus: function (e) {
    if (this.data.begdisfalg == true) {
      //  return;
    }
    console.log(e);

    var newIndex = this.data.todos;
    var objectId = e.currentTarget.dataset.id;
    var publishId = e.currentTarget.dataset.reqid;
    objectId = newIndex.length - 1 - objectId;

    this.setData({
      todosId: objectId,
      publishId: publishId,
    })

    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200,  //动画时长  
      timingFunction: "linear",   //线性  
      delay: 0  //0则不延迟  
    })
    // 第2步：这个动画实例赋给当前的动画实例  
    this.animation = animation;
    // animation.translateY(300).step();
    // 第3步：执行第一组动画  
    animation.opacity(0).rotateX(-100).step();
    // 第4步：导出动画对象赋给数据对象储存  
    this.setData({
      planimationData: animation.export()
    });
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showplModalStatus: true,
        pl_focus: true,
      })
    }
    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // animation.translateY(0).step();
      // 执行第二组动画  
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        planimationData: animation
      });
      //关闭 
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showplModalStatus: false,
          pl_focus: false,
        })
      }
    }.bind(this), 200)
  },
});