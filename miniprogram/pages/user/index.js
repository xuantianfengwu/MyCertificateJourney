// pages/user/index.js
Page({
  data: {
    // 用户信息
    userInfo: {
      name: "未登录",
      gender: "未知",
      age: 25,
      city: "未知",
      registrationTime: "未知",
      achievements: {
        practicing: 0,
        master: 0,
        grandmaster: 0
      },
      avatar: "../../images/avatar.png"
    },
    // 反馈区域展开状态
    isFeedbackExpanded: false,
    // 学习数据
    studyData: {
      totalHours: 120,
      completedQuestions: 85,
      correctRate: 80
    },
    // 登录相关状态
    showMask: false,
    maskType: 'login',
    showAuthModal: false,
    showInfoEditor: false,
    initialUserInfo: null
  },

  onLoad: function() {
    // 页面加载时初始化数据
    this.initPage();
  },

  onShow: function() {
    // 页面显示时检查登录状态
    console.log('用户页面显示，检查登录状态');
    this.checkLoginStatus();
  },

  // 登录成功回调
  onLoginSuccess: function() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        'userInfo.name': app.globalData.userInfo.nickName || '用户昵称',
        'userInfo.avatar': app.globalData.userInfo.avatarUrl || '../../images/avatar.png',
        'userInfo.gender': app.globalData.userInfo.gender === 1 ? '男' : (app.globalData.userInfo.gender === 2 ? '女' : '未知')
      });
    }
    this.initPage();
  },

  // 登录成功回调函数
  loginSuccessCallback: function() {
    const that = this;
    const app = getApp();
    if (app.globalData.userInfo) {
      that.setData({
        'userInfo.name': app.globalData.userInfo.nickName || '用户昵称',
        'userInfo.avatar': app.globalData.userInfo.avatarUrl || '../../images/avatar.png',
        'userInfo.gender': app.globalData.userInfo.gender === 1 ? '男' : (app.globalData.userInfo.gender === 2 ? '女' : '未知')
      });
    }
    that.initPage();
  },

  initPage: function() {
    // 可以在这里添加数据初始化逻辑
    // 例如从云数据库获取用户信息和学习数据
    console.log('个人中心页面初始化完成');
    // 同步用户信息
    this.syncUserInfo();
  },

  // 同步用户信息
  syncUserInfo: function() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        'userInfo.name': app.globalData.userInfo.nickName || '用户昵称',
        'userInfo.avatar': app.globalData.userInfo.avatarUrl || '../../images/avatar.png',
        'userInfo.gender': app.globalData.userInfo.gender === 1 ? '男' : (app.globalData.userInfo.gender === 2 ? '女' : '未知'),
        'userInfo.registrationTime': app.globalData.userInfo.registrationTime || '未知',
        'userInfo.city': app.globalData.userInfo.city || '未知',
        'userInfo.age': app.globalData.userInfo.age || 25,
        'userInfo.achievements': app.globalData.userInfo.achievements || {
          practicing: 0,
          master: 0,
          grandmaster: 0
        }
      });
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
    console.log('checkLoginStatus');
    const app = getApp();
    
    // 检查用户是否存在
    if (!app.globalData.userInfo || !app.globalData.isLoggedIn) {
      // 用户不存在，显示登录蒙版
      console.log('用户不存在，显示登录蒙版');
      this.setData({
        showMask: true,
        maskType: 'login'
      });
      return false;
    } else if (app.globalData.userInfo.gender === 0 || !app.globalData.userInfo.gender) {
      // 用户存在但性别未知，显示性别更新蒙版
      console.log('用户存在但性别未知，显示性别更新蒙版');
      this.setData({
        showMask: true,
        maskType: 'updateGender'
      });
      return false;
    }
    
    // 登录状态正常
    this.setData({
      showMask: false
    });
    return true;
  },

  // 处理蒙版点击
  handleMaskClick: function(e) {
    console.log('蒙版点击', e.detail.maskType);
    const maskType = e.detail.maskType;
    
    if (maskType === 'login') {
      // 显示授权弹窗
      this.setData({
        showAuthModal: true
      });
    } else if (maskType === 'updateGender') {
      // 显示信息编辑弹窗
      const app = getApp();
      this.setData({
        initialUserInfo: app.globalData.userInfo,
        showInfoEditor: true
      });
    }
  },

  // 处理授权成功
  handleAuthSuccess: function(e) {
    console.log('授权成功', e.detail);
    console.log('needInfoComplete:', e.detail.needInfoComplete);
    console.log('userInfo:', e.detail.userInfo);
    const app = getApp();
    
    // 关闭授权弹窗
    this.setData({
      showAuthModal: false
    });
    
    // 检查是否需要完善信息（如果性别为0或undefined，需要完善信息）
    const needInfoComplete = e.detail.needInfoComplete || (e.detail.userInfo && e.detail.userInfo.gender === 0);
    console.log('实际 needInfoComplete:', needInfoComplete);
    
    if (needInfoComplete) {
      // 显示信息编辑弹窗
      this.setData({
        initialUserInfo: e.detail.userInfo,
        showInfoEditor: true,
        showMask: false  // 隐藏蒙版
      });
    } else {
      // 授权成功，同步用户信息
      this.syncUserInfo();
      // 检查登录状态
      this.checkLoginStatus();
    }
  },

  // 处理授权取消
  handleAuthCancel: function() {
    console.log('授权取消');
    // 关闭授权弹窗
    this.setData({
      showAuthModal: false
    });
  },

  // 处理信息提交成功
  handleInfoSubmit: function(e) {
    console.log('信息提交成功', e.detail);
    const app = getApp();
    
    // 关闭信息编辑弹窗
    this.setData({
      showInfoEditor: false
    });
    
    // 同步用户信息
    this.syncUserInfo();
    // 检查登录状态
    this.checkLoginStatus();
  },

  // 处理信息编辑取消
  handleInfoCancel: function() {
    console.log('信息编辑取消');
    // 关闭信息编辑弹窗
    this.setData({
      showInfoEditor: false
    });
  },

  // 编辑个人信息
  editUserInfo: function() {
    console.log('编辑个人信息');
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        initialUserInfo: app.globalData.userInfo,
        showInfoEditor: true
      });
    }
  },

  // 查看学习报告
  viewStudyReport: function() {
    wx.navigateTo({
      url: '/pages/user/study-report'
    });
  },

  // 系统设置
  systemSettings: function() {
    wx.navigateTo({
      url: '/pages/user/settings'
    });
  },

  // 客服中心
  customerService: function() {
    wx.navigateTo({
      url: '/pages/user/customer-service'
    });
  },

  // 关于我们
  aboutUs: function() {
    wx.navigateTo({
      url: '/pages/user/about'
    });
  },

  // 退出登录
  logout: function() {
    const that = this;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          // 调用app的退出登录方法
          const app = getApp();
          app.logout();
          
          // 显示退出成功提示
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟切换回首页
          setTimeout(function() {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  },

  // 显示盟主浮窗
  show盟主Modal: function() {
    wx.showModal({
      title: '盟主',
      content: '',
      showCancel: false
    });
  },

  // 显示搭子浮窗
  show搭子Modal: function() {
    wx.showModal({
      title: '搭子',
      content: '',
      showCancel: false
    });
  },

  // 显示成就浮窗
  show成就Modal: function() {
    wx.showModal({
      title: '成就',
      content: '',
      showCancel: false
    });
  },

  // 提交反馈
  submitFeedback: function() {
    wx.showToast({
      title: '反馈已提交，感谢你的建议！',
      icon: 'success'
    });
  },

  // 切换反馈区域展开状态
  toggleFeedback: function() {
    this.setData({
      isFeedbackExpanded: !this.data.isFeedbackExpanded
    });
  },


});