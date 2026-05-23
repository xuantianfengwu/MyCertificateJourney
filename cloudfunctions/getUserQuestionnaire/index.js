// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userId } = event;
  
  try {
    // 查询用户问卷记录
    const result = await db.collection('userQuestionnaire')
      .where({ userId })
      .get();
    
    if (result.data.length > 0) {
      // 用户已提交问卷
      const questionnaire = result.data[0];
      return {
        hasSubmitted: true,
        submitTime: questionnaire.submitTime,
        recommendations: questionnaire.recommendations || []
      };
    } else {
      // 用户未提交问卷
      return {
        hasSubmitted: false
      };
    }
  } catch (error) {
    console.error('Error getting user questionnaire:', error);
    return {
      hasSubmitted: false,
      error: error.message || '获取问卷状态失败'
    };
  }
}