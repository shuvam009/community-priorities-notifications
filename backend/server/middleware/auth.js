import jwt from "jsonwebtoken";

export function requireAuth(request, response, next) {
  const token = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : null;
  if (!token)
    return response
      .status(401)
      .json({ message: "Authentication is required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = {
      id: payload.id || payload._id || payload.userId,
      role: payload.role || "citizen",
    };
    if (!request.user.id)
      return response
        .status(401)
        .json({ message: "Invalid authentication token." });
    return next();
  } catch {
    return response
      .status(401)
      .json({ message: "Invalid or expired authentication token." });
  }
}

export function requireModerator(request, response, next) {
  if (!["moderator", "admin"].includes(request.user.role))
    return response
      .status(403)
      .json({ message: "Moderator access is required." });
  return next();
}
