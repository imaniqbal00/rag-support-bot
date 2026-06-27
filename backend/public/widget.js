/**
 * BotBase Embeddable Widget
 * Drop-in chat bubble — zero dependencies, vanilla JS.
 * Usage: <script src="..." data-token="YOUR_API_TOKEN" defer></script>
 */
(function () {
  'use strict';

  const script   = document.currentScript;
  const TOKEN    = script?.getAttribute('data-token') || '';
  const BOT_NAME = script?.getAttribute('data-bot-name') || 'Support Bot';
  const BACKEND  = script?.getAttribute('data-backend') || '';

  if (!TOKEN) { console.warn('[BotBase] data-token is required'); return; }

  const css = `
    #bb-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #bb-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #4f46e5; color: #fff; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(79,70,229,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #bb-btn:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(79,70,229,0.5); }
    #bb-btn svg { width: 26px; height: 26px; }
    #bb-window {
      position: fixed; bottom: 92px; right: 24px; z-index: 99999;
      width: 360px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      display: flex; flex-direction: column; overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
    }
    #bb-window.bb-hidden { opacity: 0; pointer-events: none; transform: translateY(8px); }
    #bb-header { background: #4f46e5; color: #fff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
    #bb-header-title { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    #bb-header-title::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; }
    #bb-close { background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 20px; line-height: 1; padding: 0; }
    #bb-close:hover { color: #fff; }
    #bb-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
    .bb-msg { max-width: 80%; display: flex; flex-direction: column; }
    .bb-msg.bb-bot { align-self: flex-start; }
    .bb-msg.bb-user { align-self: flex-end; }
    .bb-bubble { padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.5; word-break: break-word; }
    .bb-msg.bb-bot .bb-bubble { background: #f3f4f6; color: #111; border-bottom-left-radius: 4px; }
    .bb-msg.bb-user .bb-bubble { background: #4f46e5; color: #fff; border-bottom-right-radius: 4px; }
    .bb-typing .bb-bubble { color: #9ca3af; font-style: italic; }
    .bb-time { font-size: 10px; color: #9ca3af; margin-top: 3px; }
    .bb-msg.bb-user .bb-time { text-align: right; }
    #bb-form { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid #f3f4f6; background: #fff; }
    #bb-input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 12px; font-size: 13.5px; outline: none; transition: border-color 0.15s; resize: none; height: 40px; }
    #bb-input:focus { border-color: #6366f1; }
    #bb-send { background: #4f46e5; color: #fff; border: none; cursor: pointer; border-radius: 10px; padding: 0 14px; font-size: 13px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
    #bb-send:hover { background: #4338ca; }
    #bb-send:disabled { background: #a5b4fc; cursor: not-allowed; }
    #bb-branding { text-align: center; font-size: 10px; color: #d1d5db; padding: 6px 0 10px; }
    @media (max-width: 420px) { #bb-window { width: calc(100vw - 24px); right: 12px; bottom: 80px; } }
  `;

  const iconChat = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  const iconX    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  const root = document.createElement('div');
  root.id = 'bb-root';
  const btn = document.createElement('button');
  btn.id = 'bb-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = iconChat;
  const win = document.createElement('div');
  win.id = 'bb-window';
  win.className = 'bb-hidden';
  win.innerHTML = `
    <div id="bb-header"><span id="bb-header-title">${BOT_NAME}</span><button id="bb-close">×</button></div>
    <div id="bb-messages" aria-live="polite"></div>
    <form id="bb-form" autocomplete="off">
      <input id="bb-input" placeholder="Ask a question…" maxlength="800" />
      <button id="bb-send" type="submit">Send</button>
    </form>
    <div id="bb-branding">Powered by BotBase</div>
  `;
  root.appendChild(btn);
  root.appendChild(win);
  document.head.appendChild(styleEl);
  document.body.appendChild(root);

  let open = false, waiting = false;
  const $ = (id) => document.getElementById(id);

  function timeStr() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function appendMessage(role, text, isTyping = false) {
    const msgs = $('bb-messages');
    const wrap = document.createElement('div');
    wrap.className = `bb-msg bb-${role}${isTyping ? ' bb-typing' : ''}`;
    wrap.innerHTML = `<div class="bb-bubble">${text.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div><div class="bb-time">${timeStr()}</div>`;
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  function toggleOpen() {
    open = !open;
    win.classList.toggle('bb-hidden', !open);
    btn.innerHTML = open ? iconX : iconChat;
    if (open && $('bb-messages').children.length === 0) {
      appendMessage('bot', script?.getAttribute('data-greeting') || 'Hi! How can I help you today?');
    }
    if (open) $('bb-input').focus();
  }

  async function sendMessage(text) {
    if (waiting || !text.trim()) return;
    waiting = true;
    appendMessage('user', text);
    $('bb-input').value = '';
    $('bb-send').disabled = true;
    const typingEl = appendMessage('bot', '…', true);
    try {
      const apiBase = BACKEND || (script?.src ? new URL(script.src).origin : '');
      const res = await fetch(`${apiBase}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-token': TOKEN },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      typingEl.remove();
      appendMessage('bot', res.ok ? data.answer : (data.error || 'Something went wrong.'));
    } catch {
      typingEl.remove();
      appendMessage('bot', 'Could not reach the server. Please check your connection.');
    } finally {
      waiting = false;
      $('bb-send').disabled = false;
      $('bb-input').focus();
    }
  }

  btn.addEventListener('click', toggleOpen);
  $('bb-close').addEventListener('click', toggleOpen);
  $('bb-form').addEventListener('submit', (e) => { e.preventDefault(); const v = $('bb-input').value.trim(); if (v) sendMessage(v); });
  $('bb-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('bb-form').dispatchEvent(new Event('submit')); } });
})();
