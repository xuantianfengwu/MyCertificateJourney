const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 初始化盟主数据（与projectChampions.csv一致）
const getInitialChampionsData = () => {
  const champions = [];

  // studyProjectId 5101 的盟主数据 (34个)
  const champions_5101 = [
    { championOrder: 1, championName: "任我行", totalChallengeUserCount: 128, successChallengeUserCount: 85, failChallengeUserCount: 43 },
    { championOrder: 2, championName: "东方不败", totalChallengeUserCount: 96, successChallengeUserCount: 62, failChallengeUserCount: 34 },
    { championOrder: 3, championName: "风清扬", totalChallengeUserCount: 156, successChallengeUserCount: 98, failChallengeUserCount: 58 },
    { championOrder: 4, championName: "独孤求败", totalChallengeUserCount: 203, successChallengeUserCount: 145, failChallengeUserCount: 58 },
    { championOrder: 5, championName: "张三丰", totalChallengeUserCount: 178, successChallengeUserCount: 120, failChallengeUserCount: 58 },
    { championOrder: 6, championName: "郭靖", totalChallengeUserCount: 145, successChallengeUserCount: 95, failChallengeUserCount: 50 },
    { championOrder: 7, championName: "黄蓉", totalChallengeUserCount: 132, successChallengeUserCount: 88, failChallengeUserCount: 44 },
    { championOrder: 8, championName: "杨过", totalChallengeUserCount: 167, successChallengeUserCount: 112, failChallengeUserCount: 55 },
    { championOrder: 9, championName: "小龙女", totalChallengeUserCount: 189, successChallengeUserCount: 132, failChallengeUserCount: 57 },
    { championOrder: 10, championName: "张无忌", totalChallengeUserCount: 201, successChallengeUserCount: 148, failChallengeUserCount: 53 },
    { championOrder: 11, championName: "赵敏", totalChallengeUserCount: 143, successChallengeUserCount: 92, failChallengeUserCount: 51 },
    { championOrder: 12, championName: "周伯通", totalChallengeUserCount: 176, successChallengeUserCount: 115, failChallengeUserCount: 61 },
    { championOrder: 13, championName: "黄药师", totalChallengeUserCount: 158, successChallengeUserCount: 105, failChallengeUserCount: 53 },
    { championOrder: 14, championName: "欧阳锋", totalChallengeUserCount: 169, successChallengeUserCount: 108, failChallengeUserCount: 61 },
    { championOrder: 15, championName: "一灯大师", totalChallengeUserCount: 182, successChallengeUserCount: 128, failChallengeUserCount: 54 },
    { championOrder: 16, championName: "洪七公", totalChallengeUserCount: 195, successChallengeUserCount: 142, failChallengeUserCount: 53 },
    { championOrder: 17, championName: "王重阳", totalChallengeUserCount: 211, successChallengeUserCount: 155, failChallengeUserCount: 56 },
    { championOrder: 18, championName: "段正淳", totalChallengeUserCount: 138, successChallengeUserCount: 85, failChallengeUserCount: 53 },
    { championOrder: 19, championName: "段延庆", totalChallengeUserCount: 152, successChallengeUserCount: 95, failChallengeUserCount: 57 },
    { championOrder: 20, championName: "乔峰", totalChallengeUserCount: 225, successChallengeUserCount: 168, failChallengeUserCount: 57 },
    { championOrder: 21, championName: "段誉", totalChallengeUserCount: 165, successChallengeUserCount: 108, failChallengeUserCount: 57 },
    { championOrder: 22, championName: "虚竹", totalChallengeUserCount: 148, successChallengeUserCount: 92, failChallengeUserCount: 56 },
    { championOrder: 23, championName: "萧峰", totalChallengeUserCount: 235, successChallengeUserCount: 175, failChallengeUserCount: 60 },
    { championOrder: 24, championName: "慕容复", totalChallengeUserCount: 172, successChallengeUserCount: 112, failChallengeUserCount: 60 },
    { championOrder: 25, championName: "扫地僧", totalChallengeUserCount: 88, successChallengeUserCount: 62, failChallengeUserCount: 26 },
    { championOrder: 26, championName: "鸠摩智", totalChallengeUserCount: 155, successChallengeUserCount: 98, failChallengeUserCount: 57 },
    { championOrder: 27, championName: "阿紫", totalChallengeUserCount: 125, successChallengeUserCount: 78, failChallengeUserCount: 47 },
    { championOrder: 28, championName: "游坦之", totalChallengeUserCount: 142, successChallengeUserCount: 88, failChallengeUserCount: 54 },
    { championOrder: 29, championName: "丁春秋", totalChallengeUserCount: 163, successChallengeUserCount: 102, failChallengeUserCount: 61 },
    { championOrder: 30, championName: "无崖子", totalChallengeUserCount: 95, successChallengeUserCount: 65, failChallengeUserCount: 30 },
    { championOrder: 31, championName: "天山童姥", totalChallengeUserCount: 118, successChallengeUserCount: 75, failChallengeUserCount: 43 },
    { championOrder: 32, championName: "李秋水", totalChallengeUserCount: 128, successChallengeUserCount: 82, failChallengeUserCount: 46 },
    { championOrder: 33, championName: "苏星河", totalChallengeUserCount: 108, successChallengeUserCount: 68, failChallengeUserCount: 40 },
    { championOrder: 34, championName: "玄慈", totalChallengeUserCount: 135, successChallengeUserCount: 85, failChallengeUserCount: 50 }
  ];

  // studyProjectId 5102 的盟主数据 (34个)
  const champions_5102 = [
    { championOrder: 1, championName: "叶二娘", totalChallengeUserCount: 122, successChallengeUserCount: 75, failChallengeUserCount: 47 },
    { championOrder: 2, championName: "岳老三", totalChallengeUserCount: 138, successChallengeUserCount: 88, failChallengeUserCount: 50 },
    { championOrder: 3, championName: "云中鹤", totalChallengeUserCount: 115, successChallengeUserCount: 72, failChallengeUserCount: 43 },
    { championOrder: 4, championName: "段正明", totalChallengeUserCount: 142, successChallengeUserCount: 92, failChallengeUserCount: 50 },
    { championOrder: 5, championName: "刀白凤", totalChallengeUserCount: 98, successChallengeUserCount: 58, failChallengeUserCount: 40 },
    { championOrder: 6, championName: "秦红棉", totalChallengeUserCount: 105, successChallengeUserCount: 65, failChallengeUserCount: 40 },
    { championOrder: 7, championName: "甘宝宝", totalChallengeUserCount: 112, successChallengeUserCount: 68, failChallengeUserCount: 44 },
    { championOrder: 8, championName: "阮星竹", totalChallengeUserCount: 108, successChallengeUserCount: 68, failChallengeUserCount: 40 },
    { championOrder: 9, championName: "王夫人", totalChallengeUserCount: 118, successChallengeUserCount: 72, failChallengeUserCount: 46 },
    { championOrder: 10, championName: "康敏", totalChallengeUserCount: 125, successChallengeUserCount: 78, failChallengeUserCount: 47 },
    { championOrder: 11, championName: "马夫人", totalChallengeUserCount: 132, successChallengeUserCount: 82, failChallengeUserCount: 50 },
    { championOrder: 12, championName: "白世镜", totalChallengeUserCount: 95, successChallengeUserCount: 58, failChallengeUserCount: 37 },
    { championOrder: 13, championName: "全冠清", totalChallengeUserCount: 118, successChallengeUserCount: 72, failChallengeUserCount: 46 },
    { championOrder: 14, championName: "陈友谅", totalChallengeUserCount: 145, successChallengeUserCount: 92, failChallengeUserCount: 53 },
    { championOrder: 15, championName: "成昆", totalChallengeUserCount: 158, successChallengeUserCount: 102, failChallengeUserCount: 56 },
    { championOrder: 16, championName: "谢逊", totalChallengeUserCount: 175, successChallengeUserCount: 115, failChallengeUserCount: 60 },
    { championOrder: 17, championName: "殷天正", totalChallengeUserCount: 168, successChallengeUserCount: 108, failChallengeUserCount: 60 },
    { championOrder: 18, championName: "韦一笑", totalChallengeUserCount: 135, successChallengeUserCount: 85, failChallengeUserCount: 50 },
    { championOrder: 19, championName: "紫衫龙王", totalChallengeUserCount: 148, successChallengeUserCount: 95, failChallengeUserCount: 53 },
    { championOrder: 20, championName: "青翼蝠王", totalChallengeUserCount: 122, successChallengeUserCount: 75, failChallengeUserCount: 47 },
    { championOrder: 21, championName: "白眉鹰王", totalChallengeUserCount: 158, successChallengeUserCount: 102, failChallengeUserCount: 56 },
    { championOrder: 22, championName: "金毛狮王", totalChallengeUserCount: 168, successChallengeUserCount: 108, failChallengeUserCount: 60 },
    { championOrder: 23, championName: "逍遥子", totalChallengeUserCount: 85, successChallengeUserCount: 58, failChallengeUserCount: 27 },
    { championOrder: 24, championName: "木大开", totalChallengeUserCount: 92, successChallengeUserCount: 55, failChallengeUserCount: 37 },
    { championOrder: 25, championName: "方证", totalChallengeUserCount: 105, successChallengeUserCount: 65, failChallengeUserCount: 40 },
    { championOrder: 26, championName: "冲虚", totalChallengeUserCount: 98, successChallengeUserCount: 58, failChallengeUserCount: 40 },
    { championOrder: 27, championName: "向问天", totalChallengeUserCount: 142, successChallengeUserCount: 92, failChallengeUserCount: 50 },
    { championOrder: 28, championName: "曲洋", totalChallengeUserCount: 118, successChallengeUserCount: 72, failChallengeUserCount: 46 },
    { championOrder: 29, championName: "刘正风", totalChallengeUserCount: 112, successChallengeUserCount: 68, failChallengeUserCount: 44 },
    { championOrder: 30, championName: "莫大", totalChallengeUserCount: 125, successChallengeUserCount: 78, failChallengeUserCount: 47 },
    { championOrder: 31, championName: "定闲", totalChallengeUserCount: 88, successChallengeUserCount: 52, failChallengeUserCount: 36 },
    { championOrder: 32, championName: "定静", totalChallengeUserCount: 92, successChallengeUserCount: 55, failChallengeUserCount: 37 },
    { championOrder: 33, championName: "定逸", totalChallengeUserCount: 95, successChallengeUserCount: 58, failChallengeUserCount: 37 },
    { championOrder: 34, championName: "仪琳", totalChallengeUserCount: 102, successChallengeUserCount: 62, failChallengeUserCount: 40 }
  ];

  // studyProjectId 4915 的盟主数据 (系统分析师 - 34个)
  const champions_4915 = [
    { championOrder: 1, championName: "阿兰图灵", totalChallengeUserCount: 156, successChallengeUserCount: 98, failChallengeUserCount: 58 },
    { championOrder: 2, championName: "冯诺依曼", totalChallengeUserCount: 189, successChallengeUserCount: 132, failChallengeUserCount: 57 },
    { championOrder: 3, championName: "高德纳", totalChallengeUserCount: 167, successChallengeUserCount: 112, failChallengeUserCount: 55 },
    { championOrder: 4, championName: "乔布斯", totalChallengeUserCount: 211, successChallengeUserCount: 155, failChallengeUserCount: 56 },
    { championOrder: 5, championName: "比尔盖茨", totalChallengeUserCount: 225, successChallengeUserCount: 168, failChallengeUserCount: 57 },
    { championOrder: 6, championName: "扎克伯格", totalChallengeUserCount: 178, successChallengeUserCount: 120, failChallengeUserCount: 58 },
    { championOrder: 7, championName: "马斯克", totalChallengeUserCount: 195, successChallengeUserCount: 142, failChallengeUserCount: 53 },
    { championOrder: 8, championName: "雷军", totalChallengeUserCount: 145, successChallengeUserCount: 95, failChallengeUserCount: 50 },
    { championOrder: 9, championName: "马化腾", totalChallengeUserCount: 152, successChallengeUserCount: 95, failChallengeUserCount: 57 },
    { championOrder: 10, championName: "李彦宏", totalChallengeUserCount: 132, successChallengeUserCount: 88, failChallengeUserCount: 44 },
    { championOrder: 11, championName: "张一鸣", totalChallengeUserCount: 169, successChallengeUserCount: 108, failChallengeUserCount: 61 },
    { championOrder: 12, championName: "任正非", totalChallengeUserCount: 182, successChallengeUserCount: 128, failChallengeUserCount: 54 },
    { championOrder: 13, championName: "王兴", totalChallengeUserCount: 128, successChallengeUserCount: 85, failChallengeUserCount: 43 },
    { championOrder: 14, championName: "黄峥", totalChallengeUserCount: 143, successChallengeUserCount: 92, failChallengeUserCount: 51 },
    { championOrder: 15, championName: "程维", totalChallengeUserCount: 176, successChallengeUserCount: 115, failChallengeUserCount: 61 },
    { championOrder: 16, championName: "姚劲波", totalChallengeUserCount: 138, successChallengeUserCount: 85, failChallengeUserCount: 53 },
    { championOrder: 17, championName: "周鸿祎", totalChallengeUserCount: 158, successChallengeUserCount: 105, failChallengeUserCount: 53 },
    { championOrder: 18, championName: "丁磊", totalChallengeUserCount: 122, successChallengeUserCount: 75, failChallengeUserCount: 47 },
    { championOrder: 19, championName: "张朝阳", totalChallengeUserCount: 135, successChallengeUserCount: 85, failChallengeUserCount: 50 },
    { championOrder: 20, championName: "陈天桥", totalChallengeUserCount: 118, successChallengeUserCount: 72, failChallengeUserCount: 46 },
    { championOrder: 21, championName: "雷军", totalChallengeUserCount: 148, successChallengeUserCount: 92, failChallengeUserCount: 56 },
    { championOrder: 22, championName: "李开复", totalChallengeUserCount: 165, successChallengeUserCount: 108, failChallengeUserCount: 57 },
    { championOrder: 23, championName: "沈向洋", totalChallengeUserCount: 155, successChallengeUserCount: 98, failChallengeUserCount: 57 },
    { championOrder: 24, championName: "张亚勤", totalChallengeUserCount: 142, successChallengeUserCount: 88, failChallengeUserCount: 54 },
    { championOrder: 25, championName: "陆奇", totalChallengeUserCount: 172, successChallengeUserCount: 112, failChallengeUserCount: 60 },
    { championOrder: 26, championName: "王小川", totalChallengeUserCount: 125, successChallengeUserCount: 78, failChallengeUserCount: 47 },
    { championOrder: 27, championName: "周涛", totalChallengeUserCount: 132, successChallengeUserCount: 82, failChallengeUserCount: 50 },
    { championOrder: 28, championName: "吴恩达", totalChallengeUserCount: 185, successChallengeUserCount: 135, failChallengeUserCount: 50 },
    { championOrder: 29, championName: "李飞飞", totalChallengeUserCount: 168, successChallengeUserCount: 108, failChallengeUserCount: 60 },
    { championOrder: 30, championName: "马东敏", totalChallengeUserCount: 145, successChallengeUserCount: 92, failChallengeUserCount: 53 },
    { championOrder: 31, championName: "杨致远", totalChallengeUserCount: 138, successChallengeUserCount: 85, failChallengeUserCount: 53 },
    { championOrder: 32, championName: "孙正义", totalChallengeUserCount: 198, successChallengeUserCount: 148, failChallengeUserCount: 50 },
    { championOrder: 33, championName: "马云", totalChallengeUserCount: 235, successChallengeUserCount: 175, failChallengeUserCount: 60 },
    { championOrder: 34, championName: "达摩祖师", totalChallengeUserCount: 88, successChallengeUserCount: 62, failChallengeUserCount: 26 }
  ];

  // 生成5101的盟主数据
  champions_5101.forEach((c, index) => {
    const order = c.championOrder.toString().padStart(3, '0');
    champions.push({
      _id: `pc_5101_${order}`,
      studyProjectId: 5101,
      championOrder: c.championOrder,
      championName: c.championName,
      championPortraitUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20master%20portrait%20${index + 1}&image_size=square`,
      totalChallengeUserCount: c.totalChallengeUserCount,
      successChallengeUserCount: c.successChallengeUserCount,
      failChallengeUserCount: c.failChallengeUserCount,
      championPrivatePhotos: [
        `https://example.com/photos/pc_5101_${order}_1.jpg`,
        `https://example.com/photos/pc_5101_${order}_2.jpg`,
        `https://example.com/photos/pc_5101_${order}_3.jpg`,
        `https://example.com/photos/pc_5101_${order}_4.jpg`,
        `https://example.com/photos/pc_5101_${order}_5.jpg`,
        `https://example.com/photos/pc_5101_${order}_6.jpg`,
        `https://example.com/photos/pc_5101_${order}_7.jpg`
      ],
      championPrivateVideo: `https://example.com/videos/pc_5101_${order}_video.mp4`,
      createdAt: new Date('2026-04-19T00:00:00.000Z')
    });
  });

  // 生成5102的盟主数据
  champions_5102.forEach((c, index) => {
    const order = c.championOrder.toString().padStart(3, '0');
    champions.push({
      _id: `pc_5102_${order}`,
      studyProjectId: 5102,
      championOrder: c.championOrder,
      championName: c.championName,
      championPortraitUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martial%20arts%20master%20portrait%20${index + 35}&image_size=square`,
      totalChallengeUserCount: c.totalChallengeUserCount,
      successChallengeUserCount: c.successChallengeUserCount,
      failChallengeUserCount: c.failChallengeUserCount,
      championPrivatePhotos: [
        `https://example.com/photos/pc_5102_${order}_1.jpg`,
        `https://example.com/photos/pc_5102_${order}_2.jpg`,
        `https://example.com/photos/pc_5102_${order}_3.jpg`,
        `https://example.com/photos/pc_5102_${order}_4.jpg`,
        `https://example.com/photos/pc_5102_${order}_5.jpg`,
        `https://example.com/photos/pc_5102_${order}_6.jpg`,
        `https://example.com/photos/pc_5102_${order}_7.jpg`
      ],
      championPrivateVideo: `https://example.com/videos/pc_5102_${order}_video.mp4`,
      createdAt: new Date('2026-04-19T00:00:00.000Z')
    });
  });

  // 生成4915的盟主数据 (系统分析师)
  champions_4915.forEach((c, index) => {
    const order = c.championOrder.toString().padStart(3, '0');
    champions.push({
      _id: `pc_4915_${order}`,
      studyProjectId: 4915,
      championOrder: c.championOrder,
      championName: c.championName,
      championPortraitUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20leader%20portrait%20professional%20${index + 69}&image_size=square`,
      totalChallengeUserCount: c.totalChallengeUserCount,
      successChallengeUserCount: c.successChallengeUserCount,
      failChallengeUserCount: c.failChallengeUserCount,
      championPrivatePhotos: [
        `https://example.com/photos/pc_4915_${order}_1.jpg`,
        `https://example.com/photos/pc_4915_${order}_2.jpg`,
        `https://example.com/photos/pc_4915_${order}_3.jpg`,
        `https://example.com/photos/pc_4915_${order}_4.jpg`,
        `https://example.com/photos/pc_4915_${order}_5.jpg`,
        `https://example.com/photos/pc_4915_${order}_6.jpg`,
        `https://example.com/photos/pc_4915_${order}_7.jpg`
      ],
      championPrivateVideo: `https://example.com/videos/pc_4915_${order}_video.mp4`,
      createdAt: new Date('2026-05-07T00:00:00.000Z')
    });
  });

  return champions;
};

// 批量上传或更新盟主数据
const uploadProjectChampions = async () => {
  try {
    const champions = getInitialChampionsData();
    let successCount = 0;
    let failCount = 0;

    // 逐条插入或更新（云数据库upsert）
    for (const champion of champions) {
      try {
        // 提取_id和其余字段
        const docId = champion._id;
        const { _id, ...dataWithoutId } = champion;

        await db.collection('projectChampions').doc(docId).set({
          data: dataWithoutId
        });
        successCount++;
        console.log(`成功: ${docId}`);
      } catch (e) {
        failCount++;
        console.error(`失败: ${champion._id}`, e);
      }
    }

    return {
      success: true,
      message: `上传完成：成功 ${successCount} 条，失败 ${failCount} 条`
    };
  } catch (e) {
    console.error('上传盟主数据失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

exports.main = async (event, context) => {
  return await uploadProjectChampions();
};
