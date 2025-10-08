import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  updateMetadata,
  UploadMetadata,
  UploadTask,
} from "firebase/storage";
import { clientApp } from "../firebase";

const storage = getStorage(clientApp);

/**
 * Uploads a File or Blob to Firebase Storage at the specified path.
 *
 * If an `onProgress` callback is provided, a resumable upload is used and progress updates are reported.
 *
 * @param onProgress - Optional callback invoked with upload progress as a percentage (0 to 100)
 * @returns The download URL of the uploaded file
 */
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
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

/**
 * Uploads an image to storage and returns its download URL.
 *
 * The upload uses the file's MIME type for metadata or defaults to `image/webp` when absent.
 *
 * @param file - Image data as a File or Blob
 * @param path - Destination storage path (relative to the storage bucket)
 * @param onProgress - Optional callback invoked with upload progress as a percentage (0–100)
 * @returns The download URL of the uploaded image
 */
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

/**
 * Uploads a document file to Firebase Storage and returns its download URL.
 *
 * @param file - The document `File` or `Blob` to upload.
 * @param path - Destination storage path (including any desired folders and filename).
 * @param onProgress - Optional callback invoked with upload progress as a percentage (0–100).
 * @returns The download URL of the uploaded file.
 */
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

/**
 * Uploads a video file to the specified storage path.
 *
 * Sets the upload metadata contentType from `file.type` or uses `"video/mp4"` if `file.type` is empty.
 *
 * @param file - The video file or blob to upload
 * @param path - Destination storage path (e.g., `videos/user123/clip.mp4`)
 * @param onProgress - Optional callback invoked with upload progress as a percentage (0–100)
 * @returns The download URL of the uploaded video
 */
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

/**
 * Update metadata for a storage object at the specified path.
 *
 * @param path - The storage path of the object whose metadata will be updated (e.g., "folder/file.png").
 * @param metadata - The metadata to apply to the storage object.
 * @throws Error when the metadata update fails; message is prefixed with "Update metadata failed:" followed by the underlying error message.
 */
export async function updateFileMetadata(
  path: string,
  metadata: UploadMetadata
): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await updateMetadata(storageRef, metadata);
  } catch (error) {
    throw new Error(
      `Update metadata failed: ${(error as Error).message}`
    );
  }
}

/**
 * Deletes the object stored at the specified storage path.
 *
 * @param path - The storage path of the file to delete (for example, "folder/file.ext")
 * @throws An Error when deletion fails; the error message is prefixed with "Delete failed:"
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw new Error(`Delete failed: ${(error as Error).message}`);
  }
}

/**
 * Deletes the storage object referenced by a Firebase Storage download URL.
 *
 * Attempts to extract the storage path from the provided `url` and delete that object.
 *
 * @param url - The Firebase Storage download URL of the file to delete. An empty or whitespace-only string is treated as already absent.
 * @returns `true` if the file was deleted or the `url` was empty, `false` if the path could not be extracted or deletion failed.
 */
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

/**
 * Retrieve the download URL for a storage object at the given path.
 *
 * @param path - The storage path to the file (relative to the bucket root)
 * @returns The file's download URL
 * @throws Error when the download URL cannot be retrieved; message is prefixed with "Get URL failed: "
 */
export async function getFileUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw new Error(`Get URL failed: ${(error as Error).message}`);
  }
}

/**
 * Extracts the storage object path from a Firebase Storage download URL.
 *
 * @param url - The Firebase Storage download URL to parse
 * @returns The decoded storage path (for example `folder/file.png`) if parsing succeeds, `null` otherwise
 */
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

/**
 * Creates a resumable upload task for uploading a file to the given storage path.
 *
 * @param file - The File or Blob to upload.
 * @param path - Destination storage path for the uploaded file.
 * @param metadata - Optional upload metadata (for example `contentType` or custom metadata).
 * @returns An UploadTask representing the resumable upload operation.
 */
export function createUploadTask(
  file: File | Blob,
  path: string,
  metadata?: UploadMetadata
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file, metadata);
}