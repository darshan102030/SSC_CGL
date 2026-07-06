import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, ArrowLeft, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import * as xlsx from 'xlsx';

const Analysis = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/tests/${id}`);
        setResult(res.data);
      } catch (error) {
        console.error('Failed to fetch analysis', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-xl">Loading Analysis...</div>;
  if (!result) return <div className="p-8 text-center text-xl text-red-500">Analysis not found.</div>;

  // Pie Chart Data
  const pieData = [
    { name: 'Correct', value: result.Correct, color: '#22c55e' },
    { name: 'Wrong', value: result.Wrong, color: '#ef4444' },
    { name: 'Unattempted', value: result.Unattempted, color: '#94a3b8' },
  ];

  // Weak/Strong Subjects
  const sortedSubjects = [...result.SubjectAnalysis].sort((a, b) => a.Accuracy - b.Accuracy);
  const weakestSubject = sortedSubjects[0];
  const strongestSubject = sortedSubjects[sortedSubjects.length - 1];

  // Export to Excel
  const exportToExcel = () => {
    const exportData = result.QuestionResponses.map((qr, index) => ({
      'Question No': index + 1,
      'QuestionID': qr.Question.QuestionID,
      'Subject': qr.Question.Subject,
      'Question': qr.Question.Question,
      'Correct Answer': qr.Question.CorrectAnswer,
      'User Answer': qr.UserAnswer || 'None',
      'Status': qr.Status
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Analysis');
    
    const dateStr = new Date(result.Date).toISOString().split('T')[0];
    xlsx.writeFile(workbook, `SSC_CGL_Test_${dateStr}.xlsx`);
  };

  const filteredResponses = result.QuestionResponses.filter(qr => filter === 'All' || qr.Status === filter);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/" className="flex items-center gap-2 text-ssc-primary hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400">Completed on {new Date(result.Date).toLocaleString()}</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow transition-all"
        >
          <Download className="w-5 h-5" /> Export Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Raw Score</div>
          <div className="text-3xl font-bold text-ssc-primary mt-1">{result.RawScore} <span className="text-sm font-normal text-gray-400">/ {result.TotalQuestions * 2}</span></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Accuracy</div>
          <div className="text-3xl font-bold text-green-500 mt-1">{result.Accuracy.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Attempt Rate</div>
          <div className="text-3xl font-bold text-blue-500 mt-1">{result.AttemptRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Attempted</div>
          <div className="text-3xl font-bold text-purple-500 mt-1">{result.Attempted} <span className="text-sm font-normal text-gray-400">/ {result.TotalQuestions}</span></div>
        </div>
      </div>

      {/* Charts & Subject Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Performance Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-sm mt-2">
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Correct ({result.Correct})</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Wrong ({result.Wrong})</div>
          </div>
        </div>

        {/* Subject wise Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Subject-wise Accuracy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.SubjectAnalysis} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151"/>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="Subject" type="category" width={100} tick={{fill: '#9ca3af', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} />
                <Bar dataKey="Accuracy" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {result.SubjectAnalysis.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="font-bold text-red-800 dark:text-red-400">Weak Area Identified</h4>
              <p className="text-red-600 dark:text-red-300/80 mt-1">
                Your weakest area is <strong>{weakestSubject.Subject}</strong> with an accuracy of {weakestSubject.Accuracy.toFixed(1)}%. Focus on practicing more questions from this section to improve your overall score.
              </p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30 flex items-start gap-4">
            <Target className="w-8 h-8 text-green-500 shrink-0" />
            <div>
              <h4 className="font-bold text-green-800 dark:text-green-400">Strong Area Identified</h4>
              <p className="text-green-600 dark:text-green-300/80 mt-1">
                Excellent work in <strong>{strongestSubject.Subject}</strong>! You achieved {strongestSubject.Accuracy.toFixed(1)}% accuracy. Maintain this momentum.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Question Review</h3>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="All">All Questions</option>
            <option value="Correct">Correct</option>
            <option value="Wrong">Wrong</option>
            <option value="Unattempted">Unattempted</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredResponses.map((qr, idx) => (
            <div key={idx} className="p-6 border-2 border-transparent hover:border-ssc-primary hover:shadow-md transition-all rounded-xl mb-2 bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {qr.Status === 'Correct' && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {qr.Status === 'Wrong' && <XCircle className="w-6 h-6 text-red-500" />}
                  {qr.Status === 'Unattempted' && <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-xs text-gray-600 font-bold">-</div>}
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Q {idx + 1}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{qr.Question.Subject}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap mb-4">
                    {qr.Question.Question}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isCorrect = qr.Question.CorrectAnswer === opt;
                      const isUser = qr.UserAnswer === opt;
                      let bg = 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
                      if (isCorrect) bg = 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500 text-green-800 dark:text-green-300';
                      else if (isUser && !isCorrect) bg = 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-500 text-red-800 dark:text-red-300';

                      return (
                        <div key={opt} className={`p-3 rounded-lg border-2 ${bg}`}>
                          <span className="font-bold mr-2">{opt}.</span>
                          {qr.Question[`Option${opt}`]}
                          {isUser && <span className="ml-2 text-xs font-bold">(Your Answer)</span>}
                          {isCorrect && <span className="ml-2 text-xs font-bold">(Correct Answer)</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredResponses.length === 0 && (
            <div className="p-8 text-center text-gray-500">No questions match the selected filter.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
