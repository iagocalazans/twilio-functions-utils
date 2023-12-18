/* eslint-disable @typescript-eslint/ban-ts-comment */
type Type = 'String' | 'Object' | 'Unknown' | 'Array' | 'Symbol' | 'Number' | 'Undefined' | 'Null'

export function typeOf (input: any): Type {
  const stringTag = Object.prototype.toString.call(input)
  // @ts-expect-error
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/)?.shift() ?? 'Unknown'
}
