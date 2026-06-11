import { useState, useRef } from 'react';
import { uploadWorkbook } from '../api/expenditureApi';
import { ErrorBanner } from './SectionState';

const UploadCard = ({ kind, title }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        setError('Only .xlsx spreadsheet files are supported.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccessData(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.toLowerCase().endsWith('.xlsx')) {
        setError('Only .xlsx spreadsheet files are supported.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setSuccessData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccessData(null);

    try {
      const result = await uploadWorkbook(kind, file, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setSuccessData(result);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="panel" aria-label={title}>
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>

      {error && <ErrorBanner message={error} />}

      <div
        className="upload-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isUploading && fileInputRef.current?.click();
          }
        }}
        aria-label={`Upload zone for ${title}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx"
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <span className="upload-icon" aria-hidden="true">📥</span>
        {file ? (
          <div>
            <p style={{ fontWeight: 600 }}>{file.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ({(file.size / 1024).toFixed(1)} KB)
            </p>
          </div>
        ) : (
          <div>
            <p>Drag and drop your Excel sheet here, or click to browse</p>
            <small>Supports only .xlsx spreadsheet files (Max 10MB)</small>
          </div>
        )}
      </div>

      {file && !isUploading && (
        <button
          type="button"
          onClick={handleUpload}
          className="clear-filters-btn"
          style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }}
        >
          Process and Ingest Data
        </button>
      )}

      {isUploading && (
        <div className="upload-progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">
            <span>Uploading & Parsing Spreadsheet...</span>
            <strong>{progress}%</strong>
          </div>
        </div>
      )}

      {successData && (
        <div className="upload-success-report">
          <h4>Successfully Processed Ingestion</h4>
          <ul>
            <li>• New records created: {successData.inserted}</li>
            <li>• Existing records modified: {successData.updated}</li>
            <li>• Rows skipped: {successData.skipped}</li>
            <li>• Aggregated summaries built: {successData.summaries}</li>
          </ul>
        </div>
      )}
    </section>
  );
};

export default UploadCard;
