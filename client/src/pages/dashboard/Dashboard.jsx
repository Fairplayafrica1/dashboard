// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Film, AlertTriangle, Shield, TrendingUp, Upload, Search } from 'lucide-react';
// import { getMyMovies } from '../../api/movies';
// import { getInfringements } from '../../api/scan';
// import useAuthStore from '../../store/authStore';

// const StatCard = ({ icon: Icon, label, value, color, sub }) => (
//   <div className="p-6 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
//     <div className="flex items-start justify-between">
//       <div>
//         <p className="text-sm mb-1" style={{ color: '#6B8F82' }}>{label}</p>
//         <p className="text-3xl font-bold" style={{ color: '#F0F7F4' }}>{value}</p>
//         {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
//       </div>
//       <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}18` }}>
//         <Icon size={22} style={{ color }} />
//       </div>
//     </div>
//   </div>
// );

// export default function Dashboard() {
//   const { user } = useAuthStore();
//   const [movies, setMovies] = useState([]);
//   const [infringements, setInfringements] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([getMyMovies(), getInfringements()])
//       .then(([moviesRes, infRes]) => {
//         setMovies(moviesRes.data.movies);
//         setInfringements(infRes.data.infringements);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   const detected = infringements.filter((i) => i.status === 'detected').length;
//   const takedownSent = infringements.filter((i) => i.status === 'takedown_sent').length;
//   const resolved = infringements.filter((i) => i.status === 'resolved').length;

//   return (
//     <div className="space-y-8">
//       {/* Welcome */}
//       <div>
//         <h2 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>
//           Welcome back, {user?.name?.split(' ')[0]} 👋
//         </h2>
//         <p className="mt-1" style={{ color: '#6B8F82' }}>
//           Here's what's happening with your content
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         <StatCard icon={Film} label="Movies Uploaded" value={movies.length} color="#1B9E85" sub="Protected content" />
//         <StatCard icon={AlertTriangle} label="Active Threats" value={detected} color="#EF4444" sub="Needs attention" />
//         <StatCard icon={Shield} label="Takedowns Sent" value={takedownSent} color="#F59E0B" sub="In progress" />
//         <StatCard icon={TrendingUp} label="Resolved" value={resolved} color="#22C55E" sub="Successfully removed" />
//       </div>

//       {/* Recent Infringements */}
//       <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
//         <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #2A3832' }}>
//           <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>Recent Infringements</h3>
//           <Link to="/dashboard/infringements"
//             className="text-sm font-medium hover:underline" style={{ color: '#1B9E85' }}>
//             View all
//           </Link>
//         </div>

//         {loading ? (
//           <div className="p-8 text-center" style={{ color: '#6B8F82' }}>Scanning...</div>
//         ) : infringements.length === 0 ? (
//           <div className="p-12 text-center">
//             <Shield size={40} className="mx-auto mb-4" style={{ color: '#1B9E85' }} />
//             <p className="font-medium" style={{ color: '#F0F7F4' }}>No infringements detected</p>
//             <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>Upload a movie and run a scan to get started</p>
//           </div>
//         ) : (
//           <div className="divide-y" style={{ borderColor: '#2A3832' }}>
//             {infringements.slice(0, 5).map((inf) => (
//               <div key={inf._id} className="flex items-center gap-4 p-4 hover:bg-opacity-50 transition-all"
//                 style={{ backgroundColor: 'transparent' }}
//                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2622'}
//                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
//                 <img
//                   src={inf.youtubeThumbnail}
//                   alt={inf.youtubeTitle}
//                   className="w-20 h-12 object-cover rounded-lg shrink-0"
//                   style={{ border: '1px solid #2A3832' }}
//                 />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium truncate" style={{ color: '#F0F7F4' }}>{inf.youtubeTitle}</p>
//                   <p className="text-xs mt-0.5 truncate" style={{ color: '#6B8F82' }}>{inf.youtubeChannel}</p>
//                 </div>
//                 <div className="shrink-0">
//                   <span className="px-3 py-1 rounded-full text-xs font-medium"
//                     style={{
//                       backgroundColor: inf.matchConfidence === 'high' ? '#EF444420' : '#F59E0B20',
//                       color: inf.matchConfidence === 'high' ? '#EF4444' : '#F59E0B',
//                     }}>
//                     {inf.matchConfidence} match
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Quick Actions */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Link to="/dashboard/upload"
//           className="flex items-center gap-4 p-6 rounded-2xl transition-all group"
//           style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}
//           onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1B9E85'}
//           onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2A3832'}>
//           <div className="p-3 rounded-xl" style={{ backgroundColor: '#1B9E8520' }}>
//             <Upload size={22} style={{ color: '#1B9E85' }} />
//           </div>
//           <div>
//             <p className="font-semibold" style={{ color: '#F0F7F4' }}>Upload a Movie</p>
//             <p className="text-sm" style={{ color: '#6B8F82' }}>Add a new film to protect</p>
//           </div>
//         </Link>
//         <Link to="/dashboard/infringements"
//           className="flex items-center gap-4 p-6 rounded-2xl transition-all"
//           style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}
//           onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EF4444'}
//           onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2A3832'}>
//           <div className="p-3 rounded-xl" style={{ backgroundColor: '#EF444420' }}>
//             <Search size={22} style={{ color: '#EF4444' }} />
//           </div>
//           <div>
//             <p className="font-semibold" style={{ color: '#F0F7F4' }}>Review Threats</p>
//             <p className="text-sm" style={{ color: '#6B8F82' }}>Take action on detections</p>
//           </div>
//         </Link>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, AlertTriangle, Shield, TrendingUp, Upload, Search, Megaphone, X } from 'lucide-react';
import { getMyMovies } from '../../api/movies';
import { getInfringements } from '../../api/scan';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';

// Announcement banner component
const AnnouncementBanner = ({ notifications, onDismiss }) => {
  const announcements = notifications.filter(
    (n) => n.type === 'announcement' && !n.dismissed &&
    (n.announcementType === 'urgent' || n.announcementType === 'warning')
  );
  if (announcements.length === 0) return null;
  const latest = announcements[0];
  const color = latest.announcementType === 'urgent' ? '#EF4444' : '#F59E0B';
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}>
      <Megaphone size={18} style={{ color }} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color }}>{latest.title}</p>
        <p className="text-sm mt-0.5" style={{ color: '#F0F7F4' }}>{latest.message}</p>
      </div>
      <button onClick={onDismiss} style={{ color: '#6B8F82' }}>
        <X size={16} />
      </button>
    </div>
  );
};
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    className="p-6 rounded-2xl flex items-start gap-4"
    style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}
  >
    <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${color}20` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>{value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: '#F0F7F4' }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: '#6B8F82' }}>{sub}</p>
    </div>
  </div>
);
export default function Dashboard() {
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [movies, setMovies] = useState([]);
  const [infringements, setInfringements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    Promise.all([getMyMovies(), getInfringements()])
      .then(([moviesRes, infRes]) => {
        setMovies(moviesRes.data.movies);
        setInfringements(infRes.data.infringements);
      })
      .finally(() => setLoading(false));
  }, []);

  const detected = infringements.filter((i) => i.status === 'detected').length;
  const takedownSent = infringements.filter((i) => i.status === 'takedown_sent').length;
  const resolved = infringements.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-8">
      {/* Announcement banner */}
      {!bannerDismissed && (
        <AnnouncementBanner
          notifications={notifications}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="mt-1" style={{ color: '#6B8F82' }}>
          Here's what's happening with your content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Film} label="Movies Uploaded" value={movies.length} color="#1B9E85" sub="Protected content" />
        <StatCard icon={AlertTriangle} label="Active Threats" value={detected} color="#EF4444" sub="Needs attention" />
        <StatCard icon={Shield} label="Takedowns Sent" value={takedownSent} color="#F59E0B" sub="In progress" />
        <StatCard icon={TrendingUp} label="Resolved" value={resolved} color="#22C55E" sub="Successfully removed" />
      </div>

      {/* Recent Infringements */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid #2A3832' }}>
          <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>Recent Infringements</h3>
          <Link to="/dashboard/infringements"
            className="text-sm font-medium hover:underline" style={{ color: '#1B9E85' }}>
            View all
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: '#6B8F82' }}>Loading...</div>
        ) : infringements.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={40} className="mx-auto mb-4" style={{ color: '#1B9E85' }} />
            <p className="font-medium" style={{ color: '#F0F7F4' }}>No infringements detected</p>
            <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
              Upload a movie and run a scan to get started
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2A3832' }}>
            {infringements.slice(0, 5).map((inf) => (
              <div key={inf._id} className="flex items-center gap-4 p-4 transition-all"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2622'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <img src={inf.youtubeThumbnail} alt={inf.youtubeTitle}
                  className="w-20 h-12 object-cover rounded-lg shrink-0"
                  style={{ border: '1px solid #2A3832' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#F0F7F4' }}>
                    {inf.youtubeTitle}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6B8F82' }}>
                    {inf.youtubeChannel}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: inf.matchConfidence === 'high' ? '#EF444420' : '#F59E0B20',
                    color: inf.matchConfidence === 'high' ? '#EF4444' : '#F59E0B',
                  }}>
                  {inf.matchConfidence} match
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/dashboard/upload"
          className="flex items-center gap-4 p-6 rounded-2xl transition-all"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1B9E85'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2A3832'}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#1B9E8520' }}>
            <Upload size={22} style={{ color: '#1B9E85' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#F0F7F4' }}>Upload a Movie</p>
            <p className="text-sm" style={{ color: '#6B8F82' }}>Add a new film to protect</p>
          </div>
        </Link>
        <Link to="/dashboard/infringements"
          className="flex items-center gap-4 p-6 rounded-2xl transition-all"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EF4444'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2A3832'}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#EF444420' }}>
            <Search size={22} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#F0F7F4' }}>Review Threats</p>
            <p className="text-sm" style={{ color: '#6B8F82' }}>Take action on detections</p>
          </div>
        </Link>
      </div>
    </div>
  );
}