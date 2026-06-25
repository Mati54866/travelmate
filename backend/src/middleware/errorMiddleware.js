export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Server error";

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    message = "Invalid resource id";
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};
