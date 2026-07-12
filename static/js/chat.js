/**
 * MediScan AI — AI Chat Panel JavaScript
 * Handles chat bubble toggle, message sending, AI responses
 */

(function () {
    'use strict';

    const bubble    = document.getElementById('chatBubble');
    const panel     = document.getElementById('chatPanel');
    const closeBtn  = document.getElementById('chatClose');
    const input     = document.getElementById('chatInput');
    const sendBtn   = document.getElementById('chatSend');
    const messages  = document.getElementById('chatMessages');

    if (!bubble) return;   // Not on a page with the chat widget

    const SCAN_ID = bubble.dataset.scanId;

    // ── Toggle panel ──────────────────────────────────────────────────────────
    function openPanel()  { panel.classList.add('open'); bubble.setAttribute('aria-expanded', 'true'); input && input.focus(); }
    function closePanel() { panel.classList.remove('open'); bubble.setAttribute('aria-expanded', 'false'); }

    bubble.addEventListener('click', () =>
        panel.classList.contains('open') ? closePanel() : openPanel()
    );
    closeBtn && closeBtn.addEventListener('click', closePanel);

    // Close on backdrop click
    document.addEventListener('click', e => {
        if (panel.classList.contains('open') &&
            !panel.contains(e.target) &&
            !bubble.contains(e.target)) {
            closePanel();
        }
    });

    // ── Keyboard: Enter to send, Shift+Enter for newline ─────────────────────
    input && input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    sendBtn && sendBtn.addEventListener('click', sendMessage);

    // ── Auto-resize textarea ─────────────────────────────────────────────────
    input && input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });

    // ── Append a message bubble ───────────────────────────────────────────────
    function appendMessage(role, text) {
        const isUser  = role === 'user';
        const initial = isUser ? (window._currentUserInitial || 'U') : '🤖';

        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.innerHTML = `
            <div class="chat-msg-avatar">${initial}</div>
            <div class="chat-msg-bubble">${formatText(text)}</div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    // Simple text formatter: newlines → <br>, URLs → links
    function formatText(text) {
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:#00d4aa">$1</a>');
    }

    // ── Typing indicator ─────────────────────────────────────────────────────
    function showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg ai';
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="chat-msg-avatar">🤖</div>
            <div class="chat-msg-bubble">
                <div class="chat-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    // ── Send message ─────────────────────────────────────────────────────────
    async function sendMessage() {
        if (!input) return;
        const question = input.value.trim();
        if (!question) return;

        appendMessage('user', question);
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        showTyping();

        try {
            const res = await fetch(`/chat/${SCAN_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });
            const data = await res.json();
            hideTyping();

            if (data.available && data.response) {
                appendMessage('ai', data.response);
            } else {
                appendMessage('ai', data.message ||
                    'Sorry, I could not process that. Please try again.');
            }
        } catch (err) {
            hideTyping();
            appendMessage('ai', 'Network error. Please check your connection and try again.');
        } finally {
            sendBtn.disabled = false;
            input.focus();
        }
    }
}());
