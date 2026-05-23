// components/login-check/login-check.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否在组件加载时自动检查登录状态
    autoCheck: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
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
    maskType: '',
    // 用于临时存储要切换到的标签
    pendingTab: ''
  },

  /**
   * 组件的生命周期函数
   */
  attached: function() {
    console.log('登录检查组件 attached，autoCheck:', this.data.autoCheck);
    if (this.data.autoCheck) {
      console.log('自动检查登录状态');
      this.checkLoginStatus();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 检查登录状态
    checkLoginStatus: function(callback) {
      const that = this;
      const app = getApp();
      
      console.log('开始检查登录状态');
      console.log('当前 globalData.userInfo:', app.globalData.userInfo);
      console.log('当前 globalData.isLoggedIn:', app.globalData.isLoggedIn);
      
      app.ensureLoggedIn(function(isLoggedIn, extraInfo) {
        console.log('ensureLoggedIn 回调，isLoggedIn:', isLoggedIn, 'extraInfo:', extraInfo);
        
        if (isLoggedIn) {
          // 检查是否需要授权
          if (extraInfo && extraInfo.needAuth) {
            console.log('用户不存在，显示登录蒙版');
            // 用户不存在，显示登录蒙版
            that.setData({
              showMask: true,
              maskText: '请登录以便继续',
              maskType: 'login'
            });
          } else {
            // 登录成功，检查性别信息
            console.log('登录成功，检查性别信息');
            console.log('检查时的 globalData.userInfo:', app.globalData.userInfo);
            
            if (app.globalData.userInfo) {
              // 检查性别是否为未知
              console.log('用户性别:', app.globalData.userInfo.gender);
              console.log('性别检查条件:', app.globalData.userInfo.gender === 0 || !app.globalData.userInfo.gender);
              
              if (app.globalData.userInfo.gender === 0 || !app.globalData.userInfo.gender) {
                console.log('性别为未知，显示性别更新蒙版');
                that.setData({
                  showMask: true,
                  maskText: '点击更新性别信息，内容展示受此影响',
                  maskType: 'updateGender'
                });
              } else {
                console.log('登录成功且信息完整');
                // 登录成功且信息完整
                if (callback) callback(true);
              }
            } else {
              console.log('登录成功但无用户信息');
              // 登录成功但无用户信息
              if (callback) callback(true);
            }
          }
        } else {
          console.log('登录失败，显示登录蒙版');
          // 登录失败，显示登录蒙版
          that.setData({
            showMask: true,
            maskText: '请登录以便继续',
            maskType: 'login'
          });
        }
      });
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
        showAuthModal: false,
        pendingTab: ''
      });
    },

    // 处理授权
    handleAuth: function() {
      const that = this;
      const app = getApp();
      
      app.getUserProfileAndSave(function(isSuccess, extraInfo) {
        if (isSuccess) {
          // 授权成功，关闭弹窗
          that.setData({
            showAuthModal: false,
            showMask: false
          });
          
          // 切换到待切换的标签
          const pendingTab = that.data.pendingTab;
          if (pendingTab) {
            that.setData({ pendingTab: '' });
            // 触发标签切换事件
            that.triggerEvent('tabChange', { tab: pendingTab });
          }
          
          // 触发登录成功事件
          that.triggerEvent('loginSuccess');
          
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
            showAuthModal: false,
            pendingTab: ''
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
          // 提交成功，关闭弹窗
          that.setData({
            showInfoCompleteModal: false,
            showMask: false
          });
          
          // 切换到待切换的标签
          const pendingTab = that.data.pendingTab;
          if (pendingTab) {
            that.setData({ pendingTab: '' });
            // 触发标签切换事件
            that.triggerEvent('tabChange', { tab: pendingTab });
          }
          
          // 触发登录成功事件
          that.triggerEvent('loginSuccess');
          
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
    },

    // 选择头像
    chooseAvatar: function() {
      const that = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const tempFilePaths = res.tempFilePaths;
          that.setData({
            'formData.avatarUrl': tempFilePaths[0]
          });
        }
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
            that.setData({ showMask: false });
            // 触发登录成功事件
            that.triggerEvent('loginSuccess');
            if (that.properties.successCallback) that.properties.successCallback(true);
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
            that.setData({ showMask: false });
            // 触发登录成功事件
            that.triggerEvent('loginSuccess');
            if (that.properties.successCallback) that.properties.successCallback(true);
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

    // 重新检查登录状态（供页面在需要时调用）
    recheckLoginStatus: function() {
      console.log('重新检查登录状态');
      // 先隐藏之前的蒙版和弹窗
      this.setData({
        showMask: false,
        showAuthModal: false,
        showInfoCompleteModal: false
      });
      // 重新检查登录状态
      this.checkLoginStatus();
    },

    // 检查登录状态并处理标签切换
    checkLoginAndSwitchTab: function(tab) {
      const that = this;
      const app = getApp();
      
      // 先隐藏之前的蒙版和弹窗
      this.setData({
        showMask: false,
        showAuthModal: false,
        showInfoCompleteModal: false
      });
      
      app.ensureLoggedIn(function(isLoggedIn, extraInfo) {
        if (isLoggedIn) {
          // 检查是否需要授权
          if (extraInfo && extraInfo.needAuth) {
            // 需要授权，显示授权弹窗，保存待切换的标签
            that.setData({
              showAuthModal: true,
              pendingTab: tab
            });
          } else {
            // 检查性别信息
            if (app.globalData.userInfo) {
              // 检查性别是否为未知
              if (app.globalData.userInfo.gender === 0 || !app.globalData.userInfo.gender) {
                // 显示性别更新蒙版
                that.setData({
                  showMask: true,
                  maskText: '点击更新性别信息，内容展示受此影响',
                  maskType: 'updateGender',
                  pendingTab: tab
                });
              } else {
                // 已经有用户信息且性别完整，直接切换标签
                that.triggerEvent('tabChange', { tab: tab });
              }
            } else {
              // 已经有用户信息，直接切换标签
              that.triggerEvent('tabChange', { tab: tab });
            }
          }
        } else {
          // 登录失败，显示登录蒙版
          that.setData({
            showMask: true,
            maskText: '请登录以便继续',
            maskType: 'login',
            pendingTab: tab
          });
        }
      });
    }
  }
});