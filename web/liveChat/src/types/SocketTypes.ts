export interface chat extends startChatProps  {
	chat_id: string;
};

export interface startChatProps {
	recipients: number[];
	chat_name?: string;
};

export interface client {
	id: number;
	socket: string;
};
