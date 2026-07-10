import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle, FileType } from 'lucide-react';

const PaperDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/papers/analytics/all');
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching paper analytics', error);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No Data Available</h2>
        <p className="text-gray-500 mt-2">Take a Full Question Paper test to see your analytics here.</p>
      </div>
    );
  }

  const processedResults = [];
  const attemptCounts = {};
  [...results].reverse().forEach(r => {
    const pId = r.PaperID?._id || 'unknown';
    if (!attemptCounts[pId]) attemptCounts[pId] = 0;
    attemptCounts[pId]++;
    processedResults.push({
      ...r,
      attemptNumber: attemptCounts[pId]
    });
  });
  processedResults.reverse();

  // Aggregate data for Score Trend
  const scoreTrendData = results.map(r => ({
    name: r.PaperID?.Name || 'Unknown Paper',
    score: r.RawScore,
    accuracy: r.Accuracy.toFixed(1)
  })).reverse(); // Oldest first for trend

  const latestResult = results[0]; // Newest first

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Paper Analytics</h1>
          <p className="text-lg text-gray-600">Track your performance across Full Past Papers.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 border-l-4 border-l-blue-500">
          <div className="p-4 bg-blue-50 rounded-xl">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Score</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {(results.reduce((acc, curr) => acc + curr.RawScore, 0) / results.length).toFixed(1)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 border-l-4 border-l-green-500">
          <div className="p-4 bg-green-50 rounded-xl">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Accuracy</p>
            <p className="text-3xl font-extrabold text-gray-900">
              {(results.reduce((acc, curr) => acc + curr.Accuracy, 0) / results.length).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 border-l-4 border-l-purple-500">
          <div className="p-4 bg-purple-50 rounded-xl">
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Papers</p>
            <p className="text-3xl font-extrabold text-gray-900">{results.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Score Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Score Progression
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fill: '#888', fontSize: 12}} />
                <YAxis tick={{fill: '#888'}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} name="Raw Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Paper Subject Analysis */}
        {latestResult && latestResult.SubjectAnalysis && latestResult.SubjectAnalysis.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" /> Latest Subject Accuracy
            </h2>
            <p className="text-sm text-gray-500 mb-4">From: {latestResult.PaperID?.Name}</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latestResult.SubjectAnalysis} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                  <XAxis type="number" domain={[0, 100]} tick={{fill: '#888'}} />
                  <YAxis dataKey="Subject" type="category" tick={{fill: '#555', fontSize: 13, fontWeight: 'bold'}} />
                  <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="Accuracy" radius={[0, 8, 8, 0]} barSize={32}>
                    {
                      latestResult.SubjectAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.Accuracy > 75 ? '#10b981' : entry.Accuracy > 50 ? '#f59e0b' : '#ef4444'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Attempts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Attempts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Paper Name</th>
                <th className="px-6 py-4">Attempt</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Attempted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedResults.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileType className="w-5 h-5" />
                    </div>
                    {r.PaperID?.Name || 'Unknown Paper'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Attempt {r.attemptNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(r.Date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-gray-900">{r.RawScore}</span>
                    <span className="text-gray-400 text-xs ml-1">/ {r.TotalQuestions * 2}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${r.Accuracy > 75 ? 'bg-green-500' : r.Accuracy > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${r.Accuracy}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{r.Accuracy.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.Attempted} / {r.TotalQuestions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaperDashboard;
