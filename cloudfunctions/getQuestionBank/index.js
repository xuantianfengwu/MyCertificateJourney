const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 获取题库信息（仅获取章节列表）
exports.main = async (event, context) => {
  const { studyProjectId, storagePath } = event;
  
  console.log('[getQuestionBank] 开始执行');
  console.log('[getQuestionBank] 参数 studyProjectId:', studyProjectId);
  console.log('[getQuestionBank] 参数 storagePath:', storagePath);
  
  try {
    const fileID = `cloud://cloud1-7giawtir11f7f119.636c-cloud1-7giawtir11f7f119-1420681642/${storagePath}`;
    console.log('[getQuestionBank] 尝试下载文件:', fileID);    
    const fileRes = await cloud.downloadFile({
      fileID: fileID
    });
    
    console.log('[getQuestionBank] 文件下载成功，文件大小:', fileRes.fileContent.length, '字节');
    
    const questionBank = JSON.parse(fileRes.fileContent.toString());
    console.log('[getQuestionBank] JSON解析成功');
    
    return {
      success: true,
      studyProjectId: questionBank.studyProjectId,
      examName: questionBank.examName,
      totalQuestions: questionBank.totalQuestions,
      chapters: questionBank.chapters,
      message: '章节列表加载成功'
    };
  } catch (e) {
    console.error('[getQuestionBank] 获取题库失败:', e);
    return {
      success: false,
      error: e.message,
      errorType: e.name,
      message: '题库文件不存在或下载失败'
    };
  }
};
