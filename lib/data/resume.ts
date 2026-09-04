/**
 * Resume Download Action Abstraction.
 * 
 * Resume is a downloadable document, not an application window.
 * This abstraction provides the hook for triggering the PDF download
 * once an actual PDF asset is supplied in /public.
 */

export interface ResumeConfig {
  available: boolean;
  filename: string;
  downloadPath: string;
}

export function getResumeConfig(): ResumeConfig {
  return {
    available: false, // Toggle to true once resume.pdf is added in /public
    filename: "Software-Engineer-Resume.pdf",
    downloadPath: "/resume.pdf",
  };
}

export function executeResumeDownload(
  notify?: (message: string, isSuccess: boolean) => void
): void {
  if (typeof window === "undefined") return;

  fetch("/resume.pdf", { method: "HEAD" })
    .then((res) => {
      if (res.ok) {
        const link = document.createElement("a");
        link.href = "/resume.pdf";
        link.download = "Software-Engineer-Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify?.("Initiating resume download...", true);
      } else {
        notify?.("Resume pending: Place resume.pdf in /public/ to enable direct download.", false);
      }
    })
    .catch(() => {
      notify?.("Resume pending: Place resume.pdf in /public/ to enable direct download.", false);
    });
}
