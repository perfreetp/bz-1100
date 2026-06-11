import { create } from 'zustand';
import type { User, Draft, HistoryItem, Post, Work, Question, Topic, ModelTag } from '@/types';
import { mockPosts } from '@/data/posts';
import { mockWorks } from '@/data/works';
import { mockQuestions } from '@/data/questions';
import { mockTopics } from '@/data/topics';
import { mockUsers } from '@/data/users';

interface AppState {
  currentUser: User;
  darkMode: boolean;
  drafts: Draft[];
  history: HistoryItem[];
  blockedUsers: string[];
  posts: Post[];
  works: Work[];
  questions: Question[];
  topics: Topic[];
  users: User[];
  following: string[];
  joinedTopics: string[];

  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;

  addDraft: (draft: Draft) => void;
  updateDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
  getDraft: (id: string) => Draft | undefined;

  addHistory: (item: HistoryItem) => void;
  clearHistory: () => void;

  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isBlocked: (userId: string) => boolean;

  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;

  toggleJoinTopic: (topicId: string) => void;
  isJoinedTopic: (topicId: string) => boolean;

  addPost: (post: Post) => void;
  getPost: (id: string) => Post | undefined;

  addWork: (work: Work) => void;
  getWork: (id: string) => Work | undefined;

  addQuestion: (question: Question) => void;
  getQuestion: (id: string) => Question | undefined;

  getTopic: (id: string) => Topic | undefined;

  toggleLike: (type: 'post' | 'work' | 'question', id: string) => void;
  toggleCollect: (type: 'post' | 'work', id: string) => void;
  adoptAnswer: (questionId: string, answerId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: {
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
  },
  darkMode: false,
  drafts: [],
  history: [],
  blockedUsers: [],
  posts: mockPosts,
  works: mockWorks,
  questions: mockQuestions,
  topics: mockTopics,
  users: mockUsers,
  following: ['2', '3'],
  joinedTopics: ['1', '2'],

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (v) => set({ darkMode: v }),

  addDraft: (draft) => set((state) => {
    const exists = state.drafts.find(d => d.id === draft.id);
    if (exists) {
      return { drafts: state.drafts.map(d => d.id === draft.id ? draft : d) };
    }
    return { drafts: [draft, ...state.drafts] };
  }),
  updateDraft: (draft) => set((state) => ({
    drafts: state.drafts.map(d => d.id === draft.id ? draft : d)
  })),
  removeDraft: (id) => set((state) => ({
    drafts: state.drafts.filter(d => d.id !== id)
  })),
  getDraft: (id) => get().drafts.find(d => d.id === id),

  addHistory: (item) => set((state) => {
    const filtered = state.history.filter(h => h.postId !== item.postId);
    return { history: [item, ...filtered].slice(0, 50) };
  }),
  clearHistory: () => set({ history: [] }),

  blockUser: (userId) => set((state) => {
    if (state.blockedUsers.includes(userId)) return state;
    return { blockedUsers: [...state.blockedUsers, userId] };
  }),
  unblockUser: (userId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(id => id !== userId)
  })),
  isBlocked: (userId) => get().blockedUsers.includes(userId),

  toggleFollow: (userId) => set((state) => {
    const isFollowing = state.following.includes(userId);
    return {
      following: isFollowing
        ? state.following.filter(id => id !== userId)
        : [...state.following, userId],
      users: state.users.map(u =>
        u.id === userId ? { ...u, isFollowed: !isFollowing } : u
      )
    };
  }),
  isFollowing: (userId) => get().following.includes(userId),

  toggleJoinTopic: (topicId) => set((state) => {
    const isJoined = state.joinedTopics.includes(topicId);
    return {
      joinedTopics: isJoined
        ? state.joinedTopics.filter(id => id !== topicId)
        : [...state.joinedTopics, topicId],
      topics: state.topics.map(t =>
        t.id === topicId
          ? { ...t, isJoined: !isJoined, membersCount: t.membersCount + (isJoined ? -1 : 1) }
          : t
      )
    };
  }),
  isJoinedTopic: (topicId) => get().joinedTopics.includes(topicId),

  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts]
  })),
  getPost: (id) => get().posts.find(p => p.id === id),

  addWork: (work) => set((state) => ({
    works: [work, ...state.works],
    posts: [{
      id: work.id,
      type: 'work',
      author: work.author,
      title: work.title,
      content: work.description,
      images: work.images,
      modelTags: work.modelTags,
      topics: work.topics,
      likes: work.likes,
      comments: work.comments,
      shares: work.shares,
      collects: work.collects,
      isLiked: work.isLiked,
      isCollected: work.isCollected,
      createdAt: work.createdAt
    } as Post, ...get().posts]
  })),
  getWork: (id) => get().works.find(w => w.id === id),

  addQuestion: (question) => set((state) => ({
    questions: [question, ...state.questions],
    posts: [{
      id: question.id,
      type: 'qa',
      author: question.author,
      title: question.title,
      content: question.content,
      modelTags: question.modelTags,
      topics: question.topics,
      likes: question.likes,
      comments: question.answers.length,
      shares: 0,
      collects: 0,
      createdAt: question.createdAt
    } as Post, ...get().posts]
  })),
  getQuestion: (id) => get().questions.find(q => q.id === id),

  getTopic: (id) => get().topics.find(t => t.id === id),

  toggleLike: (type, id) => set((state) => {
    if (type === 'post') {
      return {
        posts: state.posts.map(p =>
          p.id === id
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        )
      };
    }
    if (type === 'work') {
      return {
        works: state.works.map(w =>
          w.id === id
            ? { ...w, isLiked: !w.isLiked, likes: w.likes + (w.isLiked ? -1 : 1) }
            : w
        ),
        posts: state.posts.map(p =>
          p.id === id && p.type === 'work'
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        )
      };
    }
    if (type === 'question') {
      return {
        questions: state.questions.map(q =>
          q.id === id
            ? { ...q, isLiked: !q.isLiked, likes: q.likes + (q.isLiked ? -1 : 1) }
            : q
        ),
        posts: state.posts.map(p =>
          p.id === id && p.type === 'qa'
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        )
      };
    }
    return state;
  }),

  toggleCollect: (type, id) => set((state) => {
    if (type === 'post') {
      return {
        posts: state.posts.map(p =>
          p.id === id
            ? { ...p, isCollected: !p.isCollected, collects: p.collects + (p.isCollected ? -1 : 1) }
            : p
        )
      };
    }
    if (type === 'work') {
      return {
        works: state.works.map(w =>
          w.id === id
            ? { ...w, isCollected: !w.isCollected, collects: w.collects + (w.isCollected ? -1 : 1) }
            : w
        ),
        posts: state.posts.map(p =>
          p.id === id && p.type === 'work'
            ? { ...p, isCollected: !p.isCollected, collects: p.collects + (p.isCollected ? -1 : 1) }
            : p
        )
      };
    }
    return state;
  }),

  adoptAnswer: (questionId, answerId) => set((state) => ({
    questions: state.questions.map(q =>
      q.id === questionId
        ? {
            ...q,
            bestAnswerId: answerId,
            answers: q.answers.map(a => ({
              ...a,
              isBest: a.id === answerId
            }))
          }
        : q
    )
  }))
}));

export default useAppStore;
