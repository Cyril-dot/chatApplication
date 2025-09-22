// index.js — SockJS + STOMP client for your HTML
(() => {
  const wsEndpointEl = document.getElementById('wsEndpoint'); // "/chat"
  const topicPatternEl = document.getElementById('topicPattern'); // "/topic/global"
  const statusEl = document.getElementById('status');
  const messagesEl = document.getElementById('messages');
  const msgCountEl = document.getElementById('msgCount');

  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const sendBtn = document.getElementById('sendBtn');
  const fetchHistoryBtn = document.getElementById('fetchHistory');
  const clearMessagesBtn = document.getElementById('clearMessages');

  const usernameInput = document.getElementById('username');
  const contentInput = document.getElementById('content');

  let stompClient = null;
  let subscription = null;
  let messageCount = 0;

  function setStatus(s) {
    statusEl.textContent = s;
    statusEl.style.color = s === 'CONNECTED' ? '#6ee7b7' : '#ffb86b';
  }

  function renderMessage(msg) {
    // msg expected: {id, content, createdAt, senderId/displayName/username}
    const wrapper = document.createElement('div');
    wrapper.className = 'msg';
    // mark own messages if username matches
    const currentUser = usernameInput.value && usernameInput.value.trim();
    if (msg.username && currentUser && msg.username === currentUser) {
      wrapper.classList.add('own');
    }

    const meta = document.createElement('div');
    meta.className = 'metaRow';
    const userSpan = document.createElement('div');
    userSpan.className = 'username';
    userSpan.textContent = msg.displayName || msg.username || 'Anonymous';
    const timeSpan = document.createElement('div');
    timeSpan.className = 'time';
    timeSpan.textContent = new Date(msg.createdAt || Date.now()).toLocaleString();

    meta.appendChild(userSpan);
    meta.appendChild(timeSpan);

    const content = document.createElement('div');
    content.textContent = msg.content || '';

    wrapper.appendChild(meta);
    wrapper.appendChild(content);

    messagesEl.prepend(wrapper); // newest on top (your SQL uses ORDER BY created_at DESC)
    messageCount++;
    msgCountEl.textContent = messageCount;
  }

  function clearUI() {
    messagesEl.innerHTML = '';
    messageCount = 0;
    msgCountEl.textContent = 0;
  }

  function connect() {
    if (stompClient && stompClient.connected) {
      return;
    }

    const endpoint = wsEndpointEl.textContent || '/chat';
    // build absolute URL — SockJS will use same host/port as page by default
    // If your websocket URL is different, set wsEndpointEl.innerText to the correct path.
    const sock = new SockJS(endpoint);
    stompClient = Stomp.over(sock);

    // Optional: disable debug noise in console
    stompClient.debug = function () {};

    stompClient.connect({}, function (frame) {
      setStatus('CONNECTED');
      // subscribe to topic
      const topic = topicPatternEl.textContent || '/topic/global';
      subscription = stompClient.subscribe(topic, function (message) {
        try {
          const body = JSON.parse(message.body);
          renderMessage(body);
        } catch (e) {
          // if backend sends plain text:
          renderMessage({ content: message.body, createdAt: Date.now() });
        }
      });
    }, function (error) {
      setStatus('DISCONNECTED');
      console.error('STOMP connect error', error);
    });
  }

  function disconnect() {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
    if (stompClient) {
      stompClient.disconnect(() => setStatus('DISCONNECTED'));
      stompClient = null;
    } else {
      setStatus('DISCONNECTED');
    }
  }

  function sendMessage() {
    const content = contentInput.value && contentInput.value.trim();
    const username = usernameInput.value && usernameInput.value.trim();
    if (!content) return;
    // build payload: adjust keys to match backend DTO
    const payload = {
      content,
      username: username || 'Anonymous'
    };

    // If your backend expects to POST to a REST endpoint instead of STOMP send, uncomment fetch() block below.
    if (stompClient && stompClient.connected) {
      // server should have an @MessageMapping for the destination below
      stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(payload));
      contentInput.value = '';
    } else {
      // fallback: POST to REST endpoint /messages
      fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => {
        if (!r.ok) console.warn('POST /messages failed', r.status);
        contentInput.value = '';
      }).catch(err => console.error('POST /messages err', err));
    }
  }

  async function fetchHistory() {
    try {
      // Assumes backend exposes GET /messages?limit=50 returning JSON array ordered desc
      const res = await fetch('/messages?limit=50');
      if (!res.ok) {
        console.warn('Could not fetch history', res.status);
        return;
      }
      const arr = await res.json();
      clearUI();
      // arr expected newest-first; render in order
      for (const m of arr) renderMessage(m);
    } catch (e) {
      console.error('fetchHistory error', e);
    }
  }

  // events
  connectBtn.addEventListener('click', connect);
  disconnectBtn.addEventListener('click', disconnect);
  sendBtn.addEventListener('click', sendMessage);
  fetchHistoryBtn.addEventListener('click', fetchHistory);
  clearMessagesBtn.addEventListener('click', clearUI);

  // send on Enter in input
  contentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // auto-connect on page load (optional)
  window.addEventListener('load', () => {
    setStatus('DISCONNECTED');
    // try auto-connect:
    // connect();
    fetchHistory(); // show history immediately
  });

})();
// index.js — SockJS + STOMP client for your HTML
(() => {
  const wsEndpointEl = document.getElementById('wsEndpoint'); // "/chat"
  const topicPatternEl = document.getElementById('topicPattern'); // "/topic/global"
  const statusEl = document.getElementById('status');
  const messagesEl = document.getElementById('messages');
  const msgCountEl = document.getElementById('msgCount');

  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const sendBtn = document.getElementById('sendBtn');
  const fetchHistoryBtn = document.getElementById('fetchHistory');
  const clearMessagesBtn = document.getElementById('clearMessages');

  const usernameInput = document.getElementById('username');
  const contentInput = document.getElementById('content');

  let stompClient = null;
  let subscription = null;
  let messageCount = 0;

  function setStatus(s) {
    statusEl.textContent = s;
    statusEl.style.color = s === 'CONNECTED' ? '#6ee7b7' : '#ffb86b';
  }

  function renderMessage(msg) {
    // msg expected: {id, content, createdAt, senderId/displayName/username}
    const wrapper = document.createElement('div');
    wrapper.className = 'msg';
    // mark own messages if username matches
    const currentUser = usernameInput.value && usernameInput.value.trim();
    if (msg.username && currentUser && msg.username === currentUser) {
      wrapper.classList.add('own');
    }

    const meta = document.createElement('div');
    meta.className = 'metaRow';
    const userSpan = document.createElement('div');
    userSpan.className = 'username';
    userSpan.textContent = msg.displayName || msg.username || 'Anonymous';
    const timeSpan = document.createElement('div');
    timeSpan.className = 'time';
    timeSpan.textContent = new Date(msg.createdAt || Date.now()).toLocaleString();

    meta.appendChild(userSpan);
    meta.appendChild(timeSpan);

    const content = document.createElement('div');
    content.textContent = msg.content || '';

    wrapper.appendChild(meta);
    wrapper.appendChild(content);

    messagesEl.prepend(wrapper); // newest on top (your SQL uses ORDER BY created_at DESC)
    messageCount++;
    msgCountEl.textContent = messageCount;
  }

  function clearUI() {
    messagesEl.innerHTML = '';
    messageCount = 0;
    msgCountEl.textContent = 0;
  }

  function connect() {
    if (stompClient && stompClient.connected) {
      return;
    }

    const endpoint = wsEndpointEl.textContent || '/chat';
    // build absolute URL — SockJS will use same host/port as page by default
    // If your websocket URL is different, set wsEndpointEl.innerText to the correct path.
    const sock = new SockJS(endpoint);
    stompClient = Stomp.over(sock);

    // Optional: disable debug noise in console
    stompClient.debug = function () {};

    stompClient.connect({}, function (frame) {
      setStatus('CONNECTED');
      // subscribe to topic
      const topic = topicPatternEl.textContent || '/topic/global';
      subscription = stompClient.subscribe(topic, function (message) {
        try {
          const body = JSON.parse(message.body);
          renderMessage(body);
        } catch (e) {
          // if backend sends plain text:
          renderMessage({ content: message.body, createdAt: Date.now() });
        }
      });
    }, function (error) {
      setStatus('DISCONNECTED');
      console.error('STOMP connect error', error);
    });
  }

  function disconnect() {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
    if (stompClient) {
      stompClient.disconnect(() => setStatus('DISCONNECTED'));
      stompClient = null;
    } else {
      setStatus('DISCONNECTED');
    }
  }

  function sendMessage() {
    const content = contentInput.value && contentInput.value.trim();
    const username = usernameInput.value && usernameInput.value.trim();
    if (!content) return;
    // build payload: adjust keys to match backend DTO
    const payload = {
      content,
      username: username || 'Anonymous'
    };

    // If your backend expects to POST to a REST endpoint instead of STOMP send, uncomment fetch() block below.
    if (stompClient && stompClient.connected) {
      // server should have an @MessageMapping for the destination below
      stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(payload));
      contentInput.value = '';
    } else {
      // fallback: POST to REST endpoint /messages
      fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => {
        if (!r.ok) console.warn('POST /messages failed', r.status);
        contentInput.value = '';
      }).catch(err => console.error('POST /messages err', err));
    }
  }

  async function fetchHistory() {
    try {
      // Assumes backend exposes GET /messages?limit=50 returning JSON array ordered desc
      const res = await fetch('/messages?limit=50');
      if (!res.ok) {
        console.warn('Could not fetch history', res.status);
        return;
      }
      const arr = await res.json();
      clearUI();
      // arr expected newest-first; render in order
      for (const m of arr) renderMessage(m);
    } catch (e) {
      console.error('fetchHistory error', e);
    }
  }

  // events
  connectBtn.addEventListener('click', connect);
  disconnectBtn.addEventListener('click', disconnect);
  sendBtn.addEventListener('click', sendMessage);
  fetchHistoryBtn.addEventListener('click', fetchHistory);
  clearMessagesBtn.addEventListener('click', clearUI);

  // send on Enter in input
  contentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // auto-connect on page load (optional)
  window.addEventListener('load', () => {
    setStatus('DISCONNECTED');
    // try auto-connect:
    // connect();
    fetchHistory(); // show history immediately
  });

})();
