require('../../lib/twilio.mock');
import { NotFoundError } from '../../src/index';

describe('NotFoundError Class', () => {
  it('Should be an Instance of Response', () => {
    const response = new NotFoundError();

    expect(response).toBeInstanceOf(NotFoundError);
    expect(response.body).toMatch('[ NotFoundError ]: The content you are looking for was not found!');
  });

  it('Should have body value equal "My awesome response!" and "Content-Type" equal "text/plain"', () => {
    const response = new NotFoundError('My awesome Error!');

    expect(response.body).toMatch('My awesome Error!');
    expect(response.headers['Content-Type']).toMatch('text/plain');
  });
});
