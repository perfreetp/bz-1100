export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  followers?: number;
  following?: number;
  worksCount?: number;
  badges?: Badge[];
  isFollowed?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
}

export interface ModelTag {
  id: string;
  name: string;
  category: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  postsCount: number;
  membersCount: number;
  isJoined?: boolean;
  category?: string;
}

export interface Post {
  id: string;
  type: 'prompt' | 'work' | 'qa';
  author: User;
  title?: string;
  content: string;
  images?: string[];
  modelTags?: ModelTag[];
  topics?: Topic[];
  likes: number;
  comments: number;
  shares: number;
  collects: number;
  isLiked?: boolean;
  isCollected?: boolean;
  createdAt: string;
}

export interface Work {
  id: string;
  author: User;
  title: string;
  description: string;
  cover: string;
  images: string[];
  modelTags: ModelTag[];
  prompt?: string;
  process?: string;
  topics?: Topic[];
  likes: number;
  comments: number;
  shares: number;
  collects: number;
  isLiked?: boolean;
  isCollected?: boolean;
  createdAt: string;
}

export interface Question {
  id: string;
  author: User;
  title: string;
  content: string;
  answers: Answer[];
  bestAnswerId?: string;
  modelTags?: ModelTag[];
  topics?: Topic[];
  likes: number;
  views: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Answer {
  id: string;
  author: User;
  content: string;
  likes: number;
  isLiked?: boolean;
  isBest?: boolean;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  replyTo?: string;
}

export interface Message {
  id: string;
  type: 'mention' | 'system' | 'chat';
  from?: User;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  chatId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

export interface ChatSession {
  id: string;
  user: User;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface Draft {
  id: string;
  type: 'prompt' | 'work' | 'qa';
  title?: string;
  content?: string;
  images?: string[];
  modelTags?: ModelTag[];
  topics?: Topic[];
  savedAt: string;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  postId: string;
  post: Post | Work;
  viewedAt: string;
}
