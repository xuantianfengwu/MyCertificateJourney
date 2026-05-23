const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 获取盟主数据
const getProjectChampions = async (event) => {
  try {
    const { studyProjectId } = event;

    if (!studyProjectId) {
      return {
        success: false,
        error: 'studyProjectId不能为空'
      };
    }

    // 查询该学习项目下的所有盟主
    const champions = await db.collection('projectChampions')
      .where({ studyProjectId: studyProjectId })
      .orderBy('championOrder', 'asc')
      .get();

    return {
      success: true,
      data: champions.data
    };
  } catch (e) {
    console.error('获取盟主数据失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

exports.main = async (event, context) => {
  return await getProjectChampions(event);
};
