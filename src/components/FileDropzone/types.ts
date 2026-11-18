import type { ReactNode } from 'react';

export type FileErrorCode =
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'INVALID_TYPE'
  | 'TOO_MANY_FILES'
  | 'CUSTOM_VALIDATION_ERROR';

export interface FileValidationError {
  code: FileErrorCode;
  message: string;
  file?: File;
}

export interface FileDropzoneProps {
  /**
   * Accepted MIME types or extensions.
   * Can be an array (e.g. `['application/pdf']` or `['.pdf', '.png']`)
   * or a comma-separated string (e.g. `application/pdf,.pdf`).
   * Default: `['application/pdf']`
   */
  accept?: string | string[];

  /**
   * Maximum file size in bytes.
   * Default: `10 * 1024 * 1024` (10 MB).
   */
  maxSizeBytes?: number;

  /**
   * Optional minimum file size in bytes.
   */
  minSizeBytes?: number;

  /**
   * Whether to allow multiple files or only one.
   * Default: `false` (single file mode)
   */
  multiple?: boolean;

  /**
   * Maximum number of files allowed if `multiple` is true.
   * Default: `5`
   */
  maxFiles?: number;

  /**
   * Whether the dropzone is disabled.
   * Default: `false`
   */
  disabled?: boolean;

  /**
   * Callback fired when a valid single file is selected.
   */
  onFileSelect?: (file: File) => void;

  /**
   * Callback fired when multiple files are selected (if `multiple` is true).
   */
  onFilesSelect?: (files: File[]) => void;

  /**
   * Callback fired when a selected file is removed.
   */
  onFileRemove?: (removedFile: File | null) => void;

  /**
   * Callback fired when a validation error occurs.
   */
  onError?: (error: FileValidationError) => void;

  /**
   * Callback fired when error state is cleared.
   */
  onClearError?: () => void;

  /**
   * Optional custom validation function for domain-specific checks.
   * Return an error message string if invalid, or `null` if valid.
   */
  customValidator?: (file: File) => string | null;

  /**
   * Initial file if pre-populating.
   */
  value?: File | null;

  /**
   * Main heading label inside the dropzone.
   * Default: `"Drag & drop your PDF here"`
   */
  title?: string;

  /**
   * Subtitle text below title.
   * Default: `"or click to browse from your computer"`
   */
  subtitle?: string;

  /**
   * Hint text shown at bottom of dropzone.
   * Default displays configured format and size limit.
   */
  hint?: string;

  /**
   * Optional progress percentage (0 - 100) to render an upload progress bar.
   */
  uploadProgress?: number;

  /**
   * Custom CSS class name for the wrapper.
   */
  className?: string;

  /**
   * Custom inline styles for the wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Custom icon element to replace the default drop icon.
   */
  customIcon?: ReactNode;

  /**
   * Optional render prop for customizing the file preview card.
   */
  renderPreview?: (props: {
    file: File;
    formattedSize: string;
    onRemove: () => void;
    disabled?: boolean;
    progress?: number;
  }) => ReactNode;
}
