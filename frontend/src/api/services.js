import client from "./client";

export const authApi = {
  register: (payload) => client.post("/auth/register", payload),
  login: (payload) => client.post("/auth/login", payload),
  google: (payload) => client.post("/auth/google", payload),
  me: () => client.get("/auth/me"),
  updateProfile: (payload) => client.put("/auth/profile", payload),
  changePassword: (payload) => client.put("/auth/change-password", payload),
  forgotPassword: (payload) => client.post("/auth/forgot-password", payload),
  resetPassword: (payload) => client.post("/auth/reset-password", payload),
};

export const guidesApi = {
  getAll: (params) => client.get("/guides", { params }),
  getOne: (id) => client.get(`/guides/${id}`),
  getMyProfile: () => client.get("/guides/profile/me"),
  getTours: (id) => client.get(`/guides/${id}/tours`),
  getReviews: (id) => client.get(`/guides/${id}/reviews`),
  createProfile: (payload) => client.post("/guides/profile", payload),
  updateProfile: (payload) => client.put("/guides/profile", payload),
  toggleAvailability: () => client.put("/guides/availability"),
};

export const toursApi = {
  getAll: (params) => client.get("/tours", { params }),
  getOne: (id) => client.get(`/tours/${id}`),
  create: (payload) => client.post("/tours", payload),
  update: (id, payload) => client.put(`/tours/${id}`, payload),
  remove: (id) => client.delete(`/tours/${id}`),
  getMyTours: () => client.get("/tours/guide/my-tours"),
};

export const bookingsApi = {
  create: (payload) => client.post("/bookings", payload),
  getMine: () => client.get("/bookings/my-bookings"),
  getGuideBookings: () => client.get("/bookings/guide-bookings"),
  getOne: (id) => client.get(`/bookings/${id}`),
  confirm: (id) => client.put(`/bookings/${id}/confirm`),
  cancel: (id) => client.put(`/bookings/${id}/cancel`),
  complete: (id) => client.put(`/bookings/${id}/complete`),
};

export const reviewsApi = {
  create: (payload) => client.post("/reviews", payload),
  getGuide: (guideId) => client.get(`/reviews/guide/${guideId}`),
  getMine: () => client.get("/reviews/my-reviews"),
  update: (id, payload) => client.put(`/reviews/${id}`, payload),
  remove: (id) => client.delete(`/reviews/${id}`),
};

export const adminApi = {
  getOverview: () => client.get("/admin/overview"),
  getUsers: (params) => client.get("/admin/users", { params }),
  getGuides: (params) => client.get("/admin/guides", { params }),
  deleteUser: (id) => client.delete(`/admin/users/${id}`),
  deleteGuide: (id) => client.delete(`/admin/guides/${id}`),
};

export const uploadApi = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return client.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return client.post("/upload/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (publicId) =>
    client.delete(`/upload/image/${encodeURIComponent(publicId)}`),
};
