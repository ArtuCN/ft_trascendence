import { createElement, createButton } from '../utils/dom.js';
import { authState } from '../state/auth.js';

const COLORS = {
  primary: '#E67923',
  dark: '#2A2A2A',
  white: '#ffffff'
};

interface Friend {
  id: number;
  username: string;
  status: 'online' | 'offline';
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

export class SocialModal {
  private isVisible: boolean = false;
  private modalElement?: HTMLElement;
  private selectedFriend: Friend | null = null;
  private newMessage: string = '';
  
  private friends: Friend[] = [
    { id: 1, username: 'alice', status: 'online' },
    { id: 2, username: 'bob', status: 'offline' },
    { id: 3, username: 'charlie', status: 'online' },
  ];

  private messages: { [key: number]: Message[] } = {
    1: [
      { id: 1, sender: 'alice', content: 'Ciao! Come va?', timestamp: new Date(Date.now() - 300000) },
      { id: 2, sender: 'Tu', content: 'Tutto bene, grazie! Tu?', timestamp: new Date(Date.now() - 240000) },
      { id: 3, sender: 'alice', content: 'Perfetto! Hai voglia di fare una partita?', timestamp: new Date(Date.now() - 180000) },
    ],
    2: [
      { id: 4, sender: 'bob', content: 'Hey, sei disponibile per giocare?', timestamp: new Date(Date.now() - 600000) },
    ],
    3: [
      { id: 5, sender: 'charlie', content: 'Ottima partita!', timestamp: new Date(Date.now() - 120000) },
      { id: 6, sender: 'Tu', content: 'Grazie, anche tu hai giocato benissimo!', timestamp: new Date(Date.now() - 60000) },
    ],
  };

  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
  }

  hide(): void {
    if (!this.isVisible || !this.modalElement) return;
    
    this.isVisible = false;
    document.body.removeChild(this.modalElement);
    this.modalElement = undefined;
    this.selectedFriend = null;
    this.newMessage = '';
  }

  private createModal(): HTMLElement {
    const { user } = authState.getState();

    const overlay = createElement('div', {
      className: 'fixed inset-0 flex items-center justify-center z-50',
      style: 'background-color: rgba(0, 0, 0, 0.5);'
    });

    const modal = createElement('div', {
      className: 'bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col p-8 relative h-3/4',
      style: `background-color: ${COLORS.dark};`
    });

    // Quel bottoncino X per chiudere tutto quando ne hai abbastanza
    const closeButton = createButton(
      `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`,
      'absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none',
      () => this.hide()
    );
    closeButton.style.color = COLORS.primary;

    const title = createElement('h2', {
      className: 'text-2xl font-bold mb-6 text-center',
      innerHTML: 'Social',
      style: `color: ${COLORS.primary};`
    });

    const mainContent = createElement('div', {
      className: 'flex-1 overflow-hidden',
      style: `color: ${COLORS.white};`
    });

    const table = createElement('table', {
      className: 'w-full h-full border-separate border-spacing-4'
    });

    const tbody = createElement('tbody');
    const tr = createElement('tr', { className: 'h-full' });

    // La colonna degli amici
    const leftTd = createElement('td', {
      className: 'w-1/3 align-top'
    });

    const leftContent = createElement('div', {
      className: 'h-full flex flex-col'
    });

    const friendsTitle = createElement('h3', {
      className: 'text-lg font-bold mb-4',
      innerHTML: 'Amici',
      style: `color: ${COLORS.primary};`
    });

    const friendsListContainer = createElement('div', {
      className: 'flex-1 overflow-y-auto space-y-2 mb-4'
    });

    this.friends.forEach(friend => {
      const friendItem = createElement('div', {
        className: `p-3 rounded cursor-pointer transition-colors ${
          this.selectedFriend?.id === friend.id ? 'bg-opacity-30' : 'bg-opacity-10'
        }`,
        style: this.selectedFriend?.id === friend.id 
          ? `background-color: ${COLORS.primary}30;` 
          : 'background-color: rgba(255, 255, 255, 0.1);'
      });

      friendItem.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-medium">${friend.username}</span>
          <span class="w-3 h-3 rounded-full ${
            friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
          }"></span>
        </div>
      `;

      friendItem.addEventListener('click', () => {
        this.selectedFriend = friend;
        this.refreshModal();
      });

      friendsListContainer.appendChild(friendItem);
    });

    const addFriendButton = createButton(
      '+ Aggiungi Amico',
      'text-white px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none w-full',
      () => alert('Aggiungi Amico')
    );
    addFriendButton.style.backgroundColor = COLORS.primary;

    const friendIdInput = createElement('input', {
      className: 'bg-gray-800 text-white px-4 py-2 rounded text-sm w-full mt-2',
      placeholder: 'id amico'
    }) as HTMLInputElement;

    leftContent.appendChild(friendsTitle);
    leftContent.appendChild(friendsListContainer);
    leftContent.appendChild(addFriendButton);
    leftContent.appendChild(friendIdInput);
    leftTd.appendChild(leftContent);

    const rightTd = createElement('td', {
      className: 'w-2/3 align-top'
    });

    // Qui mettiamo tutta la chat vera e propria
    const rightContent = this.createChatContent(user);
    rightTd.appendChild(rightContent);

    tr.appendChild(leftTd);
    tr.appendChild(rightTd);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    mainContent.appendChild(table);

    modal.appendChild(closeButton);
    modal.appendChild(title);
    modal.appendChild(mainContent);
    overlay.appendChild(modal);

    // Non vogliamo che cliccando sulla modal si chiuda tutto per sbaglio
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });

    return overlay;
  }

  private createChatContent(user: any): HTMLElement {
    const chatContainer = createElement('div', {
      className: 'h-full flex flex-col'
    });

    if (this.selectedFriend) {
      const chatHeader = createElement('div', {
        className: 'flex items-center mb-4'
      });

      const chatTitle = createElement('h3', {
        className: 'text-lg font-bold',
        innerHTML: `Chat con ${this.selectedFriend.username}`,
        style: `color: ${COLORS.primary};`
      });

      const statusDot = createElement('span', {
        className: `ml-3 w-3 h-3 rounded-full ${
          this.selectedFriend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
        }`
      });

      chatHeader.appendChild(chatTitle);
      chatHeader.appendChild(statusDot);

      // Il contenitore dove scorri tutti i messaggi
      const messagesContainer = createElement('div', {
        className: 'flex-1 overflow-y-auto bg-gray-800 rounded p-4 mb-4 space-y-3'
      });

      const friendMessages = this.messages[this.selectedFriend.id] || [];
      const currentUsername = user?.username || 'Tu';

      friendMessages.forEach(message => {
        const messageDiv = createElement('div', {
          className: `flex ${
            message.sender === currentUsername ? 'justify-end' : 'justify-start'
          }`
        });

        const messageBubble = createElement('div', {
          className: `max-w-xs px-3 py-2 rounded text-sm ${
            message.sender === currentUsername
              ? 'text-white'
              : 'bg-gray-600 text-white'
          }`
        });

        if (message.sender === currentUsername) {
          messageBubble.style.backgroundColor = COLORS.primary;
        }

        messageBubble.innerHTML = `
          <div class="font-medium text-xs mb-1 opacity-70">${message.sender}</div>
          <div>${message.content}</div>
        `;

        messageDiv.appendChild(messageBubble);
        messagesContainer.appendChild(messageDiv);
      });


      const inputContainer = createElement('div', {
        className: 'flex gap-2'
      });

      const messageInput = createElement('input', {
        className: 'flex-1 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500',
        placeholder: 'Scrivi un messaggio...'
      }) as HTMLInputElement;

      messageInput.value = this.newMessage;
      messageInput.addEventListener('input', (e) => {
        this.newMessage = (e.target as HTMLInputElement).value;
      });

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage(currentUsername);
        }
      });

      const sendButton = createButton(
        'Invia',
        'text-white px-4 py-2 rounded hover:opacity-90 transition-opacity focus:outline-none',
        () => this.sendMessage(currentUsername)
      );
      sendButton.style.backgroundColor = COLORS.primary;

      inputContainer.appendChild(messageInput);
      inputContainer.appendChild(sendButton);

      chatContainer.appendChild(chatHeader);
      chatContainer.appendChild(messagesContainer);
      chatContainer.appendChild(inputContainer);
    } else {
      // Se non hai selezionato nessun amico, mostra questo
      const placeholder = createElement('div', {
        className: 'h-full flex items-center justify-center'
      });

      const placeholderText = createElement('p', {
        className: 'text-gray-400 text-center',
        innerHTML: 'Seleziona un amico per iniziare a chattare'
      });

      placeholder.appendChild(placeholderText);
      chatContainer.appendChild(placeholder);
    }

    return chatContainer;
  }

  private sendMessage(currentUsername: string): void {
    if (!this.selectedFriend || !this.newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: currentUsername,
      content: this.newMessage,
      timestamp: new Date(),
    };

    if (!this.messages[this.selectedFriend.id]) {
      this.messages[this.selectedFriend.id] = [];
    }

    this.messages[this.selectedFriend.id].push(message);
    this.newMessage = '';
    this.refreshModal();
  }

  private refreshModal(): void {
    if (!this.modalElement) return;
    document.body.removeChild(this.modalElement);
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
  }

  destroy(): void {
    this.hide();
  }
}
