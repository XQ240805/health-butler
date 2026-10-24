const TIPS = {
  spring: {
    label: '春',
    title: '春生：把身体从冬天里慢慢唤醒',
    items: [
      { tag: '饮食', text: '少酸多甘，绿叶菜和豆芽占一餐的一半；不急着喝凉茶清火。' },
      { tag: '作息', text: '比冬天早半小时起床，晚上十一点前躺下，顺着日照走。' },
      { tag: '活动', text: '每天户外二十分钟，散步或拉伸，出汗以微汗为度。' }
    ]
  },
  summer: {
    label: '夏',
    title: '夏长：护住脾胃，别和空调硬碰',
    items: [
      { tag: '饮食', text: '常温水和温热食物为主，冰饮放在午后小口喝，别空腹。' },
      { tag: '作息', text: '中午闭眼休息十五到二十分钟，晚上不要熬过十一点半。' },
      { tag: '活动', text: '运动放在清晨或傍晚，避开正午；出汗后补一杯水。' }
    ]
  },
  autumn: {
    label: '秋',
    title: '秋收：润燥是主线',
    items: [
      { tag: '饮食', text: '银耳、梨、百合、山药这类润的食材，一周吃三次；少辣少烧烤。' },
      { tag: '作息', text: '早睡半小时，室内放一盆水或开加湿器，湿度四到六成。' },
      { tag: '活动', text: '快走或八段锦，二十分钟即可；秋天不适合大汗淋漓。' }
    ]
  },
  winter: {
    label: '冬',
    title: '冬藏：把能量收回来',
    items: [
      { tag: '饮食', text: '根茎类当主角：萝卜、山药、红薯；汤水每天一次，别太咸。' },
      { tag: '作息', text: '早睡晚起半小时，睡足七到八小时是这个季节最重要的事。' },
      { tag: '活动', text: '等太阳出来再出门运动；回家先暖手脚，别立刻冲热水澡。' }
    ]
  }
};

const TASKS = ['起床后一杯温水', '走够六千步', '十一点前放下手机'];

function seasonOf(month) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

Page({
  data: {
    dateText: '',
    season: {},
    tasks: [],
    doneCount: 0
  },

  onLoad() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const season = TIPS[seasonOf(month)];
    const key = 'tasks_' + todayKey();
    const saved = wx.getStorageSync(key) || [];

    this.storageKey = key;
    this.setData({
      dateText: `${month} 月 ${now.getDate()} 日`,
      season,
      tasks: TASKS.map((text, i) => ({ text, done: !!saved[i] })),
      doneCount: TASKS.filter((t, i) => !!saved[i]).length
    });
  },

  toggle(e) {
    const idx = e.currentTarget.dataset.index;
    const tasks = this.data.tasks.map((t, i) => (i === idx ? { ...t, done: !t.done } : t));
    wx.setStorageSync(this.storageKey, tasks.map((t) => t.done));
    this.setData({ tasks, doneCount: tasks.filter((t) => t.done).length });
  },

  goRecords() {
    wx.switchTab({ url: '/pages/records/records' });
  }
});
