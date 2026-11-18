import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { FileDropzoneProps, FileValidationError } from './types';
import { formatFileSize, normalizeAccept, isFileAccepted, formatAcceptSummary } from './utils';
import styles from './FileDropzone.module.css';

// Default constants
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_ACCEPT = ['application/pdf'];

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  minSizeBytes,
  multiple = false,
  maxFiles = 5,
  disabled = false,
  onFileSelect,
  onFilesSelect,
  onFileRemove,
  onError,
  onClearError,
  customValidator,
  value,
  title,
  subtitle,
  hint,
  uploadProgress,
  className = '',
  style,
  customIcon,
  renderPreview,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(value ?? null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<FileValidationError | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Sync external controlled value if provided
  useEffect(() => {
    if (value !== undefined) {
      setSelectedFile(value);
    }
  }, [value]);

  const acceptedRules = React.useMemo(() => normalizeAccept(accept), [accept]);

  // Derived labels
  const acceptLabel = React.useMemo(() => formatAcceptSummary(acceptedRules), [acceptedRules]);
  const defaultTitle = multiple
    ? `Drag & drop your ${acceptLabel} files here`
    : `Drag & drop your ${acceptLabel} here`;
  const defaultSubtitle = 'or click to browse from your computer';
  const defaultHint = `${acceptLabel} up to ${formatFileSize(maxSizeBytes)}`;

  const displayTitle = title ?? defaultTitle;
  const displaySubtitle = subtitle ?? defaultSubtitle;
  const displayHint = hint ?? defaultHint;

  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
    onClearError?.();
  }, [onClearError]);

  // File validation engine
  const validateFile = useCallback(
    (file: File): FileValidationError | null => {
      // 1. Check file type
      if (!isFileAccepted(file, acceptedRules)) {
        return {
          code: 'INVALID_TYPE',
          message: `"${file.name}" is not a valid format. Please upload a ${acceptLabel} file.`,
          file,
        };
      }

      // 2. Check max size
      if (file.size > maxSizeBytes) {
        return {
          code: 'FILE_TOO_LARGE',
          message: `"${file.name}" exceeds the maximum allowed size of ${formatFileSize(maxSizeBytes)} (actual size: ${formatFileSize(file.size)}).`,
          file,
        };
      }

      // 3. Check min size (if set)
      if (minSizeBytes && file.size < minSizeBytes) {
        return {
          code: 'FILE_TOO_SMALL',
          message: `"${file.name}" is smaller than the minimum size of ${formatFileSize(minSizeBytes)}.`,
          file,
        };
      }

      // 4. Custom validation logic if provided
      if (customValidator) {
        const customMessage = customValidator(file);
        if (customMessage) {
          return {
            code: 'CUSTOM_VALIDATION_ERROR',
            message: customMessage,
            file,
          };
        }
      }

      return null;
    },
    [acceptedRules, maxSizeBytes, minSizeBytes, customValidator, acceptLabel]
  );

  // Process incoming files from input or drop
  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || disabled) return;

      clearError();

      if (!multiple) {
        const file = fileList[0];
        const validationError = validateFile(file);

        if (validationError) {
          setError(validationError);
          onError?.(validationError);
          return;
        }

        setSelectedFile(file);
        onFileSelect?.(file);
      } else {
        if (fileList.length > maxFiles) {
          const limitError: FileValidationError = {
            code: 'TOO_MANY_FILES',
            message: `You can only select up to ${maxFiles} files at once.`,
          };
          setError(limitError);
          onError?.(limitError);
          return;
        }

        const validFiles: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return;
          }
          validFiles.push(file);
        }

        setSelectedFiles(validFiles);
        onFilesSelect?.(validFiles);
      }
    },
    [disabled, multiple, maxFiles, validateFile, onFileSelect, onFilesSelect, onError, clearError]
  );

  // Drag and Drop Event Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Open file selector
  const triggerBrowse = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // Remove single selected file
  const handleRemove = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const removed = selectedFile;
    setSelectedFile(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.(removed);
  };

  // Remove multiple file by index
  const handleRemoveMultiple = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetFile = selectedFiles[index];
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    clearError();
    onFileRemove?.(targetFile);
    onFilesSelect?.(updated);
  };

  // Key navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerBrowse();
    }
  };

  const inputAcceptString = React.useMemo(() => {
    return acceptedRules.join(',');
  }, [acceptedRules]);

  const hasSelectedSingle = !multiple && Boolean(selectedFile);
  const hasSelectedMultiple = multiple && selectedFiles.length > 0;

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={inputAcceptString}
        multiple={multiple}
        disabled={disabled}
        className={styles.hiddenInput}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Single file mode preview */}
      {hasSelectedSingle && selectedFile ? (
        renderPreview ? (
          renderPreview({
            file: selectedFile,
            formattedSize: formatFileSize(selectedFile.size),
            onRemove: handleRemove,
            disabled,
            progress: uploadProgress,
          })
        ) : (
          <div className={styles.previewCard} role="region" aria-label="Selected file">
            <div className={styles.previewBadge} title={selectedFile.type || 'Document'}>
              <svg
                className={styles.badgeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>{acceptLabel.includes('PDF') ? 'PDF' : 'DOC'}</span>
            </div>

            <div className={styles.fileDetails}>
              <div className={styles.fileNameRow}>
                <h4 className={styles.fileName} title={selectedFile.name}>
                  {selectedFile.name}
                </h4>
              </div>

              <div className={styles.fileMeta}>
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className={styles.statusTag}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Ready to upload
                </span>
              </div>

              {uploadProgress !== undefined && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
                    />
                  </div>
                  <div className={styles.progressLabel}>{uploadProgress}% uploaded</div>
                </div>
              )}
            </div>

            <div className={styles.actionButtonGroup}>
              <button
                type="button"
                className={styles.changeBtn}
                onClick={triggerBrowse}
                disabled={disabled}
                aria-label="Pick another file"
                title="Pick another file"
              >
                Change
              </button>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Remove selected file"
                title="Remove file"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )
      ) : hasSelectedMultiple ? (
        /* Multiple files mode preview */
        <div className={styles.multipleFilesList}>
          <div className={styles.multipleFilesHeader}>
            <span>{selectedFiles.length} files selected</span>
            <button type="button" className={styles.changeBtn} onClick={triggerBrowse} disabled={disabled}>
              + Add More
            </button>
          </div>
          {selectedFiles.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className={styles.previewCard} style={{ marginTop: '8px' }}>
              <div className={styles.previewBadge}>
                <span>DOC</span>
              </div>
              <div className={styles.fileDetails}>
                <h4 className={styles.fileName}>{file.name}</h4>
                <div className={styles.fileMeta}>
                  <span>{formatFileSize(file.size)}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => handleRemoveMultiple(idx, e)}
                disabled={disabled}
                title="Remove file"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Dropzone Active Area */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`
            ${styles.dropzone}
            ${isDragging ? styles.dragging : ''}
            ${error ? styles.hasError : ''}
            ${disabled ? styles.disabled : ''}
          `}
          onClick={triggerBrowse}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          aria-disabled={disabled}
          aria-label={displayTitle}
        >
          <div className={styles.iconWrapper}>
            {customIcon || (
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            )}
          </div>

          <div className={styles.textGroup}>
            <p className={styles.title}>{displayTitle}</p>
            <p className={styles.subtitle}>
              {displaySubtitle.includes('click to browse') ? (
                <>
                  or <span className={styles.browseLink}>click to browse</span> from your computer
                </>
              ) : (
                displaySubtitle
              )}
            </p>
          </div>

          {displayHint && (
            <span className={styles.hint}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {displayHint}
            </span>
          )}
        </div>
      )}

      {/* Error Message Alert */}
      {error && (
        <div className={styles.errorAlert} role="alert" aria-live="assertive">
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className={styles.errorMessage}>{error.message}</p>
          <button
            type="button"
            className={styles.errorDismissBtn}
            onClick={clearError}
            aria-label="Dismiss error"
            title="Dismiss error"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
