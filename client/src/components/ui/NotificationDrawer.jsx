import { X, Bell, AlertTriangle, Megaphone, Shield, Trash2 } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { markNotificationsRead } from '../../api/auth';

const handleBellClick = () => {
  setDrawerOpen(true);
  markAllRead();
  markNotificationsRead().catch(() => {});
};

const typeConfig = {
  infringement: { icon: AlertTriangle, color: '#EF4444', bg: '#EF444420' },
  announcement: { icon: Megaphone, color: '#1B9E85', bg: '#1B9E8520' },
  account: { icon: Shield, color: '#F59E0B', bg: '#F59E0B20' },
};

const announcementColors = {
  info: '#1B9E85',
  warning: '#F59E0B',
  success: '#22C55E',
  urgent: '#EF4444',
};

export default function NotificationDrawer({ open, onClose }) {
  const { notifications, markAllRead, markRead, clearAll } = useNotificationStore();
  const navigate = useNavigate();

  const handleClick = (notification) => {
    markRead(notification.id);
    if (notification.type === 'infringement') {
      navigate('/dashboard/infringements');
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={onClose} />
      )}

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-96 z-50 flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: '#111A18',
          borderLeft: '1px solid #2A3832',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid #2A3832' }}>
          <div className="flex items-center gap-2">
            <Bell size={18} style={{ color: '#1B9E85' }} />
            <h2 className="font-semibold" style={{ color: '#F0F7F4' }}>Notifications</h2>
            {notifications.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                {notifications.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button onClick={markAllRead}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ color: '#6B8F82', backgroundColor: '#1A2622' }}>
                  Mark all read
                </button>
                <button onClick={clearAll}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: '#6B8F82' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B8F82'}>
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg"
              style={{ color: '#6B8F82' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <Bell size={40} className="mb-4" style={{ color: '#2A3832' }} />
              <p className="font-medium" style={{ color: '#F0F7F4' }}>All caught up</p>
              <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#2A3832' }}>
              {notifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.announcement;
                const Icon = config.icon;
                const borderColor = n.type === 'announcement'
                  ? announcementColors[n.announcementType] || config.color
                  : config.color;

                return (
                  <div key={n.id}
                    onClick={() => handleClick(n)}
                    className="flex gap-3 p-4 cursor-pointer transition-all"
                    style={{
                      backgroundColor: n.read ? 'transparent' : '#1A2622',
                      borderLeft: `3px solid ${n.read ? 'transparent' : borderColor}`,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2622'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : '#1A2622'}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: config.bg }}>
                      <Icon size={16} style={{ color: borderColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>{n.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B8F82' }}>
                        {n.message}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: '#6B8F82' }}>
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: borderColor }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}