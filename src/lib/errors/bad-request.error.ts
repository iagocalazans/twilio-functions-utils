import { Response } from '../responses/default.response';

export class BadRequestError extends Response {
  constructor(body: string = 'The request sent to the server is invalid or corrupted!') {
    super(`[ BadRequestError ]: ${body}`, 400);
  }
}