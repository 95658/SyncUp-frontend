import { create } from 'zustand';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export interface SnackbarItem {
  id: string;
  message: string;
  type?: SnackbarType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface SnackbarState {
  snackbars: SnackbarItem[];
  showSnackbar: (item: Omit<SnackbarItem, 'id'>) => void;
  hideSnackbar: (id: string) => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  snackbars: [],
  showSnackbar: (item) => {
    const id = `snack-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem: SnackbarItem = { ...item, id };

    set((state) => ({
      snackbars: [...state.snackbars, newItem],
    }));

    const duration = item.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        snackbars: state.snackbars.filter((s) => s.id !== id),
      }));
    }, duration);
  },
  hideSnackbar: (id) =>
    set((state) => ({
      snackbars: state.snackbars.filter((s) => s.id !== id),
    })),
}));

export const showSnack = (
  message: string,
  type: SnackbarType = 'info',
  actionLabel?: string,
  onAction?: () => void
) => {
  useSnackbarStore.getState().showSnackbar({
    message,
    type,
    actionLabel,
    onAction,
  });
};
