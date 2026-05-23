const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

// 获取 OpenID
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 获取用户正在学习的项目数据
const getUserStudyProjects = async () => {
  try {
    // 获取 OpenID
    const { openid } = await getOpenId();

    // 查询用户学习项目统计
    const userStudyProjects = await db.collection('userStudyProjectStats')
      .where({ userId: openid })
      .get();

    if (userStudyProjects.data.length === 0) {
      // 用户没有学习记录，返回空数组
      return {
        success: true,
        data: []
      };
    }

    // 获取所有相关的教材信息
    const studyProjectIds = [...new Set(userStudyProjects.data.map(p => p.studyProjectId))];
    const textbooks = await db.collection('textbooks')
      .where({ 
        studyProjectId: _.in(studyProjectIds),
        isHidden: false
      })
      .orderBy('studyProjectId', 'asc')
      .orderBy('order', 'asc')
      .get();

    // 合并数据
    const result = userStudyProjects.data.map(stat => {
      // 找到该项目的教材（排除隐藏的）
      const projectTextbooks = textbooks.data
        .filter(t => t.studyProjectId === stat.studyProjectId)
        .map(t => {
          // 根据textbookId找到对应的完成状态
          const textbookIndex = t.textbookId - 1; // textbookId从1开始，索引从0开始
          const completed = stat.textBookResults && stat.textBookResults[textbookIndex] !== undefined 
            ? stat.textBookResults[textbookIndex] 
            : false;
            
          return {
            textbookId: t.textbookId,
            title: t.title,
            description: t.description,
            downloadUrl: t.downloadUrl,
            fileSize: t.fileSize,
            type: t.type,
            order: t.order,
            completed: completed
          };
        });

      return {
        studyProjectId: stat.studyProjectId,
        discipleNumber: stat.discipleNumber,
        studyProgress: stat.studyProgress,
        accuracy: stat.accuracy,
        isMaster: stat.isMaster,
        championOrder: stat.championOrder,
        challengeCount: stat.challengeCount,
        winRate: stat.winRate,
        textbooks: projectTextbooks
      };
    });

    return {
      success: true,
      data: result
    };
  } catch (e) {
    console.error('获取用户学习项目数据失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

exports.main = async (event, context) => {
  return await getUserStudyProjects();
};