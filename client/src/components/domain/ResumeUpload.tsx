import { useRef } from "react";
import { Upload, FileText, Trash2, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { ResumeActions } from "./ResumeActions";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import { formatDateTime } from "../../lib/utils";

interface ResumeUploadProps {
  compact?: boolean;
  showProfileUpdated?: boolean;
}

export function ResumeUpload({ compact = false, showProfileUpdated = false }: ResumeUploadProps) {
  const { me, setMe } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await api.uploadResume(file);
    const updated = await api.getMe();
    setMe(updated);
    e.target.value = "";
  };

  const deleteResume = async () => {
    await api.deleteResume();
    const updated = await api.getMe();
    setMe(updated);
  };

  const profileUpdated = me?.seekerProfile?.updatedAt;

  if (me?.resume) {
    return (
      <div className="space-y-2">
        {showProfileUpdated && profileUpdated && (
          <p className="text-xs text-muted">Profile last updated {formatDateTime(profileUpdated)}</p>
        )}
        <div className="flex items-center justify-between rounded-xl p-4 glass">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-8 w-8 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-theme truncate">{me.resume.fileName}</p>
              <p className="text-xs text-muted">{(me.resume.fileSize / 1024).toFixed(0)} KB</p>
              <p className="text-xs text-muted mt-0.5">Resume updated {formatDateTime(me.resume.uploadedAt)}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <ResumeActions
              fileName={me.resume.fileName}
              mimeType={me.resume.mimeType}
              resumeKey={me.resume.id}
            />
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Replace resume">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={deleteResume} aria-label="Delete resume">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showProfileUpdated && profileUpdated && (
        <p className="text-xs text-muted">Profile last updated {formatDateTime(profileUpdated)}</p>
      )}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed border-theme text-center transition-colors hover:border-[var(--color-accent)]/40 ${compact ? "p-6" : "p-8"}`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
        <Upload className={`mx-auto text-muted mb-3 ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
        <p className="text-sm text-muted">Click to upload your resume</p>
        <p className="text-xs text-muted/70 mt-1">PDF, DOC, DOCX up to 5MB</p>
      </div>
    </div>
  );
}
