import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Users, CheckCircle, AlertCircle } from 'lucide-react';

const StudentsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
      setUploadResult(null);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/students/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      if (response.data.failed === 0 && response.data.success > 0) {
        setMessage({ type: 'success', text: `Successfully imported ${response.data.success} students!` });
      } else if (response.data.success > 0) {
        setMessage({ type: 'success', text: `Imported ${response.data.success} students, but ${response.data.failed} failed.` });
      } else {
         setMessage({ type: 'error', text: `Failed to import students. See errors below.` });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload file. Please ensure it is a valid CSV or Excel file.' 
      });
    } finally {
      setLoading(false);
      setFile(null);
      // Reset input file
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Students Management
        </h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-lg">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
          <Upload className="text-indigo-500" />
          Bulk Upload Students
        </h2>
        
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
           <AlertCircle className="text-blue-500 shrink-0 mt-0.5" />
           <div className="text-sm text-blue-800">
             <p className="font-medium mb-1">CSV/Excel Requirements:</p>
             <ul className="list-disc pl-5 space-y-1">
               <li>Required columns: <strong>FirstName</strong>, <strong>LastName</strong></li>
               <li>Optional columns: <strong>RegistrationNumber</strong>, <strong>Class</strong> (e.g. Form 1), <strong>Section</strong> (e.g. A), <strong>AcademicYear</strong> (e.g. 2023/2024)</li>
               <li>Ensure class names match exactly what is in your Class Management settings.</li>
             </ul>
           </div>
        </div>

        <form onSubmit={handleBulkUpload} className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-indigo-400" />
                <p className="mb-2 text-sm text-gray-500 font-medium">
                  <span className="text-indigo-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">CSV, XLS, or XLSX (MAX. 5MB)</p>
                {file && (
                  <p className="mt-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-semibold truncate max-w-xs">
                    {file.name}
                  </p>
                )}
              </div>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {uploadResult && uploadResult.errors?.length > 0 && (
            <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Import Errors:</h3>
              <ul className="text-sm text-red-700 space-y-1 list-disc pl-5 max-h-40 overflow-y-auto">
                {uploadResult.errors.map((err, idx) => (
                  <li key={idx}>Row {err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 ${
                !file || loading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Import Students
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentsManagementPage;
