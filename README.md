# Reusable File Dropzone & PDF Uploader Component

A lightweight, accessible, zero-dependency React component that allows users to select files (defaulted for **PDFs up to 10 MB**) via drag-and-drop or clicking to browse. It provides instant client-side validation, human-readable file metrics, removal/change actions, and callback handoffs ready for backend API integration.

---

## 🎯 Requirements Met

- [x] **Accept one PDF at a time, up to 10 MB** (configurable via props).
- [x] **Show the selected file's name and size** with clear badges and formatting.
- [x] **Option to remove and pick another** file.
- [x] **Clear error alerts** if the file is not a PDF, exceeds the 10 MB limit, or fails custom validation.
- [x] **Callback handoff** (`onFileSelect`, `onFileRemove`, `onError`, `onClearError`) to connect directly to upload endpoints.
- [x] **Zero external dependencies**: Built with inline accessible SVGs and scoped CSS variables — easily copy-pasteable into any React project (Vite, Next.js, CRA, Remix).
- [x] **Generic & Customizable**: Easily change file types, size limits, text labels, styling, and validation via props.

---

## 📁 Component Structure (Ready for Extraction)

To use this component in any other project, simply copy the `src/components/FileDropzone` folder:

```
src/components/FileDropzone/
├── FileDropzone.tsx         # Main dropzone React component
├── FileDropzone.module.css  # Encapsulated CSS with customizable CSS variables
├── types.ts                 # Full TypeScript types & interfaces
├── utils.ts                 # File size formatting & MIME validation helpers
└── index.ts                 # Public exports
```

---

## 🚀 Quick Usage Example

```tsx
import { useState } from 'react';
import { FileDropzone } from './components/FileDropzone';

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Uploaded:', result);
  };

  return (
    <div>
      <FileDropzone
        accept={['application/pdf']}
        maxSizeBytes={10 * 1024 * 1024} // 10 MB
        onFileSelect={(selectedFile) => setFile(selectedFile)}
        onFileRemove={() => setFile(null)}
        onError={(err) => console.warn(err.message)}
      />

      {file && (
        <button onClick={handleUpload} style={{ marginTop: '1rem' }}>
          Upload Document
        </button>
      )}
    </div>
  );
}
```

---

## ⚙️ Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `accept` | `string \| string[]` | `['application/pdf']` | MIME types or extensions allowed (e.g. `['application/pdf']` or `['image/png', 'image/jpeg']`). |
| `maxSizeBytes` | `number` | `10485760` (10 MB) | Maximum allowed file size in bytes. |
| `minSizeBytes` | `number` | `undefined` | Optional minimum allowed file size in bytes. |
| `multiple` | `boolean` | `false` | Whether to allow multiple file selection. |
| `maxFiles` | `number` | `5` | Maximum files allowed when `multiple` is true. |
| `disabled` | `boolean` | `false` | Disables drag-and-drop and file browsing. |
| `onFileSelect` | `(file: File) => void` | `undefined` | Callback fired when a valid single file is picked. |
| `onFilesSelect` | `(files: File[]) => void` | `undefined` | Callback fired when multiple files are picked. |
| `onFileRemove` | `(file: File \| null) => void` | `undefined` | Callback fired when a selected file is removed. |
| `onError` | `(error: FileValidationError) => void` | `undefined` | Callback fired when file validation fails. |
| `onClearError` | `() => void` | `undefined` | Callback fired when the error state is dismissed. |
| `customValidator`| `(file: File) => string \| null` | `undefined` | Custom domain validation logic (return string for error message, or `null` if valid). |
| `title` | `string` | Auto-derived | Main heading displayed inside the dropzone. |
| `subtitle` | `string` | `"or click to browse from your computer"` | Subtitle text below title. |
| `hint` | `string` | Auto-derived | Hint text showing accepted formats & limits. |
| `uploadProgress` | `number` | `undefined` | Pass `0` to `100` to render a built-in upload progress bar. |
| `className` | `string` | `""` | Optional CSS class to apply to root container. |
| `style` | `React.CSSProperties` | `undefined` | Optional inline styles. |
| `customIcon` | `ReactNode` | Cloud Upload SVG | Custom icon element to replace the default drop icon. |
| `renderPreview` | `(props) => ReactNode` | Built-in card | Custom render prop for previewing the selected file. |

---

## 🎨 CSS Customization

The component uses scoped CSS variables defined in `FileDropzone.module.css`. You can override them globally or locally:

```css
.myCustomDropzone {
  --fdz-primary: #6366f1;           /* Accent color */
  --fdz-primary-light: #e0e7ff;     /* Background for icon badge */
  --fdz-border-drag: #6366f1;       /* Border when dragging file */
  --fdz-radius: 16px;               /* Corner roundness */
}
```

---

## 🏃 Running the Demo Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Then open `http://localhost:5173/` in your browser.
