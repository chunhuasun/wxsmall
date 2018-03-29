function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function fileSaveCos(fileUrls, fromUser, thatobj, fileidx) {
  console.log('fileUrls', fileUrls, 'fromUser', fromUser);
  if (fileUrls.length > fileidx) {
    var fileUrl = fileUrls[fileidx];
    wx.uploadFile({
      url: 'https://cpross1.duapp.com/weixinsub4FileSaveCos',
      filePath: fileUrl,
      name: 'send_file',
      method: "POST",
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        fromUser: fromUser,
        tcontent: 'tcontent'
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode != 200) {
          return 0;
        }
        thatobj.setData({  //存储地址信息
          cosimageurls: thatobj.data.cosimageurls.concat(res.data),
        })
        //继续循环调用
        fileSaveCos(fileUrls, fromUser, thatobj, parseInt(parseInt(fileidx) + 1))
      },
      fail: function (e) {
        console.log(e);
        return 0;
      },
    })
  }
  console.log('cosimageurls end', thatobj.data.cosimageurls);
  return thatobj.data.cosimageurls;
  // for (let i = 0; i < fileUrls.length; i++) {
  //   var fileUrl = fileUrls[i];
  //   console.log('fileUrl', fileUrl);
  //   console.log('cosimageurls', thatobj.data.cosimageurls);
  //   wx.uploadFile({
  //     url: 'https://cpross1.duapp.com/weixinsub4FileSaveCos',
  //     filePath: fileUrl,
  //     name: 'send_file',
  //     method: "POST",
  //     header: { "Content-Type": "multipart/form-data" },
  //     formData: {
  //       fromUser: fromUser,
  //       tcontent: 'tcontent'
  //     },
  //     success: function (res) {
  //       console.log(res);
  //       if (res.statusCode != 200) {
  //         wx.showModal({
  //           title: '提示',
  //           content: '上传失败',
  //           showCancel: false
  //         })
  //         return;
  //       }

  //       thatobj.setData({  //存储地址信息
  //         cosimageurls: thatobj.data.cosimageurls.concat(res),
  //       })
  //     },
  //     fail: function (e) {
  //       console.log(e);
  //       wx.showModal({
  //         title: '提示',
  //         content: '上传失败',
  //         showCancel: false
  //       })
  //     },
  //     complete: function () {
  //       wx.hideToast();  //隐藏Toast
  //     }
  //   })
  // }
}
 

function testwxfun(thatobj) {
  wx.showToast({
    title: '已完成',
    icon: 'success',
    duration: 1000
  });
}

module.exports = {
  formatTime: formatTime,
  // fileSaveCos: fileSaveCos,
  // testwxfun: testwxfun,
}

