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

// 删除用户学习项目
const deleteUserStudyProject = async (event) => {
  try {
    const { openid } = await getOpenId();
    const { studyProjectId } = event;

    // 删除该用户的该学习项目记录
    const result = await db.collection('userStudyProjectStats')
      .where({
        userId: openid,
        studyProjectId: studyProjectId
      })
      .remove();

    return {
      success: true,
      data: {
        studyProjectId: studyProjectId,
        deletedCount: result.stats.removed
      }
    };
  } catch (e) {
    console.error('删除用户学习项目失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

exports.main = async (event, context) => {
  return await deleteUserStudyProject(event);
};
