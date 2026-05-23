const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 提交练习记录
exports.main = async (event, context) => {
  const { studyProjectId, chapterName, totalQuestions, correctCount, wrongCount, userAnswers, questions } = event;
  
  try {
    // 获取用户信息
    const { OPENID } = cloud.getWXContext();
    
    // 计算正确率
    const accuracy = totalQuestions > 0 ? Math.round(correctCount / totalQuestions * 100) : 0;
    
    // 创建练习记录
    const result = await db.collection('userPracticeRecords').add({
      data: {
        userId: OPENID,
        studyProjectId,
        chapterName,
        totalQuestions,
        correctCount,
        wrongCount,
        accuracy,
        userAnswers,
        questions,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    // 更新用户学习统计
    await updateUserStudyStats(OPENID, studyProjectId, chapterName, correctCount, wrongCount);
    
    return {
      success: true,
      recordId: result._id
    };
  } catch (e) {
    console.error('提交练习记录失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 更新用户学习统计
async function updateUserStudyStats(userId, studyProjectId, chapterName, correctCount, wrongCount) {
  try {
    // 查找现有记录
    const res = await db.collection('userStudyProjectStats')
      .where({ userId, studyProjectId })
      .get();
    
    if (res.data.length > 0) {
      // 更新现有记录
      const stats = res.data[0];
      const totalCorrect = (stats.correctCount || 0) + correctCount;
      const totalWrong = (stats.wrongCount || 0) + wrongCount;
      const totalQuestions = totalCorrect + totalWrong;
      const newAccuracy = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
      
      await db.collection('userStudyProjectStats')
        .doc(stats._id)
        .update({
          data: {
            correctCount: totalCorrect,
            wrongCount: totalWrong,
            accuracy: newAccuracy,
            updatedAt: new Date()
          }
        });
    }
  } catch (e) {
    console.error('更新学习统计失败', e);
  }
}
