import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Target, Activity, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tests/history');
        // Reverse to get chronological order for charts
        setHistory(res.data.reverse());
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8 text-center text-xl">Loading Dashboard...</div>;

  if (history.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-4xl flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Target className="w-20 h-20 text-ssc-primary mb-6 opacity-80" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Welcome to SSC CGL Mock Analyzer</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl">
          You haven't taken any mock tests yet. Upload questions from the Question Bank and start your preparation journey.
        </p>
        <div className="flex gap-4">
          <Link to="/upload" className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium transition-colors">
            Upload Questions
          </Link>
          <Link to="/create-test" className="px-6 py-3 rounded-xl bg-ssc-primary hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
            Take First Test
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTests = history.length;
  const bestScore = Math.max(...history.map(t => t.RawScore));
  const avgScore = (history.reduce((sum, t) => sum + t.RawScore, 0) / totalTests).toFixed(1);
  const avgAccuracy = (history.reduce((sum, t) => sum + t.Accuracy, 0) / totalTests).toFixed(1);

  // Chart Data preparation
  const trendData = history.map((t, index) => ({
    name: `Test ${index + 1}`,
    Score: t.RawScore,
    Accuracy: parseFloat(t.Accuracy.toFixed(1))
  }));

  // Aggregate Subject Performance from history
  const subjectAgg = {};
  history.forEach(t => {
    t.SubjectAnalysis.forEach(sa => {
      if (!subjectAgg[sa.Subject]) {
        subjectAgg[sa.Subject] = { correct: 0, attempted: 0 };
      }
      subjectAgg[sa.Subject].correct += sa.Correct;
      subjectAgg[sa.Subject].attempted += (sa.Correct + sa.Wrong);
    });
  });

  const subjectData = Object.keys(subjectAgg).map(sub => {
    const acc = subjectAgg[sub].attempted > 0 ? (subjectAgg[sub].correct / subjectAgg[sub].attempted) * 100 : 0;
    return {
      Subject: sub,
      Accuracy: parseFloat(acc.toFixed(1))
    };
  });

  // Sort subjects to find weakest/strongest
  const sortedSubjects = [...subjectData].sort((a, b) => a.Accuracy - b.Accuracy);
  const weakestSubject = sortedSubjects.length > 0 ? sortedSubjects[0].Subject : 'N/A';
  const strongestSubject = sortedSubjects.length > 0 ? sortedSubjects[sortedSubjects.length - 1].Subject : 'N/A';

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Performance Dashboard</h1>
        <Link to="/create-test" className="px-6 py-2.5 rounded-lg bg-ssc-primary hover:bg-blue-600 text-white font-medium shadow transition-colors">
          New Mock Test
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Tests</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/>{totalTests}</div>
        </div>
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Average Score</div>
          <div className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{avgScore}</div>
        </div>
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Best Score</div>
          <div className="text-2xl font-bold mt-1 text-green-500">{bestScore}</div>
        </div>
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Avg Accuracy</div>
          <div className="text-2xl font-bold mt-1 text-purple-500">{avgAccuracy}%</div>
        </div>
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Strongest Subject</div>
          <div className="text-sm font-bold mt-2 text-green-600 truncate" title={strongestSubject}>{strongestSubject}</div>
        </div>
        <div className="bg-white dark:bg-ssc-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 font-semibold uppercase">Weakest Subject</div>
          <div className="text-sm font-bold mt-2 text-red-500 truncate" title={weakestSubject}>{weakestSubject}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend Line Chart */}
        <div className="bg-white dark:bg-ssc-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Score & Accuracy Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#9ca3af'}} />
                <YAxis yAxisId="left" tick={{fill: '#9ca3af'}} />
                <YAxis yAxisId="right" orientation="right" tick={{fill: '#9ca3af'}} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} />
                <Line yAxisId="left" type="monotone" dataKey="Score" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="Accuracy" stroke="#a855f7" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm mt-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Score</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Accuracy %</div>
          </div>
        </div>

        {/* Overall Subject Performance Bar Chart */}
        <div className="bg-white dark:bg-ssc-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4">Overall Subject Accuracy</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="Subject" tick={{fill: '#9ca3af', fontSize: 12}} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{fill: '#9ca3af'}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} />
                <Bar dataKey="Accuracy" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tests (Preview) */}
      <div className="bg-white dark:bg-ssc-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Recent Tests</h3>
          <Link to="/history" className="text-sm text-ssc-primary hover:underline">View All History</Link>
        </div>
        <div className="grid gap-3">
          {[...history].reverse().slice(0, 3).map((test, i) => (
            <Link key={test._id} to={`/analysis/${test._id}`} className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                  #{history.length - i}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-200">Mock Test</div>
                  <div className="text-xs text-gray-500">{new Date(test.Date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-500 uppercase">Accuracy</div>
                  <div className="font-bold">{test.Accuracy.toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase">Score</div>
                  <div className="font-bold text-ssc-primary">{test.RawScore}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
