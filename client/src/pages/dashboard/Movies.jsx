// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Film, Upload, Trash2, Search, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
// import { getMyMovies, deleteMovie } from '../../api/movies';
// import { scanMovie } from '../../api/scan';
// import toast from 'react-hot-toast';

// const statusConfig = {
//   idle: { label: 'Not scanned', color: '#6B8F82', bg: '#6B8F8220', icon: Clock },
//   scanning: { label: 'Scanning...', color: '#F59E0B', bg: '#F59E0B20', icon: Search },
//   scanned: { label: 'Scanned', color: '#22C55E', bg: '#22C55E20', icon: CheckCircle },
//   error: { label: 'Scan error', color: '#EF4444', bg: '#EF444420', icon: AlertTriangle },
// };

// export default function Movies() {
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [scanning, setScanning] = useState({});
//   const [deleting, setDeleting] = useState({});

//   useEffect(() => {
//     fetchMovies();
//   }, []);

//   const fetchMovies = async () => {
//     try {
//       const { data } = await getMyMovies();
//       setMovies(data.movies);
//     } catch {
//       toast.error('Failed to load movies');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleScan = async (movie) => {
//     setScanning((prev) => ({ ...prev, [movie._id]: true }));
//     setMovies((prev) => prev.map((m) => m._id === movie._id ? { ...m, scanStatus: 'scanning' } : m));
//     try {
//       const { data } = await scanMovie(movie._id);
//       toast.success(`Scan complete — ${data.newInfringements} new infringement(s) found`);
//       fetchMovies();
//     } catch {
//       toast.error('Scan failed');
//       setMovies((prev) => prev.map((m) => m._id === movie._id ? { ...m, scanStatus: 'error' } : m));
//     } finally {
//       setScanning((prev) => ({ ...prev, [movie._id]: false }));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this movie? This cannot be undone.')) return;
//     setDeleting((prev) => ({ ...prev, [id]: true }));
//     try {
//       await deleteMovie(id);
//       setMovies((prev) => prev.filter((m) => m._id !== id));
//       toast.success('Movie deleted');
//     } catch {
//       toast.error('Delete failed');
//     } finally {
//       setDeleting((prev) => ({ ...prev, [id]: false }));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
//           style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>My Movies</h2>
//           <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
//             {movies.length} film{movies.length !== 1 ? 's' : ''} registered for protection
//           </p>
//         </div>
//         <Link to="/dashboard/upload"
//           className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
//           style={{ backgroundColor: '#1B9E85', color: '#fff' }}
//           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16876F'}
//           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B9E85'}>
//           <Upload size={16} />
//           Upload Movie
//         </Link>
//       </div>

//       {/* Empty state */}
//       {movies.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
//           style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
//           <Film size={48} className="mb-4" style={{ color: '#2A3832' }} />
//           <p className="font-semibold text-lg" style={{ color: '#F0F7F4' }}>No movies yet</p>
//           <p className="text-sm mt-1 mb-6" style={{ color: '#6B8F82' }}>Upload your first film to start protection</p>
//           <Link to="/dashboard/upload"
//             className="px-6 py-2.5 rounded-xl text-sm font-semibold"
//             style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
//             Upload your first movie
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {movies.map((movie) => {
//             const status = statusConfig[movie.scanStatus] || statusConfig.idle;
//             const StatusIcon = status.icon;
//             return (
//               <div key={movie._id} className="rounded-2xl overflow-hidden flex flex-col"
//                 style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
//                 {/* Thumbnail */}
//                 <div className="relative h-40 flex items-center justify-center"
//                   style={{ backgroundColor: '#1A2622' }}>
//                   {movie.thumbnailUrl ? (
//                     <img src={movie.thumbnailUrl} alt={movie.title}
//                       className="w-full h-full object-cover" />
//                   ) : (
//                     <Film size={40} style={{ color: '#2A3832' }} />
//                   )}
//                   {/* Infringement badge */}
//                   {movie.infringementCount > 0 && (
//                     <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
//                       style={{ backgroundColor: '#EF4444', color: '#fff' }}>
//                       <AlertTriangle size={11} />
//                       {movie.infringementCount}
//                     </div>
//                   )}
//                 </div>

//                 {/* Info */}
//                 <div className="p-4 flex-1 flex flex-col">
//                   <h3 className="font-semibold truncate" style={{ color: '#F0F7F4' }}>{movie.title}</h3>
//                   <div className="flex items-center gap-2 mt-1">
//                     {movie.genre && (
//                       <span className="text-xs px-2 py-0.5 rounded-full"
//                         style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
//                         {movie.genre}
//                       </span>
//                     )}
//                     {movie.releaseYear && (
//                       <span className="text-xs" style={{ color: '#6B8F82' }}>{movie.releaseYear}</span>
//                     )}
//                   </div>

//                   {/* Scan status */}
//                   <div className="flex items-center gap-2 mt-3">
//                     <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
//                       style={{ backgroundColor: status.bg, color: status.color }}>
//                       <StatusIcon size={11} />
//                       {status.label}
//                     </div>
//                     {movie.lastScannedAt && (
//                       <span className="text-xs" style={{ color: '#6B8F82' }}>
//                         {new Date(movie.lastScannedAt).toLocaleDateString()}
//                       </span>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="flex items-center gap-2 mt-4 pt-4"
//                     style={{ borderTop: '1px solid #2A3832' }}>
//                     <button
//                       onClick={() => handleScan(movie)}
//                       disabled={scanning[movie._id] || movie.scanStatus === 'scanning'}
//                       className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
//                       style={{
//                         backgroundColor: '#1B9E8520',
//                         color: scanning[movie._id] ? '#6B8F82' : '#1B9E85',
//                         cursor: scanning[movie._id] ? 'not-allowed' : 'pointer',
//                       }}>
//                       <Search size={14} />
//                       {scanning[movie._id] ? 'Scanning...' : 'Scan Now'}
//                     </button>
//                     <button
//                       onClick={() => handleDelete(movie._id)}
//                       disabled={deleting[movie._id]}
//                       className="p-2 rounded-xl transition-all"
//                       style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Film, Upload, Trash2, Search, AlertTriangle,
  Clock, CheckCircle, Download, Shield, XCircle, Loader, FileText
} from 'lucide-react';
import { getMyMovies, deleteMovie, downloadWatermarked } from '../../api/movies';
import { scanMovie } from '../../api/scan';
import toast from 'react-hot-toast';
import { downloadCertificate } from '../../api/movies';

const scanStatusConfig = {
  idle: { label: 'Not scanned', color: '#6B8F82', bg: '#6B8F8220', icon: Clock },
  scanning: { label: 'Scanning...', color: '#F59E0B', bg: '#F59E0B20', icon: Search },
  scanned: { label: 'Scanned', color: '#22C55E', bg: '#22C55E20', icon: CheckCircle },
  error: { label: 'Scan error', color: '#EF4444', bg: '#EF444420', icon: AlertTriangle },
};

const fraudStatusConfig = {
  pending: { label: 'Queued', color: '#6B8F82', icon: Clock },
  checking: { label: 'Verifying...', color: '#F59E0B', icon: Loader },
  passed: { label: 'Verified', color: '#22C55E', icon: CheckCircle },
  failed: { label: 'Fraud Detected', color: '#EF4444', icon: XCircle },
};

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState({});
  const [deleting, setDeleting] = useState({});
  const [downloading, setDownloading] = useState({});

  useEffect(() => { fetchMovies(); }, []);

  // poll for fraud check status every 5s if any movie is still checking
  useEffect(() => {
    const hasChecking = movies.some(
      (m) => m.fraudCheckStatus === 'checking' || m.fraudCheckStatus === 'pending'
    );
    if (!hasChecking) return;
    const interval = setInterval(fetchMovies, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  const fetchMovies = async () => {
    try {
      const { data } = await getMyMovies();
      setMovies(data.movies);
    } catch {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (movie) => {
    setScanning((prev) => ({ ...prev, [movie._id]: true }));
    setMovies((prev) => prev.map((m) =>
      m._id === movie._id ? { ...m, scanStatus: 'scanning' } : m
    ));
    try {
      const { data } = await scanMovie(movie._id);
      toast.success(`Scan complete — ${data.newInfringements} new infringement(s) found`);
      fetchMovies();
    } catch {
      toast.error('Scan failed');
      setMovies((prev) => prev.map((m) =>
        m._id === movie._id ? { ...m, scanStatus: 'error' } : m
      ));
    } finally {
      setScanning((prev) => ({ ...prev, [movie._id]: false }));
    }
  };
  


  const handleCertificate = async (movie) => {
  if (movie.fraudCheckStatus !== 'passed') {
    toast.error('Certificate only available after verification');
    return;
  }
  try {
    const { data } = await downloadCertificate(movie._id);
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${movie.title.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Certificate downloaded');
  } catch {
    toast.error('Certificate generation failed');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie? This cannot be undone.')) return;
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m._id !== id));
      toast.success('Movie deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDownload = async (movie) => {
    if (movie.fraudCheckStatus === 'checking' || movie.fraudCheckStatus === 'pending') {
      toast('Verification still in progress — please wait', { icon: '⏳' });
      return;
    }
    if (movie.fraudCheckStatus === 'failed') {
      toast.error('Download blocked — content failed verification');
      return;
    }
    if (!movie.legalDeclaration?.agreed) {
      toast.error('Complete the legal declaration first');
      return;
    }

    setDownloading((prev) => ({ ...prev, [movie._id]: true }));
    toast('Generating your protected copy...', { icon: '⏳' });

    try {
      const { data } = await downloadWatermarked(movie._id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'video/mp4' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${movie.title.replace(/[^a-z0-9]/gi, '_')}_protected.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Protected copy downloaded! Upload this to YouTube.');
      fetchMovies();
    } catch (error) {
      const msg = error.response?.data?.message || 'Download failed';
      toast.error(msg);
    } finally {
      setDownloading((prev) => ({ ...prev, [movie._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>My Movies</h2>
          <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
            {movies.length} film{movies.length !== 1 ? 's' : ''} registered for protection
          </p>
        </div>
        <Link to="/dashboard/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16876F'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1B9E85'}>
          <Upload size={16} />
          Upload Movie
        </Link>
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <Film size={48} className="mb-4" style={{ color: '#2A3832' }} />
          <p className="font-semibold text-lg" style={{ color: '#F0F7F4' }}>No movies yet</p>
          <p className="text-sm mt-1 mb-6" style={{ color: '#6B8F82' }}>
            Upload your first film to start protection
          </p>
          <Link to="/dashboard/upload"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
            Upload your first movie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {movies.map((movie) => {
            const scanStatus = scanStatusConfig[movie.scanStatus] || scanStatusConfig.idle;
            const fraudStatus = fraudStatusConfig[movie.fraudCheckStatus] || fraudStatusConfig.pending;
            const ScanIcon = scanStatus.icon;
            const FraudIcon = fraudStatus.icon;
            const isVerifying = movie.fraudCheckStatus === 'checking' || movie.fraudCheckStatus === 'pending';
            const isFraud = movie.fraudCheckStatus === 'failed';
            const canDownload = movie.fraudCheckStatus === 'passed' && movie.legalDeclaration?.agreed;

            return (
              <div key={movie._id} className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: '#111A18',
                  border: `1px solid ${isFraud ? '#EF444440' : '#2A3832'}`,
                }}>
                {/* Thumbnail */}
                <div className="relative h-40 flex items-center justify-center"
                  style={{ backgroundColor: '#1A2622' }}>
                  {movie.thumbnailUrl ? (
                    <img src={movie.thumbnailUrl} alt={movie.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <Film size={40} style={{ color: '#2A3832' }} />
                  )}

                  {/* Fraud badge */}
                  {isFraud && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(10,15,14,0.85)' }}>
                      <div className="text-center p-4">
                        <XCircle size={32} className="mx-auto mb-2" style={{ color: '#EF4444' }} />
                        <p className="text-sm font-bold" style={{ color: '#EF4444' }}>
                          Fraud Detected
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#6B8F82' }}>
                          {movie.fraudCheckResult}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Verifying overlay */}
                  {isVerifying && (
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
                      style={{ backgroundColor: 'rgba(10,15,14,0.9)' }}>
                      <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
                        style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }} />
                      <p className="text-xs" style={{ color: '#F59E0B' }}>
                        Running verification...
                      </p>
                    </div>
                  )}

                  {/* Infringement badge */}
                  {movie.infringementCount > 0 && !isFraud && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#EF4444', color: '#fff' }}>
                      <AlertTriangle size={11} />
                      {movie.infringementCount}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold truncate" style={{ color: '#F0F7F4' }}>
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {movie.genre && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                        {movie.genre}
                      </span>
                    )}
                    {movie.releaseYear && (
                      <span className="text-xs" style={{ color: '#6B8F82' }}>
                        {movie.releaseYear}
                      </span>
                    )}
                  </div>

                  {/* Status row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {/* Fraud check status */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${fraudStatus.color}20`,
                        color: fraudStatus.color,
                      }}>
                      <FraudIcon size={11}
                        className={isVerifying ? 'animate-spin' : ''} />
                      {fraudStatus.label}
                    </div>

                    {/* Scan status */}
                    {!isFraud && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: scanStatus.bg, color: scanStatus.color }}>
                        <ScanIcon size={11} />
                        {scanStatus.label}
                      </div>
                    )}
                  </div>

                  {/* Download status */}
                  {!isFraud && (
                    <div className="mt-2">
                      {movie.watermarkStatus === 'ready' && movie.lastDownloadedAt ? (
                        <p className="text-xs" style={{ color: '#6B8F82' }}>
                          Last downloaded: {new Date(movie.lastDownloadedAt).toLocaleDateString()}
                        </p>
                      ) : !movie.legalDeclaration?.agreed ? (
                        <p className="text-xs" style={{ color: '#F59E0B' }}>
                          ⚠ Declaration required before download
                        </p>
                      ) : isVerifying ? (
                        <p className="text-xs" style={{ color: '#F59E0B' }}>
                          ⏳ Awaiting verification before download
                        </p>
                      ) : canDownload ? (
                        <p className="text-xs" style={{ color: '#22C55E' }}>
                          ✓ Ready to download
                        </p>
                      ) : null}
                    </div>
                  )}

                  {/* Actions */}
                  {!isFraud && (
                    <div className="flex items-center gap-2 mt-4 pt-4"
                      style={{ borderTop: '1px solid #2A3832' }}>
                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(movie)}
                        disabled={downloading[movie._id] || isVerifying || !movie.legalDeclaration?.agreed}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          backgroundColor: canDownload ? '#1B9E8520' : '#1A2622',
                          color: canDownload ? '#1B9E85' : '#6B8F82',
                          cursor: (isVerifying || !canDownload) ? 'not-allowed' : 'pointer',
                          flex: 1,
                        }}>
                        {downloading[movie._id]
                          ? <><Loader size={14} className="animate-spin" /> Generating...</>
                          : isVerifying
                          ? <><Loader size={14} className="animate-spin" /> Verifying...</>
                          : <><Download size={14} />
                            {movie.watermarkStatus === 'ready' && movie.lastDownloadedAt
                              ? 'Re-download'
                              : 'Download'
                            }</>
                        }
                      </button>

                      {/* Scan button */}
                      <button
                        onClick={() => handleScan(movie)}
                        disabled={scanning[movie._id] || movie.scanStatus === 'scanning'}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                        <Search size={14} />
                        {scanning[movie._id] ? 'Scanning...' : 'Scan'}
                      </button>

                      {canDownload && (
                          <button
                            onClick={() => handleCertificate(movie)}
                            title="Download copyright certificate"
                            className="p-2 rounded-xl transition-all"
                            style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                            <FileText size={16} />
                          </button>
                        )}

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(movie._id)}
                        disabled={deleting[movie._id]}
                        className="p-2 rounded-xl"
                        style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Fraud action */}
                  {isFraud && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2A3832' }}>
                      <p className="text-xs text-center" style={{ color: '#6B8F82' }}>
                        This movie has been flagged and locked.{' '}
                        <Link to="/dashboard/appeals"
                          style={{ color: '#1B9E85' }}
                          className="hover:underline">
                          Submit an appeal
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}