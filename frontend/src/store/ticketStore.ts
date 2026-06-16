import { create } from 'zustand'
import type { SelectedProp, Ticket } from '@/types/index'

interface TicketState {
  selections: SelectedProp[]
  tickets: Ticket[]

  // Actions
  addSelection: (selection: SelectedProp) => void
  removeSelection: (propId: string) => void
  updateSelection: (propId: string, updates: Partial<SelectedProp>) => void
  clearSelections: () => void
  saveTicket: (notes?: string) => void
  loadTicket: (ticket: Ticket) => void
  deleteTicket: (ticketId: string) => void
  exportTicket: () => string
}

export const useTicketStore = create<TicketState>((set, get) => ({
  selections: [],
  tickets: [],

  addSelection: (selection) =>
    set((state) => ({
      selections: [...state.selections, selection],
    })),

  removeSelection: (propId) =>
    set((state) => ({
      selections: state.selections.filter((s) => s.prop.id !== propId),
    })),

  updateSelection: (propId, updates) =>
    set((state) => ({
      selections: state.selections.map((s) =>
        s.prop.id === propId ? { ...s, ...updates } : s
      ),
    })),

  clearSelections: () =>
    set({ selections: [] }),

  saveTicket: (notes = '') => {
    const state = get()
    const ticket: Ticket = {
      id: `ticket_${Date.now()}`,
      selections: state.selections,
      createdAt: new Date(),
      notes,
    }
    set((state) => ({
      tickets: [...state.tickets, ticket],
    }))
  },

  loadTicket: (ticket) =>
    set({ selections: ticket.selections }),

  deleteTicket: (ticketId) =>
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== ticketId),
    })),

  exportTicket: () => {
    const state = get()
    const csv = [
      ['Player', 'Market', 'Side', 'Line', 'Book', 'Price'],
      ...state.selections.map((s) => [
        `${s.prop.player.firstName} ${s.prop.player.lastName}`,
        s.prop.marketLabel,
        s.side.toUpperCase(),
        s.selectedLine?.toString() ?? '-',
        s.selectedBook.toString(),
        s.selectedPrice.toString(),
      ]),
    ]
    return csv.map((row) => row.join(',')).join('\n')
  },
}))
