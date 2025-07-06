import { Response } from '../responses/default.response';

export class NotFoundError extends Response {
  constructor(body: string = 'The content you are looking for was not found!') {
    super(`[ NotFoundError ]: ${body}`, 404);
  }
}