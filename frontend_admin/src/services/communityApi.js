const API_URL =
  import.meta.env.VITE_COMMUNITY_API_URL || "http://localhost:5000/api";
const token = () => import.meta.env.VITE_ADMIN_TOKEN;

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => ({}))).message ||
        "Unable to reach the Community API.",
    );
  return response.json();
}

export const communityApi = {
  createAnnouncement: (announcement) =>
    request("/notifications/broadcast", {
      method: "POST",
      body: JSON.stringify(announcement),
    }),
  getPosts: () => request("/community-posts"),
  createPost: (post) =>
    request("/community-posts", { method: "POST", body: JSON.stringify(post) }),
  getVotingSlots: () => request("/voting-slots"),
  createVotingSlot: (slot) =>
    request("/voting-slots", { method: "POST", body: JSON.stringify(slot) }),
  relistVotingOption: (slotId, optionId) =>
    request(`/voting-slots/${slotId}/options/${optionId}/relist`, {
      method: "POST",
    }),
  updateVotingProgress: (slotId, progress) =>
    request(`/voting-slots/${slotId}/progress`, {
      method: "PATCH",
      body: JSON.stringify(progress),
    }),
};
