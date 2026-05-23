// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会请求到哪个云环境的资源
      // 此处请填入环境 ID, 环境 ID 可在微信开发者工具右上顶部工具栏点击云开发按钮打开获取
      env: "cloud1-7giawtir11f7f119",
      openid: '',
      userInfo: null,
      isLoggedIn: false
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 从本地缓存恢复登录状态
    this.restoreLoginState();
  },

  // 登录函数 - 调用新的 userLogin 云函数
  login: function(callback) {
    const that = this;
    
    console.log('开始登录流程');
    
    // 调用新的 userLogin 云函数
    wx.cloud.callFunction({
      name: 'userLogin',
      data: {
        type: 'login'
      },
      success: function(result) {
        console.log('登录云函数返回', result);
        
        if (result.result.success) {
          that.globalData.openid = result.result.openid;
          that.globalData.isLoggedIn = true;
          
          // 保存登录状态到本地缓存
          that.saveLoginState();
          
          if (result.result.needAuth) {
            // 用户不存在，需要授权
            console.log('用户不存在，需要授权');
            if (callback) callback(true, { needAuth: true });
          } else {
            // 用户已存在，获取用户信息
            console.log('用户已存在，获取用户信息');
            that.globalData.userInfo = result.result.userInfo;
            that.saveLoginState();
            if (callback) callback(true);
          }
        } else {
          console.error('登录失败', result.result.error);
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('登录云函数调用失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        if (callback) callback(false);
      }
    });
  },

  // 检查用户是否已注册
  checkUserRegistered: function(callback) {
    const that = this;
    
    console.log('检查用户是否已注册，openid:', this.globalData.openid);
    console.log('本地用户信息:', this.globalData.userInfo);
    
    // 如果本地已经有用户信息，直接返回成功
    if (this.globalData.userInfo && this.globalData.userInfo._id) {
      console.log('本地已有用户信息，直接返回成功');
      if (callback) callback(true);
      return;
    }
    
    const db = wx.cloud.database();
    
    db.collection('users').doc(this.globalData.openid).get({
      success: function(res) {
        console.log('用户已存在，res:', res);
        // 用户已存在，获取用户信息
        that.globalData.userInfo = res.data;
        that.saveLoginState();
        if (callback) callback(true);
      },
      fail: function(err) {
        console.log('用户不存在，err:', err);
        // 用户不存在，返回需要授权状态
        if (callback) callback(true, { needAuth: true });
      }
    });
  },

  // 获取用户授权并创建/更新用户记录
  getUserProfileAndSave: function(callback) {
    const that = this;
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: function(res) {
        const userInfo = res.userInfo;
        console.log('获取到用户信息', userInfo);
        
        // 调用云函数保存用户信息
        wx.cloud.callFunction({
          name: 'userLogin',
          data: {
            type: 'auth',
            userInfo: {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              gender: userInfo.gender,
              country: userInfo.country,
              province: userInfo.province,
              city: userInfo.city,
              language: userInfo.language
            }
          },
          success: function(result) {
            console.log('保存用户信息成功', result);
            if (result.result.success) {
              // 更新全局用户信息
              that.globalData.userInfo = result.result.userInfo;
              
              // 从userInfo中提取openid并设置到globalData.openid
              if (result.result.userInfo && result.result.userInfo.openid) {
                that.globalData.openid = result.result.userInfo.openid;
                console.log('从userInfo中设置openid:', that.globalData.openid);
              }
              
              that.saveLoginState();
              
              if (callback) callback(true, { userInfo: result.result.userInfo });
            } else {
              console.error('保存用户信息失败', result.result.error);
              if (callback) callback(false);
            }
          },
          fail: function(err) {
            console.error('保存用户信息云函数调用失败', err);
            if (callback) callback(false);
          }
        });
      },
      fail: function(err) {
        console.error('获取用户授权失败', err);
        wx.showToast({
          title: '需要授权才能继续使用',
          icon: 'none'
        });
        if (callback) callback(false);
      }
    });
  },

  // 显示信息完善弹窗
  showInfoCompleteModal: function(initialUserInfo, callback) {
    // 通知调用方需要显示信息完善弹窗
    // 具体的弹窗 UI 由调用方实现
    if (callback) callback(false, { needInfoComplete: true, initialUserInfo });
  },

  // 提交用户信息（编辑用户信息时使用）
  submitUserInfo: function(userInfo, callback) {
    const that = this;
    
    console.log('提交用户信息', userInfo);
    
    // 调用云函数保存用户信息
    wx.cloud.callFunction({
      name: 'userLogin',
      data: {
        type: 'auth',
        userInfo: userInfo
      },
      success: function(result) {
        console.log('提交用户信息成功', result);
        if (result.result.success) {
          // 更新全局用户信息
          that.globalData.userInfo = result.result.userInfo;
          that.saveLoginState();
          if (callback) callback(true);
        } else {
          console.error('提交用户信息失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('提交用户信息云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 进入微信开放平台授权流程
  wechatOpenPlatformAuth: function(callback) {
    // 这里需要实现开放平台授权
    // 暂时返回成功，后续实现具体功能
    if (callback) callback(true);
  },

  // 检查登录态是否过期
  checkSession: function(callback) {
    const that = this;
    
    // 首先检查本地是否有登录状态
    if (!this.globalData.isLoggedIn || !this.globalData.openid) {
      // 本地没有登录状态，直接返回false
      console.log('本地无登录状态');
      if (callback) callback(false);
      return;
    }
    
    // 本地有登录状态，再检查微信登录态是否过期
    wx.checkSession({
      success: function() {
        // 登录态有效
        console.log('登录态有效');
        if (callback) callback(true);
      },
      fail: function() {
        // 登录态过期
        console.log('登录态过期');
        if (callback) callback(false);
      }
    });
  },

  // 保存登录状态
  saveLoginState: function() {
    wx.setStorageSync('openid', this.globalData.openid);
    wx.setStorageSync('userInfo', this.globalData.userInfo);
    wx.setStorageSync('isLoggedIn', this.globalData.isLoggedIn);
  },

  // 恢复登录状态
  restoreLoginState: function() {
    this.globalData.openid = wx.getStorageSync('openid') || '';
    this.globalData.userInfo = wx.getStorageSync('userInfo') || null;
    this.globalData.isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
  },

  // 检查是否已登录，如果没有则进行登录
  ensureLoggedIn: function(callback) {
    const that = this;
    
    console.log('开始 ensureLoggedIn 流程');
    console.log('当前 openid:', this.globalData.openid);
    console.log('当前 userInfo:', this.globalData.userInfo);
    console.log('当前 isLoggedIn:', this.globalData.isLoggedIn);
    
    // 先检查本地登录状态
    this.checkSession(function(isValid) {
      console.log('checkSession 结果:', isValid);
      
      if (isValid) {
        // 登录态有效，检查用户是否已注册
        console.log('登录状态有效，检查用户是否已注册');
        that.checkUserRegistered(callback);
      } else {
        // 登录态无效，需要登录
        console.log('需要登录');
        that.login(callback);
      }
    });
  },

  // 退出登录
  logout: function() {
    // 清除全局登录状态
    this.globalData.openid = '';
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    // 清除本地缓存
    wx.removeStorageSync('openid');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
  }
});
