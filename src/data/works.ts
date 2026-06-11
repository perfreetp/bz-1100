import type { Work } from '@/types';
import { mockUsers } from './users';
import { mockTopics, mockModelTags } from './topics';

export const mockWorks: Work[] = [
  {
    id: 'w1',
    author: mockUsers[4],
    title: '东方美学系列 — 山水意境',
    description: '将中国传统山水画的意境与现代AI技术结合，探索东方美学在数字时代的全新表达。每一幅作品都经历了数十次迭代调优...',
    cover: 'https://picsum.photos/id/1015/300/300',
    images: [
      'https://picsum.photos/id/1015/750/1000',
      'https://picsum.photos/id/1018/750/1000',
      'https://picsum.photos/id/1036/750/1000',
      'https://picsum.photos/id/1039/750/1000'
    ],
    modelTags: [mockModelTags[1]],
    prompt: 'traditional Chinese landscape painting, misty mountains, flowing water, pine trees, ink wash style, ethereal atmosphere, minimalist composition, golden ratio, ultra detailed, --ar 3:4',
    process: '1. 基础Prompt生成初稿\n2. 控制色彩偏冷色调，增加水墨质感\n3. 使用ControlNet控制构图\n4. 后期PS微调，增加纸张纹理',
    topics: [mockTopics[1], mockTopics[6]],
    likes: 5680,
    comments: 423,
    shares: 890,
    collects: 3450,
    isLiked: true,
    isCollected: false,
    createdAt: '2024-06-09T15:20:00Z'
  },
  {
    id: 'w2',
    author: mockUsers[0],
    title: '赛博朋克2077 - 霓虹街景',
    description: '赛博朋克风格城市夜景创作，重点在霓虹灯效果和雨天的反射表现',
    cover: 'https://picsum.photos/id/201/300/300',
    images: [
      'https://picsum.photos/id/201/750/1000',
      'https://picsum.photos/id/1/750/1000',
      'https://picsum.photos/id/3/750/1000'
    ],
    modelTags: [mockModelTags[0]],
    prompt: 'cyberpunk city street at night, neon signs in Chinese and Japanese, heavy rain, reflections on wet pavement, cyberpunk aesthetic, cinematic composition, moody lighting, shallow depth of field, --ar 3:4 --v 6 --style raw',
    topics: [mockTopics[1], mockTopics[4]],
    likes: 8920,
    comments: 654,
    shares: 1560,
    collects: 5680,
    isLiked: false,
    isCollected: true,
    createdAt: '2024-06-08T20:00:00Z'
  },
  {
    id: 'w3',
    author: mockUsers[2],
    title: '梦幻少女 — 二次元风格',
    description: '日系二次元少女插画，使用自定义角色LoRA',
    cover: 'https://picsum.photos/id/338/300/300',
    images: [
      'https://picsum.photos/id/338/750/1000',
      'https://picsum.photos/id/177/750/1000'
    ],
    modelTags: [mockModelTags[1]],
    topics: [mockTopics[1]],
    likes: 6540,
    comments: 489,
    shares: 890,
    collects: 4120,
    isLiked: true,
    isCollected: true,
    createdAt: '2024-06-07T12:30:00Z'
  }
];
