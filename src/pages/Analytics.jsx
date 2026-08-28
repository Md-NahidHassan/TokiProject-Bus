import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { PageHeader, SectionCard, StatCard } from '../components/ui/SharedComponents';
import { analyticsData } from '../data/mockData';
import { TrendingUp, Bus, Users, CheckSquare, DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(22,27,34,0.95)',
      borderColor: '#21262d', borderWidth: 1,
      titleColor: '#e6edf3', bodyColor: '#8b949e', padding: 10,
    },
  },
  scales: {
    x: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 11 } } },
    y: { grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 11 } } },
  },
};

export default function AnalyticsPage() {
  const tripsLine = {
    labels: analyticsData.monthly.labels,
    datasets: [{
      label: 'Trips',
      data: analyticsData.monthly.trips,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
    }],
  };

  const attendBar = {
    labels: analyticsData.monthly.labels,
    datasets: [{
      label: 'Attendance %',
      data: analyticsData.monthly.attendance,
      backgroundColor: 'rgba(16,185,129,0.7)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const fuelBar = {
    labels: analyticsData.monthly.labels,
    datasets: [
      {
        label: 'Fuel Cost',
        data: analyticsData.fuelCost,
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Maintenance Cost',
        data: analyticsData.maintenanceCost,
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderRadius: 4,
      },
    ],
  };

  const complaintsDoughnut = {
    labels: ['Resolved', 'In Progress', 'Pending'],
    datasets: [{
      data: [2, 1, 1],
      backgroundColor: ['rgba(16,185,129,0.8)','rgba(6,182,212,0.8)','rgba(245,158,11,0.8)'],
      borderColor: ['#10b981','#06b6d4','#f59e0b'],
      borderWidth: 2,
    }],
  };

  return (
    <div className="page-container p-6">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive insights and performance metrics"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Bus} label="Total Trips (Month)" value="380" change="+12%" color="primary" />
        <StatCard icon={Users} label="Avg Daily Riders" value="269" change="+8%" color="success" />
        <StatCard icon={CheckSquare} label="Attendance Rate" value="88%" change="+2%" color="info" />
        <StatCard icon={DollarSign} label="Monthly Cost" value="৳94k" change="-5%" color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Monthly Trip Trends" subtitle="Total trips per month">
          <div style={{ height: 250 }}>
            <Line data={tripsLine} options={chartOpts} />
          </div>
        </SectionCard>

        <SectionCard title="Attendance Rate" subtitle="Monthly attendance %">
          <div style={{ height: 250 }}>
            <Bar data={attendBar} options={chartOpts} />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SectionCard title="Cost Analysis" subtitle="Fuel vs maintenance cost per month (৳)">
            <div style={{ height: 260 }}>
              <Bar
                data={fuelBar}
                options={{
                  ...chartOpts,
                  plugins: {
                    ...chartOpts.plugins,
                    legend: {
                      display: true,
                      labels: { color: '#8b949e', font: { size: 11 }, padding: 12, boxWidth: 12 }
                    }
                  }
                }}
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Complaint Status" subtitle="Current period">
          <div style={{ height: 200 }}>
            <Doughnut
              data={complaintsDoughnut}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'bottom', labels: { color: '#8b949e', font: { size: 11 }, padding: 10 } },
                  tooltip: chartOpts.plugins.tooltip,
                },
                cutout: '60%',
              }}
            />
          </div>
        </SectionCard>
      </div>

      {/* Key insights */}
      <SectionCard title="Key Insights">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Peak Usage Day', value: 'Thursday', detail: '22 trips, 279 riders', color: 'from-blue-600/20 to-purple-600/20', border: 'border-blue-500/30', textColor: 'text-blue-400' },
            { title: 'Best Route', value: 'Route A', detail: '85 students, 45 trips this month', color: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/30', textColor: 'text-emerald-400' },
            { title: 'Most Reliable Driver', value: 'Md. Karim', detail: '4.8/5 rating, 234 trips', color: 'from-amber-600/20 to-orange-600/20', border: 'border-amber-500/30', textColor: 'text-amber-400' },
          ].map(item => (
            <div key={item.title} className={`p-5 rounded-xl bg-gradient-to-br ${item.color} border ${item.border}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider ${item.textColor} mb-2`}>{item.title}</div>
              <div className="text-xl font-bold text-white mb-1">{item.value}</div>
              <div className="text-sm text-[#8b949e]">{item.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
