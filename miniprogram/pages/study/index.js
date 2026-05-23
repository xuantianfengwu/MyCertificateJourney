// pages/study/index.js
// 引入数据访问模块
const dataAccess = require('../../utils/dataAccess.js');

// 临时缓存变量
let cachedStudyProjects = null;

Page({
  data: {
    // 登录相关状态
    showMask: false,
    maskType: 'login',
    showAuthModal: false,
    showInfoEditor: false,
    initialUserInfo: null,
    // 页面状态：intro（介绍页）、left（左门派页）、right（右门派页）
    pageState: 'intro',
    // 按考试分组的学习项目数据
    studyProjectsGrouped: [],
    // 当前选中的考试名称
    selectedExamName: '',
    // 确认选择弹窗
    showConfirmModal: false,
    confirmProjectId: 0,
    confirmProjectName: '',
    // 武学征程数据
    journeyData: [],
    // 盟主数据（按studyProjectId分组）
    championData: [],
    // 盟主挑战统计数据（按journeyData索引分组）
    championStatDataDict: {
      0: {
        studyProjectId: 0,
        championOrder: 1,
        championName: "盟主-左门派页",
        totalChallengeUserCount: 128,
        successChallengeUserCount: 85,
        failChallengeUserCount: 43,
        championPortraitUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20master%20standing%20on%20a%20platform%20with%20a%20championship%20belt%2C%20traditional%20Chinese%20style%2C%20dramatic%20lighting&image_size=landscape_16_9"
      },
      1: {
        studyProjectId: 0,
        championOrder: 1,
        championName: "盟主-右门派页",
        totalChallengeUserCount: 96,
        successChallengeUserCount: 62,
        failChallengeUserCount: 34,
        championPortraitUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=female%20martial%20arts%20master%20standing%20on%20a%20platform%20with%20a%20championship%20belt%2C%20traditional%20Chinese%20style%2C%20dramatic%20lighting&image_size=landscape_16_9"
      }
    },
    // 当前选中的科目
    selectedSubjectId: 0,
    // 显示历届盟主浮层
    showChampionsModal: false,
    // 显示退出师门确认弹窗
    showExitConfirm: false,
    // 倒计时秒数
    countdown: 0,
    // 倒计时定时器
    countdownTimer: null,
    // 当前选中科目的完整信息
    currentJourney: null,
    // 盟主挑战数据
    currentChampionData: null,
    // 弟子编号（当前选中科目）
    discipleNumber: 0,
    // 修炼进度（当前选中科目）
    studyProgress: 0,
    // 是否已是一代宗师（当前选中科目）
    isMaster: false,
    // 上传的图片
    uploadedImage: '',
    // 显示图片预览弹窗
    showImagePreview: false,
    // 显示视频预览
    showVideoPreview: false,
    // 预览图片URL
    previewImageUrl: '',
    // 预览视频URL
    previewVideoUrl: '',
    // 显示门派称号说明弹窗
    showTitleHelp: false,
    // 历届盟主数据
    previousChampions: [],
    // 显示门派秘史浮层
    showSectHistoryModal: false,
    // 门派秘史数据
    sectHistory: []
  },

  onLoad: function() {
    // 页面加载时初始化基础数据
    this.initPage();
  },

  onShow: function() {
    // 页面显示时重新检查登录状态
    console.log('学证页面显示，重新检查登录状态');
    const result = this.checkLoginStatus();
    if (result) {
      this.loadStudyProjectInfo();
      this.getUserStudyExams();
      this.getChampionsList();
      this.getSectHistory();
      return;
    }
  },

  // 登录成功回调
  onLoginSuccess: function() {
    this.initPage();
    this.loadStudyProjectInfo();
    this.getUserStudyExams();
    this.getChampionsList();
    this.getSectHistory();
  },

  // 加载studyProjectsInfo数据（带缓存）
  loadStudyProjectInfo: function() {
    // 如果有缓存，直接返回缓存数据
    if (cachedStudyProjects) {
      console.log('使用缓存的studyProjects数据');
      return cachedStudyProjects;
    }
    // 硬编码维护的studyProjects
    cachedStudyProjects = [
  {"projectId":10101,"examId":1,"examName":"教师资格","examLevelId":101,"examLevelName":"幼儿园","projectName":"综合素质","projectIcon":"📚","textBooks":[{"id":1,"title":"《综合素质》教材精讲","desc":"职业理念、教育法律法规、教师职业道德规范、文化素养"},{"id":2,"title":"《综合素质》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《综合素质》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10102,"examId":1,"examName":"教师资格","examLevelId":101,"examLevelName":"幼儿园","projectName":"保教知识与能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《保教知识与能力》教材精讲","desc":"学前教育原理、学前儿童发展、生活指导、环境创设、游戏活动指导、教育评价"},{"id":2,"title":"《保教知识与能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《保教知识与能力》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10201,"examId":1,"examName":"教师资格","examLevelId":102,"examLevelName":"小学","projectName":"综合素质","projectIcon":"📚","textBooks":[{"id":1,"title":"《综合素质》教材精讲","desc":"职业理念、教育法律法规、教师职业道德规范、文化素养、基本能力"},{"id":2,"title":"《综合素质》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《综合素质》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10202,"examId":1,"examName":"教师资格","examLevelId":102,"examLevelName":"小学","projectName":"教育教学知识与能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《教育教学知识与能力》教材精讲","desc":"教育基础、学生指导、班级管理、教学设计、教学实施、教学评价"},{"id":2,"title":"《教育教学知识与能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《教育教学知识与能力》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10301,"examId":1,"examName":"教师资格","examLevelId":103,"examLevelName":"初中","projectName":"综合素质","projectIcon":"📚","textBooks":[{"id":1,"title":"《综合素质》教材精讲","desc":"职业理念、教育法律法规、教师职业道德规范、文化素养、基本能力"},{"id":2,"title":"《综合素质》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《综合素质》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10302,"examId":1,"examName":"教师资格","examLevelId":103,"examLevelName":"初中","projectName":"教育知识与能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《教育知识与能力》教材精讲","desc":"教育基础知识和基本原理、中学课程、中学教学、中学生学习心理、中学生发展心理、中学生心理辅导、中学德育、中学班级管理与教师心理"},{"id":2,"title":"《教育知识与能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《教育知识与能力》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10303,"examId":1,"examName":"教师资格","examLevelId":103,"examLevelName":"初中","projectName":"学科知识与教学能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《学科知识》教材精讲","desc":"学科知识、学科教学知识、教学设计、教学实施、教学评价"},{"id":2,"title":"《学科知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《学科知识》教学设计模板","desc":"常用教学设计模板与案例"}],"storagePath":""},
  {"projectId":10401,"examId":1,"examName":"教师资格","examLevelId":104,"examLevelName":"高中","projectName":"综合素质","projectIcon":"📚","textBooks":[{"id":1,"title":"《综合素质》教材精讲","desc":"职业理念、教育法律法规、教师职业道德规范、文化素养、基本能力"},{"id":2,"title":"《综合素质》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《综合素质》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10402,"examId":1,"examName":"教师资格","examLevelId":104,"examLevelName":"高中","projectName":"教育知识与能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《教育知识与能力》教材精讲","desc":"教育基础知识和基本原理、课程理论知识、教学心理、学习心理、发展心理、德育心理、班级管理"},{"id":2,"title":"《教育知识与能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《教育知识与能力》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10403,"examId":1,"examName":"教师资格","examLevelId":104,"examLevelName":"高中","projectName":"学科知识与教学能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《学科知识》教材精讲","desc":"学科知识、学科教学知识、教学设计、教学实施、教学评价"},{"id":2,"title":"《学科知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《学科知识》教学设计模板","desc":"常用教学设计模板与案例"}],"storagePath":""},
  {"projectId":10501,"examId":1,"examName":"教师资格","examLevelId":105,"examLevelName":"中等职业学校","projectName":"综合素质","projectIcon":"📚","textBooks":[{"id":1,"title":"《综合素质》教材精讲","desc":"职业道德、职业素养、法律法规、历史文化、信息技术"},{"id":2,"title":"《综合素质》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《综合素质》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10502,"examId":1,"examName":"教师资格","examLevelId":105,"examLevelName":"中等职业学校","projectName":"教育知识与能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《教育知识与能力》教材精讲","desc":"教育学、心理学、教育心理学、教学设计、班级管理"},{"id":2,"title":"《教育知识与能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《教育知识与能力》考点速记","desc":"高频考点汇总，快速记忆版"}],"storagePath":""},
  {"projectId":10503,"examId":1,"examName":"教师资格","examLevelId":105,"examLevelName":"中等职业学校","projectName":"学科知识与教学能力","projectIcon":"📚","textBooks":[{"id":1,"title":"《学科知识》教材精讲","desc":"学科知识、教学知识、教学设计、教学实施"},{"id":2,"title":"《学科知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《学科知识》教学设计模板","desc":"教学设计模板与案例分析"}],"storagePath":""},
  {"projectId":20101,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"刑法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《刑法》讲义精要","desc":"刑法概述、犯罪论、刑罚论、罪名详解"},{"id":2,"title":"《刑法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《刑法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20102,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"民法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《民法》讲义精要","desc":"民法总则、物权、合同、人格权、婚姻家庭、继承、侵权责任"},{"id":2,"title":"《民法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《民法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20103,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"行政法与行政诉讼法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《行政法》讲义精要","desc":"行政法概述、行政许可、行政处罚、行政强制、行政复议、行政诉讼"},{"id":2,"title":"《行政法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《行政法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20104,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"刑事诉讼法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《刑事诉讼法》讲义精要","desc":"立案、侦查、起诉、审判、执行、特别程序"},{"id":2,"title":"《刑事诉讼法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《刑事诉讼法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20105,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"民事诉讼法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《民事诉讼法》讲义精要","desc":"民事诉讼法总则、审判程序、执行程序、仲裁"},{"id":2,"title":"《民事诉讼法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《民事诉讼法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20106,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"商法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《商法》讲义精要","desc":"公司法、合伙企业法、企业破产法、票据法、保险法、证券法"},{"id":2,"title":"《商法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《商法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20107,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"经济法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《经济法》讲义精要","desc":"竞争法、消费者法、银行业法、财税法、劳动法、环境资源法"},{"id":2,"title":"《经济法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《经济法》重点法条","desc":"必备法条速记与理解"}],"storagePath":""},
  {"projectId":20108,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"国际法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《国际法》讲义精要","desc":"国际法导论、国际法主体、国际法律责任、国际法各领域"},{"id":2,"title":"《国际法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《国际法》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":20109,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"国际私法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《国际私法》讲义精要","desc":"国际私法导论、法律适用、涉外民商事法律适用、国际民事诉讼、国际商事仲裁"},{"id":2,"title":"《国际私法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《国际私法》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":20110,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"国际经济法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《国际经济法》讲义精要","desc":"国际经济法导论、货物贸易、服务贸易、知识产权贸易、国际投资、国际金融"},{"id":2,"title":"《国际经济法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《国际经济法》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":20111,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"宪法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《宪法》讲义精要","desc":"宪法基本理论、国家基本制度、公民的基本权利与义务、国家机构"},{"id":2,"title":"《宪法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《宪法》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":20112,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"法理学","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《法理学》讲义精要","desc":"法的本体、法的运行、法的演进、法与社会"},{"id":2,"title":"《法理学》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《法理学》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":20113,"examId":2,"examName":"法律职业资格","examLevelId":201,"examLevelName":"无","projectName":"中国特色社会主义法治理论","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《中国特色社会主义法治理论》讲义精要","desc":"法治理论概述、全面依法治国总目标、法治道路、法治体系"},{"id":2,"title":"《中国特色社会主义法治理论》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《中国特色社会主义法治理论》重点知识点","desc":"高频考点速记"}],"storagePath":""},
  {"projectId":40101,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"会计","projectIcon":"💰","textBooks":[{"id":1,"title":"《会计》教材精讲","desc":"财务会计基本理论、资产、负债、所有者权益、收入费用利润、财务报告"},{"id":2,"title":"《会计》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《会计》分录大全","desc":"会计分录汇总与练习"}],"storagePath":""},
  {"projectId":40102,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"审计","projectIcon":"💰","textBooks":[{"id":1,"title":"《审计》教材精讲","desc":"审计基本原理、审计测试流程、各类交易和账户余额审计、审计报告"},{"id":2,"title":"《审计》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《审计》知识点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":40103,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"财务成本管理","projectIcon":"💰","textBooks":[{"id":1,"title":"《财务成本管理》教材精讲","desc":"财务管理基础、长期投资决策、长期筹资决策、营运资本管理、成本计算"},{"id":2,"title":"《财务成本管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《财务成本管理》公式大全","desc":"公式汇总与练习"}],"storagePath":""},
  {"projectId":40104,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"公司战略与风险管理","projectIcon":"💰","textBooks":[{"id":1,"title":"《公司战略与风险管理》教材精讲","desc":"战略管理、公司治理、风险管理、内控"},{"id":2,"title":"《公司战略与风险管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《公司战略与风险管理》知识点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":40105,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"经济法","projectIcon":"💰","textBooks":[{"id":1,"title":"《经济法》教材精讲","desc":"物权法、合同法、合伙企业法、公司法、证券法、破产法、反垄断法"},{"id":2,"title":"《经济法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《经济法》重点法条","desc":"必备法条速记"}],"storagePath":""},
  {"projectId":40106,"examId":4,"examName":"注册会计师","examLevelId":401,"examLevelName":"专业阶段","projectName":"税法","projectIcon":"💰","textBooks":[{"id":1,"title":"《税法》教材精讲","desc":"增值税、消费税、企业所得税、个人所得税、关税、土地增值税等"},{"id":2,"title":"《税法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《税法》税率表","desc":"常用税率汇总与练习"}],"storagePath":""},
  {"projectId":40201,"examId":4,"examName":"注册会计师","examLevelId":402,"examLevelName":"综合阶段","projectName":"职业能力综合测试(试卷一)","projectIcon":"💰","textBooks":[{"id":1,"title":"《职业能力综合测试(试卷一)》讲义","desc":"会计、审计、税法综合运用"},{"id":2,"title":"《职业能力综合测试(试卷一)》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《职业能力综合测试(试卷一)》案例分析","desc":"典型案例分析与解答"}],"storagePath":""},
  {"projectId":40202,"examId":4,"examName":"注册会计师","examLevelId":402,"examLevelName":"综合阶段","projectName":"职业能力综合测试(试卷二)","projectIcon":"💰","textBooks":[{"id":1,"title":"《职业能力综合测试(试卷二)》讲义","desc":"财务成本管理、经济法、公司战略与风险管理综合运用"},{"id":2,"title":"《职业能力综合测试(试卷二)》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《职业能力综合测试(试卷二)》案例分析","desc":"典型案例分析与解答"}],"storagePath":""},
  {"projectId":270101,"examId":27,"examName":"导游资格","examLevelId":2701,"examLevelName":"无","projectName":"导游综合知识(笔试)","projectIcon":"🌍","textBooks":[{"id":1,"title":"《导游综合知识》教材","desc":"导游考试核心知识，全国导游基础知识"},{"id":2,"title":"《导游综合知识》历年试题","desc":"历年真题及解析"},{"id":3,"title":"《导游综合知识》知识点提纲","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":270102,"examId":27,"examName":"导游资格","examLevelId":2701,"examLevelName":"无","projectName":"导游服务能力(面试)","projectIcon":"🎯","textBooks":[{"id":1,"title":"《导游服务能力》教材","desc":"导游业务规范与服务能力"},{"id":2,"title":"《导游服务能力》面试技巧","desc":"面试答题技巧和案例"},{"id":3,"title":"《导游服务能力》模拟演练","desc":"实景模拟演练题目"}],"storagePath":""},
  {"projectId":490101,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4901,"examLevelName":"初级","projectName":"程序员","projectIcon":"💻","textBooks":[{"id":1,"title":"《程序员》教材精讲","desc":"计算机基础知识、程序设计基础、操作系统基础知识、网络基础知识、数据库技术、软件工程"},{"id":2,"title":"《程序员》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《程序员》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490102,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4901,"examLevelName":"初级","projectName":"网络管理员","projectIcon":"💻","textBooks":[{"id":1,"title":"《网络管理员》教材精讲","desc":"计算机网络基础知识、网络设备配置、网络安全、网络管理与故障排除"},{"id":2,"title":"《网络管理员》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《网络管理员》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490103,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4901,"examLevelName":"初级","projectName":"信息处理技术员","projectIcon":"💻","textBooks":[{"id":1,"title":"《信息处理技术员》教材精讲","desc":"信息处理基础知识、计算机基础知识、Word/Excel/PowerPoint使用"},{"id":2,"title":"《信息处理技术员》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《信息处理技术员》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490104,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4901,"examLevelName":"初级","projectName":"多媒体应用制作技术员","projectIcon":"💻","textBooks":[{"id":1,"title":"《多媒体应用制作技术员》教材精讲","desc":"多媒体基础知识、图像处理、音频处理、视频处理"},{"id":2,"title":"《多媒体应用制作技术员》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《多媒体应用制作技术员》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490201,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"软件设计师","projectIcon":"💻","textBooks":[{"id":1,"title":"《软件设计师》教材精讲","desc":"计算机系统知识、程序设计语言、操作系统、系统开发和运行知识、网络基础知识、数据库知识、安全性知识、标准化知识、知识产权、软件工程"},{"id":2,"title":"《软件设计师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《软件设计师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490202,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"网络工程师","projectIcon":"💻","textBooks":[{"id":1,"title":"《网络工程师》教材精讲","desc":"网络基础知识、网络设备、网络协议、路由与交换、网络安全、网络管理与故障排除、Windows/Linux网络配置"},{"id":2,"title":"《网络工程师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《网络工程师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490203,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"数据库系统工程师","projectIcon":"💻","textBooks":[{"id":1,"title":"《数据库系统工程师》教材精讲","desc":"数据库系统概论、关系数据库、SQL语言、数据库设计、数据库保护、数据库系统运行和管理、数据库发展趋势与新技术"},{"id":2,"title":"《数据库系统工程师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《数据库系统工程师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490204,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"信息系统监理师","projectIcon":"💻","textBooks":[{"id":1,"title":"《信息系统监理师》教材精讲","desc":"信息系统集成技术、信息系统系统集成技术、信息系统工程监理知识、质量控制、进度控制、投资控制、合同管理、信息安全监理"},{"id":2,"title":"《信息系统监理师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《信息系统监理师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490205,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"系统集成项目管理工程师","projectIcon":"💻","textBooks":[{"id":1,"title":"《系统集成项目管理工程师》教材精讲","desc":"系统集成技术知识、项目管理知识、法律法规和标准规范、项目管理实践"},{"id":2,"title":"《系统集成项目管理工程师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《系统集成项目管理工程师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490206,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"信息系统管理工程师","projectIcon":"💻","textBooks":[{"id":1,"title":"《信息系统管理工程师》教材精讲","desc":"信息系统建设、信息系统运维管理、信息安全管理、信息系统综合测试、信息系统评价"},{"id":2,"title":"《信息系统管理工程师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《信息系统管理工程师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490207,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4902,"examLevelName":"中级","projectName":"嵌入式系统设计师","projectIcon":"💻","textBooks":[{"id":1,"title":"《嵌入式系统设计师》教材精讲","desc":"嵌入式系统基础知识、嵌入式处理器、嵌入式软件、硬件设计、嵌入式系统可靠性与可靠性、嵌入式系统测试"},{"id":2,"title":"《嵌入式系统设计师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《嵌入式系统设计师》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":490301,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4903,"examLevelName":"高级","projectName":"系统架构设计师","projectIcon":"💻","textBooks":[{"id":1,"title":"《系统架构设计师》教材精讲","desc":"计算机系统基础知识、系统架构设计理论、软件架构设计、系统质量属性与架构评估、软件可靠性、存储管理、嵌入式系统设计、系统安全与可靠性"},{"id":2,"title":"《系统架构设计师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《系统架构设计师》论文写作","desc":"论文写作指导与范文"}],"storagePath":""},
  {"projectId":490302,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4903,"examLevelName":"高级","projectName":"信息系统项目管理师","projectIcon":"💻","textBooks":[{"id":1,"title":"《信息系统项目管理师》教材精讲","desc":"信息系统项目管理知识体系、项目立项管理、项目整体管理、项目范围管理、项目进度管理、项目成本管理、项目质量管理、项目人力资源管理、项目沟通管理、项目风险管理、项目采购管理、项目干系人管理、项目配置管理、法律法规和标准规范"},{"id":2,"title":"《信息系统项目管理师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《信息系统项目管理师》论文写作","desc":"论文写作指导与范文"}],"storagePath":""},
  {"projectId":490303,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4903,"examLevelName":"高级","projectName":"网络规划设计师","projectIcon":"💻","textBooks":[{"id":1,"title":"《网络规划设计师》教材精讲","desc":"网络规划与设计理论、网络技术演进、局域网与城域网技术、广域网与接入网技术、网络安全技术、网络服务器系统、存储系统、网络管理、机房设计"},{"id":2,"title":"《网络规划设计师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《网络规划设计师》论文写作","desc":"论文写作指导与范文"}],"storagePath":""},
  {"projectId":490304,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4903,"examLevelName":"高级","projectName":"系统分析师","projectIcon":"💻","textBooks":[{"id":1,"title":"《系统分析师》教材精讲","desc":"计算机组成与体系结构、操作系统、数据库系统、计算机网络、信息安全、系统可靠性、系统配置与性能评价、企业信息化战略与实施、软件工程、需求工程、软件架构设计、系统设计、项目管理"},{"id":2,"title":"《系统分析师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《系统分析师》论文写作","desc":"论文写作指导与范文"}],"storagePath":"exam_docs/ruankao/senior/system_analyst/chapter_practice/question_bank.json"},
  {"projectId":490305,"examId":49,"examName":"计算机技术与软件专业技术资格","examLevelId":4903,"examLevelName":"高级","projectName":"系统规划与管理师","projectIcon":"💻","textBooks":[{"id":1,"title":"《系统规划与管理师》教材精讲","desc":"信息系统战略规划、IT资源管理、IT服务管理、项目管理、职业道德规范、信息系统基础、计算机网络基础、数据库基础、法律法规"},{"id":2,"title":"《系统规划与管理师》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《系统规划与管理师》论文写作","desc":"论文写作指导与范文"}],"storagePath":""},
  {"projectId":500101,"examId":50,"examName":"社会工作者职业资格","examLevelId":5001,"examLevelName":"初级","projectName":"社会工作综合能力","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作综合能力》教材精讲","desc":"社会工作价值观与伦理、社会工作理论、个案工作方法、小组工作方法、社区工作方法、社会工作行政、社会工作研究"},{"id":2,"title":"《社会工作综合能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作综合能力》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":500102,"examId":50,"examName":"社会工作者职业资格","examLevelId":5001,"examLevelName":"初级","projectName":"社会工作实务","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作实务》教材精讲","desc":"社会工作实务领域：工作对象、方法运用、过程模式"},{"id":2,"title":"《社会工作实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":500201,"examId":50,"examName":"社会工作者职业资格","examLevelId":5002,"examLevelName":"中级","projectName":"社会工作综合能力","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作综合能力》教材精讲","desc":"社会工作理论与模式、社会工作方法、社会工作实务"},{"id":2,"title":"《社会工作综合能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作综合能力》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":500202,"examId":50,"examName":"社会工作者职业资格","examLevelId":5002,"examLevelName":"中级","projectName":"社会工作实务","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作实务》教材精讲","desc":"社会工作实务领域：服务对象问题、工作方法、过程模式"},{"id":2,"title":"《社会工作实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":500203,"examId":50,"examName":"社会工作者职业资格","examLevelId":5002,"examLevelName":"中级","projectName":"社会工作法规与政策","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作法规与政策》教材精讲","desc":"社会工作法规与政策：社会救助、婚姻家庭、优抚安置、社区矫正、禁毒戒毒、未成年人保护"},{"id":2,"title":"《社会工作法规与政策》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作法规与政策》重点法规","desc":"重点法规速记"}],"storagePath":""},
  {"projectId":500301,"examId":50,"examName":"社会工作者职业资格","examLevelId":5003,"examLevelName":"高级","projectName":"社会工作实务(高级)","projectIcon":"🤝","textBooks":[{"id":1,"title":"《社会工作实务(高级)》教材精讲","desc":"高级社会工作理论与方法、实务模式"},{"id":2,"title":"《社会工作实务(高级)》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《社会工作实务(高级)》案例分析","desc":"典型案例分析与解答"}],"storagePath":""},
  {"projectId":510101,"examId":51,"examName":"会计专业技术资格","examLevelId":5101,"examLevelName":"初级","projectName":"初级会计实务","projectIcon":"💰","textBooks":[{"id":1,"title":"《初级会计实务》教材","desc":"基础学习资料，掌握初级会计实务的基础知识"},{"id":2,"title":"《初级会计实务》历年试题","desc":"历年真题及解析"},{"id":3,"title":"《初级会计实务》知识点提纲","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":510102,"examId":51,"examName":"会计专业技术资格","examLevelId":5101,"examLevelName":"初级","projectName":"经济法基础","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《经济法基础》教材","desc":"基础学习资料，掌握经济法基础的基础知识"},{"id":2,"title":"《经济法基础》历年试题","desc":"历年真题及解析"},{"id":3,"title":"《经济法基础》知识点提纲","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":510201,"examId":51,"examName":"会计专业技术资格","examLevelId":5102,"examLevelName":"中级","projectName":"中级会计实务","projectIcon":"💰","textBooks":[{"id":1,"title":"《中级会计实务》教材精讲","desc":"存货、固定资产、无形资产、投资性房地产、长期股权投资、资产减值、负债、收入、政府补助、所得税、外币折算、租赁、财务报告"},{"id":2,"title":"《中级会计实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《中级会计实务》分录大全","desc":"会计分录汇总与练习"}],"storagePath":""},
  {"projectId":510202,"examId":51,"examName":"会计专业技术资格","examLevelId":5102,"examLevelName":"中级","projectName":"财务管理","projectIcon":"💰","textBooks":[{"id":1,"title":"《财务管理》教材精讲","desc":"筹资管理、投资管理、营运资金管理、成本管理、财务分析与评价"},{"id":2,"title":"《财务管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《财务管理》公式大全","desc":"公式汇总与练习"}],"storagePath":""},
  {"projectId":510203,"examId":51,"examName":"会计专业技术资格","examLevelId":5102,"examLevelName":"中级","projectName":"经济法","projectIcon":"⚖️","textBooks":[{"id":1,"title":"《经济法》教材精讲","desc":"公司法律制度、合伙企业法律制度、合同法律制度、增值税法律制度、企业所得税法律制度"},{"id":2,"title":"《经济法》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《经济法》重点法条","desc":"必备法条速记"}],"storagePath":""},
  {"projectId":510301,"examId":51,"examName":"会计专业技术资格","examLevelId":5103,"examLevelName":"高级","projectName":"高级会计实务","projectIcon":"💰","textBooks":[{"id":1,"title":"《高级会计实务》教材精讲","desc":"企业合并、合并财务报表、所得税会计、股权激励、套期保值、职工薪酬、企业合并会计、金融工具会计"},{"id":2,"title":"《高级会计实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《高级会计实务》案例分析","desc":"典型案例分析与解答"}],"storagePath":""},
  {"projectId":530101,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"经济基础知识","projectIcon":"📈","textBooks":[{"id":1,"title":"《经济基础知识》教材精讲","desc":"经济学基础、财政、货币与金融、统计、会计、法律"},{"id":2,"title":"《经济基础知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《经济基础知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530102,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-工商管理","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-工商管理》教材精讲","desc":"工商管理专业知识与实务"},{"id":2,"title":"《专业知识和实务-工商管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-工商管理》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530103,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-农业经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-农业经济》教材精讲","desc":"农业经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-农业经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-农业经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530104,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-财政税收","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-财政税收》教材精讲","desc":"财政税收专业知识与实务"},{"id":2,"title":"《专业知识和实务-财政税收》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-财政税收》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530105,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-金融","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-金融》教材精讲","desc":"金融专业知识与实务"},{"id":2,"title":"《专业知识和实务-金融》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-金融》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530106,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-保险","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-保险》教材精讲","desc":"保险专业知识与实务"},{"id":2,"title":"《专业知识和实务-保险》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-保险》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530107,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-运输经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-运输经济》教材精讲","desc":"运输经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-运输经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-运输经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530108,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-人力资源管理","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-人力资源管理》教材精讲","desc":"人力资源管理专业知识与实务"},{"id":2,"title":"《专业知识和实务-人力资源管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-人力资源管理》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530109,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-旅游经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-旅游经济》教材精讲","desc":"旅游经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-旅游经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-旅游经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530110,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-建筑与房地产经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-建筑与房地产经济》教材精讲","desc":"建筑与房地产经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-建筑与房地产经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-建筑与房地产经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530111,"examId":53,"examName":"经济专业技术资格","examLevelId":5301,"examLevelName":"初级","projectName":"专业知识和实务-知识产权","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-知识产权》教材精讲","desc":"知识产权专业知识与实务"},{"id":2,"title":"《专业知识和实务-知识产权》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-知识产权》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530201,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"经济基础知识","projectIcon":"📈","textBooks":[{"id":1,"title":"《经济基础知识》教材精讲","desc":"经济学基础、财政、货币与金融、统计、会计、法律"},{"id":2,"title":"《经济基础知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《经济基础知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530202,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-工商管理","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-工商管理》教材精讲","desc":"工商管理专业知识与实务"},{"id":2,"title":"《专业知识和实务-工商管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-工商管理》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530203,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-农业经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-农业经济》教材精讲","desc":"农业经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-农业经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-农业经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530204,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-财政税收","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-财政税收》教材精讲","desc":"财政税收专业知识与实务"},{"id":2,"title":"《专业知识和实务-财政税收》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-财政税收》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530205,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-金融","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-金融》教材精讲","desc":"金融专业知识与实务"},{"id":2,"title":"《专业知识和实务-金融》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-金融》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530206,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-保险","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-保险》教材精讲","desc":"保险专业知识与实务"},{"id":2,"title":"《专业知识和实务-保险》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-保险》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530207,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-运输经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-运输经济》教材精讲","desc":"运输经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-运输经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-运输经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530208,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-人力资源管理","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-人力资源管理》教材精讲","desc":"人力资源管理专业知识与实务"},{"id":2,"title":"《专业知识和实务-人力资源管理》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-人力资源管理》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530209,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-旅游经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-旅游经济》教材精讲","desc":"旅游经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-旅游经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-旅游经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530210,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-建筑与房地产经济","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-建筑与房地产经济》教材精讲","desc":"建筑与房地产经济专业知识与实务"},{"id":2,"title":"《专业知识和实务-建筑与房地产经济》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-建筑与房地产经济》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530211,"examId":53,"examName":"经济专业技术资格","examLevelId":5302,"examLevelName":"中级","projectName":"专业知识和实务-知识产权","projectIcon":"📈","textBooks":[{"id":1,"title":"《专业知识和实务-知识产权》教材精讲","desc":"知识产权专业知识与实务"},{"id":2,"title":"《专业知识和实务-知识产权》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《专业知识和实务-知识产权》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":530301,"examId":53,"examName":"经济专业技术资格","examLevelId":5303,"examLevelName":"高级","projectName":"高级经济实务","projectIcon":"📈","textBooks":[{"id":1,"title":"《高级经济实务》教材精讲","desc":"经济理论、工商管理理论、政策分析"},{"id":2,"title":"《高级经济实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《高级经济实务》论文写作","desc":"论文写作指导与范文"}],"storagePath":""},
  {"projectId":680101,"examId":68,"examName":"银行业专业人员职业资格","examLevelId":6801,"examLevelName":"初级","projectName":"银行业法律法规与综合能力","projectIcon":"🏦","textBooks":[{"id":1,"title":"《银行业法律法规与综合能力》教材精讲","desc":"银行业运行环境、银行业务、银行管理、银行业法律法规"},{"id":2,"title":"《银行业法律法规与综合能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《银行业法律法规与综合能力》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":680102,"examId":68,"examName":"银行业专业人员职业资格","examLevelId":6801,"examLevelName":"初级","projectName":"银行业专业实务","projectIcon":"🏦","textBooks":[{"id":1,"title":"《银行业专业实务》教材精讲","desc":"个人理财、风险管理、公司信贷、个人贷款"},{"id":2,"title":"《银行业专业实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《银行业专业实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":680201,"examId":68,"examName":"银行业专业人员职业资格","examLevelId":6802,"examLevelName":"中级","projectName":"银行业法律法规与综合能力","projectIcon":"🏦","textBooks":[{"id":1,"title":"《银行业法律法规与综合能力》教材精讲","desc":"银行业运行环境、银行基本业务、银行管理、内部控制、合规管理、稽核监督、银行业法律法规"},{"id":2,"title":"《银行业法律法规与综合能力》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《银行业法律法规与综合能力》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":680202,"examId":68,"examName":"银行业专业人员职业资格","examLevelId":6802,"examLevelName":"中级","projectName":"银行业专业实务","projectIcon":"🏦","textBooks":[{"id":1,"title":"《银行业专业实务》教材精讲","desc":"个人理财、风险管理、公司信贷、个人贷款、银行同业业务"},{"id":2,"title":"《银行业专业实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《银行业专业实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":660101,"examId":66,"examName":"统计专业技术资格","examLevelId":6601,"examLevelName":"初级","projectName":"统计学和统计法基础知识","projectIcon":"📊","textBooks":[{"id":1,"title":"《统计学和统计法基础知识》教材精讲","desc":"统计学基础知识、统计法规"},{"id":2,"title":"《统计学和统计法基础知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《统计学和统计法基础知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":660102,"examId":66,"examName":"统计专业技术资格","examLevelId":6601,"examLevelName":"初级","projectName":"统计专业知识和实务","projectIcon":"📊","textBooks":[{"id":1,"title":"《统计专业知识和实务》教材精讲","desc":"统计实务、国民经济统计、专业统计"},{"id":2,"title":"《统计专业知识和实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《统计专业知识和实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":660201,"examId":66,"examName":"统计专业技术资格","examLevelId":6602,"examLevelName":"中级","projectName":"统计基础理论及相关知识","projectIcon":"📊","textBooks":[{"id":1,"title":"《统计基础理论及相关知识》教材精讲","desc":"统计学基础知识、经济学基础知识、会计基础知识、国民经济统计、统计报表制度"},{"id":2,"title":"《统计基础理论及相关知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《统计基础理论及相关知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":660202,"examId":66,"examName":"统计专业技术资格","examLevelId":6602,"examLevelName":"中级","projectName":"统计工作实务","projectIcon":"📊","textBooks":[{"id":1,"title":"《统计工作实务》教材精讲","desc":"统计调查设计、统计整理、统计分析、国民经济统计、专业统计"},{"id":2,"title":"《统计工作实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《统计工作实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":660301,"examId":66,"examName":"统计专业技术资格","examLevelId":6603,"examLevelName":"高级","projectName":"高级统计实务与案例分析","projectIcon":"📊","textBooks":[{"id":1,"title":"《高级统计实务与案例分析》教材精讲","desc":"统计实务、统计案例分析"},{"id":2,"title":"《高级统计实务与案例分析》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《高级统计实务与案例分析》案例分析","desc":"典型案例分析与解答"}],"storagePath":""},
  {"projectId":620101,"examId":62,"examName":"审计专业技术资格","examLevelId":6201,"examLevelName":"初级","projectName":"审计专业相关知识","projectIcon":"🔍","textBooks":[{"id":1,"title":"《审计专业相关知识》教材精讲","desc":"审计基础知识、财务管理基础知识、法律基础知识"},{"id":2,"title":"《审计专业相关知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《审计专业相关知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":620102,"examId":62,"examName":"审计专业技术资格","examLevelId":6201,"examLevelName":"初级","projectName":"审计理论与实务","projectIcon":"🔍","textBooks":[{"id":1,"title":"《审计理论与实务》教材精讲","desc":"审计理论与方法、企业财务审计"},{"id":2,"title":"《审计理论与实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《审计理论与实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":620201,"examId":62,"examName":"审计专业技术资格","examLevelId":6202,"examLevelName":"中级","projectName":"审计专业相关知识","projectIcon":"🔍","textBooks":[{"id":1,"title":"《审计专业相关知识》教材精讲","desc":"宏观经济学基础、企业财务管理、企业战略与风险管理、法律"},{"id":2,"title":"《审计专业相关知识》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《审计专业相关知识》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":620202,"examId":62,"examName":"审计专业技术资格","examLevelId":6202,"examLevelName":"中级","projectName":"审计理论与实务","projectIcon":"🔍","textBooks":[{"id":1,"title":"《审计理论与实务》教材精讲","desc":"审计理论与方法、企业财务审计"},{"id":2,"title":"《审计理论与实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《审计理论与实务》考点速记","desc":"高频考点汇总"}],"storagePath":""},
  {"projectId":620301,"examId":62,"examName":"审计专业技术资格","examLevelId":6203,"examLevelName":"高级","projectName":"高级审计实务","projectIcon":"🔍","textBooks":[{"id":1,"title":"《高级审计实务》教材精讲","desc":"高级审计理论与方法、案例分析"},{"id":2,"title":"《高级审计实务》历年真题","desc":"历年考试真题及详细解析"},{"id":3,"title":"《高级审计实务》案例分析","desc":"典型案例分析与解答"}],"storagePath":""}
];

    console.log('已缓存studyProjects数据，共', cachedStudyProjects.length, '条');

    return cachedStudyProjects;
  },

  // 清除缓存（仅用于测试）
  clearStudyProjectsCache: function() {
    cachedStudyProjects = null;
    console.log('已清除studyProjects缓存');
  },

  // 构建完整的journeyData
  buildJourneyData: function(userStudyProjectInfoList) {
    const studyProjectInfo = this.loadStudyProjectInfo();
    console.log('buildJourneyData - studyProjectInfo:', studyProjectInfo);

    return userStudyProjectInfoList.map(item => {
      // 根据studyProjectId从studyProjectInfo中查找对应的数据
      const projectInfo = studyProjectInfo.find(project => project.projectId == item.studyProjectId);

      let textBooks = [];
      if (item.textbooks && item.textbooks.length > 0) {
        textBooks = item.textbooks;
      } else if (projectInfo && projectInfo.textBooks) {
        if (item.textBookResults) {
          const minLength = Math.min(projectInfo.textBooks.length, item.textBookResults.length);
          for (let i = 0; i < minLength; i++) {
            textBooks.push({
              ...projectInfo.textBooks[i],
              completed: typeof item.textBookResults[i] === 'boolean' ? item.textBookResults[i] : (item.textBookResults[i].completed || false)
            });
          }
        } else {
          textBooks = projectInfo.textBooks.map(book => ({
            ...book,
            completed: false
          }));
        }
      }

      return {
        studyProjectId: item.studyProjectId,
        examName: projectInfo ? projectInfo.examName : '',
        examLevelId: projectInfo ? projectInfo.examLevelId : '',
        examLevelName: projectInfo ? projectInfo.examLevelName : '',
        projectName: projectInfo ? projectInfo.projectName : '',
        examIcon: projectInfo ? projectInfo.projectIcon : '',
        storagePath: projectInfo ? projectInfo.storagePath : '',

        discipleNumber: item.discipleNumber,
        studyProgress: item.studyProgress,
        accuracy: item.accuracy,
        isMaster: item.isMaster,

        championOrder: item.championOrder,
        challengeCount: item.challengeCount,
        winRate: item.winRate,

        textBooks: textBooks
      };
    });
  },

  // 获取用户正在学习的项目数据
  getUserStudyExams: function() {
    const app = getApp();
    const userId = app.globalData.openid;

    if (!userId) {
      // 未登录，使用默认数据
      console.log('未登录，使用默认数据');
      return;
    }

    // 使用数据访问模块获取用户学习项目
    dataAccess.study.getUserStudyProjects((success, data) => {
      if (success && data && data.length > 0) {
        // 有学习记录，使用统一的数据处理函数
        this.processData(data);
      } else {
        // 没有学习记录，使用默认数据
        console.log('没有学习记录，使用模拟数据');
        // 模拟数据 - 包含0、1、2个元素的测试场景， 实际使用时根据真实云函数返回结果
        // 为了演示，这里使用2个元素的模拟数据，可以修改为 [] 或 [mockCloudData[0]] 来测试0个或1个元素的情况
        const mockCloudData = [
          {
            studyProjectId: 5101,
            discipleNumber: 8888,
            studyProgress: 100,
            accuracy: 80,
            isMaster: false,
            championOrder: 1,
            challengeCount: 25,
            winRate: 68,
            textBookResults: [false, false, true]
          },
          {
            studyProjectId: 5102,
            discipleNumber: 9999,
            studyProgress: 80,
            accuracy: 75,
            isMaster: false,
            championOrder: 2,
            challengeCount: 18,
            winRate: 72,
            textBookResults: [false, true, false]
          }
        ];
        const mockCloudData1 = [
          {
            studyProjectId: 5101,
            discipleNumber: 8888,
            studyProgress: 100,
            accuracy: 80,
            isMaster: false,
            championOrder: 1,
            challengeCount: 25,
            winRate: 68,
            textBookResults: [false, false, true]
          }
        ];
        const mockCloudData2 = []

        // 使用统一的数据处理函数
        this.processData(mockCloudData1);
      }
    });
  },

  // 统一数据处理函数
  processData: function(userStudyProjectInfoList) {
    let journeyData = [];
    if (userStudyProjectInfoList && userStudyProjectInfoList.length > 0) {
      journeyData = this.buildJourneyData(userStudyProjectInfoList);
    }

    // 为每个科目计算realm
    const journeyDataWithRealm = journeyData.map(item => ({
      ...item,
      realm: this.calculateRealm(item.studyProgress, item.isMaster)
    }));

    // 设置selectedSubjectId
    let selectedSubjectId = 0;
    if (journeyDataWithRealm.length > 0) {
      selectedSubjectId = journeyDataWithRealm[0].studyProjectId;
    }

    this.setData({
      journeyData: journeyDataWithRealm,
      selectedSubjectId: selectedSubjectId
    });

    // 更新盟主数据
    this.updateChampionData();
  },

  // 更新盟主数据
  updateChampionData: function() {
    const journeyData = this.data.journeyData;
    const championData = [];
    const championStatDataDict = {};

    // 遍历journeyData，为每个item获取盟主数据
    let asyncCount = 0;
    const totalItems = journeyData.length;

    if (totalItems === 0) {
      this.setData({
        championData: [],
        championStatDataDict: {}
      });
      return;
    }

    const self = this;
    journeyData.forEach(function(item, index) {
      asyncCount++;
      dataAccess.study.getProjectChampions(item.studyProjectId, function(success, champions) {
        asyncCount--;
        if (success && champions) {
          // 存储该studyProjectId对应的盟主数据
          championData[index] = champions;

          // 根据item的championOrder获取对应的盟主信息
          const currentChampion = champions.find(function(c) {
            return c.championOrder === item.championOrder;
          });

          if (currentChampion) {
            championStatDataDict[index] = {
              studyProjectId: item.studyProjectId,
              championOrder: currentChampion.championOrder,
              championName: currentChampion.championName,
              totalChallengeUserCount: currentChampion.totalChallengeUserCount,
              successChallengeUserCount: currentChampion.successChallengeUserCount,
              failChallengeUserCount: currentChampion.failChallengeUserCount,
              championPortraitUrl: currentChampion.championPortraitUrl
            };
          }
        }

        // 当所有异步请求都完成时更新数据
        if (asyncCount === 0) {
          self.setData({
            championData: championData,
            championStatDataDict: championStatDataDict
          });
          console.log('盟主数据更新完成', championData, championStatDataDict);
        }
      });
    });
  },

  // 点击"点击加入门派"按钮，跳转到选择门派页
  goToJoinPage: function() {
    // 构建按examName->examLevelName->projectName分组的结构
    const studyProjectInfo = this.loadStudyProjectInfo();
    const journeyData = this.data.journeyData;
    const joinedProjectIds = journeyData.map(item => item.studyProjectId);
    const grouped = {};

    studyProjectInfo.forEach(project => {
      if (!grouped[project.examName]) {
        grouped[project.examName] = {};
      }
      if (!grouped[project.examName][project.examLevelName]) {
        grouped[project.examName][project.examLevelName] = [];
      }
      grouped[project.examName][project.examLevelName].push({
        projectId: project.projectId,
        projectName: project.projectName,
        projectIcon: project.projectIcon || '',
        disabled: joinedProjectIds.includes(project.projectId)
      });
    });

    // 转换为数组格式
    const studyProjectsGrouped = Object.keys(grouped).map(examName => ({
      examName: examName,
      levels: Object.keys(grouped[examName]).map(examLevelName => ({
        examLevelName: examLevelName,
        projects: grouped[examName][examLevelName]
      }))
    }));

    this.setData({
      pageState: 'join',
      studyProjectsGrouped: studyProjectsGrouped
    });
    console.log('跳转到选择门派页');
  },

  // 点击选择项目按钮，加入门派
  selectProject: function(e) {
    const projectId = e.currentTarget.dataset.id;
    const studyProjectInfo = this.loadStudyProjectInfo();
    const projectInfo = studyProjectInfo.find(p => p.projectId == projectId);

    if (!projectInfo) {
      console.error('未找到项目信息', projectId);
      return;
    }

    // 使用数据访问模块创建学习项目
    dataAccess.study.createUserStudyProject(
      projectId,
      projectInfo.textBooks ? projectInfo.textBooks.length : 0,
      (success, data) => {
        if (success) {
          // 构建新加入的门派数据
          const newJourneyItem = {
            studyProjectId: projectInfo.projectId,
            discipleNumber: data.discipleNumber,
            studyProgress: 0,
            accuracy: 0,
            isMaster: false,
            championOrder: 1,
            challengeCount: 0,
            winRate: 0,
            examName: projectInfo.examName,
            examLevelId: projectInfo.examLevelId,
            examLevelName: projectInfo.examLevelName,
            projectName: projectInfo.projectName,
            examIcon: projectInfo.projectIcon,
            textBooks: projectInfo.textBooks ? projectInfo.textBooks.map(book => ({...book, completed: false})) : [],
            realm: '初出茅庐'
          };

          // 获取当前journeyData
          const currentJourneyData = this.data.journeyData;
          const newIndex = currentJourneyData.length;
          const updatedJourneyData = [...currentJourneyData, newJourneyItem];

          // 确定pageState
          let pageState = 'left';
          if (updatedJourneyData.length > 1) {
            pageState = 'right';
          }

          this.setData({
            journeyData: updatedJourneyData,
            selectedSubjectId: projectId,
            pageState: pageState,
            currentJourney: newJourneyItem,
            discipleNumber: newJourneyItem.discipleNumber,
            studyProgress: newJourneyItem.studyProgress,
            isMaster: newJourneyItem.isMaster
          });

          wx.showToast({
            title: `已加入${projectInfo.projectName}`,
            icon: 'success',
            duration: 1500
          });

          console.log('已加入门派:', projectInfo.projectName);

          // 更新盟主数据
          this.updateChampionData();
        } else {
          console.error('创建学习项目失败');
          wx.showToast({
            title: '加入门派失败',
            icon: 'none',
            duration: 1500
          });
        }
      }
    );
  },

  // 点击examName按钮，展开/收起对应的examLevelName和projectName
  toggleExam: function(e) {
    const examName = e.currentTarget.dataset.name;
    if (this.data.selectedExamName === examName) {
      // 再次点击相同的examName，收起
      this.setData({
        selectedExamName: ''
      });
    } else {
      // 点击不同的examName，展开
      this.setData({
        selectedExamName: examName
      });
    }
  },

  // 点击projectName按钮，显示确认弹窗
  confirmSelectProject: function(e) {
    const projectId = e.currentTarget.dataset.id;
    const projectName = e.currentTarget.dataset.name;
    this.setData({
      showConfirmModal: true,
      confirmProjectId: projectId,
      confirmProjectName: projectName
    });
  },

  // 隐藏确认弹窗
  hideConfirmModal: function() {
    this.setData({
      showConfirmModal: false,
      confirmProjectId: 0,
      confirmProjectName: ''
    });
  },

  // 确认加入门派
  confirmJoinProject: function() {
    const projectId = this.data.confirmProjectId;
    const studyProjectInfo = this.loadStudyProjectInfo();
    const projectInfo = studyProjectInfo.find(p => p.projectId == projectId);

    if (!projectInfo) {
      console.error('未找到项目信息', projectId);
      return;
    }

    // 使用数据访问模块创建学习项目
    dataAccess.study.createUserStudyProject(
      projectId,
      projectInfo.textBooks ? projectInfo.textBooks.length : 0,
      (success, data) => {
        if (success) {
          // 构建新加入的门派数据
          const newJourneyItem = {
            studyProjectId: projectInfo.projectId,
            discipleNumber: data.discipleNumber,
            studyProgress: 0,
            accuracy: 0,
            isMaster: false,
            championOrder: 1,
            challengeCount: 0,
            winRate: 0,
            examName: projectInfo.examName,
            examLevelId: projectInfo.examLevelId,
            examLevelName: projectInfo.examLevelName,
            projectName: projectInfo.projectName,
            examIcon: projectInfo.projectIcon,
            textBooks: projectInfo.textBooks ? projectInfo.textBooks.map(book => ({...book, completed: false})) : [],
            realm: '初出茅庐'
          };

          // 获取当前journeyData
          const currentJourneyData = this.data.journeyData;
          const updatedJourneyData = [...currentJourneyData, newJourneyItem];

          // 确定pageState
          let pageState = 'left';
          if (updatedJourneyData.length > 1) {
            pageState = 'right';
          }

          this.setData({
            journeyData: updatedJourneyData,
            selectedSubjectId: projectId,
            pageState: pageState,
            currentJourney: newJourneyItem,
            discipleNumber: newJourneyItem.discipleNumber,
            studyProgress: newJourneyItem.studyProgress,
            isMaster: newJourneyItem.isMaster,
            showConfirmModal: false,
            confirmProjectId: 0,
            confirmProjectName: '',
            selectedExamName: ''
          });

          wx.showToast({
            title: `已加入${projectInfo.projectName}`,
            icon: 'success',
            duration: 1500
          });

          console.log('已加入门派:', projectInfo.projectName);

          // 更新盟主数据
          this.updateChampionData();
        } else {
          console.error('创建学习项目失败');
          wx.showToast({
            title: '加入门派失败',
            icon: 'none',
            duration: 1500
          });
          
          // 关闭确认弹窗
          this.setData({
            showConfirmModal: false,
            confirmProjectId: 0,
            confirmProjectName: '',
            selectedExamName: ''
          });
        }
      }
    );
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
    console.log('登录状态正常');
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
      // 授权成功，检查登录状态
      this.checkLoginStatus();
      // 登录成功，初始化页面
      this.onLoginSuccess();
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

    // 检查登录状态
    this.checkLoginStatus();
    // 登录成功，初始化页面
    this.onLoginSuccess();
  },

  // 处理信息编辑取消
  handleInfoCancel: function() {
    console.log('信息编辑取消');
    // 关闭信息编辑弹窗
    this.setData({
      showInfoEditor: false
    });
  },

  initPage: function() {
    // 可以在这里添加数据初始化逻辑
    // 例如从云数据库获取学习数据
    console.log('武学修炼中心初始化完成');
  },

  // 跳转到基础练习页面（先进入章节列表）
  goToPractice: function() {
    const selectedSubject = this.data.journeyData.find(item => item.studyProjectId === this.data.selectedSubjectId);
    if (selectedSubject) {
      wx.navigateTo({
        url: `/pages/study/practice/chapters?studyProjectId=${selectedSubject.studyProjectId}&storagePath=${encodeURIComponent(selectedSubject.storagePath || '')}`
      });
    } else {
      wx.showToast({ title: '请先选择科目', icon: 'none' });
    }
  },

  // 获取历届盟主列表（支持从云函数获取）
  getChampionsList: function() {
    // 这里应该调用云函数获取历届盟主数据
    // 现在使用模拟数据
    const championsData = this.mockGetChampions();
    this.setData({
      previousChampions: championsData
    });
  },

  // 模拟云函数：获取历届盟主
  mockGetChampions: function() {
    const championNames = [
      '任我行', '东方不败', '令狐冲', '风清扬', '独孤求败', '张三丰',
      '郭靖', '黄蓉', '杨过', '小龙女', '张无忌', '赵敏',
      '周伯通', '黄药师', '欧阳锋', '一灯大师', '洪七公', '王重阳',
      '段正淳', '段延庆', '乔峰', '段誉', '虚竹', '萧峰',
      '慕容复', '扫地僧', '鸠摩智', '阿紫', '游坦之', '丁春秋',
      '无崖子', '天山童姥', '李秋水', '苏星河', '丁春秋', '玄慈',
      '叶二娘', '岳老三', '云中鹤', '段正明', '刀白凤', '秦红棉',
      '甘宝宝', '阮星竹', '王夫人', '康敏', '马夫人', '白世镜',
      '全冠清', '陈友谅', '成昆', '谢逊', '殷天正', '韦一笑',
      '紫衫龙王', '青翼蝠王', '白眉鹰王', '金毛狮王'
    ];

    const champions = [];
    for (let i = 1; i <= 52; i++) {
      const round = i;
      const name = championNames[i % championNames.length];
      const images = [];
      for (let j = 1; j <= 7; j++) {
        images.push(
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20master%20portrait%20' + (i + j) + '&image_size=square'
        );
      }
      const video = 'https://example.com/video/martial_arts_' + i + '.mp4';

      champions.push({
        id: i,
        round: round,
        name: name,
        images: images,
        video: video
      });
    }
    return champions;
  },

  // 计算境界称号
  calculateRealm: function(studyProgress, isMaster) {
    if (isMaster) {
      return "一代宗师";
    }

    if (studyProgress >= 80) {
      return "登峰造极";
    } else if (studyProgress >= 60) {
      return "炉火纯青";
    } else if (studyProgress >= 40) {
      return "小有成就";
    } else if (studyProgress >= 20) {
      return "渐入佳境";
    } else {
      return "初出茅庐";
    }
  },

  // 选择科目
  selectSubject: function(e) {
    const subjectId = e.currentTarget.dataset.id;

    // 从journeyData中获取当前选中科目的详细信息
    const selectedJourney = this.data.journeyData.find(item => item.studyProjectId === subjectId);

    if (!selectedJourney) {
      console.error('未找到对应的科目数据', subjectId);
      return;
    }

    // 根据选择的科目设置页面状态
    // 通过journeyData中的索引来判断是left还是right
    const index = this.data.journeyData.findIndex(item => item.studyProjectId === subjectId);
    let pageState = index === 0 ? 'left' : 'right';

    // 获取championStatDataDict对应的盟主数据
    // championStatDataDict的key是journeyData的索引（0, 1, 2...）
    const championStatData = this.data.championStatDataDict[index];

    if (!championStatData) {
      console.error('未找到对应的盟主数据', index);
      return;
    }

    // 计算境界称号
    const realm = this.calculateRealm(selectedJourney.studyProgress, selectedJourney.isMaster);

    // 构建currentChampionData，包含盟主相关信息
    const currentChampionData = {
      studyProjectId: championStatData.studyProjectId,
      championOrder: championStatData.championOrder,
      championName: championStatData.championName,
      totalChallengeUserCount: championStatData.totalChallengeUserCount,
      successChallengeUserCount: championStatData.successChallengeUserCount,
      failChallengeUserCount: championStatData.failChallengeUserCount,
      championPortraitUrl: championStatData.championPortraitUrl
    };

    this.setData({
      selectedSubjectId: subjectId,
      pageState: pageState,
      currentJourney: {
        ...selectedJourney,
        realm: realm
      },
      currentChampionData: currentChampionData,
      discipleNumber: selectedJourney.discipleNumber,
      studyProgress: selectedJourney.studyProgress,
      isMaster: selectedJourney.isMaster
    });
    console.log('选择了科目:', subjectId, '页面状态:', pageState);
  },

  // 切换到介绍页
  goToIntroPage: function() {
    this.setData({
      pageState: 'intro',
      selectedSubjectId: 0 // 0表示未选中任何门派
    });
    console.log('切换到介绍页');
  },

  // 切换教材完成状态
  toggleTask: function(e) {
    const taskId = e.currentTarget.dataset.id;
    const currentJourney = {...this.data.currentJourney};
    const textbooks = currentJourney.textBooks;
    const taskIndex = textbooks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      textbooks[taskIndex].completed = !textbooks[taskIndex].completed;
      this.setData({
        currentJourney: currentJourney
      });

      // 如果完成，显示提示
      if (textbooks[taskIndex].completed) {
        wx.showToast({
          title: '已完成',
          icon: 'success',
          duration: 1500
        });
      }
    }
  },

  // 跳转到章节练习（保留，供其他地方调用）
  goToPracticeOld: function() {
    const selectedSubject = this.data.journeyData.find(item => item.studyProjectId === this.data.selectedSubjectId);
    if (selectedSubject) {
      wx.navigateTo({
        url: `/pages/study/practice/chapters?studyProjectId=${selectedSubject.studyProjectId}`
      });
    } else {
      wx.showToast({ title: '请先选择科目', icon: 'none' });
    }
  },

  // 跳转到模拟考试
  goToSimulation: function() {
    wx.navigateTo({
      url: '/pages/study/simulation'
    });
  },

  // 跳转到错题本
  goToError: function() {
    wx.navigateTo({
      url: '/pages/study/error'
    });
  },

  // 跳转到学习笔记
  goToNote: function() {
    wx.navigateTo({
      url: '/pages/study/note'
    });
  },

  // 显示历届盟主浮层
  showPreviousChampions: function() {
    this.setData({
      showChampionsModal: true
    });
  },

  // 隐藏历届盟主浮层
  hidePreviousChampions: function() {
    this.setData({
      showChampionsModal: false
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 阻止事件冒泡，防止点击浮层内容时关闭浮层
  },

  // 显示退出师门确认弹窗
  showExitConfirm: function() {
    // 重置倒计时
    this.setData({
      showExitConfirm: true,
      countdown: 10
    });

    // 启动倒计时
    this.startCountdown();
  },

  // 隐藏退出师门确认弹窗
  hideExitConfirm: function() {
    // 清除倒计时
    this.clearCountdown();
    this.setData({
      showExitConfirm: false,
      countdown: 0
    });
  },

  // 启动倒计时
  startCountdown: function() {
    // 清除之前的定时器
    this.clearCountdown();

    // 启动新的定时器
    this.data.countdownTimer = setInterval(() => {
      const countdown = this.data.countdown - 1;
      if (countdown < 0) {
        this.clearCountdown();
        this.setData({
          countdown: 0
        });
      } else {
        this.setData({
          countdown: countdown
        });
      }
    }, 1000);
  },

  // 清除倒计时
  clearCountdown: function() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
      this.data.countdownTimer = null;
    }
  },

  // 确认退出师门
  confirmExit: function() {
    const selectedSubjectId = this.data.selectedSubjectId;
    
    if (!selectedSubjectId) {
      console.error('未选中任何科目');
      return;
    }

    // 使用数据访问模块删除学习项目
    dataAccess.study.deleteUserStudyProject(selectedSubjectId, (success, data) => {
      if (success) {
        // 清除倒计时
        this.clearCountdown();

        // 显示退出成功提示
        wx.showToast({
          title: '已退出师门',
          icon: 'success',
          duration: 1500
        });

        // 关闭确认弹窗
        this.setData({
          showExitConfirm: false,
          countdown: 0
        });

        // 更新journeyData，移除已退出的科目
        const updatedJourneyData = this.data.journeyData.filter(item => item.studyProjectId !== selectedSubjectId);
        
        // 重新设置selectedSubjectId和页面状态
        let newSelectedSubjectId = 0;
        let newPageState = 'intro';
        let newCurrentJourney = null;
        let newCurrentChampionData = null;
        let newDiscipleNumber = 0;
        let newStudyProgress = 0;
        let newIsMaster = false;
        
        if (updatedJourneyData.length > 0) {
          newSelectedSubjectId = updatedJourneyData[0].studyProjectId;
          newPageState = updatedJourneyData.length > 1 ? 'right' : 'left';
          
          // 计算境界称号
          const realm = this.calculateRealm(updatedJourneyData[0].studyProgress, updatedJourneyData[0].isMaster);
          
          // 获取盟主数据
          const championIndex = 0;
          const championStatData = this.data.championStatDataDict[championIndex];
          
          newCurrentJourney = {
            ...updatedJourneyData[0],
            realm: realm
          };
          newDiscipleNumber = updatedJourneyData[0].discipleNumber;
          newStudyProgress = updatedJourneyData[0].studyProgress;
          newIsMaster = updatedJourneyData[0].isMaster;
          
          if (championStatData) {
            newCurrentChampionData = {
              studyProjectId: championStatData.studyProjectId,
              championOrder: championStatData.championOrder,
              championName: championStatData.championName,
              totalChallengeUserCount: championStatData.totalChallengeUserCount,
              successChallengeUserCount: championStatData.successChallengeUserCount,
              failChallengeUserCount: championStatData.failChallengeUserCount,
              championPortraitUrl: championStatData.championPortraitUrl
            };
          }
        }

        this.setData({
          journeyData: updatedJourneyData,
          selectedSubjectId: newSelectedSubjectId,
          pageState: newPageState,
          currentJourney: newCurrentJourney,
          currentChampionData: newCurrentChampionData,
          discipleNumber: newDiscipleNumber,
          studyProgress: newStudyProgress,
          isMaster: newIsMaster
        });

        console.log('已退出师门，当前科目数:', updatedJourneyData.length);

        // 更新盟主数据
        this.updateChampionData();
      } else {
        console.error('删除学习项目失败');
        wx.showToast({
          title: '退出师门失败',
          icon: 'none',
          duration: 1500
        });
        
        // 清除倒计时
        this.clearCountdown();
        
        // 关闭确认弹窗
        this.setData({
          showExitConfirm: false,
          countdown: 0
        });
      }
    });
  },

  // 选择图片
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          uploadedImage: tempFilePaths[0],
          showImagePreview: true
        });
      },
      fail: (err) => {
        console.log('选择图片失败', err);
      }
    });
  },

  // 提交审核
  submitImage: function() {
    // 这里应该上传图片到服务器，然后调用云函数进行审核
    // 现在只是模拟审核过程
    wx.showToast({
      title: '提交成功，审核中...',
      icon: 'success',
      duration: 1500
    });

    // 关闭预览弹窗
    this.setData({
      showImagePreview: false
    });
  },

  // 隐藏图片预览弹窗
  hideImagePreview: function() {
    this.setData({
      showImagePreview: false
    });
  },

  // 显示门派称号说明弹窗
  showTitleHelp: function() {
    this.setData({
      showTitleHelp: true
    });
  },

  // 隐藏门派称号说明弹窗
  hideTitleHelp: function() {
    this.setData({
      showTitleHelp: false
    });
  },

  // 预览图片
  previewImage: function(e) {
    const image = e.currentTarget.dataset.image;
    const empty = e.currentTarget.dataset.empty;

    if (empty) {
      wx.showToast({
        title: '您尚未获得该资源，快去挑战吧',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    this.setData({
      previewImageUrl: image,
      showImagePreview: true
    });
  },

  // 预览视频
  previewVideo: function(e) {
    const video = e.currentTarget.dataset.video;
    const empty = e.currentTarget.dataset.empty;

    if (empty) {
      wx.showToast({
        title: '您尚未获得该资源，快去挑战吧',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    this.setData({
      previewVideoUrl: video,
      showVideoPreview: true
    });
  },

  // 隐藏全屏预览
  hideFullscreenPreview: function() {
    this.setData({
      showImagePreview: false,
      showVideoPreview: false,
      previewImageUrl: '',
      previewVideoUrl: ''
    });
  },

  // 获取门派秘史数据（支持从云函数获取）
  getSectHistory: function() {
    // 这里应该调用云函数获取门派秘史数据
    // 现在使用模拟数据
    const sectHistoryData = this.mockGetSectHistory();
    this.setData({
      sectHistory: sectHistoryData
    });
  },

  // 模拟获取门派秘史数据
  mockGetSectHistory: function() {
    const historyData = [
      {
        id: 1,
        title: '门派创立',
        video: 'https://example.com/video/sect_founding.mp4',
        poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20sect%20founding%20ceremony%2C%20traditional%20Chinese%20style&image_size=landscape_16_9'
      },
      {
        id: 2,
        title: '第一次门派大战',
        video: 'https://example.com/video/first_war.mp4',
        poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20battle%2C%20traditional%20Chinese%20style&image_size=landscape_16_9'
      },
      {
        id: 3,
        title: '第二代掌门继位',
        video: 'https://example.com/video/second_master.mp4',
        poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20master%20succession%2C%20traditional%20Chinese%20style&image_size=landscape_16_9'
      },
      {
        id: 4,
        title: '门派鼎盛时期',
        video: 'https://example.com/video/golden_age.mp4',
        poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20sect%20golden%20age%2C%20traditional%20Chinese%20style&image_size=landscape_16_9'
      },
      {
        id: 5,
        title: '近代传承',
        video: 'https://example.com/video/modern_heritage.mp4',
        poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20heritage%20ceremony%2C%20traditional%20Chinese%20style&image_size=landscape_16_9'
      }
    ];
    return historyData;
  },

  // 显示门派秘史浮层
  showSectHistory: function() {
    this.setData({
      showSectHistoryModal: true
    });
  },

  // 隐藏门派秘史浮层
  hideSectHistory: function() {
    this.setData({
      showSectHistoryModal: false
    });
  },

  // 播放门派秘史视频
  playSectVideo: function(e) {
    const video = e.currentTarget.dataset.video;
    if (video) {
      this.setData({
        previewVideoUrl: video,
        showVideoPreview: true
      });
    }
  }

});