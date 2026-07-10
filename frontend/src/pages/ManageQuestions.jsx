import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const [editModal, setEditModal] = useState({ show: false, data: null });
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions?page=${page}&limit=20&search=${search}`);
      setQuestions(res.data.questions);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleDelete = async (id) => {
    if (!password) {
      alert("Please enter the admin password in the top right to delete questions.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/questions/${id}?password=${password}`);
        setStatus({ type: 'success', message: 'Question deleted successfully.' });
        fetchQuestions();
      } catch (error) {
        setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to delete.' });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!password) {
      alert("Please enter the admin password in the top right to update questions.");
      return;
    }
    try {
      await api.put(`/questions/${editModal.data._id}`, {
        ...editModal.data,
        password
      });
      setStatus({ type: 'success', message: 'Question updated successfully.' });
      setEditModal({ show: false, data: null });
      fetchQuestions();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update.' });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Questions</h1>
        
        <div className="flex items-center gap-4">
          <input
            type="password"
            placeholder="Admin Password (required)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-ssc-primary"
          />
        </div>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
          <AlertCircle className="w-5 h-5" />
          {status.message}
        </div>
      )}

      <div className="bg-white dark:bg-ssc-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID, Subject, Topic, or content..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-ssc-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
              <tr>
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Subject / Topic</th>
                <th className="p-4 font-bold">Question Preview</th>
                <th className="p-4 font-bold w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>}
              {!loading && questions.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No questions found.</td></tr>}
              {!loading && questions.map(q => (
                <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="p-4 font-mono font-medium text-blue-600 dark:text-blue-400">{q.QuestionID}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{q.Subject}</div>
                    {q.Topic && <div className="text-xs text-gray-500 mt-1">{q.Topic}</div>}
                  </td>
                  <td className="p-4 max-w-md truncate" title={q.Question}>{q.Question}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button 
                      onClick={() => setEditModal({ show: true, data: q })}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(q._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium">Page {page} of {totalPages || 1}</span>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-ssc-dark rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Question (ID: {editModal.data.QuestionID})</h2>
              <button onClick={() => setEditModal({ show: false, data: null })} className="text-gray-500 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="editForm" onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <select 
                      value={editModal.data.Subject}
                      onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Subject: e.target.value } })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="Quant">Quantitative Aptitude</option>
                      <option value="Reasoning">Logical Reasoning</option>
                      <option value="English">English Comprehension</option>
                      <option value="General Awareness">General Awareness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Topic</label>
                    <input 
                      type="text" 
                      value={editModal.data.Topic || ''}
                      onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Topic: e.target.value } })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea 
                    value={editModal.data.Question}
                    onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Question: e.target.value } })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 min-h-[100px]" 
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt}>
                      <label className="block text-sm font-medium mb-1">Option {opt}</label>
                      <input 
                        type="text" 
                        value={editModal.data[`Option${opt}`]}
                        onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, [`Option${opt}`]: e.target.value } })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800" 
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                    <select 
                      value={editModal.data.CorrectAnswer}
                      onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, CorrectAnswer: e.target.value } })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input 
                      type="text" 
                      value={editModal.data.Year}
                      onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, Year: e.target.value } })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800" 
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
              <button 
                onClick={() => setEditModal({ show: false, data: null })}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="editForm"
                className="px-6 py-2 bg-ssc-primary text-white font-medium rounded hover:bg-blue-600 flex items-center gap-2 transition-colors shadow"
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
