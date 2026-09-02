// import { useEffect } from 'react';
// import { io } from 'socket.io-client';
// import useAuthStore from '../store/authStore';
// import useNotificationStore from '../store/notificationStore';
// import toast from 'react-hot-toast';
// import { v4 as uuidv4 } from 'uuid';

// let socket = null;

// export const useSocket = () => {
//   const { user, isAuthenticated } = useAuthStore();
//   const { addNotification } = useNotificationStore();

//   useEffect(() => {
//     if (!isAuthenticated || !user) return;

//     socket = io('http://localhost:5000', { withCredentials: true });

//     socket.on('connect', () => {
//       socket.emit('authenticate', user._id);
//     });

//     socket.on('new_infringements', (data) => {
//       const notification = {
//         id: uuidv4(),
//         type: 'infringement',
//         title: `${data.count} new piracy detected`,
//         message: `"${data.movieTitle}" was found on ${data.count} YouTube channel${data.count > 1 ? 's' : ''}`,
//         timestamp: new Date().toISOString(),
//         read: false,
//         data,
//       };
//       addNotification(notification);
//       toast(
//         (t) => (
//           <div onClick={() => toast.dismiss(t.id)}>
//             <p style={{ fontWeight: 600, marginBottom: 4 }}>
//               🚨 {notification.title}
//             </p>
//             <p style={{ fontSize: 13, opacity: 0.8 }}>{notification.message}</p>
//           </div>
//         ),
//         {
//           duration: 8000,
//           style: {
//             background: '#1A2622',
//             color: '#F0F7F4',
//             border: '1px solid #EF4444',
//           },
//         }
//       );
//     });

//     socket.on('announcement', (data) => {
//       const typeColors = {
//         info: '#1B9E85',
//         warning: '#F59E0B',
//         success: '#22C55E',
//         urgent: '#EF4444',
//       };
//       const notification = {
//         id: uuidv4(),
//         type: 'announcement',
//         title: data.title,
//         message: data.message,
//         announcementType: data.type,
//         timestamp: new Date().toISOString(),
//         read: false,
//       };
//       addNotification(notification);
//       toast(
//         (t) => (
//           <div onClick={() => toast.dismiss(t.id)}>
//             <p style={{ fontWeight: 600, marginBottom: 4 }}>📢 {data.title}</p>
//             <p style={{ fontSize: 13, opacity: 0.8 }}>{data.message}</p>
//           </div>
//         ),
//         {
//           duration: 10000,
//           style: {
//             background: '#1A2622',
//             color: '#F0F7F4',
//             border: `1px solid ${typeColors[data.type] || '#1B9E85'}`,
//           },
//         }
//       );
//     });

//     socket.on('account_status_changed', (data) => {
//       const notification = {
//         id: uuidv4(),
//         type: 'account',
//         title: data.title,
//         message: data.message,
//         timestamp: new Date().toISOString(),
//         read: false,
//       };
//       addNotification(notification);
//     });

//     socket.on('disconnect', () => {});

//     return () => {
//       if (socket) { socket.disconnect(); socket = null; }
//     };
//   }, [isAuthenticated, user]);

//   return socket;
// };
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import { getNotifications, getMe } from '../api/auth';
import toast from 'react-hot-toast';

let socket = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification, setNotifications } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // load persisted notifications from DB on mount
    getNotifications()
      .then(({ data }) => {
        setNotifications(
          data.notifications.map((n) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            timestamp: n.createdAt,
            announcementType: n.metadata?.announcementType,
            metadata: n.metadata,
          }))
        );
      })
      .catch(() => {});

    

    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('authenticate', user._id);
    });

    socket.on('new_infringements', (data) => {
      const notification = {
        id: data.notificationId || uuidv4(),
        type: 'infringement',
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: data.metadata,
      };
      addNotification(notification);
      toast(
        (t) => (
          <div onClick={() => toast.dismiss(t.id)}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>🚨 {notification.title}</p>
            <p style={{ fontSize: 13, opacity: 0.8 }}>{notification.message}</p>
          </div>
        ),
        {
          duration: 8000,
          style: { background: '#1A2622', color: '#F0F7F4', border: '1px solid #EF4444' },
        }
      );
    });

    socket.on('account_status_changed', (data) => {
      // reload user so Layout can show the block screen if suspended/banned
      getMe()
        .then(({ data: meData }) => {
          useAuthStore.getState().setUser(meData.user);
        })
        .catch(() => {});
    });

    socket.on('announcement', (data) => {
      const typeColors = {
        info: '#1B9E85', warning: '#F59E0B', success: '#22C55E', urgent: '#EF4444',
      };
      const notification = {
        id: uuidv4(),
        type: 'announcement',
        title: data.title,
        message: data.message,
        announcementType: data.type,
        timestamp: new Date().toISOString(),
        read: false,
      };
      addNotification(notification);
      toast(
        (t) => (
          <div onClick={() => toast.dismiss(t.id)}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>📢 {data.title}</p>
            <p style={{ fontSize: 13, opacity: 0.8 }}>{data.message}</p>
          </div>
        ),
        {
          duration: 10000,
          style: {
            background: '#1A2622',
            color: '#F0F7F4',
            border: `1px solid ${typeColors[data.type] || '#1B9E85'}`,
          },
        }
      );
    });

    socket.on('disconnect', () => {});

    return () => {
      if (socket) { socket.disconnect(); socket = null; }
    };
  }, [isAuthenticated, user]);

  return socket;
};