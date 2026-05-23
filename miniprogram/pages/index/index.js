// index.js
Page({
  data: {
    // 热门推荐考试数据
    hotExams: [
      {
        id: 1,
        name: "初级会计职称",
        tags: ["可抵扣个税", "初级"],
        description: "会计入门必备证书，就业前景广阔",
        passRate: "30%",
        examFee: "100元"
      },
      {
        id: 2,
        name: "注册消防工程师",
        tags: ["可抵扣个税", "中级"],
        description: "高薪职业，社会需求大",
        passRate: "20%",
        examFee: "200元"
      },
      {
        id: 3,
        name: "教师资格证",
        tags: ["可抵扣个税", "中级"],
        description: "教育行业必备，稳定职业选择",
        passRate: "40%",
        examFee: "150元"
      }
    ],
    // 是否显示授权弹窗
    showAuthModal: false,
    // 是否显示信息完善弹窗
    showInfoCompleteModal: false,
    // 初始用户信息
    initialUserInfo: null,
    // 信息完善表单数据
    formData: {
      nickName: '',
      avatarUrl: '',
      gender: 0
    },
    // 是否显示页面蒙版
    showMask: false,
    // 蒙版提示文本
    maskText: '',
    // 蒙版类型：login 或 updateGender
    maskType: ''
  },

  onLoad: function() {
    // 首页不需要在加载时检查登录状态，只在需要时触发
    this.initPage();
  },

  initPage: function() {
    // 可以在这里添加数据初始化逻辑
    // 例如从云数据库获取推荐考试数据
    console.log('首页初始化完成');
  },

  // 跳转到考试详情页
  goToExamDetail: function(e) {
    const examId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exam/detail?id=${examId}`
    });
  },

  // 跳转到选证页面
  goToSelectExam: function() {
    wx.switchTab({
      url: '/pages/exam/index'
    });
  },

  // 跳转到学证页面
  goToStudy: function() {
    wx.switchTab({
      url: '/pages/study/index'
    });
  },

  // 跳转到考证页面
  goToCheck: function() {
    wx.switchTab({
      url: '/pages/exam/check'
    });
  },

  // 跳转到个人中心
  goToMy: function() {
    wx.switchTab({
      url: '/pages/user/index'
    });
  },

  // 处理蒙版点击
  handleMaskClick: function() {
    const that = this;
    const app = getApp();
    
    if (this.data.maskType === 'login') {
      // 触发登录流程
      app.getUserProfileAndSave(function(isSuccess, extraInfo) {
        if (isSuccess) {
          that.setData({
            showMask: false
          });
          that.initPage();
        } else if (extraInfo && extraInfo.needInfoComplete) {
          // 需要完善信息，显示信息完善弹窗
          that.setData({
            showInfoCompleteModal: true,
            initialUserInfo: extraInfo.initialUserInfo,
            formData: {
              nickName: extraInfo.initialUserInfo.nickName || '',
              avatarUrl: extraInfo.initialUserInfo.avatarUrl || '',
              gender: extraInfo.initialUserInfo.gender || 0
            }
          });
        }
      });
    } else if (this.data.maskType === 'updateGender') {
      // 显示信息完善弹窗，重点更新性别
      app.getUserProfileAndSave(function(isSuccess, extraInfo) {
        if (isSuccess) {
          that.setData({
            showMask: false
          });
          that.initPage();
        } else if (extraInfo && extraInfo.needInfoComplete) {
          // 需要完善信息，显示信息完善弹窗
          that.setData({
            showInfoCompleteModal: true,
            initialUserInfo: extraInfo.initialUserInfo,
            formData: {
              nickName: extraInfo.initialUserInfo.nickName || '',
              avatarUrl: extraInfo.initialUserInfo.avatarUrl || '',
              gender: extraInfo.initialUserInfo.gender || 0
            }
          });
        }
      });
    }
  },

  // 显示授权弹窗
  showAuthModal: function() {
    this.setData({
      showAuthModal: true
    });
  },

  // 隐藏授权弹窗
  hideAuthModal: function() {
    this.setData({
      showAuthModal: false
    });
  },

  // 处理授权
  handleAuth: function() {
    const that = this;
    const app = getApp();
    
    app.getUserProfileAndSave(function(isSuccess, extraInfo) {
      if (isSuccess) {
        // 授权成功，关闭弹窗并更新页面数据
        that.setData({
          showAuthModal: false
        });
        
        wx.showToast({
          title: '授权成功',
          icon: 'success'
        });
      } else if (extraInfo && extraInfo.needInfoComplete) {
        // 需要完善信息，显示信息完善弹窗
        that.setData({
          showAuthModal: false,
          showInfoCompleteModal: true,
          initialUserInfo: extraInfo.initialUserInfo,
          formData: {
            nickName: extraInfo.initialUserInfo.nickName || '',
            avatarUrl: extraInfo.initialUserInfo.avatarUrl || '',
            gender: extraInfo.initialUserInfo.gender || 0
          }
        });
      } else {
        // 授权失败
        that.setData({
          showAuthModal: false
        });
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      }
    });
  },

  // 显示信息完善弹窗
  showInfoCompleteModal: function() {
    this.setData({
      showInfoCompleteModal: true
    });
  },

  // 隐藏信息完善弹窗
  hideInfoCompleteModal: function() {
    this.setData({
      showInfoCompleteModal: false
    });
  },

  // 处理表单输入变化
  handleInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 处理性别选择
  handleGenderSelect: function(e) {
    const gender = parseInt(e.currentTarget.dataset.gender);
    this.setData({
      'formData.gender': gender
    });
  },

  // 提交信息完善表单
  submitInfoComplete: function() {
    const that = this;
    const app = getApp();
    const formData = this.data.formData;
    
    // 验证表单
    if (!formData.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    if (formData.gender === 0) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    
    // 提交用户信息
    app.submitUserInfo(formData, function(isSuccess) {
      if (isSuccess) {
        // 提交成功，关闭弹窗并更新页面
        that.setData({
          showInfoCompleteModal: false,
          showMask: false
        });
        
        that.initPage();
        
        wx.showToast({
          title: '信息完善成功',
          icon: 'success'
        });
      } else {
        // 提交失败
        wx.showToast({
          title: '信息完善失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 使用微信信息
  useWeChatInfo: function() {
    const that = this;
    const app = getApp();
    
    app.wechatOpenPlatformAuth(function(isSuccess) {
      if (isSuccess) {
        // 假设获取到了微信信息
        const wechatInfo = {
          nickName: that.data.initialUserInfo.nickName || '微信用户',
          avatarUrl: that.data.initialUserInfo.avatarUrl || '../../images/avatar.png',
          gender: that.data.initialUserInfo.gender || 0
        };
        
        that.setData({
          formData: wechatInfo
        });
        
        wx.showToast({
          title: '已使用微信信息',
          icon: 'success'
        });
      }
    });
  }
});
