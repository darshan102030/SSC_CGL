import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';

const PaperUpload = () => {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [uploadType, setUploadType] = useState('excel');
  const [file, setFile] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnswerKeyChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerKey(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      setStatus({ ...status, error: 'Name and File are required' });
      return;
    }

    setStatus({ loading: true, success: null, error: null });
    const formData = new FormData();
    formData.append('name', name);
    formData.append('year', year);
    formData.append('uploadType', uploadType);
    formData.append('file', file);
    if (uploadType === 'pdf' && answerKey) {
      formData.append('answerKey', answerKey);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus({ loading: false, success: 'Paper uploaded successfully!', error: null });
      setName('');
      setYear('');
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus({ loading: false, success: null, error: error.response?.data?.error || 'Failed to upload paper' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Full Question Paper</h1>
        <p className="text-gray-500 mt-2">Add a new past paper or mock exam for students to practice.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SSC CGL 2023 Tier 1 Shift 1"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2023"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Type</label>
              <div className="flex gap-4">
                <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${uploadType === 'excel' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" className="hidden" name="uploadType" value="excel" checked={uploadType === 'excel'} onChange={() => setUploadType('excel')} />
                  <div className="flex flex-col items-center">
                    <FileType className={`w-8 h-8 mb-2 ${uploadType === 'excel' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${uploadType === 'excel' ? 'text-blue-800' : 'text-gray-600'}`}>Excel / CSV</span>
                    <span className="text-xs text-gray-400 mt-1">Structured Questions</span>
                  </div>
                </label>
                
                <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${uploadType === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" className="hidden" name="uploadType" value="pdf" checked={uploadType === 'pdf'} onChange={() => setUploadType('pdf')} />
                  <div className="flex flex-col items-center">
                    <FileType className={`w-8 h-8 mb-2 ${uploadType === 'pdf' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${uploadType === 'pdf' ? 'text-blue-800' : 'text-gray-600'}`}>PDF Document</span>
                    <span className="text-xs text-gray-400 mt-1">Split-screen Mode</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                <input
                  type="file"
                  accept={uploadType === 'excel' ? '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' : 'application/pdf'}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  {file ? file.name : `Click or drag and drop your ${uploadType.toUpperCase()} file here`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>

            {uploadType === 'pdf' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Key (CSV) - Optional but Recommended</label>
                <div className="border border-gray-300 rounded-xl p-4 flex items-center bg-white cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleAnswerKeyChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-600 font-medium truncate">
                    {answerKey ? answerKey.name : 'Upload answer key CSV...'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Columns should be <code>QuestionID</code> and <code>CorrectAnswer</code>. If omitted, you won't get a score.
                </p>
              </div>
            )}

            {status.error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{status.error}</p>
              </div>
            )}
            
            {status.success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{status.success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${status.loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
            >
              {status.loading ? 'Uploading...' : 'Upload Question Paper'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperUpload;
