import { create } from 'zustand';
import type { User, Draft, HistoryItem, Post, Work, Question, Topic, ModelTag, Comment, ChatSession, ChatMessage } from '@/types';
import { mockPosts } from '@/data/posts';
import { mockWorks } from '@/data/works';
import { mockQuestions } from '@/data/questions';
import { mockTopics } from '@/data/topics';
import { mockUsers, mockCurrentUser } from '@/data/users';

const STORAGE_KEY = 'ai_creator_hub_store_v2';

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
  comments: Comment[];
  chatSessions: ChatSession[];
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
      currentUser: state.currentUser || mockCurrentUser,
      comments: state.comments || [],
      chatSessions: state.chatSessions || []
    };
    if (typeof Taro !== 'undefined' && Taro.setStorageSync) {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toSave));
    }
  } catch (e) {
    console.warn('[Store] 保存持久化数据失败:', e);
  }
};

const initialComments: Comment[] = [
  {
    id: 'cmt-1',
    targetId: 'w1',
    targetType: 'work',
    author: mockUsers[0] || mockCurrentUser,
    content: '这个prompt太棒了！我也试一下',
    likes: 23,
    isLiked: false,
    createdAt: '2025-01-10T10:30:00Z'
  },
  {
    id: 'cmt-2',
    targetId: 'w1',
    targetType: 'work',
    author: mockUsers[1] || mockCurrentUser,
    content: '请问是用的哪个checkpoint？效果真的赞',
    likes: 8,
    isLiked: true,
    createdAt: '2025-01-10T09:15:00Z'
  }
];

const initialChatSessions: ChatSession[] = mockUsers.slice(0, 3).map((user, idx) => ({
  id: `chat-${idx + 1}`,
  user,
  messages: [
    {
      id: `msg-${idx}-1`,
      senderId: user.id,
      content: ['你好！看了你的作品真的很棒！', '请问能分享一下Prompt吗？', '最近也在学Midjourney～'][idx],
      type: 'text' as const,
      createdAt: new Date(Date.now() - idx * 3600000).toISOString()
    }
  ],
  unreadCount: idx === 0 ? 2 : idx === 1 ? 0 : 1,
  isBlocked: false,
  lastMessageAt: new Date(Date.now() - idx * 3600000).toISOString()
}));

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
  comments: Comment[];
  chatSessions: ChatSession[];

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

  getUser: (userId: string) => User | undefined;

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

  getComments: (targetId: string, targetType?: 'post' | 'work' | 'question') => Comment[];
  addComment: (targetId: string, targetType: 'post' | 'work' | 'question', content: string, author: User) => void;
  toggleCommentLike: (commentId: string) => void;
  deleteComment: (commentId: string, userId: string) => boolean;

  getChatSessions: () => ChatSession[];
  getChatSession: (sessionId: string) => ChatSession | undefined;
  sendChatMessage: (sessionId: string, content: string, senderId: string) => void;
  markChatRead: (sessionId: string) => void;
  toggleChatBlock: (sessionId: string, blocked: boolean) => void;
  updatePostCommentCount: (postId: string, delta: number) => void;
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
  comments: persisted.comments && persisted.comments.length > 0 ? persisted.comments : initialComments,
  chatSessions: persisted.chatSessions && persisted.chatSessions.length > 0 ? persisted.chatSessions : initialChatSessions,

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

  getUser: (userId) => get().users.find(u => u.id === userId),

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
  getQuestion: (id) => {
    const q = get().questions.find(q => q.id === id);
    if (q) return q;
    const post = get().posts.find(p => p.id === id && p.type === 'qa');
    if (post) {
      return {
        id: post.id,
        author: post.author,
        title: post.title || '',
        content: post.content,
        answers: [],
        modelTags: post.modelTags,
        topics: post.topics,
        likes: post.likes,
        views: 0,
        comments: post.comments || 0,
        isLiked: post.isLiked,
        createdAt: post.createdAt
      } as Question;
    }
    return undefined;
  },

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
  },

  getComments: (targetId, targetType) => {
    return get().comments.filter(c => {
      if (c.targetId !== targetId) return false;
      if (targetType && c.targetType !== targetType) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addComment: (targetId, targetType, content, author) => {
    set((state) => {
      const now = new Date().toISOString();
      const newComment: Comment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetId,
        targetType,
        author,
        content,
        likes: 0,
        isLiked: false,
        createdAt: now
      };
      const newComments = [newComment, ...state.comments];

      const stateUpdater: Partial<AppState> = { comments: newComments };

      if (targetType === 'post' || targetType === 'work') {
        stateUpdater.posts = state.posts.map(p =>
          p.id === targetId ? { ...p, comments: (p.comments || 0) + 1 } : p
        );
      }
      if (targetType === 'work') {
        stateUpdater.works = state.works.map(w =>
          w.id === targetId ? { ...w, comments: (w.comments || 0) + 1 } : w
        );
      }
      if (targetType === 'question') {
        stateUpdater.posts = (stateUpdater.posts || state.posts).map(p =>
          p.id === targetId && p.type === 'qa' ? { ...p, comments: (p.comments || 0) + 1 } : p
        );
        stateUpdater.questions = state.questions.map(q =>
          q.id === targetId ? { ...q, comments: (q.comments || 0) + 1 } : q
        );
      }

      savePersistedData({ ...get(), ...stateUpdater });
      return stateUpdater;
    });
  },

  toggleCommentLike: (commentId) => {
    set((state) => {
      const newComments = state.comments.map(c =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likes: c.likes + (c.isLiked ? -1 : 1) }
          : c
      );
      savePersistedData({ ...get(), comments: newComments });
      return { comments: newComments };
    });
  },

  deleteComment: (commentId, userId) => {
    const comment = get().comments.find(c => c.id === commentId);
    if (!comment || comment.author.id !== userId) return false;

    set((state) => {
      const newComments = state.comments.filter(c => c.id !== commentId);

      const stateUpdater: Partial<AppState> = { comments: newComments };
      const targetId = comment.targetId;
      const targetType = comment.targetType;

      if (targetType === 'post' || targetType === 'work') {
        stateUpdater.posts = (stateUpdater.posts || state.posts).map(p =>
          p.id === targetId ? { ...p, comments: Math.max(0, (p.comments || 0) - 1) } : p
        );
      }
      if (targetType === 'work') {
        stateUpdater.works = (stateUpdater.works || state.works).map(w =>
          w.id === targetId ? { ...w, comments: Math.max(0, (w.comments || 0) - 1) } : w
        );
      }
      if (targetType === 'question') {
        stateUpdater.posts = (stateUpdater.posts || state.posts).map(p =>
          p.id === targetId && p.type === 'qa' ? { ...p, comments: Math.max(0, (p.comments || 0) - 1) } : p
        );
        stateUpdater.questions = state.questions.map(q =>
          q.id === targetId ? { ...q, comments: Math.max(0, (q.comments || 0) - 1) } : q
        );
      }

      savePersistedData({ ...get(), ...stateUpdater });
      return stateUpdater;
    });

    return true;
  },

  getChatSessions: () => get().chatSessions.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),

  getChatSession: (sessionId) => get().chatSessions.find(s => s.id === sessionId),

  sendChatMessage: (sessionId, content, senderId) => {
    set((state) => {
      const now = new Date().toISOString();
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId,
        content,
        type: 'text',
        createdAt: now
      };

      const newSessions = state.chatSessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          messages: [...s.messages, newMsg],
          lastMessageAt: now
        };
      });

      savePersistedData({ ...get(), chatSessions: newSessions });
      return { chatSessions: newSessions };
    });
  },

  markChatRead: (sessionId) => {
    set((state) => {
      const newSessions = state.chatSessions.map(s =>
        s.id === sessionId ? { ...s, unreadCount: 0 } : s
      );
      savePersistedData({ ...get(), chatSessions: newSessions });
      return { chatSessions: newSessions };
    });
  },

  toggleChatBlock: (sessionId, blocked) => {
    set((state) => {
      const newSessions = state.chatSessions.map(s =>
        s.id === sessionId ? { ...s, isBlocked: blocked } : s
      );
      const session = state.chatSessions.find(s => s.id === sessionId);
      let newBlocked = state.blockedUsers;
      if (session) {
        newBlocked = blocked
          ? [...state.blockedUsers, session.user.id].filter((v, i, a) => a.indexOf(v) === i)
          : state.blockedUsers.filter(id => id !== session.user.id);
      }
      savePersistedData({ ...get(), chatSessions: newSessions, blockedUsers: newBlocked });
      return { chatSessions: newSessions, blockedUsers: newBlocked };
    });
  },

  updatePostCommentCount: (postId, delta) => {
    set((state) => {
      const newPosts = state.posts.map(p =>
        p.id === postId ? { ...p, comments: Math.max(0, (p.comments || 0) + delta) } : p
      );
      const newWorks = state.works.map(w =>
        w.id === postId ? { ...w, comments: Math.max(0, (w.comments || 0) + delta) } : w
      );
      const newQuestions = state.questions.map(q =>
        q.id === postId ? { ...q, comments: Math.max(0, (q.comments || 0) + delta) } : q
      );
      savePersistedData({ ...get(), posts: newPosts, works: newWorks, questions: newQuestions });
      return { posts: newPosts, works: newWorks, questions: newQuestions };
    });
  }
}));

export default useAppStore;
