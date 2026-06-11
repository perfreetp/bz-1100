import type { Question } from '@/types';
import { mockUsers } from './users';
import { mockTopics, mockModelTags } from './topics';

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    author: mockUsers[2],
    title: '新手提问：Stable Diffusion如何训练自己的LoRA模型？',
    content: '最近想训练一个自己风格的LoRA，但是网上教程太多太杂了。想问问大家：\n1. 训练集需要多少张图比较合适？\n2. 打标签有什么技巧？\n3. 推荐用什么训练工具？\n4. 一般训练多少轮效果最好？',
    modelTags: [mockModelTags[1]],
    topics: [mockTopics[2], mockTopics[6]],
    likes: 156,
    views: 2340,
    isLiked: false,
    bestAnswerId: 'a1',
    answers: [
      {
        id: 'a1',
        author: mockUsers[0],
        content: '作为训练过几十个LoRA的老鸟，给你一些实用建议：\n\n1. 训练集数量：建议15-30张，太少模型学不到特征，太多容易过拟合\n2. 打标签：用WD14 Tagger自动打标后人工校对，重点描述主体特征\n3. 工具推荐：Kohya_ss，界面友好功能全\n4. 训练轮次：一般10-20epoch，看loss曲线判断',
        likes: 234,
        isBest: true,
        createdAt: '2024-06-09T12:00:00Z'
      },
      {
        id: 'a2',
        author: mockUsers[1],
        content: '补充一下，打标签一定要把特征词和触发词分开。比如训练一个人物，触发词是sks，特征描述是brown hair, blue eyes, wearing red dress。这样生成时只要加sks就能触发人物特征。',
        likes: 89,
        createdAt: '2024-06-09T14:30:00Z'
      }
    ],
    createdAt: '2024-06-09T09:15:00Z'
  },
  {
    id: 'q2',
    author: mockUsers[3],
    title: 'DALL·E 3和Midjourney V6各有什么优劣？',
    content: '想问问大家的实际使用体验，这两个模型在不同场景下的表现如何？比如写实风格、创意概念、文字生成、细节处理等方面，哪个更好用？',
    modelTags: [mockModelTags[0], mockModelTags[2]],
    topics: [mockTopics[1]],
    likes: 234,
    views: 3450,
    isLiked: true,
    answers: [
      {
        id: 'a3',
        author: mockUsers[4],
        content: '两个工具我都重度使用，说说我的感受：\n\nMJ V6：艺术感强、画面精致、适合创意概念和艺术创作。但对Prompt理解有时候偏"艺术化"，精确控制难。\nDALL·E 3：理解能力超强、能生成文字、Prompt遵循度高。但画风相对保守，艺术感不如MJ。\n\n总结：搞艺术用MJ，做实用设计用DALL·E 3。',
        likes: 178,
        createdAt: '2024-06-06T11:00:00Z'
      }
    ],
    createdAt: '2024-06-06T09:00:00Z'
  },
  {
    id: 'q3',
    author: mockUsers[0],
    title: 'GPT-4o中文能力相比GPT-4有提升吗？',
    content: '最近GPT-4o发布了，想问问已经在用的朋友，中文场景下的表现如何？特别是代码、写作、推理这几个方面。',
    modelTags: [mockModelTags[3], mockModelTags[4]],
    topics: [mockTopics[7]],
    likes: 456,
    views: 5670,
    isLiked: false,
    answers: [],
    createdAt: '2024-06-05T10:00:00Z'
  }
];
