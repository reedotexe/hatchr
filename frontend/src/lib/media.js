export function resolveMediaUrl(url){
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  // treat as local path served by backend
  const backend = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  // ensure leading slash
  const p = url.startsWith('/') ? url : `/${url}`
  return `${backend}${p}`
}

export default resolveMediaUrl
