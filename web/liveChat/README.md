# Live Chat Application

A real-time chat application built with TypeScript, Socket.IO, Fastify, and Vite. This application enables users to create private/group chats, manage chat participants, and maintain persistent identities across reconnections.

## What This App Does

This is a full-stack real-time messaging application that provides:

- **Real-time Communication**: Instant message delivery using WebSocket technology
- **Private/Group Chats**: Create chat rooms with specific recipients
- **Persistent Identity**: Users maintain their identity across page refreshes and reconnections
- **Chat Management**: Add or remove participants from existing chats
- **Multi-user Support**: Track and connect with multiple online users
- **Reconnection Handling**: Automatically rejoin chats after disconnection

## How It Works

The application uses a client-server architecture with a **dual identity system** to handle ephemeral socket connections and persistent user identities.

### Dual Identity System

The core innovation of this chat system is separating **Socket Identity** from **User Identity**:

```
┌─────────────────────────────────┐
│  User/Client ID (Permanent)     │
│  - Number from database/auth    │
│  - Survives reconnections       │
│  - Stored in chats              │
└────────────┬────────────────────┘
             │
             │ Mapped via clients[] array
             ▼
┌─────────────────────────────────┐
│  Socket ID (Ephemeral)          │
│  - String from Socket.IO        │
│  - Changes on every connection  │
│  - Used for routing messages    │
└─────────────────────────────────┘
```

**Why This Matters:**
- Socket IDs change on every page refresh/reconnection
- Chats store **client IDs** (permanent) not socket IDs
- The `clients[]` array maintains the mapping: `{id: client_id, socket: socket_id}`
- When a user reconnects, they send their client ID to update the mapping
- Messages are routed by looking up current socket IDs from client IDs

### Reconnection Flow

```
1. User connects/reconnects
   └─→ New socket.id assigned by Socket.IO

2. Client sends save_client_id with permanent ID
   └─→ Server updates: clients[index].socket = new_socket_id

3. Client requests their chats (get_client_chat_ids)
   └─→ Server looks up client_id by socket_id
   └─→ Returns chats where client_id is in recipients

4. User is back in all their chats with new socket
```

### Architecture Flow

```
Client (Browser) <--WebSocket--> Socket.IO Server <--> Fastify Server
     |                                  |
     |                                  |
  DOM Updates                    Chat Management
  User Actions                   Client ID Mapping
  localStorage (client_id)       Event Broadcasting
```

## Running the Application

### Docker Deployment (Recommended for Production)

The LiveChat service is fully containerized and integrated into the main Docker Compose infrastructure.

**Prerequisites**: Docker and Docker Compose installed.

**From project root**:
```bash
# Build the LiveChat container
docker-compose build livechat

# Start all services (including LiveChat)
docker-compose up -d

# View LiveChat logs
docker-compose logs -f livechat

# Stop services
docker-compose down
```

**Access Points** (when running in Docker):
- LiveChat REST API: `https://localhost/chat/`
- LiveChat WebSocket: `https://localhost/socket.io/`
- Internal (container-to-container): `http://livechat:4555`

**Docker Configuration**:
- Container name: `livechat`
- Internal port: `4555`
- Network: `transcendnet`
- Volumes: Hot-reload enabled for `src/`, persistent `node_modules`
- Dependencies: Waits for `database` and `backend` to be ready


---

### Local Development Mode

**Without Docker** - Run directly on your machine for development:

#### Full Stack (Frontend + Backend)
```bash
npm run dev
```
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:4555 (Fastify + Socket.IO)

#### Frontend Only
```bash
npm run front
```
Starts only the Vite dev server on port 5173.

#### Backend Only
```bash
npm run back
```
Starts only the backend server with hot reload using nodemon.

---

### Environment Variables

LiveChat uses different environment files for different deployment modes:

#### For Docker Deployment
Use `env_example_docker.txt` as template for `.env.docker`:

```env
# Container-to-container communication
VITE_API_URL="http://livechat:4555"
HOST="http://livechat"
VITE_PORT=4555
VITE_FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your_secret_key"
FRONTEND_URL="http://localhost:5173"
```

#### For Local Development
Use `env_example_local.txt` as template for `.env`:

```env
# Local machine communication
HOST="127.0.0.1"
VITE_API_URL="http://localhost:4555"
VITE_PORT=4555
VITE_FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your_secret_key"
FRONTEND_URL="http://localhost:5173"
```

**Key Differences**:
- Docker uses container names (`livechat`) for internal communication
- Local uses `localhost` or `127.0.0.1`
- Port remains `4555` in both cases

---

### Integration with Other Services

To integrate LiveChat into your frontend or backend service, see the **`LIVECHAT_INTEGRATION_GUIDE.md`** file in this directory.

## Project Structure

### Configuration Files

#### `package.json`
Project configuration and dependencies.

**Key Dependencies**:
- `fastify`: Fast HTTP server framework
- `socket.io`: Server-side WebSocket library
- `socket.io-client`: Client-side WebSocket library
- `vite`: Frontend build tool and dev server
- `typescript`: Type-safe JavaScript

**Scripts**:
- `npm run dev`: Runs both frontend and backend concurrently
- `npm run front`: Runs only the Vite dev server (port 5173)
- `npm run back`: Runs only the backend server with hot reload
- `npm run build`: Compiles TypeScript and builds production bundle
- `npm run preview`: Preview production build

---

### Backend Files

#### `src/lib/index.ts`
**Entry point** for the backend server.

**Responsibilities**:
- Starts Fastify HTTP server
- Initializes Socket.IO after server is ready
- Error handling for startup failures

**Flow**: `main()` → `startServer()` → `startSocket()`

**Location**: Backend server orchestration

---

#### `src/lib/server.ts`
**Fastify HTTP server** configuration.

**Exports**:
- `fastifyServer`: The underlying Node.js HTTP server instance
- `PORT`: Configured server port (from env or default 3000)
- `startServer()`: Async function that starts the Fastify server

**Endpoints**:
- `GET /`: Basic health check endpoint returning `{ hello: 'world' }`

**Location**: HTTP server layer

---

#### `src/lib/socket.ts`
**Core Socket.IO server** implementation. This is where all the chat logic lives.

**Key Data Structures**:
```typescript
const chats: chat[] = [];      // All active chats
const clients: client[] = [];  // Socket-to-client ID mapping

interface chat {
  chat_id: string;           // UUID
  chat_name?: string;        // Optional name
  recipients: number[];      // Array of CLIENT IDs (not socket IDs!)
}

interface client {
  id: number;      // Permanent client/user ID
  socket: string;  // Current socket ID (updated on reconnect)
}
```

**Key Functions**:
- `saveClientId(client_id, socket_id)`: Creates or updates client-to-socket mapping
  - If client exists: updates socket ID (handles reconnection)
  - If new client: adds to clients array
- `startSocket()`: Initializes Socket.IO server with CORS config
- `getAllSockets()`: Returns array of all connected socket IDs (dev only)

**Socket Events Handled**:

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Server | User connects to server |
| `disconnect` | Server | User disconnects (logs only, no cleanup yet) |
| `save_client_id` | Client→Server | Register/update client ID to socket mapping |
| `chat:message` | Client→Server | Broadcast message to all users |
| `create_chat` | Client→Server | Create new chat with client IDs as recipients |
| `add_recipient` | Client→Server | Add client to existing chat |
| `delete_recipient` | Client→Server | Remove client from chat |
| `get_client_chat_ids` | Client→Server | Get all chat IDs for requesting client |
| `get_chat_object` | Client→Server | Get full chat object by ID or name |
| `private_message` | Client→Server | Send message to specific client IDs |
| `get_sockets` | Client→Server | Get all connected socket IDs (dev only) |
| `get_all_clients` | Client→Server | Get all registered client IDs (dev only) |

**Important Implementation Details**:

1. **Chat Creation** (lines 52-76):
   - Adds creator's client ID to recipients
   - Generates UUID for chat_id
   - Stores recipients as **client IDs** (numbers)
   - Notifies all recipients by looking up their socket IDs

2. **Message Routing** (lines 140-148):
   - Accepts array of client IDs as recipients
   - Filters `clients[]` to find matching client entries
   - Emits to each client's current socket ID

3. **Get Client Chats** (lines 114-125):
   - **BUG**: Currently returns ALL chats with ANY connected client
   - **Should**: Look up requesting socket's client ID, filter chats containing that ID

**Location**: All real-time communication and chat management logic

---

### Frontend Files

#### `src/main.ts`
**Frontend entry point**. Initializes the client application.

**Flow**: `DOMContentLoaded` → `new App()` → `appendComponent()` for each component

**Location**: Frontend initialization

---

#### `src/App.ts`
**Application root manager**. Simple component system.

**Class**: `App`
- `root`: Reference to `#app` div
- `appendComponent(component)`: Mounts a component to the root

**Location**: Component mounting logic

---

#### `src/lib/client-socket.ts`
**Client-side Socket.IO wrapper**. All socket operations go through here.

**Key Exports**:
- `socket`: Socket.IO client instance
- `client_chat_ids`: Array of chat IDs the user belongs to
- `client_id_local`: The user's permanent client ID

**Reconnection Handling** (lines 10-17):
```typescript
socket.on("connect", async () => {
  const storedId = localStorage.getItem("client_id_websocket");
  if (storedId) {
    // BUG: Should call saveClientId(storedId) first!
    await getClientChats();
  }
  console.log("connected to socket server:", socket.id);
});
```

**Key Functions**:

| Function | Description | Returns |
|----------|-------------|---------|
| `saveClientId(client_id)` | Register client ID with server, store in localStorage | Promise\<number\> |
| `sendMessage(msg)` | Broadcast message to all | void |
| `sendPrivateMessage(chat_id, msg)` | Send to all recipients in a chat | void |
| `getAllSockets()` | Request all connected sockets (dev) | void |
| `getAllClients()` | Request all registered client IDs (dev) | void |
| `getClientChats()` | Get user's chat IDs | Promise\<string[]\> |
| `getChatObject(id, name?)` | Get chat details | Promise\<chat\> |
| `getChatname(id)` | Get chat name by ID | Promise\<string\> |
| `startChat(recipients, name?)` | Create new chat with client IDs | Promise\<string\> |
| `addRecipient(chatId, recipient)` | Add client to chat | Promise\<number[]\> |
| `deleteRecipient(chatId, clientId)` | Remove client from chat | Promise\<number\> |

**Location**: All client-side socket operations and promises

---

#### `src/components/SocketComponent.ts`
**Main UI component** for the chat interface.

**UI Elements**:
- Connection status display
- Message input field
- Client selector dropdown
- Active chats dropdown
- Buttons: send, start chat, add/delete recipient, refresh
- Messages container

**Event Handlers**:
- `connect`: Updates status, fetches clients and chats
- `disconnect`: Updates status
- `get_sockets`: Populates recipient dropdown
- `get_all_clients`: Populates client selector
- `get_client_chat_ids`: Populates chat dropdown
- `create_chat`: Updates chat list
- `chat:message`: Displays broadcast messages
- `private_message`: Displays private messages

**Location**: All UI interaction logic

---

### Type Definitions

#### `src/types/SocketTypes.ts`
TypeScript interfaces for type safety.

**Interfaces**:
```typescript
interface client {
  id: number;      // Permanent client ID
  socket: string;  // Current socket ID
}

interface chat {
  chat_id: string;
  chat_name?: string;
  recipients: number[];  // Array of client IDs!
}

interface startChatProps {
  recipients: number[];
  chat_name?: string;
}
```

**Location**: Shared type definitions

---

## File Connection Diagram

```
Frontend:
main.ts
  └─→ App.ts
       ├─→ Testdiv.ts
       └─→ SocketComponent.ts
            └─→ client-socket.ts
                 └─→ SocketTypes.ts

Backend:
index.ts
  ├─→ server.ts
  │    └─→ Exports fastifyServer
  └─→ socket.ts
       ├─→ Uses fastifyServer
       ├─→ Uses SocketTypes.ts
       └─→ Manages chats[] and clients[]
```

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Socket.IO**: Real-time bidirectional event-based communication
- **Fastify**: Fast and low overhead web framework
- **Vite**: Next generation frontend tooling
- **Vanilla JS DOM**: No frontend framework dependencies

## Features in Detail

### Client Identity Management

**Registration Flow**:
1. Client connects and gets a socket ID
2. Client calls `saveClientId(myClientId)` with permanent ID from auth/database
3. Server stores or updates mapping: `{id: myClientId, socket: socketId}`
4. Client ID is stored in localStorage for reconnection

**Reconnection Flow**:
1. Page refreshes → new socket connection
2. Client retrieves stored client ID from localStorage
3. Client calls `saveClientId(storedId)` to update socket mapping
4. Client calls `getClientChats()` to reload chat list
5. User is back in all chats automatically

### Chat Creation

Users create chats by selecting client IDs (not socket IDs). The chat stores these permanent IDs in the recipients array. Each chat gets a unique UUID.

### Dynamic Participant Management

Chats support adding and removing participants dynamically. All operations use client IDs. When participants are modified, the server looks up their current socket IDs and notifies them.

### Message Routing

Messages are sent to client IDs. The server:
1. Receives message with recipient client IDs
2. Filters `clients[]` array to find matching clients
3. Looks up their current socket IDs
4. Emits messages to those socket IDs

This allows messages to reach users even if their socket ID changed since the chat was created.

## Current Limitations

1. **No Persistence**: All chats and client mappings lost on server restart
2. **No Authentication**: Any client can claim any client ID
3. **No Cleanup**: Disconnected clients remain in clients[] array
4. **In-Memory Only**: No database integration yet
5. **Bug in get_client_chat_ids**: Returns chats for all clients, not just the requester

## Known Issues & TODOs

- [ ] Fix `get_client_chat_ids` to filter by requesting client
- [x] Fix reconnection logic to call `saveClientId()` before `getClientChats()`
- [ ] Implement disconnect cleanup (remove from clients[] array)
- [ ] Add authentication/authorization
- [ ] Add database persistence
- [ ] Add message history storage
- [ ] Implement proper error handling
