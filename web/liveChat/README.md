# Live Chat Application

A real-time chat application built with TypeScript, Socket.IO, Fastify, and Vite. This application enables users to send broadcast messages, create private/group chats, and manage chat participants in real-time.

## What This App Does

This is a full-stack real-time messaging application that provides:

- **Real-time Communication**: Instant message delivery using WebSocket technology
- **Broadcast Messaging**: Send messages to all connected users
- **Private/Group Chats**: Create chat rooms with specific recipients
- **Chat Management**: Add or remove participants from existing chats
- **Multi-user Support**: Track and connect with multiple online users
- **Dynamic UI**: Interactive interface for chat creation and messaging

## How It Works

The application uses a client-server architecture:

1. **Backend Server**: Fastify HTTP server running on a configurable port
2. **WebSocket Layer**: Socket.IO server attached to the Fastify instance for real-time bidirectional communication
3. **Frontend Client**: Vanilla TypeScript client that connects to the Socket.IO server
4. **Event-Driven**: All interactions are handled through Socket.IO event emitters and listeners

### Architecture Flow

```
Client (Browser) <--WebSocket--> Socket.IO Server <--> Fastify Server
     |                                  |
     |                                  |
  DOM Updates                    Chat Management
  User Actions                   Event Broadcasting
```

## Project Structure

### Configuration Files

#### `package.json`
Project configuration and dependencies. Defines scripts for development, build, and preview modes. Uses CommonJS module system.

**Key Dependencies**:
- `fastify`: Fast HTTP server framework
- `socket.io`: Server-side WebSocket library
- `socket.io-client`: Client-side WebSocket library
- `vite`: Frontend build tool and dev server
- `typescript`: Type-safe JavaScript

**Scripts**:
- `npm run dev`: Runs both frontend and backend concurrently
- `npm run front`: Runs only the Vite dev server
- `npm run back`: Runs only the backend server with hot reload
- `npm run build`: Compiles TypeScript and builds production bundle

---

### Backend Files

#### `src/lib/index.ts`
**Entry point** for the backend server. Orchestrates the startup sequence by initializing both the Fastify HTTP server and the Socket.IO WebSocket server.

**Responsibilities**:
- Starts Fastify server
- Initializes Socket.IO after server is ready
- Error handling for startup failures

**Flow**: `main()` → `startServer()` → `startSocket()`

---

#### `src/lib/server.ts`
**Fastify HTTP server** configuration and initialization. Sets up the HTTP layer that Socket.IO will attach to.

**Exports**:
- `fastifyServer`: The underlying Node.js HTTP server instance
- `PORT`: Configured server port (from env or default 3000)
- `startServer()`: Async function that starts the Fastify server

**Endpoints**:
- `GET /`: Basic health check endpoint returning `{ hello: 'world' }`

**Connection**: Provides `fastifyServer` to `socket.ts` for Socket.IO attachment

---

#### `src/lib/socket.ts`
**Core Socket.IO server** implementation. Handles all real-time communication logic and chat management.

**Key Data Structures**:
- `chats[]`: In-memory array storing all active chat rooms
- `io`: Socket.IO server instance

**Socket Events Handled**:

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Server | User connects to server |
| `disconnect` | Server | User disconnects from server |
| `chat:message` | Client→Server | Broadcast message to all users |
| `create_chat` | Client→Server | Create new chat with recipients |
| `add_recipient` | Client→Server | Add user to existing chat |
| `delete_recipient` | Client→Server | Remove user from chat |
| `get_client_chat_ids` | Client→Server | Get all chats for current user |
| `get_chat_object` | Client→Server | Get full chat object by ID or name |
| `private_message` | Client→Server | Send message to specific recipients |
| `get_sockets` | Client→Server | Get all connected socket IDs (dev only) |

**Functions**:
- `startSocket()`: Initializes Socket.IO server with CORS config
- `getAllSockets()`: Returns array of all connected socket IDs

**Connection**: Uses `fastifyServer` from `server.ts`, exports `io` for other modules

---

### Frontend Files

#### `src/main.ts`
**Frontend entry point**. Initializes the client-side application when the DOM is ready.

**Responsibilities**:
- Waits for DOM to load
- Creates App instance
- Registers UI components (TestDiv and SocketComponent)

**Flow**: `DOMContentLoaded` → `new App()` → `appendComponent()` for each component

---

#### `src/App.ts`
**Application root manager**. Provides a simple component system for mounting UI elements.

**Class**: `App`
- `root`: Reference to `#app` div (creates if doesn't exist)
- `appendComponent(component)`: Mounts a component function to the root

**Type**: `Component` - Function that returns an HTMLElement

**Connection**: Used by `main.ts` to mount components

---

#### `src/lib/client-socket.ts`
**Client-side Socket.IO wrapper**. Provides typed functions for all socket operations and manages the WebSocket connection.

**Key Exports**:
- `socket`: Socket.IO client instance connected to server
- `client_chat_ids`: Array of chat IDs the user belongs to

**Functions**:

| Function | Description | Returns |
|----------|-------------|---------|
| `sendMessage(msg)` | Broadcast message to all | void |
| `sendPrivateMessage(recipients, msg)` | Send to specific users | void |
| `getAllSockets()` | Request all connected sockets | void |
| `getClientChats()` | Get user's chat IDs | Promise\<string[]\> |
| `getChatObject(id, name?)` | Get chat details | Promise\<chat\> |
| `getChatname(id)` | Get chat name by ID | Promise\<string\> |
| `getChatIdFromName(name)` | Get chat ID by name | Promise\<string\> |
| `startChat(recipients, ids?, name?)` | Create new chat | Promise\<string\> |
| `addRecipient(chatId, recipient)` | Add user to chat | Promise\<string[]\> |
| `deleteRecipient(chatId, clientId)` | Remove user from chat | Promise\<string\> |

**Connection**: Used by `SocketComponent.ts` for all socket operations

---

#### `src/components/SocketComponent.ts`
**Main UI component** for the chat interface. Creates and manages all interactive elements.

**UI Elements**:
- Status display showing connection state
- Input field for message typing
- Select dropdown for choosing recipients (all connected sockets)
- Select dropdown for choosing active chats
- Buttons for: refresh, private send, start chat, add/delete recipient
- Messages container for displaying chat history

**Event Handlers**:
- `connect`: Updates status, fetches sockets and chats
- `disconnect`: Updates status
- `get_sockets`: Populates recipient dropdown
- `get_client_chat_ids`: Populates chat dropdown
- `chat:message`: Displays broadcast messages
- `private_message`: Displays private messages with sender info
- Button clicks for chat management actions

**Connection**: Uses functions from `client-socket.ts`, returns HTMLElement mounted by `App`

---

#### `src/components/Testdiv.ts`
**Simple test component**. Returns a div with "hello" text. Used for development/testing purposes.

**Connection**: Mounted by `main.ts` via `App`

---

### Type Definitions

#### `src/types/SocketTypes.ts`
**TypeScript interfaces** for type safety across the application.

**Interfaces**:
- `startChatProps`: Parameters for creating a chat
  - `recipients`: Array of socket IDs
  - `recipient_ids?`: Optional array of user IDs
  - `chat_name?`: Optional chat name
- `chat`: Full chat object (extends startChatProps)
  - `chat_id`: Unique identifier for the chat

**Connection**: Used by `socket.ts` and `client-socket.ts` for type safety

---

## File Connection Diagram

```
main.ts
  └─→ App.ts
       ├─→ Testdiv.ts
       └─→ SocketComponent.ts
            └─→ client-socket.ts
                 └─→ SocketTypes.ts

index.ts (Backend)
  ├─→ server.ts
  │    └─→ Exports fastifyServer
  └─→ socket.ts
       ├─→ Uses fastifyServer
       └─→ Uses SocketTypes.ts
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs both frontend (port 5173) and backend (configurable port, default 3000) concurrently.

### Frontend Only
```bash
npm run front
```

### Backend Only
```bash
npm run back
```

### Production Build
```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_PORT=3000
VITE_API_URL=http://localhost:3000
```

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **Socket.IO**: Real-time bidirectional event-based communication
- **Fastify**: Fast and low overhead web framework
- **Vite**: Next generation frontend tooling
- **Vanilla JS DOM**: No frontend framework dependencies

## Features in Detail

### Chat Creation
Users can create new chat rooms by selecting recipients from connected users. Each chat gets a unique UUID and maintains a list of participant socket IDs.

### Dynamic Participant Management
Chats support adding and removing participants dynamically. When participants are added/removed, all chat members are notified.

### Message Types
- **Broadcast**: Sent to all connected users
- **Private/Group**: Sent only to participants of a specific chat

### Development Tools
- Hot reload for both frontend and backend
- Socket ID visibility for debugging
- Real-time connection status display
