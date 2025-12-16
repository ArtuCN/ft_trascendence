# LiveChat Integration Guide

This guide explains how to integrate the LiveChat service into your frontend or backend services within the ft_transcendence application.

**Note**: This guide assumes the LiveChat Docker container is already built and running. For Docker setup, see `LIVECHAT_DOCKER_GUIDE.md` in the project root.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [Authentication & User Identity](#authentication--user-identity)
6. [Available Events](#available-events)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Browser)         Backend (Optional)               │
│       │                            │                         │
│       │ Socket.IO Client          │ HTTP/Socket.IO          │
│       │                            │                         │
│       └────────────┬───────────────┘                         │
│                    │                                          │
└────────────────────┼──────────────────────────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   nginx      │  (Reverse Proxy)
              └─────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   /chat/                  /socket.io/
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
              ┌─────────────┐
              │  LiveChat    │  (Port 4555)
              │   Server     │
              └─────────────┘
```

### Connection URLs

| Environment | REST API | WebSocket | Use Case |
|-------------|----------|-----------|----------|
| **Docker (Production)** | `https://localhost/chat/` | `https://localhost` (path: `/socket.io/`) | Browser connections |
| **Docker (Internal)** | `http://livechat:4555` | `http://livechat:4555` | Container-to-container |
| **Local Development** | `http://localhost:4555` | `http://localhost:4555` | Direct connection |

---

## Quick Start

### 1. Install Socket.IO Client

In your frontend project:

```bash
npm install socket.io-client
```

### 2. Basic Connection (Frontend in Docker Environment)

```typescript
import { io } from 'socket.io-client';

// Connect to LiveChat through nginx proxy
const socket = io('https://localhost', {
  path: '/socket.io/',
  secure: true,
  rejectUnauthorized: false  // Only for self-signed certs in development
});

socket.on('connect', () => {
  console.log('Connected to LiveChat:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from LiveChat');
});
```

### 3. Register Your User

```typescript
// After user authentication, register their permanent ID
const userId = 12345;  // From your auth system or database

socket.emit('save_client_id', userId);
```

**That's it!** You're now connected to LiveChat. See below for detailed usage patterns.

---

## Frontend Integration

### Environment-Specific Configuration

Create a connection utility that handles different environments:

```typescript
// src/utils/livechat.ts

function getLiveChatURL(): string {
  // Check if running in production (Docker)
  if (import.meta.env.PROD || window.location.protocol === 'https:') {
    return 'https://localhost';
  }
  // Local development
  return 'http://localhost:4555';
}

function getLiveChatConfig() {
  const isProd = import.meta.env.PROD || window.location.protocol === 'https:';

  return {
    url: getLiveChatURL(),
    options: {
      path: '/socket.io/',
      secure: isProd,
      rejectUnauthorized: false,  // For dev with self-signed certs
      transports: ['websocket', 'polling'],  // Fallback to polling if needed
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    }
  };
}

export { getLiveChatURL, getLiveChatConfig };
```

### Complete Frontend Setup

```typescript
// src/services/livechat-service.ts
import { io, Socket } from 'socket.io-client';
import { getLiveChatConfig } from '../utils/livechat';

class LiveChatService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private chatIds: string[] = [];

  connect(userId: number) {
    const { url, options } = getLiveChatConfig();

    this.socket = io(url, options);
    this.userId = userId;

    this.socket.on('connect', () => {
      console.log('LiveChat connected:', this.socket?.id);
      this.registerUser();
      this.loadUserChats();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('LiveChat disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('LiveChat connection error:', error);
    });

    return this.socket;
  }

  private registerUser() {
    if (!this.socket || !this.userId) return;

    // Save user ID in localStorage for reconnection
    localStorage.setItem('livechat_user_id', this.userId.toString());

    // Register with server
    this.socket.emit('save_client_id', this.userId);
  }

  private async loadUserChats() {
    if (!this.socket) return;

    return new Promise<string[]>((resolve) => {
      this.socket!.emit('get_client_chat_ids');

      this.socket!.once('get_client_chat_ids', (chatIds: string[]) => {
        this.chatIds = chatIds;
        console.log('User chats loaded:', chatIds);
        resolve(chatIds);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Utility methods
  sendMessage(chatId: string, message: string) {
    if (!this.socket) return;

    this.socket.emit('private_message', {
      chat_id: chatId,
      message: message
    });
  }

  createChat(recipientIds: number[], chatName?: string) {
    return new Promise<string>((resolve) => {
      if (!this.socket) return;

      this.socket.emit('create_chat', { recipients: recipientIds, chat_name: chatName });

      this.socket.once('create_chat', (chatId: string) => {
        this.chatIds.push(chatId);
        resolve(chatId);
      });
    });
  }
}

export const liveChatService = new LiveChatService();
```

### Usage in React Component (Example)

```tsx
// src/components/ChatComponent.tsx
import { useEffect, useState } from 'react';
import { liveChatService } from '../services/livechat-service';

function ChatComponent({ currentUserId }: { currentUserId: number }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to LiveChat
    const socket = liveChatService.connect(currentUserId);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen for incoming messages
    socket.on('private_message', (data) => {
      setMessages(prev => [...prev, {
        chatId: data.chat_id,
        message: data.message,
        timestamp: Date.now()
      }]);
    });

    // Cleanup on unmount
    return () => {
      liveChatService.disconnect();
    };
  }, [currentUserId]);

  const handleSendMessage = (chatId: string, text: string) => {
    liveChatService.sendMessage(chatId, text);
  };

  return (
    <div>
      <div>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {/* Your chat UI here */}
    </div>
  );
}
```

---

## Backend Integration

If you need to interact with LiveChat from your backend service (e.g., sending system messages, creating chats programmatically):

### Internal Container-to-Container Connection

```typescript
// In your backend service (running in Docker)
import { io, Socket } from 'socket.io-client';

const socket = io('http://livechat:4555', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Backend connected to LiveChat:', socket.id);

  // Register as a system client
  socket.emit('save_client_id', -1);  // Use negative ID for system
});

// Send a system message to a chat
function sendSystemMessage(chatId: string, message: string) {
  socket.emit('private_message', {
    chat_id: chatId,
    message: `[SYSTEM] ${message}`
  });
}
```

### HTTP REST API (If Available)

Currently, the LiveChat service exposes a basic REST endpoint:

```bash
# Health check
curl https://localhost/chat/

# Response: {"hello":"world"}
```

**Note**: Most LiveChat functionality is through Socket.IO events, not REST endpoints.

---

## Authentication & User Identity

### Understanding Client IDs

LiveChat uses **permanent client IDs** (numbers) to identify users across reconnections. Your application is responsible for:

1. **User Authentication**: Verify user identity through your auth system
2. **ID Assignment**: Assign each user a unique numeric ID (from your database)
3. **ID Registration**: Pass this ID to LiveChat using `save_client_id` event

### Identity Flow

```
┌──────────────┐
│  Your Auth   │  (OAuth, JWT, sessions, etc.)
│   System     │
└───────┬──────┘
        │
        ▼
   User ID: 12345
        │
        ▼
┌───────────────┐
│  LiveChat     │  emit('save_client_id', 12345)
│  Registration │
└───────────────┘
        │
        ▼
   Stored as permanent identity
   Maps to ephemeral socket.id
```

### Implementation Example

```typescript
// After user logs in with your auth system
async function onUserLogin(username: string, password: string) {
  // 1. Authenticate with your backend
  const authResponse = await fetch('https://localhost/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  const { userId, token } = await authResponse.json();

  // 2. Store auth token
  localStorage.setItem('auth_token', token);

  // 3. Connect to LiveChat with the user ID
  const socket = liveChatService.connect(userId);
}
```

### Reconnection Handling

LiveChat automatically handles reconnections if you store the user ID:

```typescript
// On page load, check for existing user
function initializeApp() {
  const savedUserId = localStorage.getItem('livechat_user_id');

  if (savedUserId) {
    // User was previously connected, reconnect
    liveChatService.connect(parseInt(savedUserId));
  }
}
```

---

## Available Events

### Client → Server Events

| Event | Parameters | Description | Response Event |
|-------|-----------|-------------|----------------|
| `save_client_id` | `client_id: number` | Register/update user's permanent ID | - |
| `get_client_chat_ids` | - | Get all chat IDs for current user | `get_client_chat_ids` |
| `create_chat` | `{ recipients: number[], chat_name?: string }` | Create new chat with user IDs | `create_chat` |
| `get_chat_object` | `{ id?: string, chat_name?: string }` | Get chat details by ID or name | `get_chat_object` |
| `private_message` | `{ chat_id: string, message: string }` | Send message to chat recipients | `private_message` (to recipients) |
| `add_recipient` | `{ chat_id: string, recipient: number }` | Add user to existing chat | `add_recipient` |
| `delete_recipient` | `{ chat_id: string, client_id: number }` | Remove user from chat | `delete_recipient` |
| `chat:message` | `message: string` | Broadcast to all connected users | `chat:message` (to all) |
| `get_sockets` | - | Get all connected socket IDs (dev only) | `get_sockets` |
| `get_all_clients` | - | Get all registered client IDs (dev only) | `get_all_clients` |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `connect` | - | Socket.IO connection established |
| `disconnect` | `reason: string` | Socket.IO connection lost |
| `get_client_chat_ids` | `chatIds: string[]` | Response with user's chat IDs |
| `create_chat` | `chatId: string` | Response with new chat ID |
| `get_chat_object` | `chat: { chat_id, chat_name?, recipients }` | Response with chat details |
| `private_message` | `{ chat_id: string, message: string }` | Incoming private message |
| `add_recipient` | `recipients: number[]` | Updated recipients list |
| `delete_recipient` | `deletedId: number` | Confirmation of removal |
| `chat:message` | `message: string` | Broadcast message from any user |
| `get_sockets` | `socketIds: string[]` | All connected socket IDs |
| `get_all_clients` | `clientIds: number[]` | All registered client IDs |

---

## Common Patterns

### Pattern 1: Creating a Direct Message (DM)

```typescript
async function createDirectMessage(myUserId: number, recipientUserId: number) {
  const socket = liveChatService.getSocket();

  return new Promise<string>((resolve) => {
    socket.emit('create_chat', {
      recipients: [myUserId, recipientUserId],
      chat_name: `DM-${myUserId}-${recipientUserId}`
    });

    socket.once('create_chat', (chatId: string) => {
      console.log('DM created:', chatId);
      resolve(chatId);
    });
  });
}
```

### Pattern 2: Creating a Group Chat

```typescript
async function createGroupChat(myUserId: number, otherUserIds: number[], groupName: string) {
  const socket = liveChatService.getSocket();

  return new Promise<string>((resolve) => {
    socket.emit('create_chat', {
      recipients: [myUserId, ...otherUserIds],
      chat_name: groupName
    });

    socket.once('create_chat', (chatId: string) => {
      console.log('Group chat created:', chatId);
      resolve(chatId);
    });
  });
}
```

### Pattern 3: Listening for Messages in a Specific Chat

```typescript
function listenToChatMessages(chatId: string, onMessage: (msg: string) => void) {
  const socket = liveChatService.getSocket();

  socket.on('private_message', (data) => {
    if (data.chat_id === chatId) {
      onMessage(data.message);
    }
  });
}
```

### Pattern 4: Adding Someone to an Existing Chat

```typescript
async function addUserToChat(chatId: string, newUserId: number) {
  const socket = liveChatService.getSocket();

  return new Promise<number[]>((resolve) => {
    socket.emit('add_recipient', {
      chat_id: chatId,
      recipient: newUserId
    });

    socket.once('add_recipient', (updatedRecipients: number[]) => {
      console.log('Updated recipients:', updatedRecipients);
      resolve(updatedRecipients);
    });
  });
}
```

### Pattern 5: Getting All User's Chats on Login

```typescript
async function loadUserChats(userId: number) {
  const socket = liveChatService.getSocket();

  // Get list of chat IDs
  const chatIds = await new Promise<string[]>((resolve) => {
    socket.emit('get_client_chat_ids');
    socket.once('get_client_chat_ids', resolve);
  });

  // Load details for each chat
  const chats = await Promise.all(
    chatIds.map(chatId =>
      new Promise((resolve) => {
        socket.emit('get_chat_object', { id: chatId });
        socket.once('get_chat_object', resolve);
      })
    )
  );

  return chats;
}
```

### Pattern 6: Checking if User is Online

```typescript
async function isUserOnline(userId: number): Promise<boolean> {
  const socket = liveChatService.getSocket();

  return new Promise<boolean>((resolve) => {
    socket.emit('get_all_clients');

    socket.once('get_all_clients', (clientIds: number[]) => {
      resolve(clientIds.includes(userId));
    });
  });
}
```

---

## Troubleshooting

### Issue: Cannot connect to LiveChat

**Symptoms**: `connect_error` or connection timeout

**Solutions**:
1. Check LiveChat container is running: `docker-compose ps livechat`
2. Check nginx is routing correctly: `curl -k https://localhost/chat/`
3. Verify nginx configuration includes `/socket.io/` location block
4. Check browser console for CORS errors
5. For local dev, ensure LiveChat is running on port 4555

```bash
# Check LiveChat is accessible internally
docker exec frontend curl http://livechat:4555/
```

### Issue: Messages not being received

**Symptoms**: Can send but not receive messages

**Possible causes**:
1. **Not registered**: Did you call `save_client_id` after connecting?
2. **Wrong chat ID**: Verify you're in the chat with `get_client_chat_ids`
3. **Not listening**: Make sure you have `socket.on('private_message', ...)` listener

**Debug**:
```typescript
socket.on('private_message', (data) => {
  console.log('Received message:', data);
});
```

### Issue: Reconnection not working

**Symptoms**: After page refresh, user loses chats

**Solution**: Store and restore user ID from localStorage

```typescript
// On connect
socket.on('connect', () => {
  const userId = localStorage.getItem('livechat_user_id');
  if (userId) {
    socket.emit('save_client_id', parseInt(userId));
    socket.emit('get_client_chat_ids');
  }
});
```

### Issue: WebSocket falls back to polling

**Symptoms**: Slow connection, frequent reconnects

**Solution**: Ensure WebSocket upgrade is working

```typescript
const socket = io(url, {
  transports: ['websocket', 'polling'],  // Try websocket first
  upgrade: true
});

socket.on('connect', () => {
  console.log('Transport:', socket.io.engine.transport.name);
  // Should log "websocket", not "polling"
});
```

### Issue: CORS errors in browser

**Symptoms**: `Access-Control-Allow-Origin` errors

**Solution**: LiveChat should have CORS configured. If running locally without nginx:

```typescript
// In src/lib/socket.ts (server-side)
const io = new Server(fastifyServer, {
  cors: {
    origin: ["http://localhost:5173", "https://localhost"],
    methods: ["GET", "POST"]
  }
});
```

### Issue: Can't reach from another Docker container

**Symptoms**: Connection timeout from backend container

**Solution**: Ensure both containers are on the same network

```yaml
# In your docker-compose.yml
your_service:
  networks:
    - transcendnet  # Same network as livechat
```

---

## Additional Resources

- **LiveChat Internal Architecture**: See `README.md` in this directory
- **Docker Setup Guide**: See `LIVECHAT_DOCKER_GUIDE.md` in project root
- **Socket.IO Documentation**: https://socket.io/docs/v4/

---

## Support

For issues or questions about LiveChat integration:
1. Check this guide's troubleshooting section
2. Review the README.md for internal architecture details
3. Check LiveChat logs: `docker-compose logs -f livechat`
4. Verify nginx configuration: `docker exec nginx nginx -t`
