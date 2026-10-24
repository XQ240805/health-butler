// app.js
App({
  globalData: {
    // 有正式小程序 AppID 后，在 project.config.json 里配置好云环境，这里填 env id 即可启用云端 AI
    cloudEnv: '',
    useCloud: false
  },

  onLaunch() {
    if (wx.cloud && this.globalData.cloudEnv) {
      try {
        wx.cloud.init({ env: this.globalData.cloudEnv, traceUser: true });
        this.globalData.useCloud = true;
      } catch (e) {
        this.globalData.useCloud = false;
      }
    }
  }
});
