import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'AI艺术大师',
    avatar: 'https://picsum.photos/id/91/200/200',
    bio: '专业AI绘画创作者，擅长Midjourney与Stable Diffusion',
    followers: 5680,
    following: 128,
    worksCount: 256,
    badges: [{ id: '1', name: '顶级创作者', icon: '👑' }],
    isFollowed: true
  },
  {
    id: 'u2',
    name: '提示词工程师',
    avatar: 'https://picsum.photos/id/177/200/200',
    bio: '专注提示词研究，分享高质量Prompt模板',
    followers: 3240,
    following: 256,
    worksCount: 189,
    badges: [{ id: '2', name: '提示词专家', icon: '✨' }],
    isFollowed: false
  },
  {
    id: 'u3',
    name: '创意设计师Lily',
    avatar: 'https://picsum.photos/id/338/200/200',
    bio: '平面设计师转型AI创作，探索艺术与科技的融合',
    followers: 2180,
    following: 89,
    worksCount: 145,
    isFollowed: false
  },
  {
    id: 'u4',
    name: '代码诗人',
    avatar: 'https://picsum.photos/id/1027/200/200',
    bio: '全栈开发者，AI编程工具爱好者',
    followers: 1560,
    following: 312,
    worksCount: 78,
    isFollowed: true
  },
  {
    id: 'u5',
    name: '数字艺术家老王',
    avatar: 'https://picsum.photos/id/64/200/200',
    bio: '10年传统美术经验，现在专注AI数字艺术创作',
    followers: 8920,
    following: 45,
    worksCount: 423,
    badges: [
      { id: '1', name: '顶级创作者', icon: '👑' },
      { id: '3', name: '创意达人', icon: '🎨' }
    ],
    isFollowed: false
  }
];

export const mockCurrentUser: User = {
  id: 'me',
  name: 'AI创作者小明',
  avatar: 'https://picsum.photos/id/64/200/200',
  bio: '专注AI绘画与提示词工程 | Midjourney深度用户 | 每天分享创作心得',
  followers: 1280,
  following: 256,
  worksCount: 89,
  badges: [
    { id: '1', name: '创意达人', icon: '🎨' },
    { id: '2', name: '提示词专家', icon: '✨' }
  ]
};

export const currentUser = mockCurrentUser;
export const defaultCurrentUser = mockCurrentUser;
