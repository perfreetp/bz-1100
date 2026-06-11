import type { Message, ChatSession, ChatMessage } from '@/types';
import { mockUsers, mockCurrentUser } from './users';

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    type: 'mention',
    from: mockUsers[0],
    title: 'AI艺术大师 @了你',
    content: '@AI创作者小明 看看这个提示词效果怎么样？',
    isRead: false,
    createdAt: '2024-06-10T14:30:00Z'
  },
  {
    id: 'msg2',
    type: 'mention',
    from: mockUsers[2],
    title: '创意设计师Lily @了你',
    content: '@AI创作者小明 你的作品太赞了，能分享一下创作过程吗？',
    isRead: false,
    createdAt: '2024-06-10T10:15:00Z'
  },
  {
    id: 'msg3',
    type: 'system',
    title: '系统通知',
    content: '恭喜你！你的作品《赛博朋克城市夜景》获得了本周热门作品第三名',
    isRead: true,
    createdAt: '2024-06-09T18:00:00Z'
  },
  {
    id: 'msg4',
    type: 'system',
    title: '系统通知',
    content: '你关注的用户「数字艺术家老王」发布了新作品',
    isRead: true,
    createdAt: '2024-06-08T20:00:00Z'
  },
  {
    id: 'msg5',
    type: 'mention',
    from: mockUsers[1],
    title: '提示词工程师 回复了你的评论',
    content: '说得很有道理！我补充一点...',
    isRead: true,
    createdAt: '2024-06-07T09:30:00Z'
  }
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'c1',
    user: mockUsers[0],
    lastMessage: '好的，我把提示词整理好发给你',
    unreadCount: 2,
    updatedAt: '2024-06-10T15:00:00Z'
  },
  {
    id: 'c2',
    user: mockUsers[4],
    lastMessage: '这个LoRA训练得真不错！',
    unreadCount: 0,
    updatedAt: '2024-06-09T22:30:00Z'
  },
  {
    id: 'c3',
    user: mockUsers[2],
    lastMessage: '合作愉快！期待下次一起创作',
    unreadCount: 0,
    updatedAt: '2024-06-08T11:20:00Z'
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'cm1',
    senderId: mockUsers[0].id,
    content: '你好！看了你分享的赛博朋克提示词，非常棒！',
    type: 'text',
    createdAt: '2024-06-10T14:30:00Z'
  },
  {
    id: 'cm2',
    senderId: mockCurrentUser.id,
    content: '谢谢！其实我还在调试中，想让光影效果更自然一些',
    type: 'text',
    createdAt: '2024-06-10T14:35:00Z'
  },
  {
    id: 'cm3',
    senderId: mockUsers[0].id,
    content: '可以试试加 cinematic lighting, volumetric light, god rays 这些关键词',
    type: 'text',
    createdAt: '2024-06-10T14:40:00Z'
  },
  {
    id: 'cm4',
    senderId: mockUsers[0].id,
    content: '好的，我把提示词整理好发给你',
    type: 'text',
    createdAt: '2024-06-10T15:00:00Z'
  }
];
