Component({
  data: {
    show: true,
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/list/list",
      iconPath: "static/list.png",
      selectedIconPath: "static/list-active.png",
      text: "List"
    }, {
      pagePath: "/pages/logs/logs",
      iconPath: "static/logs.png",
      selectedIconPath: "static/logs-active.png",
      text: "Logs"
    }]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
      this.setData({
        selected: data.index
      })
    }
  }
})