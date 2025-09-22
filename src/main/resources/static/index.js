const WS_ENDPOINT = '/chat';
const APP_DESTINATION = '/app/chat.send';

let stompClient = null;
let receivedMessageIds = new Set(); // track displayed messages to prevent duplicates

const usernameInput = document.getElementById('username');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const sendBtn = document.getElementById('sendBtn');
const messagesEl = document.getElementById('messages');
const statusEl = document.getElementById('status');
const msgCount = document.getElementById('msgCount');

function setStatus(text) { statusEl.textContent = text; }

// Add a message to the UI and enable copy
function addMessageToUI(msg) {
    const msgId = msg.id || msg.createdAt; // unique id
    if (receivedMessageIds.has(msgId)) return; // skip duplicates
    receivedMessageIds.add(msgId);

    const div = document.createElement('div');
    div.className = 'message';

    const meta = document.createElement('div');
    meta.className = 'meta small';
    meta.textContent = `${msg.senderName || 'unknown'} • ${new Date(msg.createdAt || Date.now()).toLocaleString()}`;
    div.appendChild(meta);

    const body = document.createElement('div');
    body.textContent = msg.content || '';
    body.style.cursor = 'pointer';
    body.title = "Click to copy";
    body.addEventListener('click', () => {
        navigator.clipboard.writeText(msg.content || '').then(() => {
            alert('Message copied to clipboard!');
        });
    });
    div.appendChild(body);

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    msgCount.textContent = messagesEl.children.length;
}

function clearMessages() {
    messagesEl.innerHTML = '';
    msgCount.textContent = '0';
    receivedMessageIds.clear();
}

async function fetchHistory() {
    try {
        const res = await fetch('/api/chat/messages');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) {
            console.error("Expected array, got:", data);
            return;
        }
        clearMessages();
        data.forEach(addMessageToUI);
    } catch (e) {
        console.error("Failed to fetch chat history:", e);
    }
}

function connect() {
    const username = usernameInput.value.trim() || 'anonymous';
    if (!username) return alert('Enter a username');

    setStatus('CONNECTING...');
    const socket = new SockJS(WS_ENDPOINT);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, frame => {
        setStatus('CONNECTED');

        // Subscribe to global chat topic
        stompClient.subscribe('/topic/global', msg => {
            if (!msg.body) return;
            const message = JSON.parse(msg.body);
            addMessageToUI(message);
        });

        // Fetch last 50 messages once after connecting
        fetchHistory();
    });
}

function disconnect() {
    if (stompClient) stompClient.disconnect();
    stompClient = null;
    setStatus('DISCONNECTED');
}

function sendMessage() {
    if (!stompClient) return alert('Not connected');

    const content = document.getElementById('content').value.trim();
    const username = usernameInput.value.trim() || 'anonymous';
    if (!content) return;

    const payload = { type: 'MESSAGE', senderName: username, content };
    stompClient.send(APP_DESTINATION, {}, JSON.stringify(payload));

    document.getElementById('content').value = '';
}

// Event listeners
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
sendBtn.addEventListener('click', sendMessage);
document.getElementById('content').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
