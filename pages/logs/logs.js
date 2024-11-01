Page({
  data: {
    logs: [],
  },
  onShow() {
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      });
    }
    const logs = wx.getStorageSync("logs");
    this.setData({
      logs: logs ? logs.reverse() : []
    });
  },
});