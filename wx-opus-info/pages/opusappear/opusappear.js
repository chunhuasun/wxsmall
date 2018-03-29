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
        var opusinfo = thatobj.data.opusinfo || [];
        if (opertype == '1') {
          thatobj.setData({ loadhidden: true }) 
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
          var mydate = new Date();
          var year = mydate.getFullYear();
          var month = mydate.getMonth() + 1;
          var date = mydate.getDate();
          var opusdate = year.toString() + '-' + month.toString() + '-' + date.toString()
          //拼装结构体
          var newarray = {
            opustitle: '标题',
            opusurl: cosurl,
            objectId: opusinfo.length+1,
            opusauthor: operinfo.substring(0, 10).replace(new RegExp('↓', 'g'), ''),
            opusdate: opusdate,
            opusdepict: operinfo.substring(10, 40).replace(new RegExp('↓', 'g'), '\r\n'),
            opustype: '',
          };
          opusinfo.push(newarray);

          var newimage = fileUrls[fileidx];
          newimage.icon = 'icon';
          fileUrls.splice(fileidx, 1, newimage);

          thatobj.setData({  //存储地址信息
            opusinfo: opusinfo,
            saveimageurls: fileUrls
          })
          //继续循环调用
          fileidx = parseInt(parseInt(fileidx) + 1);
          if (fileUrls.length > fileidx) {
            fileSaveCos(fileUrls, fromUser, thatobj, fileidx, funoptype)
          } else {
            thatobj.setData({
              imagechooseflag: false,
              loadhidden: true,
            })
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

function saveOpusInfo(thatobj, funoptype) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var opusinfo = thatobj.data.opusinfo || [];
  //替换特殊字符
  for (var i = 0; i < opusinfo.length; i++){
     opusinfo[i].opustitle = opusinfo[i].opustitle.replace(/[\n\r\t\s]+/g, '↓');
     opusinfo[i].opusauthor = opusinfo[i].opusauthor.replace(/[\n\r\t\s]+/g, '↓');
     opusinfo[i].opusdepict = opusinfo[i].opusdepict.replace(/[\n\r\t\s]+/g, '↓'); 
  } 

  var commentData = JSON.stringify(opusinfo);
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
  
function getListData(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || 1;
  var funoptype = "byid";
  var sendData =
    '{ "getType": "ItemKnowledge","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryDay": "' + queryday +
    '","itemTimeId": "' + that.data.itemtimeid +
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
      console.log(res.data[0].iteminfo)
      if (dd > 0) {
        that.setData({
          itemtitle: res.data[0].itemTitle,
          itemtitletype: res.data[0].itemtitletype,
          iteminfo: res.data[0].itemInfo,
          itemaddinfo: res.data[0].itemaddinfo,
          iteminfoinput: false,
          cosimageurls: res.data[0].cosimageurls,
        })
      }
    }
  })
}

function getTitleData(that) {
  var user = wx.getStorageSync('user') || {};
  var openid = user.openid;
  var planId = that.data.planId || 1;
  var queryday = that.data.queryday || 1;
  var funoptype = "byid";
  var sendData =
    '{ "getType": "ItemTitleQuery","getPlanId": ' + planId +
    ',"getItemId": "","reqOpenId": "' + openid +
    '","funOpType": "' + funoptype +
    '","queryDay": "' + queryday +
    '","itemTimeId": "' + that.data.itemtimeid +
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
      console.log('res', res)
      var dd = res.data.length
      if (dd > 0) {
        console.log('res xxitemtitles', res.data[0].xxitemtitles)
        console.log('res shitemtitles', res.data[0].shitemtitles)
        console.log('res ylitemtitles', res.data[0].ylitemtitles)
        console.log('res mathsitemtitles', res.data[0].mathsitemtitles)
        var newitem = [];
        // var itemtitles = res.data[0].xxitemtitles || ''
        var itemtitles = res.data[0].mathsitemtitles || []
        dd = itemtitles.length;
        console.log(dd)
        if (dd > 0) {
          for (var i = 0; i < dd; i++) {
            var todos = itemtitles[i];
            newitem.push(todos.titleInfo);
          }
          that.setData({
            xxitemtitles: newitem,
          })
        }
      }
    }
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

    imagechooseflag: true,
    opusinfo: [
      // {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.6802a99e5e2a9e3b0f114ea0cc21888b.jpg', objectId: 1, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // }, {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.1bf9678f4cccea4ac298573102a066f8.jpg', objectId: 2, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // }, {
      //   opustitle: '标题', opusurl: 'http://tmp/wxc7e7b6ebc0de4528.o6zAJs3KJP4oGGAbbbsXn5iUiRho.a12ab4eedb69ea182b0d89af169bfc76.jpg', objectId: 3, opusauthor: '绘画人信息', opusdate: '作品日期', opusdepict: '作品信息', opustype: '艺术分类'
      // },
    ]

  },
  bindimagesave: function () {
    var that = this;
    console.log('bindimagesave');
    if (this.data.saveimageurls.length > 0) {
      this.setData({
        begdisfalg: true,
        loadhidden: false,
      })
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
    //newvalue = newvalue.replace(/[\n\r\t\s]+/g, '↓');  提交的时候替换
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
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.titletabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.titletabs.length * that.data.activeIndex,

          sliderplLeft: (res.windowWidth / that.data.typetabs.length - sliderWidth) / 2,
          sliderplOffset: res.windowWidth / that.data.typetabs.length * that.data.activeplIndex,
        });
      }
    });

    getUserToken(this);
    //获取当前时间
    var mydate = new Date();
    var year = mydate.getFullYear();
    var month = mydate.getMonth() + 1;
    var date = mydate.getDate();

    var queryday = year.toString() + month.toString() + date.toString()

    var hour = mydate.getHours()
    var minute = mydate.getMinutes()

    if (parseInt(hour) < 10) hour = '0' + hour
    if (parseInt(minute) < 10) minute = '0' + minute
    var time = hour + ':' + minute;
    var itemId = options.itemId || 0;
    queryday = options.queryday || queryday;

    console.log(queryday);

    var showDayInfo = '记录日期：     ' + queryday.substring(0, 4) + '-' + queryday.substring(4, 6)
      + '-' + queryday.substring(6, 8);
    this.setData({
      starttime: time,
      endtime: time,
      itemtimeid: itemId,
      queryday: queryday,
      showDayInfo: showDayInfo,
    });
    console.log('dayinfo', mydate, date, time)

    //获取当前记录的相关信息
    if (itemId != 0) {
      getListData(this);
    } else {
      //获取标题信息
      getTitleData(this);
    }
  },

  onUnload: function () {
    console.log("onUnload  timerecord");
    var pages = getCurrentPages()
    var presPage = pages[pages.length - 1]  //当前界面
    var prevPage = pages[pages.length - 2]  //上一个页面
    var that = this;
    // prevPage.pagereback('ooooo');
  },

  touchColumn: function (queryday, itemtimeid) {
    console.log('timerecord pagereback', queryday)
    var showDayInfo = '记录日期：     ' + queryday.substring(0, 4) + '-' + queryday.substring(4, 6)
      + '-' + queryday.substring(6, 8);
    this.setData({
      queryday: queryday,
      showDayInfo: showDayInfo,
      itemtimeid: itemtimeid,
    });
    getListData(this);
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
          var newarray = {
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
        showModalStatus: true
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
          showModalStatus: false
        })
      }
    }.bind(this), 200)
  },
});