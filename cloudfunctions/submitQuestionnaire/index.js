// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 推荐等级映射函数
function mapScoreToLevel(score) {
  if (score >= 80) return 'stronglyRecommend';  // 强烈推荐
  if (score >= 50) return 'recommend';          // 推荐
  return 'notRecommend';                         // 不推荐
}

// 生成随机推荐原因
function generateReasons(exam) {
  const reasons = [
    '与您的职业背景匹配',
    '与您的兴趣爱好相关',
    '考试难度适中',
    '学习时间要求合理',
    '可享受个税抵扣政策',
    '就业前景良好',
    '证书含金量高',
    '考试通过率较高',
    '考试费用合理',
    '适合您的教育背景'
  ];
  
  // 随机选择2-3个原因
  const selectedReasons = [];
  const reasonCount = Math.floor(Math.random() * 2) + 2;
  
  for (let i = 0; i < reasonCount; i++) {
    const randomIndex = Math.floor(Math.random() * reasons.length);
    if (!selectedReasons.includes(reasons[randomIndex])) {
      selectedReasons.push(reasons[randomIndex]);
    }
  }
  
  return selectedReasons;
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { userId, answers } = event;
  
  try {
    // 1. 保存用户问卷答案
    const userQuestionnaireData = {
      userId,
      educationExperience: answers.educationExperience || '',
      occupation: answers.occupation || '',
      industry: answers.industry || '',
      otherCertificates: answers.otherCertificates || '',
      submitTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 2. 使用模拟考试数据（因为考试数据存储在本地CSV中）
    const allExams = [
      { _id: "1", name: "教师资格" },
      { _id: "2", name: "法律职业资格" },
      { _id: "3", name: "中国委托公证人资格(香港、澳门)" },
      { _id: "4", name: "注册会计师" },
      { _id: "5", name: "注册城乡规划师" },
      { _id: "6", name: "注册测绘师" },
      { _id: "7", name: "民用核安全设备无损检验人员" },
      { _id: "8", name: "国防科技工业军用核安全设备无损检验人员" },
      { _id: "9", name: "民用核设施操纵人员" },
      { _id: "10", name: "国防科技工业军用核设施操纵人员" },
      { _id: "11", name: "注册核安全工程师" },
      { _id: "12", name: "注册建筑师" },
      { _id: "13", name: "监理工程师" },
      { _id: "14", name: "房地产估价师" },
      { _id: "15", name: "造价工程师" },
      { _id: "16", name: "建造师" },
      { _id: "17", name: "注册结构工程师" },
      { _id: "18", name: "注册土木工程师" },
      { _id: "19", name: "注册化工工程师" },
      { _id: "20", name: "注册电气工程师" },
      { _id: "21", name: "注册公用设备工程师" },
      { _id: "22", name: "注册环保工程师" },
      { _id: "23", name: "注册验船师" },
      { _id: "24", name: "船员资格（含船员、渔业船员）" },
      { _id: "25", name: "执业兽医" },
      { _id: "26", name: "演出经纪人员资格" },
      { _id: "27", name: "导游资格" },
      { _id: "28", name: "医师" },
      { _id: "29", name: "乡村医生" },
      { _id: "30", name: "人体器官移植医师" },
      { _id: "31", name: "职业病诊断医师" },
      { _id: "32", name: "护士执业资格" },
      { _id: "33", name: "母婴保健技术服务人员资格" },
      { _id: "34", name: "注册安全工程师" },
      { _id: "35", name: "注册消防工程师" },
      { _id: "36", name: "注册计量师" },
      { _id: "37", name: "特种设备检验、检测人员资格" },
      { _id: "38", name: "广播电视播音员、主持人资格" },
      { _id: "39", name: "新闻记者职业资格" },
      { _id: "40", name: "空勤人员、地面人员" },
      { _id: "41", name: "民用航空器外国驾驶员、领航员、飞行机械员、飞行通信员" },
      { _id: "42", name: "航空安全员" },
      { _id: "43", name: "民用航空电信人员、航行情报人员、气象人员" },
      { _id: "44", name: "执业药师" },
      { _id: "45", name: "专利代理师" },
      { _id: "46", name: "拍卖师" },
      { _id: "47", name: "工程咨询（投资）专业技术人员职业资格" },
      { _id: "48", name: "通信专业技术人员职业资格" },
      { _id: "49", name: "计算机技术与软件专业技术资格" },
      { _id: "50", name: "社会工作者职业资格" },
      { _id: "51", name: "会计专业技术资格" },
      { _id: "52", name: "资产评估师" },
      { _id: "53", name: "经济专业技术资格" },
      { _id: "54", name: "不动产登记代理专业人员职业资格" },
      { _id: "55", name: "矿业权评估师" },
      { _id: "56", name: "环境影响评价工程师" },
      { _id: "57", name: "房地产经纪专业人员职业资格" },
      { _id: "58", name: "机动车检测维修专业技术人员职业资格" },
      { _id: "59", name: "公路水运工程试验检测专业技术人员职业资格" },
      { _id: "60", name: "水利工程质量检测员资格" },
      { _id: "61", name: "卫生专业技术资格" },
      { _id: "62", name: "审计专业技术资格" },
      { _id: "63", name: "税务师" },
      { _id: "64", name: "认证人员职业资格" },
      { _id: "65", name: "设备监理师" },
      { _id: "66", name: "统计专业技术资格" },
      { _id: "67", name: "出版专业技术人员职业资格" },
      { _id: "68", name: "银行业专业人员职业资格" },
      { _id: "69", name: "精算师" },
      { _id: "70", name: "证券期货基金业从业人员资格" },
      { _id: "71", name: "文物保护工程从业资格" },
      { _id: "72", name: "翻译专业资格" },
      { _id: "73", name: "民用核安全设备焊工、焊接操作工" },
      { _id: "74", name: "国防科技工业军用核安全设备焊接人员" },
      { _id: "75", name: "保安员" },
      { _id: "76", name: "民航安全检查员" },
      { _id: "77", name: "消防员" },
      { _id: "78", name: "森林消防员" },
      { _id: "79", name: "应急救援员" },
      { _id: "80", name: "消防设施操作员" },
      { _id: "81", name: "游泳救生员" },
      { _id: "82", name: "社会体育指导员" },
      { _id: "83", name: "民航乘务员" },
      { _id: "84", name: "机场运行指挥员" },
      { _id: "85", name: "轨道列车司机" },
      { _id: "86", name: "危险货物道路运输从业人员" },
      { _id: "87", name: "放射性物品道路运输从业人员" },
      { _id: "88", name: "危险货物水路运输从业人员" },
      { _id: "89", name: "经营性客运驾驶员" },
      { _id: "90", name: "经营性货运驾驶员" },
      { _id: "91", name: "出租汽车驾驶员" },
      { _id: "92", name: "特种作业人员" },
      { _id: "93", name: "建筑施工特种作业人员" },
      { _id: "94", name: "特种设备安全管理和作业人员" },
      { _id: "95", name: "家畜繁殖员" }
    ];
    
    // 3. 使用随机数算法计算每个考试的匹配分数
    const scoredExams = allExams.map(exam => ({
      exam,
      score: Math.floor(Math.random() * 101), // 0-100的随机分数
      reasons: generateReasons(exam)
    }));
    
    // 4. 生成推荐等级
    const recommendations = scoredExams
      .sort((a, b) => b.score - a.score)
      .map(item => ({
        examId: item.exam._id,
        examName: item.exam.name,
        level: mapScoreToLevel(item.score),
        reasons: item.reasons,
        matchScore: item.score
      }));
    
    // 5. 更新用户的推荐结果
    userQuestionnaireData.recommendations = recommendations;
    
    // 6. 检查用户是否已存在问卷记录
    const existingRecord = await db.collection('userQuestionnaire')
      .where({ userId })
      .get();
    
    if (existingRecord.data.length > 0) {
      // 更新现有记录
      await db.collection('userQuestionnaire')
        .doc(existingRecord.data[0]._id)
        .update({
          data: {
            ...userQuestionnaireData,
            updatedAt: new Date()
          }
        });
    } else {
      // 创建新记录
      await db.collection('userQuestionnaire').add({
        data: userQuestionnaireData
      });
    }
    
    return {
      success: true,
      recommendations: recommendations
    };
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return {
      success: false,
      error: error.message || '提交问卷失败'
    };
  }
}