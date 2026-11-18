import { useState } from 'react';
import { FileDropzone, formatFileSize } from './components/FileDropzone';
import type { FileValidationError } from './components/FileDropzone';
import './App.css';

interface EventLogItem {
  id: string;
  time: string;
  type: 'select' | 'remove' | 'error' | 'clear';
  name: string;
  details: string;
}

type DemoPreset = 'pdf-default' | 'images' | 'custom-validator';

export function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<DemoPreset>('pdf-default');
  const [currentError, setCurrentError] = useState<FileValidationError | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [eventLogs, setEventLogs] = useState<EventLogItem[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Helper to append to live event logger
  const logEvent = (type: EventLogItem['type'], name: string, details: string) => {
    const time = new Date().toLocaleTimeString();
    setEventLogs((prev) => [{ id: Math.random().toString(), time, type, name, details }, ...prev.slice(0, 19)]);
  };

  // Handlers passed into component callbacks
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentError(null);
    setUploadStatus('idle');
    setUploadProgress(undefined);
    logEvent('select', 'onFileSelect', `${file.name} (${formatFileSize(file.size)})`);
  };

  const handleFileRemove = (file: File | null) => {
    setSelectedFile(null);
    setCurrentError(null);
    setUploadStatus('idle');
    setUploadProgress(undefined);
    logEvent('remove', 'onFileRemove', file ? file.name : 'Cleared');
  };

  const handleError = (err: FileValidationError) => {
    setCurrentError(err);
    logEvent('error', 'onError', `[${err.code}] ${err.message}`);
  };

  const handleClearError = () => {
    setCurrentError(null);
    logEvent('clear', 'onClearError', 'User dismissed or resolved error state');
  };

  // Simulate API Upload (to prove parent file handoff to backend API)
  const handleSimulateUpload = () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === undefined) return 15;
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  // Quick programmatically generated mock files for immediate validation testing
  const createMockFile = (name: string, sizeBytes: number, type: string): File => {
    const blob = new Blob([new Uint8Array(Math.min(sizeBytes, 1024))], { type });
    // Define custom size property on mock file
    const file = new File([blob], name, { type });
    Object.defineProperty(file, 'size', { value: sizeBytes, writable: false });
    return file;
  };

  const triggerMockFile = (name: string, sizeBytes: number, type: string) => {
    const mockFile = createMockFile(name, sizeBytes, type);
    // Directly supply to select or validate
    handleFileSelect(mockFile);
  };

  // Copy code helper
  const handleCopyCode = () => {
    const code = `import { useState } from 'react';
import { FileDropzone } from './components/FileDropzone';

export function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    await fetch('/api/upload', { method: 'POST', body: formData });
  };

  return (
    <FileDropzone
      accept={['application/pdf']}
      maxSizeBytes={10 * 1024 * 1024} // 10 MB limit
      onFileSelect={(selected) => setFile(selected)}
      onFileRemove={() => setFile(null)}
      onError={(err) => console.error(err.message)}
    />
  );
}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="app">
      {/* Top Header */}
      <header className="header">
        <div className="badgeRow">
          <span className="badge">React + TypeScript</span>
          <span className="badge emerald">PDF · 10 MB Limit</span>
          <span className="badge purple">Zero External Dependencies</span>
        </div>
        <h1 className="title">PDF Dropzone Component</h1>
        <p className="subtitle">
          A small, reusable dropzone component that lets users select a PDF by dragging it or clicking to browse.
          Strictly validated, accessible, and easily extractable into any React project.
        </p>
      </header>

      {/* Main Showcase Layout */}
      <div className="mainGrid">
        {/* Left Column: Interactive Component Demo */}
        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Component Playground
            </h2>
            <p className="cardDesc">
              Choose a preset configuration or drag & drop a PDF file directly onto the drop area below.
            </p>
          </div>

          {/* Preset Config Switcher */}
          <div className="presetSelector" role="tablist">
            <button
              type="button"
              className={`presetBtn ${preset === 'pdf-default' ? 'active' : ''}`}
              onClick={() => {
                setPreset('pdf-default');
                setSelectedFile(null);
                setCurrentError(null);
                setUploadStatus('idle');
              }}
            >
              📄 Default (PDF 10MB)
            </button>
            <button
              type="button"
              className={`presetBtn ${preset === 'images' ? 'active' : ''}`}
              onClick={() => {
                setPreset('images');
                setSelectedFile(null);
                setCurrentError(null);
                setUploadStatus('idle');
              }}
            >
              🖼️ Images (5MB PNG/JPG)
            </button>
            <button
              type="button"
              className={`presetBtn ${preset === 'custom-validator' ? 'active' : ''}`}
              onClick={() => {
                setPreset('custom-validator');
                setSelectedFile(null);
                setCurrentError(null);
                setUploadStatus('idle');
              }}
            >
              🛡️ Custom Validator (No 'draft')
            </button>
          </div>

          {/* The Reusable Component Instance */}
          {preset === 'pdf-default' && (
            <FileDropzone
              accept={['application/pdf']}
              maxSizeBytes={10 * 1024 * 1024} // 10 MB
              value={selectedFile}
              error={currentError}
              uploadProgress={uploadProgress}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onError={handleError}
              onClearError={handleClearError}
            />
          )}

          {preset === 'images' && (
            <FileDropzone
              accept={['image/png', 'image/jpeg', 'image/webp']}
              maxSizeBytes={5 * 1024 * 1024} // 5 MB
              title="Upload an Image"
              subtitle="Drag & drop PNG, JPG, or WEBP here"
              hint="Images up to 5 MB"
              value={selectedFile}
              error={currentError}
              uploadProgress={uploadProgress}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onError={handleError}
              onClearError={handleClearError}
            />
          )}

          {preset === 'custom-validator' && (
            <FileDropzone
              accept={['application/pdf']}
              maxSizeBytes={10 * 1024 * 1024}
              title="Upload Final Document"
              subtitle="Files containing 'draft' will be rejected"
              customValidator={(file) => {
                if (file.name.toLowerCase().includes('draft')) {
                  return `Draft documents cannot be uploaded. Please submit a finalized file.`;
                }
                return null;
              }}
              value={selectedFile}
              error={currentError}
              uploadProgress={uploadProgress}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              onError={handleError}
              onClearError={handleClearError}
            />
          )}

          {/* Quick Simulation / Test Triggers */}
          <div className="testButtonsRow">
            <div className="testRowLabel">Quick Test Triggers (Simulate files without manual drag)</div>
            <div className="testBtnGroup">
              <button
                type="button"
                className="quickTestBtn success"
                onClick={() => {
                  setCurrentError(null);
                  triggerMockFile('annual-financial-report-2026.pdf', 3.4 * 1024 * 1024, 'application/pdf');
                }}
              >
                ✓ Mock 3.4 MB PDF
              </button>
              <button
                type="button"
                className="quickTestBtn danger"
                onClick={() => {
                  const oversize = createMockFile('huge-portfolio-archive.pdf', 14.5 * 1024 * 1024, 'application/pdf');
                  handleError({
                    code: 'FILE_TOO_LARGE',
                    message: `"${oversize.name}" exceeds the maximum allowed size of 10 MB (actual size: 14.5 MB).`,
                    file: oversize,
                  });
                }}
              >
                ✕ Mock 14.5 MB (Over 10MB Limit)
              </button>
              <button
                type="button"
                className="quickTestBtn danger"
                onClick={() => {
                  const invalidType = createMockFile('family-vacation.jpg', 1.8 * 1024 * 1024, 'image/jpeg');
                  handleError({
                    code: 'INVALID_TYPE',
                    message: `"${invalidType.name}" is not a valid format. Please upload a PDF file.`,
                    file: invalidType,
                  });
                }}
              >
                ✕ Mock .JPG (Non-PDF Format)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Parent Component Integration & State Inspector */}
        <div className="sidePanel">
          {/* Parent State Inspection */}
          <div className="stateBox">
            <div className="stateHeader">
              <span className="stateTitle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Parent State: selectedFile
              </span>
              <span style={{ color: selectedFile ? '#4ade80' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                {selectedFile ? '● FILE READY' : '○ NO FILE'}
              </span>
            </div>

            <pre className="statePre">
              {selectedFile ? (
                <>
                  <div><strong>Name:</strong> {selectedFile.name}</div>
                  <div><strong>Size:</strong> {formatFileSize(selectedFile.size)} ({selectedFile.size.toLocaleString()} bytes)</div>
                  <div><strong>Type:</strong> {selectedFile.type || 'application/pdf'}</div>
                  <div><strong>Last Modified:</strong> {new Date(selectedFile.lastModified || Date.now()).toLocaleDateString()}</div>
                </>
              ) : (
                '// No file selected.\n// Parent receives File instance via onFileSelect.'
              )}
            </pre>
          </div>

          {/* API Upload Simulation Box */}
          <div className="apiBox">
            <div className="apiBoxHeader">
              <h3 className="apiTitle">Handoff to Upload API</h3>
            </div>
            <button
              type="button"
              className="uploadActionBtn"
              disabled={!selectedFile || uploadStatus === 'uploading'}
              onClick={handleSimulateUpload}
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Uploading ({uploadProgress}%)...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Simulate API Upload
                </>
              )}
            </button>

            {uploadStatus === 'success' && (
              <div className="uploadSuccessAlert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Upload successful! File transmitted to <code>POST /api/documents</code>.</span>
              </div>
            )}
          </div>

          {/* Live Callbacks Activity Feed */}
          <div className="eventLogCard">
            <div className="eventLogHeader">
              <h3 className="eventLogTitle">Live Callbacks Log</h3>
              {eventLogs.length > 0 && (
                <button type="button" className="clearLogsBtn" onClick={() => setEventLogs([])}>
                  Clear
                </button>
              )}
            </div>

            <div className="eventList">
              {eventLogs.length === 0 ? (
                <div style={{ color: '#94a3b8', padding: '12px 0', textAlign: 'center' }}>
                  No callback events emitted yet. Drag or pick a file to view real-time events.
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div key={log.id} className={`eventItem ${log.type}`}>
                    <span className="eventTime">{log.time}</span>
                    <span className="eventName">{log.name}:</span>
                    <span className="eventDetails" title={log.details}>{log.details}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extraction & Integration Documentation */}
      <section className="extractSection">
        <h2 className="sectionTitle">How to Extract & Use in Your Project</h2>
        <p className="sectionDesc">
          The <code>FileDropzone</code> component is built to be completely self-contained with <strong>zero external dependencies</strong> and customizable through standard props.
        </p>

        <div className="featuresGrid">
          <div className="featureBox">
            <h4>📦 100% Self-Contained</h4>
            <p>Just copy the <code>src/components/FileDropzone/</code> folder. Uses standard SVG icons and modular CSS variables.</p>
          </div>
          <div className="featureBox">
            <h4>🛡️ Robust Validation</h4>
            <p>Handles MIME types, file extensions, max/min file size, and custom validation functions out of the box.</p>
          </div>
          <div className="featureBox">
            <h4>⚙️ Fully Configurable</h4>
            <p>Pass custom titles, subtitles, accepted types, max size limits, disabled states, or custom render previews.</p>
          </div>
          <div className="featureBox">
            <h4>⚡ API Ready</h4>
            <p>Receives standard browser <code>File</code> object ready for <code>FormData</code> and <code>fetch/axios</code> uploads.</p>
          </div>
        </div>

        <div className="codeBlockContainer">
          <button type="button" className="copyCodeBtn" onClick={handleCopyCode}>
            {copiedCode ? '✓ Copied' : 'Copy Code'}
          </button>
          <pre className="codeBlock">
{`import { useState } from 'react';
import { FileDropzone } from './components/FileDropzone';

export function DocumentUploadForm() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    await fetch('/api/upload', { method: 'POST', body: formData });
  };

  return (
    <FileDropzone
      accept={['application/pdf']}
      maxSizeBytes={10 * 1024 * 1024} // 10 MB limit
      onFileSelect={(selected) => setFile(selected)}
      onFileRemove={() => setFile(null)}
      onError={(err) => console.error(err.message)}
    />
  );
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}

export default App;
