import { create } from 'zustand';
import type { User, Draft, HistoryItem, Post, Work, Question, Topic, ModelTag } from '@/types';
import { mockPosts } from '@/data/posts';
import { mockWorks } from '@/data/works';
import { mockQuestions } from '@/data/questions';
import { mockTopics } from '@/data/topics';
import { mockUsers, mockCurrentUser } from '@/data/users';

const STORAGE_KEY = 'ai_creator_hub_store_v1';

interface PersistedState {
  drafts: Draft[];
  history: HistoryItem[];
  blockedUsers: string[];
  posts: Post[];
  works: Work[];
  questions: Question[];
  following: string[];
  joinedTopics: string[];
  darkMode: boolean;
  currentUser: User;
}

const getPersistedData = (): Partial<PersistedState> => {
  try {
    if (typeof Taro !== 'undefined' && Taro.getStorageSync) {
      const data = Taro.getStorageSync(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.warn('[Store] 读取持久化数据失败:', e);
  }
  return {};
};

const savePersistedData = (state: Partial<PersistedState>) => {
  try {
    const toSave: PersistedState = {
      drafts: state.drafts || [],
      history: state.history || [],
      blockedUsers: state.blockedUsers || [],
      posts: state.posts || [],
      works: state.works || [],
      questions: state.questions || [],
      following: state.following || [],
      joinedTopics: state.joinedTopics || [],
      darkMode: state.darkMode || false,
      currentUser: state.currentUser || mockCurrentUser
    };
    if (typeof Taro !== 'undefined' && Taro.setStorageSync) {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toSave));
    }
  } catch (e) {
    console.warn('[Store] 保存持久化数据失败:', e);
  }
};

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

const persisted = getPersistedData();

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: persisted.currentUser || mockCurrentUser,
  darkMode: persisted.darkMode ?? false,
  drafts: persisted.drafts || [],
  history: persisted.history || [],
  blockedUsers: persisted.blockedUsers || [],
  posts: persisted.posts && persisted.posts.length > 0 ? persisted.posts : mockPosts,
  works: persisted.works && persisted.works.length > 0 ? persisted.works : mockWorks,
  questions: persisted.questions && persisted.questions.length > 0 ? persisted.questions : mockQuestions,
  topics: mockTopics,
  users: mockUsers,
  following: persisted.following || ['2', '3'],
  joinedTopics: persisted.joinedTopics || ['1', '2'],

  toggleDarkMode: () => {
    set((state) => {
      const newState = { darkMode: !state.darkMode };
      savePersistedData({ ...get(), ...newState });
      return newState;
    });
  },
  setDarkMode: (v) => {
    set({ darkMode: v });
    savePersistedData({ ...get(), darkMode: v });
  },

  addDraft: (draft) => {
    set((state) => {
      const exists = state.drafts.find(d => d.id === draft.id);
      const newDrafts = exists
        ? state.drafts.map(d => d.id === draft.id ? draft : d)
        : [draft, ...state.drafts];
      savePersistedData({ ...get(), drafts: newDrafts });
      return { drafts: newDrafts };
    });
  },
  updateDraft: (draft) => {
    set((state) => {
      const newDrafts = state.drafts.map(d => d.id === draft.id ? draft : d);
      savePersistedData({ ...get(), drafts: newDrafts });
      return { drafts: newDrafts };
    });
  },
  removeDraft: (id) => {
    set((state) => {
      const newDrafts = state.drafts.filter(d => d.id !== id);
      savePersistedData({ ...get(), drafts: newDrafts });
      return { drafts: newDrafts };
    });
  },
  getDraft: (id) => get().drafts.find(d => d.id === id),

  addHistory: (item) => {
    set((state) => {
      const filtered = state.history.filter(h => h.postId !== item.postId);
      const newHistory = [item, ...filtered].slice(0, 50);
      savePersistedData({ ...get(), history: newHistory });
      return { history: newHistory };
    });
  },
  clearHistory: () => {
    set({ history: [] });
    savePersistedData({ ...get(), history: [] });
  },

  blockUser: (userId) => {
    set((state) => {
      if (state.blockedUsers.includes(userId)) return state;
      const newBlocked = [...state.blockedUsers, userId];
      savePersistedData({ ...get(), blockedUsers: newBlocked });
      return { blockedUsers: newBlocked };
    });
  },
  unblockUser: (userId) => {
    set((state) => {
      const newBlocked = state.blockedUsers.filter(id => id !== userId);
      savePersistedData({ ...get(), blockedUsers: newBlocked });
      return { blockedUsers: newBlocked };
    });
  },
  isBlocked: (userId) => get().blockedUsers.includes(userId),

  toggleFollow: (userId) => {
    set((state) => {
      const isFollowing = state.following.includes(userId);
      const newFollowing = isFollowing
        ? state.following.filter(id => id !== userId)
        : [...state.following, userId];
      const newUsers = state.users.map(u =>
        u.id === userId ? { ...u, isFollowed: !isFollowing } : u
      );
      savePersistedData({ ...get(), following: newFollowing });
      return {
        following: newFollowing,
        users: newUsers
      };
    });
  },
  isFollowing: (userId) => get().following.includes(userId),

  toggleJoinTopic: (topicId) => {
    set((state) => {
      const isJoined = state.joinedTopics.includes(topicId);
      const newJoinedTopics = isJoined
        ? state.joinedTopics.filter(id => id !== topicId)
        : [...state.joinedTopics, topicId];
      const newTopics = state.topics.map(t =>
        t.id === topicId
          ? { ...t, isJoined: !isJoined, membersCount: t.membersCount + (isJoined ? -1 : 1) }
          : t
      );
      savePersistedData({ ...get(), joinedTopics: newJoinedTopics });
      return {
        joinedTopics: newJoinedTopics,
        topics: newTopics
      };
    });
  },
  isJoinedTopic: (topicId) => get().joinedTopics.includes(topicId),

  addPost: (post) => {
    set((state) => {
      const newPosts = [post, ...state.posts];
      savePersistedData({ ...get(), posts: newPosts });
      return { posts: newPosts };
    });
  },
  getPost: (id) => get().posts.find(p => p.id === id),

  addWork: (work) => {
    set((state) => {
      const newWorks = [work, ...state.works];
      const newPosts = [{
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
      } as Post, ...get().posts];
      savePersistedData({ ...get(), works: newWorks, posts: newPosts });
      return { works: newWorks, posts: newPosts };
    });
  },
  getWork: (id) => get().works.find(w => w.id === id),

  addQuestion: (question) => {
    set((state) => {
      const newQuestions = [question, ...state.questions];
      const newPosts = [{
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
      } as Post, ...get().posts];
      savePersistedData({ ...get(), questions: newQuestions, posts: newPosts });
      return { questions: newQuestions, posts: newPosts };
    });
  },
  getQuestion: (id) => get().questions.find(q => q.id === id),

  getTopic: (id) => get().topics.find(t => t.id === id),

  toggleLike: (type, id) => {
    set((state) => {
      if (type === 'post') {
        const newPosts = state.posts.map(p =>
          p.id === id
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        );
        savePersistedData({ ...get(), posts: newPosts });
        return { posts: newPosts };
      }
      if (type === 'work') {
        const newWorks = state.works.map(w =>
          w.id === id
            ? { ...w, isLiked: !w.isLiked, likes: w.likes + (w.isLiked ? -1 : 1) }
            : w
        );
        const newPosts = state.posts.map(p =>
          p.id === id && p.type === 'work'
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        );
        savePersistedData({ ...get(), works: newWorks, posts: newPosts });
        return { works: newWorks, posts: newPosts };
      }
      if (type === 'question') {
        const newQuestions = state.questions.map(q =>
          q.id === id
            ? { ...q, isLiked: !q.isLiked, likes: q.likes + (q.isLiked ? -1 : 1) }
            : q
        );
        const newPosts = state.posts.map(p =>
          p.id === id && p.type === 'qa'
            ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
            : p
        );
        savePersistedData({ ...get(), questions: newQuestions, posts: newPosts });
        return { questions: newQuestions, posts: newPosts };
      }
      return state;
    });
  },

  toggleCollect: (type, id) => {
    set((state) => {
      if (type === 'post') {
        const newPosts = state.posts.map(p =>
          p.id === id
            ? { ...p, isCollected: !p.isCollected, collects: p.collects + (p.isCollected ? -1 : 1) }
            : p
        );
        savePersistedData({ ...get(), posts: newPosts });
        return { posts: newPosts };
      }
      if (type === 'work') {
        const newWorks = state.works.map(w =>
          w.id === id
            ? { ...w, isCollected: !w.isCollected, collects: w.collects + (w.isCollected ? -1 : 1) }
            : w
        );
        const newPosts = state.posts.map(p =>
          p.id === id && p.type === 'work'
            ? { ...p, isCollected: !p.isCollected, collects: p.collects + (p.isCollected ? -1 : 1) }
            : p
        );
        savePersistedData({ ...get(), works: newWorks, posts: newPosts });
        return { works: newWorks, posts: newPosts };
      }
      return state;
    });
  },

  adoptAnswer: (questionId, answerId) => {
    set((state) => {
      const newQuestions = state.questions.map(q =>
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
      );
      savePersistedData({ ...get(), questions: newQuestions });
      return { questions: newQuestions };
    });
  }
}));

export default useAppStore;
