// import { create } from 'zustand';

// const useNotificationStore = create((set, get) => ({
//   notifications: [],
//   unreadCount: 0,

//   addNotification: (notification) => {
//     set((state) => ({
//       notifications: [notification, ...state.notifications],
//       unreadCount: state.unreadCount + 1,
//     }));
//   },

//   markAllRead: () => set({ unreadCount: 0 }),

//   markRead: (id) => set((state) => ({
//     notifications: state.notifications.map((n) =>
//       n.id === id ? { ...n, read: true } : n
//     ),
//     unreadCount: Math.max(0, state.unreadCount - 1),
//   })),

//   clearAll: () => set({ notifications: [], unreadCount: 0 }),
// }));

// export default useNotificationStore;
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  }),

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  })),

  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  markRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotificationStore;