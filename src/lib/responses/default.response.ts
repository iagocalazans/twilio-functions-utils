/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* global Twilio */

import _ from 'lodash'
import { typeOf } from 'try2catch'

export class Response extends Twilio.Response {
  constructor (body = {}, statusCode = 200) {
    super({ statusCode })

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*')
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type')
      this.appendHeader('Content-Type', 'text/plain')
      this.setBody(body)

      return
    }

    this.appendHeader('Access-Control-Allow-Origin', '*')
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type')
    this.appendHeader('Content-Type', 'application/json')

    if (typeOf(body) !== 'Array') {
      this.setBody(_.omit(body, [
        '_version',
        '_solution',
        '_context',
        // @ts-expect-error
        _.isFunction]))
    } else {
      this.setBody(body)
    }
  }
}
