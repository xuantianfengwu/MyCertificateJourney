// miniprogram/utils/dataAccess.js

const app = getApp();

// 用户相关操作
const userAccess = {
  // 登录
  login: function(callback) {
    wx.cloud.callFunction({
      name: 'userLogin',
      data: { type: 'login' },
      success: function(result) {
        if (result.result.success) {
          app.globalData.openid = result.result.openid;
          app.globalData.isLoggedIn = true;
          app.saveLoginState();
          
          if (result.result.needAuth) {
            if (callback) callback(true, { needAuth: true });
          } else {
            app.globalData.userInfo = result.result.userInfo;
            app.saveLoginState();
            if (callback) callback(true);
          }
        } else {
          console.error('登录失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('登录云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 授权并保存用户信息
  authAndSave: function(userInfo, callback) {
    wx.cloud.callFunction({
      name: 'userLogin',
      data: {
        type: 'auth',
        userInfo: userInfo
      },
      success: function(result) {
        if (result.result.success) {
          app.globalData.userInfo = result.result.userInfo;
          app.globalData.isLoggedIn = true; // 设置登录状态为true
          
          // 从userInfo中提取openid并设置到globalData.openid
          if (result.result.userInfo && result.result.userInfo.openid) {
            app.globalData.openid = result.result.userInfo.openid;
            console.log('从userInfo中设置openid:', app.globalData.openid);
          }
          
          app.saveLoginState();
          if (callback) callback(true, result.result.userInfo);
        } else {
          console.error('保存用户信息失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('保存用户信息云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 获取用户信息
  getUserInfo: function(callback) {
    wx.cloud.callFunction({
      name: 'userLogin',
      data: { type: 'getUserInfo' },
      success: function(result) {
        if (result.result.success) {
          app.globalData.userInfo = result.result.userInfo;
          app.globalData.isLoggedIn = true; // 设置登录状态为true
          
          // 从userInfo中提取openid并设置到globalData.openid
          if (result.result.userInfo && result.result.userInfo.openid) {
            app.globalData.openid = result.result.userInfo.openid;
            console.log('从userInfo中设置openid:', app.globalData.openid);
          }
          
          app.saveLoginState();
          if (callback) callback(true, result.result.userInfo);
        } else {
          console.error('获取用户信息失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('获取用户信息云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  }
};

// 学习项目相关操作
const studyAccess = {
  // 获取用户学习项目
  getUserStudyProjects: function(callback) {
    wx.cloud.callFunction({
      name: 'getUserStudyProjects',
      success: function(result) {
        if (result.result.success) {
          if (callback) callback(true, result.result.data);
        } else {
          console.error('获取用户学习项目失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('获取用户学习项目云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 创建用户学习项目
  createUserStudyProject: function(studyProjectId, textBookCount, callback) {
    wx.cloud.callFunction({
      name: 'createUserStudyProject',
      data: {
        studyProjectId: studyProjectId,
        textBookCount: textBookCount
      },
      success: function(result) {
        if (result.result.success) {
          if (callback) callback(true, result.result.data);
        } else {
          console.error('创建用户学习项目失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('创建用户学习项目云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 删除用户学习项目
  deleteUserStudyProject: function(studyProjectId, callback) {
    wx.cloud.callFunction({
      name: 'deleteUserStudyProject',
      data: {
        studyProjectId: studyProjectId
      },
      success: function(result) {
        if (result.result.success) {
          if (callback) callback(true, result.result.data);
        } else {
          console.error('删除用户学习项目失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('删除用户学习项目云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  },

  // 获取盟主数据
  getProjectChampions: function(studyProjectId, callback) {
    wx.cloud.callFunction({
      name: 'getProjectChampions',
      data: {
        studyProjectId: studyProjectId
      },
      success: function(result) {
        if (result.result.success) {
          if (callback) callback(true, result.result.data);
        } else {
          console.error('获取盟主数据失败', result.result.error);
          if (callback) callback(false);
        }
      },
      fail: function(err) {
        console.error('获取盟主数据云函数调用失败', err);
        if (callback) callback(false);
      }
    });
  }
};

// 导出模块
module.exports = {
  user: userAccess,
  study: studyAccess
};
