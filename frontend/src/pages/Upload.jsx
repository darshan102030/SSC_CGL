import { useState } from 'react';
import api from '../services/api';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !password) {
      setStatus({ type: 'error', message: 'Please provide both file and admin password.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const response = await api.post('/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus({ 
        type: 'success', 
        message: `${response.data.message}. Added: ${response.data.added}, Duplicates Ignored: ${response.data.duplicatesIgnored}`
      });
      setFile(null);
      setPassword('');
      document.getElementById('file-upload').value = '';
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to upload file. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-white dark:bg-ssc-dark shadow-lg rounded-xl p-8 border border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-ssc-dark dark:text-white flex items-center justify-center gap-3">
          <UploadCloud className="w-8 h-8 text-ssc-primary" />
          Upload Question Bank
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excel File (.xlsx)
            </label>
            <p className="text-xs text-gray-500 mb-2">Required columns: QuestionID, Subject, Year, Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer</p>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-ssc-primary focus:border-ssc-primary bg-gray-50 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-ssc-primary focus:border-ssc-primary bg-gray-50 dark:bg-gray-900 dark:text-white"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 flex justify-center items-center gap-2 rounded-lg text-white font-medium transition-all ${
              loading ? 'bg-ssc-primary/70 cursor-not-allowed' : 'bg-ssc-primary hover:bg-blue-600 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Questions'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            status.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
