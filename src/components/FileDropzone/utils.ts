/**
 * Format bytes into human-readable string (e.g. 2.45 MB)
 */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} ${sizes[index]}`;
}

/**
 * Normalizes accept prop to array of mime types or extensions
 */
export function normalizeAccept(accept?: string | string[]): string[] {
  if (!accept) return ['application/pdf'];
  if (Array.isArray(accept)) {
    return accept.map((item) => item.trim().toLowerCase());
  }
  return accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Check if a file matches the accepted formats (MIME type or extension)
 */
export function isFileAccepted(file: File, acceptedRules: string[]): boolean {
  if (!acceptedRules.length || acceptedRules.includes('*') || acceptedRules.includes('*/*')) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  return acceptedRules.some((rule) => {
    // Check wildcard mime (e.g. "image/*")
    if (rule.endsWith('/*')) {
      const typePrefix = rule.replace('/*', '');
      return fileType.startsWith(typePrefix);
    }

    // Check extension (e.g. ".pdf")
    if (rule.startsWith('.')) {
      return fileName.endsWith(rule);
    }

    // Check exact MIME match (e.g. "application/pdf")
    if (rule === fileType) {
      return true;
    }

    // Fallback: if rule is "pdf", check both type and extension
    if (!rule.includes('/')) {
      return fileName.endsWith(`.${rule}`) || fileType.includes(rule);
    }

    return false;
  });
}

/**
 * Derives a readable label from accept patterns (e.g., "PDF", "PDF, PNG, JPG")
 */
export function formatAcceptSummary(acceptedRules: string[]): string {
  if (!acceptedRules.length) return 'Any file';
  return acceptedRules
    .map((rule) => {
      if (rule === 'application/pdf' || rule === '.pdf') return 'PDF';
      if (rule.startsWith('.')) return rule.slice(1).toUpperCase();
      if (rule.includes('/')) return rule.split('/')[1].toUpperCase();
      return rule.toUpperCase();
    })
    .join(', ');
}
