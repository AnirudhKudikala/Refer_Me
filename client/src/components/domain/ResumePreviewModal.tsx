import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText } from "lucide-react";
import { Button } from "../ui/Button";

interface ResumePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  mimeType: string;
  onDownload: () => void;
  fetchBlob: () => Promise<Blob>;
}

export function ResumePreviewModal({
  open,
  onClose,
  fileName,
  mimeType,
  onDownload,
  fetchBlob,
}: ResumePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPreview = mimeType === "application/pdf";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      return;
    }

    if (!canPreview) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBlob()
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load resume preview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, canPreview, fetchBlob]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-preview-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="pointer-events-auto flex w-full max-w-4xl max-h-[min(90vh,820px)] flex-col glass rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-theme px-6 py-4 shrink-0">
                <div className="min-w-0">
                  <h2 id="resume-preview-title" className="text-lg font-semibold text-theme truncate">
                    {fileName}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Resume preview</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={onDownload}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close preview">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-black/10">
                {!canPreview ? (
                  <div className="flex h-[min(70vh,640px)] flex-col items-center justify-center gap-4 p-8 text-center">
                    <FileText className="h-12 w-12 text-muted" />
                    <p className="text-sm text-muted max-w-sm">
                      In-browser preview is available for PDF files. Download this resume to open it locally.
                    </p>
                    <Button onClick={onDownload}>
                      <Download className="h-4 w-4" /> Download Resume
                    </Button>
                  </div>
                ) : loading ? (
                  <div className="flex h-[min(70vh,640px)] items-center justify-center text-sm text-muted">
                    Loading preview...
                  </div>
                ) : error ? (
                  <div className="flex h-[min(70vh,640px)] flex-col items-center justify-center gap-4 p-8 text-center">
                    <p className="text-sm text-muted">{error}</p>
                    <Button variant="secondary" onClick={onDownload}>
                      <Download className="h-4 w-4" /> Download instead
                    </Button>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    title={`Preview of ${fileName}`}
                    src={previewUrl}
                    className="h-[min(70vh,640px)] w-full border-0 bg-white"
                  />
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
