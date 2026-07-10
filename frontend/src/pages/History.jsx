import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { History as HistoryIcon, ArrowRight, TrendingUp } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tests/history');
        setHistory(res.data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <HistoryIcon className="w-8 h-8 text-ssc-primary" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Test History</h1>
      </div>

      {loading ? (
        <div className="text-center p-8">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-ssc-dark p-8 rounded-xl text-center shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 mb-4">You haven't taken any tests yet.</p>
          <Link to="/create-test" className="px-6 py-2 bg-ssc-primary text-white rounded-lg hover:bg-blue-600 transition-colors inline-block">
            Take a Mock Test
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((test, idx) => (
            <Link 
              key={test._id} 
              to={`/analysis/${test._id}`}
              className="bg-white dark:bg-ssc-dark p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-ssc-primary rounded-full flex items-center justify-center font-bold">
                  #{history.length - idx}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">
                      {test.TestType === 'Topic Quiz' ? 'Topic Quiz' : 'Mock Test'}
                    </h3>
                    {test.TopicName && (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                        {test.TopicName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(test.Date).toLocaleDateString()} at {new Date(test.Date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 items-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Score</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{test.RawScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Accuracy</p>
                  <p className={`font-bold text-lg ${test.Accuracy >= 80 ? 'text-green-500' : test.Accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {test.Accuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Attempted</p>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{test.Attempted}/{test.TotalQuestions}</p>
                </div>
                
                <div className="ml-4 p-2 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-ssc-primary" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
