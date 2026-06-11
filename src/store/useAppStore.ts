import { create } from 'zustand';
import type { User, Draft, HistoryItem } from '@/types';

interface AppState {
  currentUser: User;
  isDarkMode: boolean;
  drafts: Draft[];
  history: HistoryItem[];
  blockedUsers: string[];
  setDarkMode: (v: boolean) => void;
  addDraft: (draft: Draft) => void;
  removeDraft: (id: string) => void;
  addHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  toggleFollow: (userId: string) => void;
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
  isDarkMode: false,
  drafts: [],
  history: [],
  blockedUsers: [],
  setDarkMode: (v) => set({ isDarkMode: v }),
  addDraft: (draft) => set((state) => {
    const exists = state.drafts.find(d => d.id === draft.id);
    if (exists) {
      return { drafts: state.drafts.map(d => d.id === draft.id ? draft : d) };
    }
    return { drafts: [draft, ...state.drafts] };
  }),
  removeDraft: (id) => set((state) => ({
    drafts: state.drafts.filter(d => d.id !== id)
  })),
  addHistory: (item) => set((state) => {
    const filtered = state.history.filter(h => h.postId !== item.postId);
    return { history: [item, ...filtered].slice(0, 50) };
  }),
  clearHistory: () => set({ history: [] }),
  blockUser: (userId) => set((state) => ({
    blockedUsers: [...state.blockedUsers, userId]
  })),
  unblockUser: (userId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(id => id !== userId)
  })),
  toggleFollow: (userId) => {
    console.log('[Store] toggleFollow:', userId);
  }
}));
