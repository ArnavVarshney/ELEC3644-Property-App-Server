export interface User {
    id: string;
    name: string | null;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    timestamp: string;
}


