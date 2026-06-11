import type { Topic, ModelTag } from '@/types';

export const mockModelTags: ModelTag[] = [
  { id: 'm1', name: 'Midjourney', category: 'AI绘画' },
  { id: 'm2', name: 'Stable Diffusion', category: 'AI绘画' },
  { id: 'm3', name: 'DALL·E 3', category: 'AI绘画' },
  { id: 'm4', name: 'GPT-4', category: '大语言模型' },
  { id: 'm5', name: 'GPT-4o', category: '大语言模型' },
  { id: 'm6', name: 'Claude 3', category: '大语言模型' },
  { id: 'm7', name: '文心一言', category: '大语言模型' },
  { id: 'm8', name: '通义千问', category: '大语言模型' },
  { id: 'm9', name: 'Sora', category: 'AI视频' },
  { id: 'm10', name: 'Runway', category: 'AI视频' },
  { id: 'm11', name: 'Suno', category: 'AI音乐' },
  { id: 'm12', name: 'Udio', category: 'AI音乐' }
];

export const mockTopics: Topic[] = [
  {
    id: 't1',
    name: '提示词分享',
    description: '分享高质量Prompt，交流提示词工程技巧',
    cover: 'https://picsum.photos/id/1/750/400',
    postsCount: 12580,
    membersCount: 8920,
    isJoined: true,
    category: '热门'
  },
  {
    id: 't2',
    name: 'AI绘画作品',
    description: '展示你的AI绘画作品，交流创作经验',
    cover: 'https://picsum.photos/id/2/750/400',
    postsCount: 28450,
    membersCount: 15680,
    isJoined: true,
    category: '热门'
  },
  {
    id: 't3',
    name: 'AI编程',
    description: '使用AI辅助编程的经验分享与问题讨论',
    cover: 'https://picsum.photos/id/3/750/400',
    postsCount: 8920,
    membersCount: 6540,
    isJoined: false,
    category: '技术'
  },
  {
    id: 't4',
    name: 'AI视频创作',
    description: 'Sora、Runway等AI视频工具交流',
    cover: 'https://picsum.photos/id/8/750/400',
    postsCount: 4560,
    membersCount: 3280,
    isJoined: false,
    category: '创作'
  },
  {
    id: 't5',
    name: 'Midjourney专区',
    description: 'Midjourney用户专属交流区',
    cover: 'https://picsum.photos/id/6/750/400',
    postsCount: 15680,
    membersCount: 10250,
    isJoined: true,
    category: '工具'
  },
  {
    id: 't6',
    name: 'AI音乐创作',
    description: 'Suno、Udio等AI音乐创作交流',
    cover: 'https://picsum.photos/id/9/750/400',
    postsCount: 2340,
    membersCount: 1890,
    isJoined: false,
    category: '创作'
  },
  {
    id: 't7',
    name: 'Stable Diffusion',
    description: 'SD模型、LoRA训练、ControlNet等技术交流',
    cover: 'https://picsum.photos/id/119/750/400',
    postsCount: 9870,
    membersCount: 7650,
    isJoined: false,
    category: '工具'
  },
  {
    id: 't8',
    name: 'AI写作文案',
    description: 'GPT、Claude等AI写作工具经验分享',
    cover: 'https://picsum.photos/id/160/750/400',
    postsCount: 6780,
    membersCount: 5420,
    isJoined: false,
    category: '创作'
  }
];

export const topicCategories = ['推荐', '热门', '技术', '创作', '工具', '问答'];
