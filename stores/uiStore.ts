import { create } from 'zustand';

interface UIState {
  // Modal states
  isShareModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isFriendsModalOpen: boolean;
  isFollowersModalOpen: boolean;
  isNotificationsModalOpen: boolean;
  isSharedWithMeModalOpen: boolean;

  // Selected items for modals
  selectedRecipeId: string | null;

  // Actions
  openShareModal: (recipeId: string) => void;
  closeShareModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openFriendsModal: () => void;
  closeFriendsModal: () => void;
  openFollowersModal: () => void;
  closeFollowersModal: () => void;
  openNotificationsModal: () => void;
  closeNotificationsModal: () => void;
  openSharedWithMeModal: () => void;
  closeSharedWithMeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial states
  isShareModalOpen: false,
  isSettingsModalOpen: false,
  isFriendsModalOpen: false,
  isFollowersModalOpen: false,
  isNotificationsModalOpen: false,
  isSharedWithMeModalOpen: false,
  selectedRecipeId: null,

  // Actions
  openShareModal: (recipeId) =>
    set({ isShareModalOpen: true, selectedRecipeId: recipeId }),
  closeShareModal: () =>
    set({ isShareModalOpen: false, selectedRecipeId: null }),

  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),

  openFriendsModal: () => set({ isFriendsModalOpen: true }),
  closeFriendsModal: () => set({ isFriendsModalOpen: false }),

  openFollowersModal: () => set({ isFollowersModalOpen: true }),
  closeFollowersModal: () => set({ isFollowersModalOpen: false }),

  openNotificationsModal: () => set({ isNotificationsModalOpen: true }),
  closeNotificationsModal: () => set({ isNotificationsModalOpen: false }),

  openSharedWithMeModal: () => set({ isSharedWithMeModalOpen: true }),
  closeSharedWithMeModal: () => set({ isSharedWithMeModalOpen: false }),
}));
