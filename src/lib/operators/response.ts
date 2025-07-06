import { Observable, of, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from '../responses/default.response';
import { TwiMLResponse } from '../responses/twiml.response';
import * as twilio from 'twilio';

/**
 * Creates a JSON response from the stream data
 */
export const toJsonResponse = <T = any>(
  statusCode: number = 200,
  headers?: { [key: string]: string }
) =>
  pipe(
    map((data: T) => {
      const response = new Response(data as any, statusCode);
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          response.appendHeader(key, value);
        });
      }
      return response;
    })
  );

/**
 * Creates a successful JSON response (200)
 */
export const ok = <T = any>(headers?: { [key: string]: string }) =>
  toJsonResponse<T>(200, headers);

/**
 * Creates a created response (201)
 */
export const created = <T = any>(headers?: { [key: string]: string }) =>
  toJsonResponse<T>(201, headers);

/**
 * Creates an accepted response (202)
 */
export const accepted = <T = any>(headers?: { [key: string]: string }) =>
  toJsonResponse<T>(202, headers);

/**
 * Creates a no content response (204)
 */
export const noContent = () =>
  pipe(
    map(() => new Response('', 204))
  );

/**
 * Creates a TwiML response from VoiceResponse
 */
export const toTwiMLResponse = () =>
  pipe(
    map((twiml: any) => {
      if (typeof twiml === 'string') {
        return new TwiMLResponse(twiml);
      }
      return new TwiMLResponse(twiml.toString());
    })
  );

/**
 * Maps data to a custom response
 */
export const toResponse = <T = any>(
  responseFactory: (data: T) => Response
) =>
  pipe(
    map((data: T) => responseFactory(data))
  );

/**
 * Creates a redirect response
 */
export const redirect = (url: string, statusCode: number = 302) =>
  pipe(
    map(() => {
      const response = new Response('', statusCode);
      response.appendHeader('Location', url);
      return response;
    })
  );

/**
 * Sets response headers
 */
export const withHeaders = (headers: { [key: string]: string }) =>
  pipe(
    map((response: Response) => {
      Object.entries(headers).forEach(([key, value]) => {
        response.appendHeader(key, value);
      });
      return response;
    })
  );

/**
 * Sets a single response header
 */
export const withHeader = (key: string, value: string) =>
  pipe(
    map((response: Response) => {
      response.appendHeader(key, value);
      return response;
    })
  );

/**
 * Wraps data in a standard API response format
 */
export const apiResponse = <T = any>(
  options: {
    success?: boolean;
    message?: string;
    meta?: any;
  } = {}
) =>
  pipe(
    map((data: T) => {
      const response = {
        success: options.success ?? true,
        data,
        ...(options.message && { message: options.message }),
        ...(options.meta && { meta: options.meta })
      };
      return new Response(response);
    })
  );