import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  updateMetadata,
  type UploadMetadata,
  type UploadTask,
} from "firebase/storage";
import { clientApp } from "../firebase";

const storage = getStorage(clientApp);

export async function uploadFile(
  file: File | Blob,
  path: string,
  metadata?: UploadMetadata,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, path);

    if (onProgress) {
      // Use resumable upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // Simple upload without progress
      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    }
  } catch (error) {
    throw new Error(`Upload failed: ${(error as Error).message}`);
  }
}

// Upload an image (with automatic webp conversion if needed)
export async function uploadImage(
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const metadata: UploadMetadata = {
    contentType: file.type || "image/webp",
  };

  return uploadFile(file, path, metadata, onProgress);
}

// Upload a document
export async function uploadDocument(
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const metadata: UploadMetadata = {
    contentType: file.type || "application/octet-stream",
  };

  return uploadFile(file, path, metadata, onProgress);
}

// Upload a video
export async function uploadVideo(
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const metadata: UploadMetadata = {
    contentType: file.type || "video/mp4",
  };

  return uploadFile(file, path, metadata, onProgress);
}

export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw new Error(`Delete failed: ${(error as Error).message}`);
  }
}

export async function updateFileMetadata(path: string, metadata: UploadMetadata): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await updateMetadata(storageRef, metadata);
  } catch (error) {
    throw new Error(`Update metadata failed: ${(error as Error).message}`);
  }
}

export function fileRef(path: string) {
  return ref(storage, path);
}

// Delete a file using its download URL
export async function deleteFileFromUrl(url: string): Promise<boolean> {
  try {
    if (!url || url.trim() === "") {
      return true;
    }

    const filePath = extractFilePathFromUrl(url);
    if (!filePath) {
      console.warn("Could not extract file path from URL:", url);
      return false;
    }

    await deleteFile(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    return false;
  }
}

// Get download URL for a file (alias with different casing)
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw new Error(`Get URL failed: ${(error as Error).message}`);
  }
}

// Extract file path from Firebase Storage URL
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlParts = url.split("/o/");
    if (urlParts.length > 1) {
      const encodedPath = urlParts[1].split("?")[0];
      return decodeURIComponent(encodedPath);
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to create resumable upload task (for advanced use cases)
export function createUploadTask(
  file: File | Blob,
  path: string,
  metadata?: UploadMetadata
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file, metadata);
}
