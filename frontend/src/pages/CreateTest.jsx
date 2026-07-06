import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTest } from '../context/TestContext';

const CreateTest = () => {
  const [testType, setTestType] = useState('Full');
  const [questionCount, setQuestionCount] = useState(100);
  const [subject, setSubject] = useState('All');
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { startTest } = useTest();

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await api.get('/questions/years');
        setAvailableYears(response.data);
      } catch (err) {
        console.error('Failed to fetch years', err);
      }
    };
    fetchYears();
  }, []);

  const handleTestTypeChange = (type) => {
    setTestType(type);
    if (type === 'Full') {
      setQuestionCount(100);
      setSubject('All');
    } else if (type === 'Subject-wise') {
      setQuestionCount(25);
      setSubject('Quant'); // Default
    }
  };

  const handleStartTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/questions/random', {
        params: { count: questionCount, subject, year: selectedYear }
      });

      if (response.data.length === 0) {
        setError('No questions found for the selected criteria. Please upload questions first.');
        setLoading(false);
        return;
      }

      // Calculate duration: standard SSC CGL is 100 Qs in 60 mins. Let's make it proportional or configurable.
      const duration = testType === 'Full' ? 60 : Math.ceil(questionCount * 0.6); 

      startTest(response.data, duration);
      navigate('/test'); // Navigate to the test interface
    } catch (err) {
      setError('Failed to fetch questions. Please ensure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-ssc-dark dark:text-white">Create Mock Test</h1>
      
      <div className="bg-white dark:bg-ssc-dark shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleStartTest} className="space-y-8">
          
          {/* Test Type Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Select Test Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Full', 'Subject-wise', 'Custom'].map((type) => (
                <div
                  key={type}
                  onClick={() => handleTestTypeChange(type)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    testType === type 
                      ? 'border-ssc-primary bg-blue-50 dark:bg-blue-900/20 text-ssc-primary shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <h3 className="font-bold text-center">{type} Test</h3>
                  <p className="text-xs text-center mt-1 opacity-80">
                    {type === 'Full' && '100 Questions, All Subjects'}
                    {type === 'Subject-wise' && 'Single Subject Focus'}
                    {type === 'Custom' && 'Choose specific parameters'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={testType === 'Full'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-ssc-primary disabled:opacity-50"
              >
                <option value="All">All Subjects (Mixed)</option>
                <option value="Quant">Quantitative Aptitude</option>
                <option value="Reasoning">General Intelligence & Reasoning</option>
                <option value="English">English Comprehension</option>
                <option value="General Awareness">General Awareness</option>
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-ssc-primary"
              >
                <option value="Any">Any Year</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
              <input
                type="number"
                min="5"
                max="200"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={testType === 'Full'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-ssc-primary disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
                loading ? 'bg-ssc-primary/70 cursor-not-allowed' : 'bg-ssc-primary hover:bg-blue-600 hover:-translate-y-1 hover:shadow-blue-500/30 active:scale-[0.98]'
              }`}
            >
              {loading ? 'Preparing Test...' : 'Start Test Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTest;
