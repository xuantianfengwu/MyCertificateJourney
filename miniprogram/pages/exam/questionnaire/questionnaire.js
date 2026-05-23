// pages/exam/questionnaire/questionnaire.js
const app = getApp()

Page({
  data: {
    loading: false,
    answers: {
      educationExperience: '',
      occupation: '',
      industry: '',
      otherCertificates: ''
    },
    hasSubmitted: false,
    submitButtonText: '提交'
  },
  
  onLoad: function(options) {
    // 检查用户登录状态
    if (!app.globalData.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 检查用户是否已提交过问卷
    this.checkQuestionnaireStatus();
  },
  
  // 检查用户问卷提交状态
  checkQuestionnaireStatus: function() {
    const userId = app.globalData.openid;
    
    wx.cloud.callFunction({
      name: 'getUserQuestionnaire',
      data: { userId },
      success: res => {
        if (res.result.hasSubmitted) {
          // 用户已提交问卷，按钮文案改为“再次提交”
          this.setData({
            hasSubmitted: true,
            submitButtonText: '再次提交'
          });
        }
      }
    });
  },
  
  // 绑定教育经历输入
  bindEducationExperienceInput: function(e) {
    this.setData({
      'answers.educationExperience': e.detail.value
    });
  },

  // 绑定职业输入
  bindOccupationInput: function(e) {
    this.setData({
      'answers.occupation': e.detail.value
    });
  },

  // 绑定行业输入
  bindIndustryInput: function(e) {
    this.setData({
      'answers.industry': e.detail.value
    });
  },

  // 绑定其他证书或爱好输入
  bindOtherCertificatesInput: function(e) {
    this.setData({
      'answers.otherCertificates': e.detail.value
    });
  },
  
  // 表单验证
  validateForm: function(answers) {
    console.log('验证的答案:', answers)
    if (!answers.educationExperience) {
      wx.showToast({ title: '请输入教育经历', icon: 'none' })
      return false
    }
    if (!answers.occupation) {
      wx.showToast({ title: '请输入工作职业', icon: 'none' })
      return false
    }
    if (!answers.industry) {
      wx.showToast({ title: '请输入所在行业', icon: 'none' })
      return false
    }
    if (!answers.otherCertificates) {
      wx.showToast({ title: '请输入其他证书或爱好', icon: 'none' })
      return false
    }
    return true
  },
  
  // 提交问卷
  submitQuestionnaire: function(e) {
    console.log('questionnaire.js.submitQuestionnaire')
    console.log('表单数据:', e.detail.value)
    
    const answers = e.detail.value
    
    // 表单验证
    if (!this.validateForm(answers)) {
      return
    }
    
    this.setData({ loading: true })
    
    const userId = app.globalData.openid
    
    wx.cloud.callFunction({
      name: 'submitQuestionnaire',
      data: {
        userId,
        answers
      },
      success: res => {
        this.setData({ loading: false })
        
        console.log('云函数调用成功:', res)
        
        if (res.result && res.result.success) {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          })
          
          // 保存数据到本地存储
          wx.setStorageSync('userExperience', answers);
          
          // 跳转回选证页面
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.result.error || '提交失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        this.setData({ loading: false })
        console.error('云函数调用失败:', err)
        wx.showToast({
          title: '提交失败，请检查云函数是否已上传',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },
  
  // 重置表单
  resetForm: function() {
    this.setData({
      answers: {
        educationExperience: '',
        occupation: '',
        industry: '',
        otherCertificates: ''
      }
    })
  }
})