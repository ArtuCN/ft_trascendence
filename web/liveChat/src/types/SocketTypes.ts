export interface chat extends startChatProps  {
	chat_id: string;
}

export interface startChatProps {
	recipients: string[];
	recipient_ids?: string[];
	chat_name?: string;
}
