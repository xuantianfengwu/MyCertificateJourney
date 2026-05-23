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

// 创建用户学习项目
const createUserStudyProject = async (event) => {
  try {
    const { openid } = await getOpenId();
    const { studyProjectId, textBookCount } = event;

    // 查询该 studyProjectId 下当前最大的 discipleNumber
    const maxDiscipleResult = await db.collection('userStudyProjectStats')
      .where({ studyProjectId: studyProjectId })
      .orderBy('discipleNumber', 'desc')
      .limit(1)
      .get();

    let newDiscipleNumber = 1000; // 从1000开始
    if (maxDiscipleResult.data.length > 0) {
      newDiscipleNumber = maxDiscipleResult.data[0].discipleNumber + 1;
    }

    // 初始化 textBookResults 为全 false 的数组
    const textBookResults = [];
    for (let i = 0; i < textBookCount; i++) {
      textBookResults.push(false);
    }

    // 插入新记录
    const result = await db.collection('userStudyProjectStats').add({
      data: {
        userId: openid,
        studyProjectId: studyProjectId,
        discipleNumber: newDiscipleNumber,
        studyProgress: 0,
        accuracy: 0,
        isMaster: false,
        championOrder: 1,
        challengeCount: 0,
        winRate: 0,
        textBookResults: textBookResults,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return {
      success: true,
      data: {
        _id: result._id,
        studyProjectId: studyProjectId,
        discipleNumber: newDiscipleNumber
      }
    };
  } catch (e) {
    console.error('创建用户学习项目失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

exports.main = async (event, context) => {
  return await createUserStudyProject(event);
};
