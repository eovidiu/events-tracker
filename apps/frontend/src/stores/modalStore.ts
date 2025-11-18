// Modal State Store (Zustand)
import { create } from 'zustand'

interface ModalState {
  createEventOpen: boolean
  editEventOpen: boolean
  editEventId: string | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (eventId: string) => void
  closeEditModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  createEventOpen: false,
  editEventOpen: false,
  editEventId: null,
  openCreateModal: () => set({ createEventOpen: true }),
  closeCreateModal: () => set({ createEventOpen: false }),
  openEditModal: (eventId) => set({ editEventOpen: true, editEventId: eventId }),
  closeEditModal: () => set({ editEventOpen: false, editEventId: null }),
}))
