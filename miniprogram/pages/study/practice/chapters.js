// pages/study/practice/chapters.js
const app = getApp();

Page({
  data: {
    studyProjectId: 0,
    examName: '',
    totalQuestions: 0,
    chapters: []
  },

  onLoad: function(options) {
    console.log('[Chapters] onLoad', options);
    const studyProjectId = parseInt(options.studyProjectId);
    this.setData({ studyProjectId });
    this.loadChapters();
  },

  loadChapters: function() {
    const that = this;
    wx.showLoading({ title: '加载章节...' });
    
    wx.cloud.callFunction({
      name: 'getQuestionBank',
      data: { 
        studyProjectId: this.data.studyProjectId,
        storagePath: 'exam_docs/ruankao/senior/system_analyst/chapter_practice/question_bank.json'
      },
      success: function(res) {
        wx.hideLoading();
        console.log('[Chapters] 章节数据:', res);
        if (res.result && res.result.success) {
          that.setData({
            examName: res.result.examName,
            totalQuestions: res.result.totalQuestions,
            chapters: res.result.chapters
          });
        } else {
          wx.showToast({ title: '加载章节失败', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('[Chapters] 加载章节失败:', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  selectChapter: function(e) {
    const chapterName = e.currentTarget.dataset.chapter;
    console.log('[Chapters] 选择章节:', chapterName);
    
    wx.navigateTo({
      url: `/pages/study/practice/practice?studyProjectId=${this.data.studyProjectId}&chapterName=${encodeURIComponent(chapterName)}`
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});