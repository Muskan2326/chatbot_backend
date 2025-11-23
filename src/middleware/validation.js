export function validateChatRequest(req, res, next) {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message field is required',
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message must be a string',
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message cannot be empty',
    });
  }

  if (message.length > 2000) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Message exceeds maximum length of 2000 characters',
    });
  }

  if (sessionId && typeof sessionId !== 'string') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'SessionId must be a string',
    });
  }

  next();
}

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication',
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
}
