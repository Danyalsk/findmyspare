import * as ImagePicker from "expo-image-picker";
import { API_URL } from "./index";
import { getAccessToken } from "../store";

export type UploadKind =
  | "gst_cert"
  | "product_image"
  | "banner_image"
  | "inquiry_image"
  | "message_image"
  | "message_video";

export interface UploadResult {
  url: string;
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

function guessMime(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "pdf") return "application/pdf";
  if (ext === "mp4") return "video/mp4";
  if (ext === "mov") return "video/quicktime";
  if (ext === "webm") return "video/webm";
  return "image/jpeg";
}

/**
 * Upload a local file URI to the backend (Vercel Blob). Uses multipart/form-data;
 * React Native FormData accepts the `{ uri, name, type }` shape for files.
 */
export async function uploadFile(uri: string, kind: UploadKind): Promise<UploadResult> {
  const type = guessMime(uri);
  const name = uri.split("/").pop() || `upload.${type.split("/")[1] || "jpg"}`;

  const form = new FormData();
  // @ts-expect-error — RN's FormData file shape isn't in the DOM lib types.
  form.append("file", { uri, name, type });
  form.append("kind", kind);

  const token = getAccessToken();
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }
  return res.json();
}

/**
 * Pick an image from the library, then upload it. Returns the hosted URL, or
 * null if the user cancelled.
 */
export async function pickAndUploadImage(kind: UploadKind): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Photo access is needed to upload an image.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.length) return null;

  const uploaded = await uploadFile(result.assets[0].uri, kind);
  return uploaded.url;
}

/**
 * Pick an image OR video from the library and upload it. Returns
 * `{ url, type }` for a chat attachment, or null if cancelled.
 */
export async function pickAndUploadMedia(): Promise<{ url: string; type: "image" | "video" } | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Media access is needed to attach a file.");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    quality: 0.7,
    videoMaxDuration: 60,
  });
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const isVideo = asset.type === "video";
  const uploaded = await uploadFile(asset.uri, isVideo ? "message_video" : "message_image");
  return { url: uploaded.url, type: isVideo ? "video" : "image" };
}
