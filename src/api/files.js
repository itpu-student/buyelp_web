import { apiUpload } from "./client.js"

export function uploadFile(file, usage) {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("usage", usage)
  return apiUpload("/api/files/upload", fd, { auth: true })
}
