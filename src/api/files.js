import { apiUpload } from "./client.js"

export function uploadFile(file, usage, options = { auth: true }) {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("usage", usage)
  return apiUpload("/api/files/upload", fd, options)
}
