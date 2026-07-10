import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, FileType, Trash2 } from 'lucide-react';

const PaperList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/papers');
        setPapers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching papers', error);
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleStartExam = (paperId) => {
    navigate(`/papers/exam/${paperId}`);
  };

  const handleDelete = async (paperId, paperName) => {
    if (window.confirm(`Are you sure you want to delete "${paperName}"? This will also delete all attempt history for this paper.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/papers/${paperId}`);
        setPapers(papers.filter(p => p._id !== paperId));
      } catch (error) {
        console.error('Error deleting paper', error);
        alert('Failed to delete paper');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Past Year Papers</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practice with full-length previous year question papers. Experience the real exam environment.
        </p>
      </div>

      {papers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">No Papers Found</h2>
          <p className="text-gray-500 mt-2">Check back later or ask your administrator to upload some papers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col h-full group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {paper.Year || 'General'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    <FileType className="w-3 h-3" />
                    {paper.UploadType === 'pdf' ? 'PDF Mode' : 'CBT Mode'}
                  </div>
                  <button 
                    onClick={() => handleDelete(paper._id, paper.Name)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{paper.Name}</h3>
              
              <div className="flex items-center gap-4 mt-auto pt-6 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>60 Mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>100 Qs</span>
                </div>
              </div>
              
              <button
                onClick={() => handleStartExam(paper._id)}
                className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white font-bold rounded-xl transition-colors text-center border border-gray-200 hover:border-blue-600"
              >
                Start Practicing
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperList;
