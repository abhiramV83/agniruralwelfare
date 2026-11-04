let accessToken = null;
let refreshPromise = null;
let onSession = () => {};
export function setSession(data) {
  accessToken = data?.accessToken || null;
  onSession(data?.user || null);
}
export function subscribeSession(fn) {
  onSession = fn;
  return () => {
    onSession = () => {};
  };
}
export async function refreshSession() {
  if (!refreshPromise)
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) {
          setSession(null);
          return null;
        }
        const data = await r.json();
        setSession(data);
        return data;
      })
      .catch(() => {
        setSession(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  return refreshPromise;
}
export async function api(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, {
    ...options,
    body,
    headers,
    credentials: "include",
  });
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const renewed = await refreshSession();
    if (renewed) return api(path, options, false);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({
      message: "The server could not complete this request.",
    }));
    throw Object.assign(new Error(data.message), {
      status: res.status,
      errors: data.errors,
    });
  }
  if (options.blob) {
    const blob = await res.blob();
    blob.downloadName = res.headers
      .get("content-disposition")
      ?.match(/filename="([^"/\\]+)"/)?.[1];
    return blob;
  }
  return res.status === 204 ? null : res.json();
}
export async function download(path, filename, options = {}) {
  const blob = await api(path, { ...options, blob: true });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = blob.downloadName || filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function formData(values) {
  const form = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (v instanceof FileList) {
      if (v[0]) form.append(k, v[0]);
    } else if (v !== undefined && v !== null) form.append(k, v && typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  return form;
}
