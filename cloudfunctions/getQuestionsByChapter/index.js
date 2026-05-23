const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 获取章节题目（从单独的章节文件获取）
exports.main = async (event, context) => {
  const { studyProjectId, storagePath, chapterName } = event;
  
  console.log('[getQuestionsByChapter] 开始执行');
  console.log('[getQuestionsByChapter] 参数 studyProjectId:', studyProjectId);
  console.log('[getQuestionsByChapter] 参数 storagePath:', storagePath);
  console.log('[getQuestionsByChapter] 参数 chapterName:', chapterName);
  
  try {
    // 构建章节文件路径：从 storagePath 提取目录，然后加上章节文件名
    const directory = storagePath.substring(0, storagePath.lastIndexOf('/') + 1);
    const chapterFileName = `${chapterName}.json`;
    const chapterFilePath = directory + chapterFileName;
    
    const fileID = `cloud://cloud1-7giawtir11f7f119.636c-cloud1-7giawtir11f7f119-1420681642/${chapterFilePath}`;
    console.log('[getQuestionsByChapter] 尝试下载章节文件:', fileID);
    const fileRes = await cloud.downloadFile({
      fileID: fileID
    });    
    console.log('[getQuestionsByChapter] 文件下载成功，文件大小:', fileRes.fileContent.length, '字节');
    
    const questions = JSON.parse(fileRes.fileContent.toString());
    console.log('[getQuestionsByChapter] JSON解析成功，题目数量:', questions.length);
    
    return {
      success: true,
      questions: questions,
      chapterName: chapterName,
      message: '章节题目加载成功'
    };
  } catch (e) {
    console.error('[getQuestionsByChapter] 获取章节题目失败:', e);
    return {
      success: false,
      error: e.message,
      errorType: e.name,
      message: '章节文件不存在或下载失败'
    };
  }
};
