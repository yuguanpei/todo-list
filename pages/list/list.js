Page({
  data: {
    event: '',
    events: [],
    leftCount: 0,
    logs: []
  },

  save() {
    wx.setStorageSync('list', this.data.events)
    wx.setStorageSync('logs', this.data.logs)
  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onLoad() {
    const events = wx.getStorageSync('list')
    if (events) {
      const leftCount = events.filter(function (item) {
        return !item.completed
      }).length
      this.setData({
        events: events,
        leftCount: leftCount
      })
    }
    const logs = wx.getStorageSync('logs')
    if (logs) {
      this.setData({
        logs: logs
      })
    }
  },

  handleClearStorage() {
    wx.showModal({
      title: 'Warning',
      content: 'Are you sure to clear the storage? This will cause the current list to be emptied',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
          this.setData({
            event: '',
            events: [],
            leftCount: 0,
            logs: []
          })
        }
      }
    })

  },

  handleInputEvent(e) {
    this.setData({
      event: e.detail.value
    })
  },

  handleAddTask(e) {
    if (!this.data.event || !this.data.event.trim()) return
    const events = this.data.events
    if (events.find(event => event.name === this.data.event)) {
      wx.showModal({
        title: 'Task Already Exists',
        content: 'Please do not repeat the task!',
        showCancel: false,
        confirmText: 'OK',
      });
      return
    }
    events.push({
      name: this.data.event,
      completed: false
    })
    const logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Add',
      name: this.data.event
    })
    this.setData({
      event: '',
      events: events,
      leftCount: this.data.leftCount + 1,
      logs: logs
    })
    this.save()
  },

  handleCompleteTask(e) {
    const index = e.currentTarget.dataset.index
    const events = this.data.events
    events[index].completed = !events[index].completed
    const logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: events[index].completed ? 'Finish' : 'Restart',
      name: events[index].name
    })
    this.setData({
      events: events,
      leftCount: this.data.leftCount + (events[index].completed ? -1 : 1),
      logs: logs
    })
    this.save()
  },

  handleRemoveTask(e) {
    const index = e.currentTarget.dataset.index
    const events = this.data.events
    const remove = events.splice(index, 1)[0]
    const logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Remove',
      name: remove.name
    })
    this.setData({
      events: events,
      leftCount: this.data.leftCount - (remove.completed ? 0 : 1),
      logs: logs
    })
    this.save()
  },

  handleClearCompleted(e) {
    const events = this.data.events
    const remains = []
    for (let i = 0; i < events.length; i++) {
      events[i].completed || remains.push(events[i])
    }
    const logs = this.data.logs
    logs.push({
      timestamp: new Date(),
      action: 'Clear',
      name: '[Completed]'
    })
    this.setData({
      events: remains,
      logs: logs
    })
    this.save()
  }
})