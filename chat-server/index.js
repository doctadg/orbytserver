import { createClient } from 'redis';
import { WebSocketServer } from 'ws';

const redisClient = createClient({
  socket: {
    host: 'smiling-joey-14708.upstash.io',
    port: 6379,
    tls: true
  },
  password: 'ATl0AAIjcDExOTEzNTYyNDI5ZTk0ZGViYTE4ZWZjODAyNjM3MmNjN3AxMA'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

const wss = new WebSocketServer({ port: 8080 });

const CHAT_HISTORY_KEY = 'chat_history';

async function loadChatHistory() {
  try {
    const history = await redisClient.lRange(CHAT_HISTORY_KEY, 0, -1);
    return history.map(JSON.parse);
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

async function saveMessage(message) {
  try {
    await redisClient.rPush(CHAT_HISTORY_KEY, JSON.stringify(message));
  } catch (error) {
    console.error('Error saving message:', error);
  }
}
wss.on('connection', async (ws) => {
  console.log('Client connected');

    const chatHistory = await loadChatHistory();
    chatHistory.forEach(msg => {
        ws.send(JSON.stringify(msg));
    });


  ws.on('message', async (message) => {
    const messageObj = {
      text: message.toString(),
      timestamp: Date.now()
    };

    await saveMessage(messageObj);

    // Broadcast the message to all clients
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(messageObj));
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server listening on port 8080');
