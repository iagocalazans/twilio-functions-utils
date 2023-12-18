export const extract = <X, Y extends keyof X>(property: Y) => function (el: X) {
  return el[property]
}

type InstanceType<T, Z> = new (data: Z) => T

export const factory = <T, Z>(Instance: InstanceType<T, Z>) => function (ob: Z): T {
  return new Instance(ob)
}
