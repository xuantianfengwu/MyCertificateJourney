// pages/exam/check.js
Page({
  data: {
    // 登录相关状态
    showMask: false,
    maskType: 'login',
    showAuthModal: false,
    showInfoEditor: false,
    initialUserInfo: null,
    // 待切换的标签
    pendingTab: '',
    // 当前选中的选项卡
    activeTab: 'schedule', // schedule, certificate, forum
    // 考试日程数据
    schedules: [
      {
        id: 1,
        exam: "初级会计职称",
        date: "2026年5月15日",
        time: "9:00-11:30",
        location: "北京市朝阳区考点",
        status: "即将到来"
      },
      {
        id: 2,
        exam: "计算机二级",
        date: "2026年6月20日",
        time: "14:00-16:30",
        location: "北京市海淀区考点",
        status: "即将到来"
      }
    ],
    // 城市数据
    cities: [
      { id: 'beijing', name: '北京' },
      { id: 'shanghai', name: '上海' },
      { id: 'guangzhou', name: '广州' },
      { id: 'shenzhen', name: '深圳' },
      { id: 'hangzhou', name: '杭州' }
    ],
    // 当前选中的城市
    selectedCity: 'beijing',
    // 备考空间数据（按城市区分）
    studySpaces: {
      beijing: [
        {
          id: 1,
          name: "北京市图书馆",
          address: "北京市东城区王府井大街36号",
          hours: "周一至周日 9:00-21:00",
          features: "安静环境，免费WiFi，空调开放"
        },
        {
          id: 2,
          name: "北京大学自习室",
          address: "北京市海淀区颐和园路5号",
          hours: "周一至周五 8:00-22:00，周末 9:00-21:00",
          features: "学术氛围浓厚，桌椅舒适"
        }
      ],
      shanghai: [
        {
          id: 1,
          name: "上海市图书馆",
          address: "上海市徐汇区淮海中路1555号",
          hours: "周一至周日 9:00-21:00",
          features: "现代化设施，海量藏书"
        },
        {
          id: 2,
          name: "复旦大学自习室",
          address: "上海市杨浦区邯郸路220号",
          hours: "周一至周五 8:00-22:00，周末 9:00-21:00",
          features: "学习氛围好，环境安静"
        }
      ],
      guangzhou: [
        {
          id: 1,
          name: "广州市图书馆",
          address: "广州市天河区珠江新城冼村路28号",
          hours: "周一至周日 9:00-21:00",
          features: "现代化建筑，舒适环境"
        },
        {
          id: 2,
          name: "中山大学自习室",
          address: "广州市海珠区新港西路135号",
          hours: "周一至周五 8:00-22:00，周末 9:00-21:00",
          features: "学术氛围浓厚，设施齐全"
        }
      ],
      shenzhen: [
        {
          id: 1,
          name: "深圳市图书馆",
          address: "深圳市福田区福中一路2001号",
          hours: "周一至周日 9:00-21:00",
          features: "现代化设施，免费WiFi"
        },
        {
          id: 2,
          name: "深圳大学自习室",
          address: "深圳市南山区南海大道3688号",
          hours: "周一至周五 8:00-22:00，周末 9:00-21:00",
          features: "环境优美，学习氛围好"
        }
      ],
      hangzhou: [
        {
          id: 1,
          name: "杭州市图书馆",
          address: "杭州市江干区解放东路58号",
          hours: "周一至周日 9:00-21:00",
          features: "现代化设施，舒适环境"
        },
        {
          id: 2,
          name: "浙江大学自习室",
          address: "杭州市西湖区余杭塘路866号",
          hours: "周一至周五 8:00-22:00，周末 9:00-21:00",
          features: "学术氛围浓厚，环境安静"
        }
      ]
    },
    // 备考机构数据（按城市区分）
    studyInstitutions: {
      beijing: [
        {
          id: 1,
          name: "北京华章教育",
          address: "北京市海淀区中关村大街1号",
          hours: "周一至周日 8:00-22:00",
          features: "专业师资，小班授课，模拟考试"
        },
        {
          id: 2,
          name: "中公教育北京分校",
          address: "北京市朝阳区建国路88号",
          hours: "周一至周日 9:00-21:00",
          features: "全科目覆盖，线上线下结合"
        }
      ],
      shanghai: [
        {
          id: 1,
          name: "上海华图教育",
          address: "上海市黄浦区南京东路1号",
          hours: "周一至周日 8:00-22:00",
          features: "名师授课，个性化辅导"
        },
        {
          id: 2,
          name: "上海粉笔教育",
          address: "上海市浦东新区陆家嘴环路999号",
          hours: "周一至周日 9:00-21:00",
          features: "智能题库，在线答疑"
        }
      ],
      guangzhou: [
        {
          id: 1,
          name: "广州新东方",
          address: "广州市天河区体育西路103号",
          hours: "周一至周日 8:00-22:00",
          features: "专业教研，学习规划"
        },
        {
          id: 2,
          name: "广州学而思",
          address: "广州市越秀区北京路168号",
          hours: "周一至周日 9:00-21:00",
          features: "小班教学，课后辅导"
        }
      ],
      shenzhen: [
        {
          id: 1,
          name: "深圳中公教育",
          address: "深圳市福田区深南中路3039号",
          hours: "周一至周日 8:00-22:00",
          features: "全流程服务，就业指导"
        },
        {
          id: 2,
          name: "深圳华图教育",
          address: "深圳市南山区科技园南区",
          hours: "周一至周日 9:00-21:00",
          features: "名师团队，模考测评"
        }
      ],
      hangzhou: [
        {
          id: 1,
          name: "杭州粉笔教育",
          address: "杭州市西湖区文三路478号",
          hours: "周一至周日 8:00-22:00",
          features: "线上课程，灵活学习"
        },
        {
          id: 2,
          name: "杭州中公教育",
          address: "杭州市拱墅区莫干山路111号",
          hours: "周一至周日 9:00-21:00",
          features: "面授课程，互动教学"
        }
      ]
    }
  },

  onLoad: function() {
    // 考证页面不需要在加载时检查登录状态，只在点击本地论坛标签时触发
    this.initPage();
  },

  initPage: function() {
    // 可以在这里添加数据初始化逻辑
    // 例如从云数据库获取证书、成绩和日程数据
    console.log('考证页面初始化完成');
  },

  // 切换选项卡
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    // 如果是本地论坛标签，先检查登录
    if (tab === 'forum') {
      this.checkLoginAndSwitchTab(tab);
    } else {
      // 其他标签直接切换
      this.setData({
        activeTab: tab
      });
    }
  },

  // 检查登录状态并处理标签切换
  checkLoginAndSwitchTab: function(tab) {
    const that = this;
    const app = getApp();
    
    // 先隐藏之前的蒙版和弹窗
    this.setData({
      showMask: false,
      showAuthModal: false,
      showInfoEditor: false
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
              that.setData({
                activeTab: tab
              });
            }
          } else {
            // 已经有用户信息，直接切换标签
            that.setData({
              activeTab: tab
            });
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
  },

  // 处理蒙版点击
  handleMaskClick: function(e) {
    console.log('蒙版点击', e.detail.maskType);
    const maskType = e.detail.maskType;
    const that = this;
    const app = getApp();
    
    if (maskType === 'login') {
      // 显示授权弹窗
      this.setData({
        showAuthModal: true
      });
    } else if (maskType === 'updateGender') {
      // 显示信息编辑弹窗
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
      // 授权成功，检查待切换的标签
      const pendingTab = this.data.pendingTab;
      if (pendingTab) {
        this.setData({
          pendingTab: '',
          activeTab: pendingTab
        });
      }
    }
  },

  // 处理授权取消
  handleAuthCancel: function() {
    console.log('授权取消');
    // 关闭授权弹窗
    this.setData({
      showAuthModal: false,
      pendingTab: ''
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
    
    // 检查待切换的标签
    const pendingTab = this.data.pendingTab;
    if (pendingTab) {
      this.setData({
        pendingTab: '',
        activeTab: pendingTab
      });
    }
  },

  // 处理信息编辑取消
  handleInfoCancel: function() {
    console.log('信息编辑取消');
    // 关闭信息编辑弹窗
    this.setData({
      showInfoEditor: false,
      pendingTab: ''
    });
  },



  // 查看证书详情
  viewCertificateDetail: function(e) {
    const certificateId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exam/certificate-detail?id=${certificateId}`
    });
  },

  // 查看成绩详情
  viewScoreDetail: function(e) {
    const scoreId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exam/score-detail?id=${scoreId}`
    });
  },

  // 查看考试详情
  viewScheduleDetail: function(e) {
    const scheduleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/exam/schedule-detail?id=${scheduleId}`
    });
  },

  // 全国证书查询
  nationalCertificateQuery: function() {
    // 跳转到全国证书查询页面
    wx.navigateTo({
      url: `/pages/exam/national-query`
    });
  },

  // 证书验证
  certificateVerify: function() {
    // 跳转到证书验证页面
    wx.navigateTo({
      url: `/pages/exam/certificate-verify`
    });
  },

  // 证书分享
  shareCertificate: function() {
    // 实现证书分享功能
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 证书备份
  backupCertificate: function() {
    // 实现证书备份功能
    wx.showToast({
      title: '备份功能开发中',
      icon: 'none'
    });
  },

  // 选择城市
  selectCity: function(e) {
    const cityId = e.currentTarget.dataset.id;
    this.setData({
      selectedCity: cityId
    });
  },

  // 查看更多备考空间
  viewMoreSpaces: function() {
    wx.showToast({
      title: '查看更多备考空间',
      icon: 'none'
    });
  },

  // 查看更多备考机构
  viewMoreInstitutions: function() {
    wx.showToast({
      title: '查看更多备考机构',
      icon: 'none'
    });
  }
});