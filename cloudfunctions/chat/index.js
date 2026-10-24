// 云函数 chat：接大模型（默认火山方舟 Ark，OpenAI 兼容协议），返回健康管家口吻的回复
// 在云开发控制台 → 云函数 chat → 配置 → 环境变量中设置：
//   ARK_API_KEY  方舟 API Key（ark-xxxx）
//   ARK_MODEL    模型或推理接入点，如 doubao-seed-1-6-250615 / ep-2025xxxx
//   ARK_BASE_URL 可选，默认 https://ark.cn-beijing.volces.com/api/v3
// 未配置时返回 fallback:true，小程序会自动退回本地规则库，不会白屏

const https = require('https');
const http = require('http');
const { URL } = require('url');

const SYSTEM_PROMPT = `你是一位健康管家式的养生顾问，说话平稳、克制、有耐心。

语气：不夸张、不制造焦虑、不劝人硬扛，也不用感叹号和表情。

格式（重要，界面按此渲染）：
1. 开头一句话回应对方的感受，不超过 40 字。
2. 接着给 2-3 条建议，每条一行，写成「1. **要点**：一句具体做法」，含具体时间和量，单条不超过 45 字。
3. 结尾一句话提示就医条件，不超过 35 字。
全文不超过 160 字，不要标题、不要分隔线、不要总结段、不要重复对方原话。

内容边界：只谈生活方式与作息饮食；不谈玄学，不推荐具体药品、品牌和剂量；涉及诊断用药一律引导到医生。`;

function post(urlStr, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === 'http:' ? http : https;
    const data = JSON.stringify(body);
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'http:' ? 80 : 443),
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        },
        timeout: 20000
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(buf));
          } catch (e) {
            reject(new Error('invalid json: ' + buf.slice(0, 200)));
          }
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.main = async (event) => {
  const text = (event.text || '').toString().slice(0, 1000);
  const history = Array.isArray(event.history) ? event.history.slice(-6) : [];

  const base = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const key = process.env.ARK_API_KEY;
  const model = process.env.ARK_MODEL || 'doubao-seed-2-1-pro-260915';

  if (!base || !key || !model) {
    return { reply: '', fallback: true };
  }

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }].concat(
    history
      .filter((m) => m && m.content)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 800) }))
  );
  messages.push({ role: 'user', content: text });

  try {
    // doubao-seed 系列默认开启思考，健康问答场景关掉，响应更快
    const payload = { model, messages, temperature: 0.4, max_tokens: 900 };
    if (/^doubao-seed/.test(model)) payload.thinking = { type: 'disabled' };
    const res = await post(
      base.replace(/\/$/, '') + '/chat/completions',
      payload,
      { Authorization: 'Bearer ' + key }
    );
    const reply =
      res && res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content;
    if (!reply) return { reply: '', fallback: true };
    return { reply: String(reply).trim() };
  } catch (e) {
    console.error('llm error', e.message);
    return { reply: '', fallback: true };
  }
};
