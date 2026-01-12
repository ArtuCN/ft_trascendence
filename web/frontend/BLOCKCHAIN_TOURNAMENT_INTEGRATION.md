# Blockchain Tournament Integration Guide

## Overview

This guide explains the blockchain tournament integration system and how to use the new backend and frontend APIs to save and retrieve tournament data on the blockchain.

## Architecture

The integration consists of three layers:

1. **Backend API** - RESTful endpoints for tournament data management
2. **Frontend API Service** - TypeScript service for making authenticated requests
3. **Blockchain Contract Interface** - Direct interaction with smart contracts using viem

---

## Backend API Endpoints

### 1. Save Tournament to Blockchain Mapping

**Endpoint:** `POST /api/blockchain/tournament`

**Description:** Links a backend tournament ID with a blockchain tournament ID after saving tournament data on-chain.

**Request Body:**
```json
{
  "backend_id": 123,
  "blockchain_id": 456
}
```

**Response:**
```json
{
  "insertedId": 1
}
```

**Location:** `web/backend/srcs/controllers/blockchain_tournament.js:5`

---

### 2. Get Tournament by Backend ID

**Endpoint:** `GET /api/blockchain/tournament/by-backend?backend_id={id}`

**Description:** Retrieves the blockchain tournament mapping using the backend tournament ID.

**Query Parameters:**
- `backend_id` (required): The backend tournament ID

**Response:**
```json
{
  "id": 1,
  "id_backend": 123,
  "id_blockchain": 456
}
```

**Location:** `web/backend/srcs/controllers/blockchain_tournament.js:20`

---

### 3. Get Tournament by Blockchain ID

**Endpoint:** `GET /api/blockchain/tournament/by-blockchain?blockchain_id={id}`

**Description:** Retrieves the backend tournament mapping using the blockchain tournament ID.

**Query Parameters:**
- `blockchain_id` (required): The blockchain tournament ID

**Response:**
```json
{
  "id": 1,
  "id_backend": 123,
  "id_blockchain": 456
}
```

**Location:** `web/backend/srcs/controllers/blockchain_tournament.js:34`

---

### 4. Get Tournament Data for Blockchain

**Endpoint:** `GET /api/gettournamentforblockchain?id={user_id}&tournament_id={tournament_id}`

**Description:** Retrieves formatted tournament data ready to be saved on the blockchain. This endpoint aggregates all tournament matches, calculates scores, and formats data according to blockchain contract requirements.

**Query Parameters:**
- `id` (required): User ID (must be a participant in the tournament)
- `tournament_id` (required): Backend tournament ID

**Response:**
```json
{
  "user_ids": [1, 2, 3, 4, 0, 0, 0, 0],
  "user_scores": [150, 120, 90, 60, 0, 0, 0, 0],
  "winner_ids": [1, 0, 0, 0, 0, 0, 0, 0],
  "winner_names": "john_doe",
  "tournament_id": 123
}
```

**Notes:**
- Arrays are padded to length 8 with zeros
- Scores are calculated as: `goals_scored - goals_taken` (minimum 0)
- Only tournament participants can access this data
- Returns 403 error if user is not in tournament

**Location:** `web/backend/srcs/controllers/tournament.js:50`

---

## Frontend API Service

**File:** `web/frontend/ts_frontend/src/services/blockchainTournamentApi.ts`

The `BlockchainTournamentApi` class provides type-safe methods for interacting with the backend API.

### Usage

```typescript
import { blockchainTournamentApi } from './services/blockchainTournamentApi';
```

### Methods

#### 1. insertTournament()

```typescript
async insertTournament(
  backend_id: number,
  blockchain_id: number
): Promise<{ insertedId: number }>
```

**Example:**
```typescript
try {
  const result = await blockchainTournamentApi.insertTournament(123, 456);
  console.log('Mapping saved with ID:', result.insertedId);
} catch (error) {
  console.error('Failed to save mapping:', error);
}
```

---

#### 2. getTournamentByBackendId()

```typescript
async getTournamentByBackendId(backend_id: number): Promise<any>
```

**Example:**
```typescript
const mapping = await blockchainTournamentApi.getTournamentByBackendId(123);
console.log('Blockchain ID:', mapping.id_blockchain);
```

---

#### 3. getTournamentByBlockchainId()

```typescript
async getTournamentByBlockchainId(blockchain_id: number): Promise<any>
```

**Example:**
```typescript
const mapping = await blockchainTournamentApi.getTournamentByBlockchainId(456);
console.log('Backend ID:', mapping.id_backend);
```

---

#### 4. getTournamentForBlockchain()

```typescript
async getTournamentForBlockchain(
  id: number,
  tournament_id: number
): Promise<TournamentForBlockchain>
```

**Example:**
```typescript
const tournamentData = await blockchainTournamentApi.getTournamentForBlockchain(
  userId,
  tournamentId
);

// tournamentData is ready to be passed to the blockchain contract
console.log('User IDs:', tournamentData.user_ids);
console.log('Scores:', tournamentData.user_scores);
```

---

## Blockchain Contract Interface

**File:** `web/frontend/ts_frontend/src/blockchain/Contract.ts`

### Tournament-Related Functions

#### saveTournamentData()

**Location:** `Contract.ts:138`

Saves tournament data directly to the blockchain smart contract.

```typescript
async function saveTournamentData(
  _NofPlayers: number,
  _user_ids: number[],
  _user_scores: number[],
  _winner_ids: number[],
  _winner_names: string,
  _tournament_id: number
): Promise<void>
```

**Example:**
```typescript
import { saveTournamentData } from './blockchain/Contract';

// Get tournament data from backend
const tournamentData = await blockchainTournamentApi.getTournamentForBlockchain(
  userId,
  tournamentId
);

// Save to blockchain
await saveTournamentData(
  4, // Number of players (not padded)
  tournamentData.user_ids,
  tournamentData.user_scores,
  tournamentData.winner_ids,
  tournamentData.winner_names,
  tournamentData.tournament_id
);
```

**Prerequisites:**
- User must have MetaMask connected
- User wallet must have sufficient gas fees
- Tournament must be finished in the backend

---

#### getTournamentData()

**Location:** `Contract.ts:38`

Retrieves tournament data from the blockchain.

```typescript
async function getTournamentData(tournamentIndex: number)
```

**Example:**
```typescript
import { getTournamentData } from './blockchain/Contract';

const blockchainData = await getTournamentData(456);
console.log('Blockchain tournament data:', blockchainData);
```

---

## Complete Workflow Examples

### Example 1: Saving a Finished Tournament to Blockchain

```typescript
import { blockchainTournamentApi } from './services/blockchainTournamentApi';
import { saveTournamentData } from './blockchain/Contract';

async function saveFinishedTournament(userId: number, tournamentId: number) {
  try {
    // Step 1: Get formatted tournament data from backend
    const tournamentData = await blockchainTournamentApi.getTournamentForBlockchain(
      userId,
      tournamentId
    );

    // Step 2: Calculate actual number of players (non-zero entries)
    const actualPlayers = tournamentData.user_ids.filter(id => id !== 0).length;

    // Step 3: Save to blockchain
    await saveTournamentData(
      actualPlayers,
      tournamentData.user_ids,
      tournamentData.user_scores,
      tournamentData.winner_ids,
      tournamentData.winner_names,
      tournamentData.tournament_id
    );

    console.log('Tournament saved to blockchain successfully!');

    // Step 4: (Optional) Save the mapping
    // Note: You would need to get the blockchain tournament ID from the transaction
    // This depends on how your smart contract returns the tournament ID

  } catch (error) {
    if (error.message.includes('User not in tournament')) {
      alert('You must be a participant to save this tournament');
    } else if (error.message.includes('Wallet not connected')) {
      alert('Please connect your MetaMask wallet');
    } else {
      console.error('Error saving tournament:', error);
      alert('Failed to save tournament to blockchain');
    }
  }
}
```

---

### Example 2: Checking if Tournament is Already on Blockchain

```typescript
async function isTournamentOnBlockchain(backendTournamentId: number): Promise<boolean> {
  try {
    const mapping = await blockchainTournamentApi.getTournamentByBackendId(
      backendTournamentId
    );
    return mapping !== null && mapping.id_blockchain !== null;
  } catch (error) {
    return false;
  }
}

// Usage in a component
async function showTournamentStatus(tournamentId: number) {
  const isOnChain = await isTournamentOnBlockchain(tournamentId);

  if (isOnChain) {
    console.log('This tournament is already saved on the blockchain');
  } else {
    console.log('This tournament is not yet on the blockchain');
  }
}
```

---

### Example 3: Full Integration in a React Component

```typescript
import React, { useState, useEffect } from 'react';
import { blockchainTournamentApi } from '../services/blockchainTournamentApi';
import { saveTournamentData } from '../blockchain/Contract';

function TournamentBlockchainButton({
  tournamentId,
  userId
}: {
  tournamentId: number;
  userId: number;
}) {
  const [isOnBlockchain, setIsOnBlockchain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blockchainId, setBlockchainId] = useState<number | null>(null);

  useEffect(() => {
    checkBlockchainStatus();
  }, [tournamentId]);

  async function checkBlockchainStatus() {
    try {
      const mapping = await blockchainTournamentApi.getTournamentByBackendId(
        tournamentId
      );
      if (mapping) {
        setIsOnBlockchain(true);
        setBlockchainId(mapping.id_blockchain);
      }
    } catch (error) {
      // Not on blockchain yet
      setIsOnBlockchain(false);
    }
  }

  async function handleSaveToBlockchain() {
    setIsSaving(true);
    try {
      // Get tournament data
      const tournamentData = await blockchainTournamentApi.getTournamentForBlockchain(
        userId,
        tournamentId
      );

      // Count actual players
      const actualPlayers = tournamentData.user_ids.filter(id => id !== 0).length;

      // Save to blockchain
      await saveTournamentData(
        actualPlayers,
        tournamentData.user_ids,
        tournamentData.user_scores,
        tournamentData.winner_ids,
        tournamentData.winner_names,
        tournamentData.tournament_id
      );

      // Recheck status
      await checkBlockchainStatus();

      alert('Tournament saved to blockchain successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isOnBlockchain) {
    return (
      <div>
        <span>✓ On Blockchain</span>
        <span>ID: {blockchainId}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSaveToBlockchain}
      disabled={isSaving}
    >
      {isSaving ? 'Saving to Blockchain...' : 'Save to Blockchain'}
    </button>
  );
}

export default TournamentBlockchainButton;
```

---

## Data Format Requirements

### Array Padding

All arrays must be padded to length 8 with zeros:

```typescript
// Backend handles this automatically, but if you need to pad manually:
function padTo8(arr: number[], fill = 0): number[] {
  const padded = [...arr];
  while (padded.length < 8) {
    padded.push(fill);
  }
  return padded.slice(0, 8);
}
```

### Score Calculation

Scores are calculated as: `goals_scored - goals_taken` (minimum 0)

The backend handles this automatically in `getTournamentDataForBlockchain`.

---

## Error Handling

### Common Errors

1. **"User not in tournament"** (403)
   - User must be a participant to access tournament data
   - Verify user ID is correct and user participated in the tournament

2. **"Missing id or tournament_id"** (400)
   - Ensure both query parameters are provided

3. **"Wallet not connected"**
   - User needs to connect MetaMask before blockchain operations
   - Check wallet connection status before calling contract methods

4. **"Session expired"** (401)
   - Token has expired, user needs to re-authenticate
   - API service automatically removes token on 401

---

## Security Considerations

1. **Authentication Required**: All API endpoints require JWT authentication
2. **User Verification**: Backend verifies user is a tournament participant
3. **Input Sanitization**: All inputs are sanitized on the backend
4. **Wallet Requirement**: Blockchain operations require connected wallet

---

## Testing Checklist

- [ ] User can fetch tournament data if they participated
- [ ] User gets 403 error if not a participant
- [ ] Arrays are properly padded to length 8
- [ ] Scores are calculated correctly (goals_scored - goals_taken)
- [ ] Tournament can be saved to blockchain with MetaMask
- [ ] Mapping is saved after blockchain transaction
- [ ] Tournament data can be retrieved from blockchain
- [ ] Error messages are user-friendly

---

## Database Schema

The backend uses a `blockchain_tournament` table to map backend and blockchain IDs:

```sql
CREATE TABLE blockchain_tournament (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_backend INTEGER NOT NULL,
  id_blockchain INTEGER NOT NULL,
  FOREIGN KEY (id_backend) REFERENCES tournament(id)
);
```

---

## File Locations Reference

### Backend
- `web/backend/srcs/controllers/blockchain_tournament.js` - Blockchain tournament API endpoints
- `web/backend/srcs/controllers/tournament.js` - Tournament API endpoints
- `web/backend/srcs/database_comunication/blockchain_tournament.js` - Database operations for blockchain mapping
- `web/backend/srcs/database_comunication/tournament_db.js` - Tournament database operations

### Frontend
- `web/frontend/ts_frontend/src/services/blockchainTournamentApi.ts` - API service for backend communication
- `web/frontend/ts_frontend/src/blockchain/Contract.ts` - Smart contract interaction layer

---

## Questions or Issues?

If you encounter any issues:
1. Check browser console for detailed error messages
2. Verify MetaMask is connected and on the correct network
3. Ensure tournament is finished before saving to blockchain
4. Check backend logs for API errors
5. Verify environment variables are set correctly (VITE_CONTRACT_ADDRESS, VITE_SCORES_ADDRESS)
