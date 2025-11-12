class ApiError extends Error {
  constructor(
    statusCode,
    message = "something went wrong",
    errors = [],
    statck = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    // placeholder for any data
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    //can skip this statck
    if (statck) {
      this.stack = statck;
    } else {
      //ensures the stack trace points to this error, not the internal Error constructor.
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
