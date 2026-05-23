// pages/study/practice/practice.js
const app = getApp();

Page({
  data: {
    // 科目信息
    studyProjectId: 0,
    examName: '系统分析师',
    totalQuestions: 0,
    
    // 章节列表
    chapters: [],
    selectedChapterIndex: -1,
    
    // 当前题目
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    showAnswer: false,
    
    // 练习模式
    mode: 'chapter', // chapter: 章节选择, practice: 练习模式, result: 结果模式
    practiceResult: {
      total: 0,
      correct: 0,
      wrong: 0
    }
  },

  onLoad: function(options) {
    console.log('[Practice] onLoad 开始', JSON.stringify(options));
    
    const studyProjectId = parseInt(options.studyProjectId);
    console.log('[Practice] studyProjectId 参数值:', studyProjectId, typeof studyProjectId);
    
    this.setData({ studyProjectId });
    console.log('[Practice] 已设置 studyProjectId:', this.data.studyProjectId);
    
    this.loadQuestionBank(options.chapterName);
  },

  // 加载题库信息
  loadQuestionBank: function(chapterName) {
    const that = this;
    console.log('[Practice] 开始加载题库...');
    console.log('[Practice] 当前 studyProjectId:', this.data.studyProjectId);
    console.log('[Practice] chapterName:', chapterName);
    
    const storagePath = 'exam_docs/ruankao/senior/system_analyst/chapter_practice/question_bank.json';
    console.log('[Practice] 题库存储路径:', storagePath);
    
    wx.showLoading({ title: '加载题库...' });
    
    wx.cloud.callFunction({
      name: 'getQuestionBank',
      data: { 
        studyProjectId: this.data.studyProjectId,
        storagePath: storagePath
      },
      success: function(res) {
        wx.hideLoading();
        console.log('[Practice] 云函数调用成功:', JSON.stringify(res));
        
        if (res.result) {
          console.log('[Practice] 返回结果 success:', res.result.success);
          
          if (res.result.success) {
            console.log('[Practice] 题库数据:', JSON.stringify(res.result));
            that.setData({
              examName: res.result.examName,
              totalQuestions: res.result.totalQuestions,
              chapters: res.result.chapters
            });
            console.log('[Practice] 题库加载成功，章节数量:', that.data.chapters.length);
            
            if (chapterName) {
              that.selectChapterDirectly(chapterName);
            }
          } else {
            console.error('[Practice] 加载题库失败 - 服务端返回失败:', res.result.message || '无错误信息');
            wx.showToast({ title: '加载题库失败', icon: 'none' });
          }
        } else {
          console.error('[Practice] 加载题库失败 - 无返回结果');
          wx.showToast({ title: '加载题库失败', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('[Practice] 云函数调用失败:', err);
        console.error('[Practice] 错误详情:', JSON.stringify(err));
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  
  // 直接选择章节并加载题目
  selectChapterDirectly: function(chapterName) {
    const chapters = this.data.chapters;
    const index = chapters.findIndex(chapter => chapter.chapterName === decodeURIComponent(chapterName));
    
    if (index === -1) {
      console.error('[Practice] 未找到章节:', chapterName);
      wx.showToast({ title: '未找到章节', icon: 'none' });
      return;
    }
    
    const chapter = chapters[index];
    
    this.setData({
      selectedChapterIndex: index,
      mode: 'practice',
      currentQuestionIndex: 0,
      userAnswers: {},
      showAnswer: false,
      practiceResult: { total: 0, correct: 0, wrong: 0 }
    });
    
    this.loadChapterQuestions(chapter.chapterName);
  },

  // 选择章节
  selectChapter: function(e) {
    const index = e.currentTarget.dataset.index;
    const chapter = this.data.chapters[index];
    
    this.setData({
      selectedChapterIndex: index,
      mode: 'practice',
      currentQuestionIndex: 0,
      userAnswers: {},
      showAnswer: false,
      practiceResult: { total: 0, correct: 0, wrong: 0 }
    });
    
    this.loadChapterQuestions(chapter.chapterName);
  },

  // 加载章节题目
  loadChapterQuestions: function(chapterName) {
    const that = this;
    wx.showLoading({ title: '加载题目...' });
    
    wx.cloud.callFunction({
      name: 'getQuestionsByChapter',
      data: { 
        studyProjectId: this.data.studyProjectId,
        storagePath: 'exam_docs/ruankao/senior/system_analyst/chapter_practice/question_bank.json',
        chapterName: chapterName
      },
      success: function(res) {
        wx.hideLoading();
        if (res.result.success) {
          that.setData({
            questions: res.result.questions,
            practiceResult: { 
              total: res.result.questions.length,
              correct: 0,
              wrong: 0
            }
          });
        } else {
          wx.showToast({ title: '加载题目失败', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('加载题目失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 选择答案
  selectAnswer: function(e) {
    if (this.data.showAnswer) return;
    
    const questionId = this.data.questions[this.data.currentQuestionIndex].question_id;
    const answer = e.currentTarget.dataset.answer;
    
    this.setData({
      [`userAnswers.${questionId}`]: answer
    });
  },

  // 显示答案
  showAnswerFn: function() {
    this.setData({ showAnswer: true });
    
    // 统计结果
    const currentQuestion = this.data.questions[this.data.currentQuestionIndex];
    const userAnswer = this.data.userAnswers[currentQuestion.question_id];
    const isCorrect = userAnswer && userAnswer === currentQuestion.answer;
    
    this.setData({
      practiceResult: {
        total: this.data.practiceResult.total,
        correct: this.data.practiceResult.correct + (isCorrect ? 1 : 0),
        wrong: this.data.practiceResult.wrong + (isCorrect ? 0 : 1)
      }
    });
  },

  // 下一题
  nextQuestion: function() {
    if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex + 1,
        showAnswer: false
      });
    } else {
      // 练习完成
      this.setData({ mode: 'result' });
    }
  },

  // 返回章节列表
  backToChapters: function() {
    this.setData({
      mode: 'chapter',
      selectedChapterIndex: -1,
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      showAnswer: false
    });
  },

  // 重新练习
  retryPractice: function() {
    const chapter = this.data.chapters[this.data.selectedChapterIndex];
    this.setData({
      mode: 'practice',
      currentQuestionIndex: 0,
      userAnswers: {},
      showAnswer: false,
      practiceResult: { 
        total: this.data.practiceResult.total,
        correct: 0,
        wrong: 0
      }
    });
    this.loadChapterQuestions(chapter.chapterName);
  },

  // 提交练习记录
  submitPractice: function() {
    const that = this;
    wx.cloud.callFunction({
      name: 'submitPracticeRecord',
      data: {
        studyProjectId: this.data.studyProjectId,
        chapterName: this.data.chapters[this.data.selectedChapterIndex].chapterName,
        totalQuestions: this.data.practiceResult.total,
        correctCount: this.data.practiceResult.correct,
        wrongCount: this.data.practiceResult.wrong,
        userAnswers: this.data.userAnswers,
        questions: this.data.questions
      },
      success: function(res) {
        if (res.result.success) {
          wx.showToast({ title: '提交成功', icon: 'success' });
        } else {
          wx.showToast({ title: '提交失败', icon: 'none' });
        }
      },
      fail: function(err) {
        console.error('提交失败', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});
