/** Thrown by getCurrentUserId() when there is no valid session. handleError()
 *  maps it to a 401 response. */
export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
