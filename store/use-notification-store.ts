import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  reminderAt: string;
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  
  fetchNotifications: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  dismissAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ notifications: data });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  dismissNotification: async (id) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id }),
      });
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  },

  dismissAll: async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissAll: true }),
      });
      set({ notifications: [] });
    } catch (error) {
      console.error("Failed to dismiss all notifications:", error);
    }
  },
}));
