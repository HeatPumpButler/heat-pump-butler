import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { storage } from "./firebase.js";

/** Uploads a photo file for a job, returns { storagePath, downloadURL }. */
export async function uploadJobPhoto(jobId, file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `jobs/${jobId}/${photoId}.${ext}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadURL = await getDownloadURL(storageRef);
  return { storagePath, downloadURL, photoId };
}

export async function deleteJobPhoto(storagePath) {
  await deleteObject(ref(storage, storagePath));
}

export async function getPhotoUrl(storagePath) {
  return getDownloadURL(ref(storage, storagePath));
}
