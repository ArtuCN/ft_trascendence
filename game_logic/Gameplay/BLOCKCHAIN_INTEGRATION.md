# Guida all'Integrazione Blockchain (Gameplay <-> Frontend)

Questa documentazione descrive come il modulo di gioco (Pong 2D/3D in iframe) comunica con l'applicazione principale per gestire l'integrazione con la blockchain (Avalanche Fuji).

## Architettura

Il sistema utilizza il metodo `window.postMessage` per la comunicazione sicura tra l'iframe del gioco (`game_logic`) e la finestra genitore dell'applicazione (`web/frontend`).

### File Principali

- **`game_logic/Gameplay/blockchainIntegration.ts`**: Modulo lato gioco che gestisce lo stato del wallet e l'invio delle richieste.
- **`web/frontend/ts_frontend/src/pages/PlayPage.ts`**: Modulo lato frontend che riceve i messaggi e interagisce con i servizi blockchain (`Contract.ts`, `Wallet.ts`).
- **`game_logic/Gameplay/utilities.ts`**: Gestisce l'interfaccia utente (pulsante "Save on Chain").

---

## Flusso di Funzionamento

### 1. Sincronizzazione Wallet
All'avvio del gioco, l'iframe richiede lo stato del wallet:
1. `initWalletListener()` invia `request_wallet_state`.
2. Il parent risponde con `wallet_state_update` contenente indirizzo e stato di connessione.
3. Se connesso, il gioco abilita le funzionalità blockchain.

### 2. Creazione Torneo
Quando l'utente inizia un torneo:
1. Il gioco chiama `/api/tournament` per creare l'entry nel database backend (PostgreSQL/SQLite).
2. Riceve un `id` univoco dal database.
3. Questo `id` viene usato per tracciare tutte le partite successive.

### 3. Salvataggio Partite
Durante il torneo, ogni partita viene salvata nel backend tramite `/api/match`. Questo è **fondamentale** perché lo smart contract richiede di verificare i dati sul backend prima di salvare su chain.

### 4. Salvataggio su Blockchain (Finale)
Al termine del torneo (schermata di vittoria):
1. Appare il pulsante **"Save on Chain"**.
2. Al click, viene chiamato `saveTournamentToBlockchain(tournamentId)`.
3. Il gioco invia un messaggio `save_tournament_to_blockchain` al parent.
4. Il frontend riceve il messaggio:
   - Recupera i dati completi del torneo dal backend (`blockchainTournamentApi`).
   - Chiama lo smart contract (`Contract.ts`) per salvare i dati su Avalanche Fuji.
   - Attende la conferma della transazione.
5. Invia al gioco un messaggio `tournament_saved` (successo) o `tournament_save_error` (errore).

---

## Messaggi `postMessage`

### Iframe -> Parent

| Tipo | Descrizione | Dati |
|------|-------------|------|
| `request_wallet_state` | Richiede lo stato attuale del wallet. | `{}` |
| `save_tournament_to_blockchain` | Richiede di salvare il torneo su chain. | `{ tournamentId, messageId }` |
| `navigate_to_home` | Richiede il reindirizzamento alla home. | `{}` |

### Parent -> Iframe

| Tipo | Descrizione | Dati |
|------|-------------|------|
| `wallet_state_update` | Aggiorna lo stato del wallet nel gioco. | `{ isConnected, address }` |
| `tournament_saved` | Conferma avvenuto salvataggio su chain. | `{ messageId, tournamentId }` |
| `tournament_save_error` | Segnala errore nel salvataggio. | `{ messageId, error }` |

---

## Smart Contract

Il salvataggio avviene chiamando la funzione `saveTournamentData` sullo smart contract `Score`.
Vengono salvati:
- Numero giocatori
- ID utenti
- Punteggi
- ID vincitori
- Nomi vincitori
