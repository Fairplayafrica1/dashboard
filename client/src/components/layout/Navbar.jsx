// import { Bell, Search } from 'lucide-react';
// import useAuthStore from '../../store/authStore';

// export default function Navbar({ title }) {
//   const { user } = useAuthStore();

//   return (
//     <header className="h-16 flex items-center justify-between px-8"
//       style={{ borderBottom: '1px solid #2A3832', backgroundColor: '#0A0F0E' }}>
//       <h1 className="text-lg font-semibold" style={{ color: '#F0F7F4' }}>{title}</h1>
//       <div className="flex items-center gap-4">
//         <div className="relative">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B8F82' }} />
//           <input
//             type="text"
//             placeholder="Search..."
//             className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none w-48"
//             style={{
//               backgroundColor: '#1A2622',
//               border: '1px solid #2A3832',
//               color: '#F0F7F4',
//             }}
//           />
//         </div>
//         <button className="relative p-2 rounded-lg transition-all"
//           style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
//           <Bell size={18} style={{ color: '#6B8F82' }} />
//           <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
//             style={{ backgroundColor: '#EF4444' }} />
//         </button>
//         <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
//           style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
//           {user?.name?.charAt(0).toUpperCase() || 'U'}
//         </div>
//       </div>
//     </header>
//   );
// }
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationDrawer from '../ui/NotificationDrawer';
import { markNotificationsRead } from '../../api/auth';


export default function Navbar({ title }) {
  const { user } = useAuthStore();
  const { unreadCount, markAllRead } = useNotificationStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
const handleBellClick = () => {
  setDrawerOpen(true);
  markAllRead();
  markNotificationsRead().catch(() => {});
};

  // const handleBellClick = () => {
  //   setDrawerOpen(true);
  //   markAllRead();
  // };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-8"
        style={{ borderBottom: '1px solid #2A3832', backgroundColor: '#0A0F0E' }}>
        <h1 className="text-lg font-semibold" style={{ color: '#F0F7F4' }}>{title}</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#6B8F82' }} />
            <input type="text" placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none w-48"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }} />
          </div>

          {/* Notification bell */}
          <button onClick={handleBellClick}
            className="relative p-2 rounded-lg transition-all"
            style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
            <Bell size={18} style={{ color: unreadCount > 0 ? '#1B9E85' : '#6B8F82' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#EF4444', color: '#fff' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}