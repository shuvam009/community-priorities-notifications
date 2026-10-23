const API_URL =
  import.meta.env.VITE_COMMUNITY_API_URL || "http://localhost:5000/api";
const token = () => import.meta.env.VITE_CITIZEN_TOKEN;

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
        "Community API request failed.",
    );
  return response.json();
}

export const communityApi = {
  getNotifications: () => request("/notifications"),
  markNotificationRead: (notificationId) =>
    request(`/notifications/${notificationId}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    request("/notifications/read-all", { method: "PATCH" }),
  getCommunityPosts: () => request("/community-posts"),
  postReview: (postId, review) =>
    request(`/community-posts/${postId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    }),
  getVotingSlots: () => request("/voting-slots"),
  voteInSlot: (slotId, optionId) =>
    request(`/voting-slots/${slotId}/options/${optionId}/vote`, {
      method: "POST",
    }),
};
