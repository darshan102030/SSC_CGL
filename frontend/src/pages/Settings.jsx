import { useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, AlertTriangle, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleClearHistory = async () => {
    if (!password) {
      setStatus({ type: 'error', message: 'Admin password is required.' });
      return;
    }
    
    if (window.confirm('WARNING: This will permanently delete ALL mock test history and performance data. Question banks will NOT be deleted. Are you absolutely sure?')) {
      setLoading(true);
      try {
        await api.delete(`/tests/history/clear?password=${password}`);
        setStatus({ type: 'success', message: 'Test history has been completely cleared.' });
        setPassword('');
      } catch (error) {
        setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to clear history.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-gray-800 dark:text-white" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      <div className="bg-white dark:bg-ssc-dark p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-xl font-bold">Danger Zone</h2>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Clear Test History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            If you are done testing the platform and want to start fresh, you can clear all recorded mock tests, topic quizzes, and performance analytics. 
            <strong> This will not delete your uploaded questions.</strong>
          </p>

          <div className="flex items-center gap-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleClearHistory}
              disabled={loading}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium rounded-lg transition-colors shadow disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear History'}
            </button>
          </div>

          {status.message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
              {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
