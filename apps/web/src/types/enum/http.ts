export enum HTTP_STATUS {
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.3
   *
   * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
   */
  BAD_GATEWAY = 502,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.1
   *
   * This response means that server could not understand the request due to invalid syntax.
   */
  BAD_REQUEST = 400,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.8
   *
   * This response is sent when a request conflicts with the current state of the server.
   */
  CONFLICT = 409,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.3
   *
   * The client does not have access rights to the content, i.e. they are unauthorized, so server is rejecting to give proper response. Unlike 401, the client's identity is known to the server.
   */
  FORBIDDEN = 403,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.5
   *
   * This error response is given when the server is acting as a gateway and cannot get a response in time.
   */
  GATEWAY_TIMEOUT = 504,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.6
   *
   * The HTTP version used in the request is not supported by the server.
   */
  HTTP_VERSION_NOT_SUPPORTED = 505,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.1
   *
   * The server encountered an unexpected condition that prevented it from fulfilling the request.
   */
  INTERNAL_SERVER_ERROR = 500,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.4
   *
   * The server can not find requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurence on the web.
   */
  NOT_FOUND = 404,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.6.2
   *
   * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
   */
  NOT_IMPLEMENTED = 501,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.3.1
   *
   * The request has succeeded. The meaning of a success varies depending on the HTTP method:
   * GET: The resource has been fetched and is transmitted in the message body.
   * HEAD: The entity headers are in the message body.
   * POST: The resource describing the result of the action is transmitted in the message body.
   * TRACE: The message body contains the request message as received by the server
   */
  OK = 200,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc6585#section-4
   *
   * The user has sent too many requests in a given amount of time ("rate limiting").
   */
  TOO_MANY_REQUESTS = 429,
  /**
   * Official Documentation @ https://tools.ietf.org/html/rfc7235#section-3.1
   *
   * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
   */
  UNAUTHORIZED = 401,
}
