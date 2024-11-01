const soid = 'gh_62493b22bcb5'
const title = 'CodeEasier'
const addr = 'https://www.codeasier.com/web'
const home = '/pages/list/list'

Page({
  data: {
    lang: 'en-us',
    event: null,
    scene: null,
    editing: false,
    userInfo: null,
  },
  onLoad(query) {
    wx.setNavigationBarTitle({
      title,
    })

    if (!query?.scene) {
      wx.switchTab({
        url: home
      })
      return;
    }

    this.setData({
      event: query.event ? decodeURIComponent(query.event) : 'SCAN',
      scene: decodeURIComponent(query.scene)
    })

    const {
      language
    } = wx.getSystemInfoSync()
    if (language.toLocaleLowerCase() === 'zh_cn')
      this.setData({
        lang: 'zh-cn',
      });

    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo
      });
      this.callback();
    } else {
      this.setData({
        editing: true
      })
      wx.login({
        success: ({
          code
        }) => {
          wx.request({
            method: 'GET',
            url: `${addr}/cor/weixin/${soid}/session`,
            header: {
              lang: this.data.lang,
            },
            data: {
              code,
            },
            success: ({
              data: {
                code,
                msg,
                data
              }
            }) => {
              if (code === 200) {
                this.setData({
                  'userInfo.openid': data.openid
                })
              } else {
                wx.showModal({
                  title,
                  content: msg,
                  showCancel: false,
                  confirmText: 'OK',
                  success: () => {
                    wx.switchTab({
                      url: home
                    })
                  }
                });
              }
            },
            fail: (err) => {
              wx.showModal({
                title,
                content: err.errMsg,
                showCancel: false,
                confirmText: 'OK',
                success: () => {
                  wx.switchTab({
                    url: home
                  })
                }
              });
            }
          });
        },
      });
    }
  },
  onChooseAvatar(e) {
    wx.uploadFile({
      url: `${addr}/cor/weixin/${soid}/upload`,
      filePath: e.detail.avatarUrl,
      name: 'avatar',
      formData: {
        openid: this.data.userInfo.openid
      },
      success: (res) => {
        const {
          code,
          msg,
          data
        } = JSON.parse(res.data)
        if (code === 200) {
          this.setData({
            'userInfo.avatarUrl': `${addr}/${data.url}`,
          })
        } else {
          wx.showModal({
            title,
            content: msg,
            showCancel: false,
            confirmText: 'OK',
            success: () => {
              // wx.switchTab({
              //   url: home
              // })
            }
          });
        }
      },
      fail: (err) => {
        wx.showModal({
          title,
          content: err.errMsg,
          showCancel: false,
          confirmText: 'OK',
          success: () => {
            // wx.switchTab({
            //   url: home
            // })
          }
        });
      }
    })
  },
  onRemoveAvatar(e) {
    this.setData({
      editing: true,
      'userInfo.avatarUrl': null,
    })
  },
  onChooseNickname(e) {
    this.setData({
      'userInfo.nickName': e.detail.value,
    })
  },
  onRemoveNickname() {
    this.setData({
      editing: true,
      'userInfo.nickName': null,
    })
  },
  onSubmitUserInfo() {
    if (!this.data.userInfo?.avatarUrl) {
      wx.showToast({
        title: this.data.lang === 'zh-cn' ? '请选择头像' : 'Please choose your avatar',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (!this.data.userInfo?.nickName) {
      wx.showToast({
        title: this.data.lang === 'zh-cn' ? '请输入昵称' : 'Please input your nickname',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.setStorageSync('userInfo', this.data.userInfo);
    this.setData({
      editing: false,
    })
    this.callback()
  },
  callback() {
    if (this.data.scene) {
      wx.showLoading({
        title: this.data.lang === 'zh-cn' ? '加载中' : 'Loading'
      })
      wx.request({
        method: 'POST',
        url: `${addr}/cor/weixin/${soid}`,
        header: {
          lang: this.data.lang,
        },
        data: {
          ToUserName: soid,
          FromUserName: this.data.userInfo.openid,
          CreateTime: Math.round(new Date().getTime() / 1000).toString(),
          MsgType: "event",
          Event: this.data.event,
          EventKey: this.data.scene,
          // MsgId: Math.round(new Date().getTime()).toString() + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          UserInfo: this.data.userInfo
        },
        success: ({
          data
        }) => {
          this.setData({
            event: null,
            scene: null
          })
          wx.hideLoading()
          if (typeof data === 'object' && 'api' in data) {
            wx.showModal({
              title,
              content: data.api,
              showCancel: false,
              confirmText: 'OK',
              success: () => {
                try {
                  wx[data.api](data.params).then(res => {
                    wx.showModal({
                      title,
                      content: JSON.stringify(res),
                      showCancel: false,
                      confirmText: 'OK'
                    })
                  }).catch(err => {
                    wx.showModal({
                      title,
                      content: JSON.stringify(err),
                      showCancel: false,
                      confirmText: 'OK'
                    })
                  })
                } catch (error) {
                  wx.showModal({
                    title,
                    content: error.message,
                    showCancel: false,
                    confirmText: 'OK'
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title,
              content: data,
              showCancel: false,
              confirmText: 'OK',
              success: () => {
                // wx.switchTab({
                //   url: home
                // })
              }
            });
          }
        },
        fail: (err) => {
          wx.hideLoading()
          wx.showModal({
            title,
            content: err.errMsg,
            showCancel: false,
            confirmText: 'OK',
            success: () => {
              wx.switchTab({
                url: home
              })
            }
          });
        }
      })
    }
  },
});