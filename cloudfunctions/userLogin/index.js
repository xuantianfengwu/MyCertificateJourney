const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 获取 OpenID
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 检查用户是否已注册
const checkUserExists = async (openid) => {
  try {
    const result = await db.collection('users').doc(openid).get();
    return {
      exists: true,
      userInfo: result.data
    };
  } catch (e) {
    return {
      exists: false,
      userInfo: null
    };
  }
};

// 创建新用户
const createUser = async (openid, userInfo) => {
  const now = new Date();
  const userData = {
    // 移除 _id 字段
    openid: openid,
    nickName: userInfo.nickName || '微信用户',
    avatarUrl: userInfo.avatarUrl || '',
    gender: userInfo.gender || 0,
    country: userInfo.country || '',
    province: userInfo.province || '',
    city: userInfo.city || '',
    language: userInfo.language || 'zh_CN',
    registrationTime: now.toISOString().split('T')[0],
    achievements: {
      practicing: 0,
      master: 0,
      grandmaster: 0
    },
    createdAt: now,
    updatedAt: now
  };

  try {
    await db.collection('users').doc(openid).set({
      data: userData
    });
    return {
      success: true,
      userInfo: userData
    };
  } catch (e) {
    console.error('创建用户失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 更新用户信息
const updateUser = async (openid, userInfo) => {
  const now = new Date();
  
  // 创建更新数据，排除 _id 字段
  const updateData = {
    updatedAt: now
  };
  
  // 复制 userInfo 中的字段，但排除 _id
  for (const key in userInfo) {
    if (key !== '_id') {
      updateData[key] = userInfo[key];
    }
  }

  try {
    await db.collection('users').doc(openid).update({
      data: updateData
    });
    
    // 获取更新后的用户信息
    const result = await db.collection('users').doc(openid).get();
    return {
      success: true,
      userInfo: result.data
    };
  } catch (e) {
    console.error('更新用户失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 处理用户登录
const handleLogin = async () => {
  try {
    // 获取 OpenID
    const { openid } = await getOpenId();
    
    // 检查用户是否存在
    const { exists, userInfo } = await checkUserExists(openid);
    
    if (exists) {
      // 用户已存在，返回用户信息
      return {
        success: true,
        isNewUser: false,
        openid: openid,
        userInfo: userInfo,
        needAuth: false
      };
    } else {
      // 用户不存在，需要授权
      return {
        success: true,
        isNewUser: true,
        openid: openid,
        userInfo: null,
        needAuth: true
      };
    }
  } catch (e) {
    console.error('登录处理失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 处理用户授权（保存用户信息）
const handleAuth = async (event) => {
  const { userInfo } = event;
  
  try {
    // 获取 OpenID
    const { openid } = await getOpenId();
    
    // 检查用户是否存在
    const { exists } = await checkUserExists(openid);
    console.log('用户是否存在:', exists);
    
    let result;
    if (exists) {
      // 更新用户信息
      result = await updateUser(openid, userInfo);
    } else {
      // 创建新用户
      result = await createUser(openid, userInfo);
    }
    
    return {
      success: result.success,
      userInfo: result.userInfo,
      error: result.error
    };
  } catch (e) {
    console.error('授权处理失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 获取当前用户信息
const getUserInfo = async () => {
  try {
    const { openid } = await getOpenId();
    const { exists, userInfo } = await checkUserExists(openid);
    
    if (exists) {
      return {
        success: true,
        userInfo: userInfo
      };
    } else {
      return {
        success: false,
        error: '用户不存在'
      };
    }
  } catch (e) {
    console.error('获取用户信息失败', e);
    return {
      success: false,
      error: e.message
    };
  }
};

// 云函数入口函数
exports.main = async (event, context) => {
  const { type } = event;
  
  switch (type) {
    case 'login':
      return await handleLogin();
    case 'auth':
      return await handleAuth(event);
    case 'getUserInfo':
      return await getUserInfo();
    default:
      return {
        success: false,
        error: '未知的操作类型'
      };
  }
};
