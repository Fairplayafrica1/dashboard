import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getAnalytics } from '../../api/scan';

const COLORS = ['#1B9E85', '#EF4444', '#F59E0B', '#22C55E', '#6B8F82'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-sm"
      style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}>
      <p className="font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
    </div>
  );

  const statusData = data?.statusBreakdown?.map((s) => ({
    name: s._id.replace('_', ' '),
    value: s.count,
  })) || [];

  const confidenceData = data?.confidenceBreakdown?.map((c) => ({
    name: c._id,
    value: c.count,
  })) || [];

  const timelineData = data?.infringementsByDay?.map((d) => ({
    date: d._id.slice(5),
    infringements: d.count,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Analytics</h2>
        <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
          Your piracy protection performance
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Detected', value: data?.total || 0, color: '#EF4444', icon: AlertTriangle },
          { label: 'Resolved', value: data?.resolved || 0, color: '#22C55E', icon: CheckCircle },
          { label: 'Success Rate', value: `${data?.successRate || 0}%`, color: '#1B9E85', icon: TrendingUp },
          { label: 'Most Pirated', value: data?.mostPirated?.[0]?.title || '—', color: '#F59E0B', icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="p-5 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: '#6B8F82' }}>{label}</p>
                <p className="text-2xl font-bold truncate" style={{ color: '#F0F7F4' }}>{value}</p>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infringements over time */}
      <div className="p-6 rounded-2xl"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold mb-6" style={{ color: '#F0F7F4' }}>
          Infringements — Last 30 Days
        </h3>
        {timelineData.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p style={{ color: '#6B8F82' }}>No data yet — run a scan to see results</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3832" />
              <XAxis dataKey="date" stroke="#6B8F82" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B8F82" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="infringements" stroke="#EF4444"
                strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="p-6 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <h3 className="font-semibold mb-6" style={{ color: '#F0F7F4' }}>Status Breakdown</h3>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p style={{ color: '#6B8F82' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#6B8F82', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Most pirated movies */}
        <div className="p-6 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <h3 className="font-semibold mb-6" style={{ color: '#F0F7F4' }}>Most Pirated</h3>
          {!data?.mostPirated?.length ? (
            <div className="flex items-center justify-center h-32">
              <p style={{ color: '#6B8F82' }}>No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.mostPirated} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3832" />
                <XAxis type="number" stroke="#6B8F82" tick={{ fontSize: 11 }} />
                <YAxis dataKey="title" type="category" stroke="#6B8F82"
                  tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="infringementCount" fill="#1B9E85" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}