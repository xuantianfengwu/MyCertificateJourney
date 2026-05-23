// components/auth-modal/auth-modal.js
const dataAccess = require('../../utils/dataAccess');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示授权弹窗
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 处理授权
    handleAuth: function() {
      const that = this;
      
      console.log('开始获取用户授权');
      
      // 调用 wx.getUserProfile 获取用户信息
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: function(res) {
          console.log('获取用户授权成功', res.userInfo);
          const userInfo = res.userInfo;
          
          // 准备用户信息数据
          const userData = {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city,
            language: userInfo.language
          };
          
          // 使用 dataAccess 保存用户信息
          dataAccess.user.authAndSave(userData, function(isSuccess, savedUserInfo) {
            if (isSuccess) {
              console.log('保存用户信息成功', savedUserInfo);
              
              // 检查用户性别是否为 0（未知），如果是则需要完善信息
              const needInfoComplete = savedUserInfo.gender === 0;
              
              // 触发授权成功事件
              that.triggerEvent('authSuccess', {
                userInfo: savedUserInfo,
                needInfoComplete: needInfoComplete
              });
            } else {
              console.error('保存用户信息失败');
              that.triggerEvent('authCancel');
            }
          });
        },
        fail: function(err) {
          console.error('获取用户授权失败', err);
          wx.showToast({
            title: '需要授权才能继续使用',
            icon: 'none'
          });
          that.triggerEvent('authCancel');
        }
      });
    },

    // 处理取消
    handleCancel: function() {
      // 触发授权取消事件
      this.triggerEvent('authCancel');
    }
  }
});
