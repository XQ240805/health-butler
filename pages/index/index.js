const butler = require('../../utils/butler.js');
const app = getApp();

Page({
  data: {
    messages: [
      {
        role: 'butler',
        content: '我在。我是你的健康管家。\n\n作息、饮食、睡眠、身体上的小不适，都可以和我说。我不会夸大风险，也不会让你硬扛。\n\n今天想先聊哪一块？'
      }
    ],
    input: '',
    thinking: false,
    scrollTo: '',
    quick: ['最近总睡不好', '秋天嗓子干', '久坐腰酸怎么办', '容易焦虑没力气']
  },

  onLoad() {
    this.seq = 1;
  },

  onInput(e) {
    this.setData({ input: e.detail.value });
  },

  onQuick(e) {
    const text = e.currentTarget.dataset.text;
    this.ask(text);
  },

  onSend() {
    const text = (this.data.input || '').trim();
    if (!text || this.data.thinking) return;
    this.setData({ input: '' });
    this.ask(text);
  },

  ask(text) {
    if (this.data.thinking) return;
    const messages = this.data.messages.concat([{ role: 'user', content: text }]);
    this.setData({ messages, thinking: true, scrollTo: 'bottom' });

    const finish = (content) => {
      this.setData({
        messages: this.data.messages.concat([{ role: 'butler', content }]),
        thinking: false,
        scrollTo: 'bottom'
      });
    };

    if (app.globalData.useCloud) {
      wx.cloud
        .callFunction({ name: 'chat', data: { text, history: messages.slice(-6) } })
        .then((res) => {
          const content = (res && res.result && res.result.reply) || butler.reply(text);
          finish(content);
        })
        .catch(() => {
          setTimeout(() => finish(butler.reply(text)), 300);
        });
    } else {
      setTimeout(() => finish(butler.reply(text)), 420);
    }
  },

  copyLast() {
    const list = this.data.messages.filter((m) => m.role === 'butler');
    if (!list.length) return;
    wx.setClipboardData({ data: list[list.length - 1].content });
  }
});
