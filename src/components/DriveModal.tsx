import React, { useState, useEffect } from "react";
import {
  X,
  HardDrive,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import {
  listDriveFiles,
  readDriveFileContent,
  deleteDriveFile,
  DriveFileItem,
} from "../services/driveService";
import { googleSignIn, getAccessToken } from "../services/firebase";
import { ConfirmModal } from "./ConfirmModal";

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportContent?: (text: string, title: string) => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  onImportContent,
}) => {
  const [hasToken, setHasToken] = useState(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<DriveFileItem | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkTokenAndLoadFiles();
    }
  }, [isOpen]);

  const checkTokenAndLoadFiles = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        setHasToken(true);
        loadFiles();
      } else {
        setHasToken(false);
        setFiles([]);
      }
    } catch (e) {
      setHasToken(false);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const driveFiles = await listDriveFiles();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error("Error loading drive files:", err);
      setErrorMessage(err.message || "Failed to load files from Google Drive.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInGoogle = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        setHasToken(true);
        await loadFiles();
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      setErrorMessage(
        "Could not sign in with Google or access was denied. Please review the permissions requested."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFile = async (file: DriveFileItem) => {
    setImportingFileId(file.id);
    setErrorMessage(null);
    try {
      const text = await readDriveFileContent(file.id, file.mimeType);
      if (!text || text.trim().length === 0) {
        throw new Error("This file is empty or contains unsupported binary formatting.");
      }
      if (onImportContent) {
        onImportContent(text, file.name);
        setSuccessNotice(`Imported "${file.name}" into your study workspace!`);
        setTimeout(() => {
          setSuccessNotice(null);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to read file content from Drive.");
    } finally {
      setImportingFileId(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!selectedFileForDelete) return;
    setIsLoading(true);
    try {
      await deleteDriveFile(selectedFileForDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== selectedFileForDelete.id));
      setSelectedFileForDelete(null);
      setSuccessNotice("File deleted from your Google Drive with your confirmation.");
      setTimeout(() => setSuccessNotice(null), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete file.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          id="drive-integration-modal"
          className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl text-left max-h-[85vh] flex flex-col"
          role="dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Google Drive Documents
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Import study notes or export generated quizzes & flashcards
                </p>
              </div>
            </div>
            <button
              id="btn-close-drive"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {!hasToken ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mb-3">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Connect Google Drive
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Access your course documents, class slides, and lecture notes directly inside
                  StudyAI to generate instant summaries and practice questions.
                </p>

                {/* Official GSI Material Button styling as mandated by Workspace skill */}
                <div className="mt-5 flex justify-center">
                  <button
                    id="btn-drive-google-signin"
                    onClick={handleSignInGoogle}
                    disabled={isLoading}
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 shadow-xs font-medium text-xs transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>{isLoading ? "Connecting..." : "Sign in with Google to Connect Drive"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Your Drive Files ({files.length})
                  </span>
                  <button
                    onClick={loadFiles}
                    disabled={isLoading}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {isLoading && files.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Scanning your Google Drive files...
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No text or document files found in your Google Drive.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-zinc-800/60 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {file.mimeType.split("/").pop()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onImportContent && (
                            <button
                              onClick={() => handleImportFile(file)}
                              disabled={importingFileId === file.id}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>{importingFileId === file.id ? "Loading..." : "Use in Study"}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedFileForDelete(file)}
                            className="p-1 text-zinc-400 hover:text-red-600 rounded-md transition-colors"
                            title="Delete file (with confirmation)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>StudyAI operates with explicit user permission.</span>
            <button onClick={onClose} className="hover:underline font-medium">
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for File Deletion */}
      <ConfirmModal
        isOpen={Boolean(selectedFileForDelete)}
        title="Delete Google Drive File?"
        message={`Are you sure you want to permanently delete "${selectedFileForDelete?.name}" from your Google Drive? This action cannot be undone.`}
        confirmLabel="Delete from Drive"
        cancelLabel="Keep File"
        isDestructive={true}
        onConfirm={confirmDeleteFile}
        onCancel={() => setSelectedFileForDelete(null)}
      />
    </>
  );
};
