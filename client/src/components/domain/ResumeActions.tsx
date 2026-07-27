import { useCallback, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "../ui/Button";
import { ResumePreviewModal } from "./ResumePreviewModal";
import { api } from "../../lib/api";

interface ResumeActionsProps {
  fileName: string;
  mimeType: string;
  seekerId?: string;
  size?: "sm" | "md";
}

export function ResumeActions({ fileName, mimeType, seekerId, size = "sm" }: ResumeActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchBlob = useCallback(
    () => (seekerId ? api.fetchSeekerResume(seekerId, true) : api.fetchMyResume(true)),
    [seekerId]
  );

  const handleDownload = async () => {
    if (seekerId) {
      await api.downloadResume(seekerId, fileName);
    } else {
      await api.downloadMyResume(fileName);
    }
  };

  return (
    <>
      <Button variant="ghost" size={size} onClick={() => setPreviewOpen(true)} aria-label="Preview resume">
        <Eye className="h-4 w-4" />
      </Button>

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileName={fileName}
        mimeType={mimeType}
        onDownload={handleDownload}
        fetchBlob={fetchBlob}
      />
    </>
  );
}
