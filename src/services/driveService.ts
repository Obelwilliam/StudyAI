import { getAccessToken } from "./firebase";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

/**
 * List files from user's Google Drive
 */
export async function listDriveFiles(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Drive access token not available. Please sign in with Google.");
  }

  // Filter for readable study files: text, docs, pdfs, markdown
  const query = encodeURIComponent("trashed = false and (mimeType contains 'text' or mimeType contains 'document' or mimeType contains 'pdf' or mimeType contains 'presentation' or mimeType = 'application/vnd.google-apps.document')");
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=25&q=${query}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || "Failed to list Google Drive files");
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Download file text content from Google Drive
 */
export async function readDriveFileContent(fileId: string, mimeType: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Drive access token not available.");
  }

  let fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  // Google Docs cannot be downloaded with ?alt=media; must be exported as text/plain
  if (mimeType === "application/vnd.google-apps.document") {
    fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  }

  const response = await fetch(fetchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to read file from Google Drive: ${errorText}`);
  }

  return await response.text();
}

/**
 * Save study notes, summary, quiz, or flashcards to user's Google Drive
 */
export async function saveFileToDrive(params: {
  filename: string;
  content: string;
  mimeType?: string;
}): Promise<{ id: string; name: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Drive access token not available.");
  }

  const { filename, content, mimeType = "text/plain" } = params;

  const metadata = {
    name: filename,
    mimeType: mimeType,
    description: "Exported study material from StudyAI",
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to save to Google Drive: ${err}`);
  }

  return await response.json();
}

/**
 * Delete a file from user's Google Drive.
 * MANDATORY: Workspace skill dictates explicit user confirmation prior to calling this!
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("Google Drive access token not available.");
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete file from Google Drive.");
  }

  return true;
}
