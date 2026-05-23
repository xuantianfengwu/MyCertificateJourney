// components/info-editor/info-editor.js
const dataAccess = require('../../utils/dataAccess');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示信息编辑弹窗
    show: {
      type: Boolean,
      value: false
    },
    // 初始用户信息
    initialInfo: {
      type: Object,
      value: null,
      observer: function(newVal) {
        if (newVal) {
          // 查找城市在列表中的索引
          let cityIndex = 0;
          if (newVal.city) {
            cityIndex = this.data.cityList.indexOf(newVal.city) || 0;
          }
          
          this.setData({
            formData: {
              nickName: newVal.nickName || '',
              avatarUrl: newVal.avatarUrl || '',
              gender: newVal.gender || 0,
              city: newVal.city || '',
              cityIndex: cityIndex
            }
          });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 城市列表
    cityList: [
      '未知',
      '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安',
      '南京', '重庆', '天津', '苏州', '郑州', '长沙', '沈阳', '青岛',
      '宁波', '东莞', '无锡', '昆明', '福州', '厦门', '哈尔滨', '济南',
      '大连', '南宁', '南昌', '贵阳', '太原', '乌鲁木齐', '兰州', '西宁',
      '银川', '拉萨', '香港', '澳门', '台湾', '海外'
    ],
    // 信息完善表单数据
    formData: {
      nickName: '',
      avatarUrl: '',
      gender: 0,
      city: '',
      cityIndex: 0
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 处理昵称输入
    handleNicknameInput: function(e) {
      const value = e.detail.value;
      this.setData({
        'formData.nickName': value
      });
    },

    // 处理头像选择（使用微信开放能力）
    onChooseAvatar: function(e) {
      console.log('=== 开始选择头像 ===');
      const { avatarUrl } = e.detail;
      console.log('获取到的头像URL:', avatarUrl);
      
      if (!avatarUrl) {
        console.warn('头像URL为空，取消上传');
        return;
      }
      
      const app = getApp();
      // 如果openid为空，尝试从userInfo中获取
      let openid = app.globalData.openid || app.globalData.userInfo.openid;
      
      // 显示加载中
      wx.showLoading({
        title: '上传头像中...',
        mask: true
      });
      
      // 构建云路径，确保openid不为空
      let cloudPath;
      if (openid) {
        cloudPath = 'avatars/' + openid + '/' + Date.now() + '.jpg';
      } else {
        // 如果openid为空，使用默认路径
        cloudPath = 'avatars/default/' + Date.now() + '.jpg';
      }
      
      console.log('构建的云存储路径:', cloudPath);
      
      // 上传头像到云存储
      console.log('=== 开始上传到云存储 ===');
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: avatarUrl,
        success: (res) => {
          console.log('=== 头像上传成功 ===');
          console.log('获取到的fileID:', res.fileID);
          
          wx.hideLoading();
          this.setData({
            'formData.avatarUrl': res.fileID // 存储云存储的永久 URL
          });
        },
        fail: (err) => {
          console.error('=== 头像上传失败 ===');
          console.error('错误信息:', err);
          
          wx.hideLoading();
          
          // 上传失败时，暂时使用临时路径
          console.log('使用临时头像路径:', avatarUrl);
          this.setData({
            'formData.avatarUrl': avatarUrl
          });
          
          wx.showToast({
            title: '头像上传失败，使用临时头像',
            icon: 'none',
            duration: 3000
          });
        }
      });
    },

    // 处理性别选择
    handleGenderSelect: function(e) {
      const gender = parseInt(e.currentTarget.dataset.gender);
      this.setData({
        'formData.gender': gender
      });
    },

    // 处理城市选择
    handleCityChange: function(e) {
      const cityIndex = e.detail.value;
      const city = this.data.cityList[cityIndex];
      this.setData({
        'formData.cityIndex': cityIndex,
        'formData.city': city
      });
    },

    // 提交信息完善表单
    submitInfoComplete: function() {
      const that = this;
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
      
      console.log('提交用户信息', formData);
      
      // 显示加载中
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
      
      // 使用 dataAccess 保存用户信息
      dataAccess.user.authAndSave(formData, function(isSuccess, savedUserInfo) {
        wx.hideLoading();
        
        if (isSuccess) {
          console.log('保存用户信息成功', savedUserInfo);
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 提交成功，触发信息提交成功事件
          that.triggerEvent('infoSubmit', {
            userInfo: savedUserInfo
          });
        } else {
          console.error('保存用户信息失败');
          wx.showToast({
            title: '信息完善失败，请重试',
            icon: 'none'
          });
        }
      });
    },

    // 处理取消
    handleCancel: function() {
      // 触发信息编辑取消事件
      this.triggerEvent('infoCancel');
    }
  },

  /**
   * 组件生命周期
   */
  attached: function() {
    // 初始化表单数据
    if (this.properties.initialInfo) {
      // 查找城市在列表中的索引
      let cityIndex = 0;
      if (this.properties.initialInfo.city) {
        cityIndex = this.data.cityList.indexOf(this.properties.initialInfo.city) || 0;
      }
      
      this.setData({
        formData: {
          nickName: this.properties.initialInfo.nickName || '',
          avatarUrl: this.properties.initialInfo.avatarUrl || '',
          gender: this.properties.initialInfo.gender || 0,
          city: this.properties.initialInfo.city || '',
          cityIndex: cityIndex
        }
      });
    }
  }
});
