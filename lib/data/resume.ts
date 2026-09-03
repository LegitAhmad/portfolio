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
  const config = getResumeConfig();

  if (!config.available) {
    notify?.(
      "Resume download: Asset pending in /public/ (Action abstraction active)",
      false
    );
    return;
  }

  if (typeof window !== "undefined") {
    const link = document.createElement("a");
    link.href = config.downloadPath;
    link.download = config.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify?.("Initiating resume download...", true);
  }
}
