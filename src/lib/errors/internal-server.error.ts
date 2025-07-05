import { Response } from '../responses/default.response';

export class InternalServerError extends Response {
  constructor(body: string = 'The server encountered an unexpected condition that prevented it from fulfilling the request!') {
    super(`[ InternalServerError ]: ${body}`, 500);
  }
}