import { useEffect, useState } from 'react';
import { Film, Shield, AlertTriangle, Search, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { getAdminMovies } from '../../api/admin';

const watermarkConfig = {
  ready: { label: 'Watermarked', color: '#1B9E85', bg: '#1B9E8520', icon: Shield },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#F59E0B20', icon: Clock },
  processing: { label: 'Processing', color: '#6B8F82', bg: '#6B8F8220', icon: Clock },
  error: { label: 'Error', color: '#EF4444', bg: '#EF444420', icon: AlertTriangle },
};

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAdminMovies()
      .then(({ data }) => setMovies(data.movies))
      .finally(() => setLoading(false));
  }, []);

  const filtered = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.owner?.name?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'watermarked') return matchSearch && m.watermarkStatus === 'ready';
    if (filter === 'declared') return matchSearch && m.legalDeclaration?.agreed;
    if (filter === 'flagged') return matchSearch && m.infringementCount > 0;
    return matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Movies</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>
          {movies.length} films registered on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { key: 'all', label: 'All Movies' },
          { key: 'watermarked', label: 'Watermarked' },
          { key: 'declared', label: 'Declared' },
          { key: 'flagged', label: 'Has Infringements' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: filter === key ? '#1B9E85' : '#111A18',
              color: filter === key ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === key ? '#1B9E85' : '#2A3832'}`,
            }}>
            {label}
          </button>
        ))}

        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#6B8F82' }} />
          <input type="text" placeholder="Search movies or owners..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: '#111A18',
              border: '1px solid #2A3832',
              color: '#F0F7F4',
              width: '220px',
            }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: movies.length, color: '#1B9E85' },
          { label: 'Watermarked', value: movies.filter((m) => m.watermarkStatus === 'ready').length, color: '#1B9E85' },
          { label: 'Declared', value: movies.filter((m) => m.legalDeclaration?.agreed).length, color: '#22C55E' },
          { label: 'With Infringements', value: movies.filter((m) => m.infringementCount > 0).length, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: '#6B8F82' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Movies list */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium uppercase"
          style={{ color: '#6B8F82', borderBottom: '1px solid #2A3832', backgroundColor: '#1A2622' }}>
          <span className="col-span-4">Movie</span>
          <span className="col-span-2">Owner</span>
          <span className="col-span-2">Watermark</span>
          <span className="col-span-2">Declaration</span>
          <span className="col-span-1">Threats</span>
          <span className="col-span-1">Scan</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#6B8F82' }}>No movies found</div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2A3832' }}>
            {filtered.map((movie) => {
              const wm = watermarkConfig[movie.watermarkStatus] || watermarkConfig.pending;
              const WmIcon = wm.icon;
              return (
                <div key={movie._id}
                  className="grid grid-cols-12 px-6 py-4 items-center transition-all"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2622'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>

                  {/* Movie */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#2A3832' }}>
                      <Film size={18} style={{ color: '#6B8F82' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#F0F7F4' }}>
                        {movie.title}
                      </p>
                      <p className="text-xs" style={{ color: '#6B8F82' }}>
                        {movie.genre || 'No genre'} · {movie.releaseYear || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm truncate" style={{ color: '#F0F7F4' }}>
                      {movie.owner?.name || '—'}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#6B8F82' }}>
                      {movie.owner?.accountStatus}
                    </p>
                  </div>

                  {/* Watermark */}
                  <div className="col-span-2">
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full w-fit"
                      style={{ backgroundColor: wm.bg, color: wm.color }}>
                      <WmIcon size={11} />
                      {wm.label}
                    </span>
                    {movie.ownerCode && (
                      <p className="text-xs mt-1 font-mono" style={{ color: '#6B8F82' }}>
                        {movie.ownerCode}
                      </p>
                    )}
                  </div>

                  {/* Declaration */}
                  <div className="col-span-2">
                    {movie.legalDeclaration?.agreed ? (
                      <div>
                        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full w-fit"
                          style={{ backgroundColor: '#22C55E20', color: '#22C55E' }}>
                          <CheckCircle size={11} />
                          Signed
                        </span>
                        <p className="text-xs mt-1" style={{ color: '#6B8F82' }}>
                          {movie.legalDeclaration.fullName}
                        </p>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full w-fit"
                        style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                        <AlertTriangle size={11} />
                        Not signed
                      </span>
                    )}
                  </div>

                  {/* Threats */}
                  <div className="col-span-1">
                    {movie.infringementCount > 0 ? (
                      <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                        {movie.infringementCount}
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: '#6B8F82' }}>0</span>
                    )}
                  </div>

                  {/* Scan status */}
                  <div className="col-span-1">
                    <span className="text-xs" style={{
                      color: movie.scanStatus === 'scanned' ? '#22C55E'
                        : movie.scanStatus === 'scanning' ? '#F59E0B'
                        : '#6B8F82',
                    }}>
                      {movie.scanStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}