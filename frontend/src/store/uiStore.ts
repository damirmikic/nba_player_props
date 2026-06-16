import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  ticketBuilderOpen: boolean
  selectedTab: 'odds' | 'analytics' | 'history'

  // Actions
  toggleSidebar: () => void
  toggleTicketBuilder: () => void
  setTicketBuilderOpen: (open: boolean) => void
  setSelectedTab: (tab: UIState['selectedTab']) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  ticketBuilderOpen: true,
  selectedTab: 'odds',

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleTicketBuilder: () =>
    set((state) => ({ ticketBuilderOpen: !state.ticketBuilderOpen })),

  setTicketBuilderOpen: (open) =>
    set({ ticketBuilderOpen: open }),

  setSelectedTab: (tab) =>
    set({ selectedTab: tab }),
}))
