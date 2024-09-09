import { ApolloError, ServerError, ServerParseError } from '@apollo/client';
import { GraphQLErrors } from '@apollo/client/errors';

import { HTTP_STATUS } from '@/types/enum/http';

class ApiError extends Error implements ApolloError {
  graphQLErrors: GraphQLErrors;
  protocolErrors;
  clientErrors: readonly Error[];
  networkError: Error | ServerParseError | ServerError | null;
  extraInfo: any;
  name:
    | 'BadRequestError'
    | 'ApiForbiddenError'
    | 'ApiNotFoundError'
    | 'ApiInternalServerError'
    | 'ApiError';

  constructor(error: ApolloError) {
    super(error.message);
    this.graphQLErrors = error.graphQLErrors;
    this.protocolErrors = error.protocolErrors;
    this.clientErrors = error.clientErrors;
    this.networkError = error.networkError;
    this.extraInfo = error.extraInfo;

    const statusCode = (error.networkError as ServerError).statusCode;

    switch (statusCode) {
      case HTTP_STATUS.BAD_REQUEST: // 400
        this.name = 'BadRequestError';
        break;
      case HTTP_STATUS.FORBIDDEN: // 403
        this.name = 'ApiForbiddenError';
        break;
      case HTTP_STATUS.NOT_FOUND: // 404
        this.name = 'ApiNotFoundError';
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR: // 500
        this.name = 'ApiInternalServerError';
        break;
      default:
        this.name = 'ApiError';
        break;
    }
  }
}

export default ApiError;
