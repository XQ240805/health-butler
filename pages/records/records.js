const KEY = 'checkins';

function keyOf(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function labelOf(d) {
  const today = new Date();
  if (keyOf(d) === keyOf(today)) return '今天';
  const y = new Date(today.getTime() - 86400000);
  if (keyOf(d) === keyOf(y)) return '昨天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

Page({
  data: {
    form: { sleep: '', water: '', steps: '' },
    list: [],
    hasData: false,
    tip: ''
  },

  onShow() {
    this.load();
  },

  load() {
    const all = wx.getStorageSync(KEY) || {};
    const list = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      const rec = all[keyOf(d)];
      if (!rec) continue;
      list.push({
        label: labelOf(d),
        sleep: rec.sleep,
        water: rec.water,
        steps: rec.steps,
        sleepPct: Math.min(100, Math.round((Number(rec.sleep) / 8) * 100)),
        isToday: i === 0
      });
    }

    const todayRec = all[keyOf(today)] || {};
    this.setData({
      list,
      hasData: list.length > 0,
      form: {
        sleep: todayRec.sleep || '',
        water: todayRec.water || '',
        steps: todayRec.steps || ''
      }
    });
  },

  onField(e) {
    const field = e.currentTarget.dataset.field;
    const form = { ...this.data.form, [field]: e.detail.value };
    this.setData({ form, tip: '' });
  },

  save() {
    const { sleep, water, steps } = this.data.form;
    const n = (v) => (v === '' ? NaN : Number(v));

    if (isNaN(n(sleep)) || n(sleep) < 0 || n(sleep) > 24) {
      return this.setData({ tip: '睡眠时长填 0 到 24 之间的小时数' });
    }
    if (isNaN(n(water)) || n(water) < 0 || n(water) > 30) {
      return this.setData({ tip: '饮水按杯数记，0 到 30 之间' });
    }
    if (isNaN(n(steps)) || n(steps) < 0 || n(steps) > 100000) {
      return this.setData({ tip: '步数填一个合理的整数' });
    }

    const all = wx.getStorageSync(KEY) || {};
    all[keyOf(new Date())] = { sleep: n(sleep), water: n(water), steps: n(steps) };
    wx.setStorageSync(KEY, all);
    this.setData({ tip: '已记录' });
    this.load();

    if (this.data.list.length >= 3) {
      this.advise();
    }
  },

  advise() {
    const recent = this.data.list.slice(0, 3);
    const avgSleep = recent.reduce((s, x) => s + Number(x.sleep), 0) / recent.length;
    const avgWater = recent.reduce((s, x) => s + Number(x.water), 0) / recent.length;
    let text = '';

    if (avgSleep < 6.5) {
      text = '最近三天的睡眠偏少，先把起床时间固定住，比逼自己早睡更容易见效。';
    } else if (avgWater < 6) {
      text = '饮水偏少。把水杯放在看得见的地方，每次 200 毫升，分六到八次喝完。';
    } else {
      text = '这三天整体还算稳，继续保持同样的节奏就可以。';
    }
    this.setData({ tip: text });
  }
});
