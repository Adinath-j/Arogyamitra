export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.') || 'body'}: ${firstIssue.message}` : 'Validation error';
      return res.status(400).json({ detail: message, errors: result.error.issues });
    }
    req.body = result.data;
    next();
  };
}
