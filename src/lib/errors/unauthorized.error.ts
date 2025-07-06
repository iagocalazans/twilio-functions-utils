import { Response } from '../responses/default.response';

export class UnauthorizedError extends Response {
  constructor(body: string = 'The received request could not be verified!') {
    super(`[ UnauthorizedError ]: ${body}`, 401);
  }
}