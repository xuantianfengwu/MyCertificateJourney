// components/guide-mask/guide-mask.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示蒙版
    show: {
      type: Boolean,
      value: false
    },
    // 蒙版类型：login 或 updateGender
    maskType: {
      type: String,
      value: 'login',
      observer: function(newVal) {
        this.updateMaskText(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 蒙版提示文本
    maskText: '请登录以便继续'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 更新蒙版提示文本
    updateMaskText: function(maskType) {
      let maskText = '请登录以便继续';
      if (maskType === 'updateGender') {
        maskText = '点击更新性别信息，内容展示受此影响';
      }
      this.setData({
        maskText: maskText
      });
    },

    // 处理蒙版点击
    handleMaskClick: function() {
      // 触发蒙版点击事件
      this.triggerEvent('maskClick', {
        maskType: this.data.maskType
      });
    }
  },

  /**
   * 组件生命周期
   */
  attached: function() {
    // 初始化蒙版文本
    this.updateMaskText(this.properties.maskType);
  }
});
