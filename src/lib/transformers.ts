type NeutralConstructor<T> = {
  new (): NeutralServerlessInstance<T>;
};

export class NeutralServerlessInstance<T> {
  fetch(): Omit<T, 'fetch'> {
    //@ts-expect-error
    return this
  }
}

/**
 * 
 * @param ob 
 * @param Instance
 * @example
 * 
 * class Human extends NeutralServerlessInstance<Human> {
 *   size: number
 *   name: string
 *   age: number
 * }
 *
 * const generator = transformToInstance({nome: 'Iago', idade: 31, altura: 178}, Human)
 *
 * const human = generator({ altura: 'size', idade: 'age', nome: 'name' })
 * human.age // 31
 * human.name // Iago
 * human.size // 178
 * 
 * @returns Instance
 */
export const transformToInstance = <X extends Object, Y extends  NeutralServerlessInstance<Y>>(ob: X, Instance: NeutralConstructor<Y>) => function (ref: Record<keyof X, keyof Y>) {
  const properties = Object.getOwnPropertyNames(ob) as [keyof X];
  const factory = new Instance();

  for (const prop of properties) {
    const reference = ref[prop]  as keyof Y
    Reflect.defineProperty(factory, reference, {
      value: ob[prop]
    })
  }

  return factory.fetch();
};
type PipeFunction = (...args: any[]) => any


/**
 * 
 * @param fns 
 * @example
 * 
 * const getName = (name: string) => {
 *   return name
 * }
 * 
 * const plusLastName = (lastName: string) => {
 *   return (firstName: string) => {
 *     return `${firstName} ${lastName}`;
 *   }
 * }
 * 
 * const result = pipe(plusLastName("Braga"), getName )
 * console.log(result('Iago'));
 * @returns T
 */
export const pipe = (...fns: PipeFunction[]) => fns.reduce((result,
  fn) => (...args) => fn(result(...args)));

  type CallbackFunction = (...args: any[]) => unknown
  
  export const retryAsync = (maxCount = 1) => async function recurrency(
    args: any, cb: CallbackFunction, count = 1,
    ) {
      try {
    return await cb(args);
  } catch (err) {
    if (count >= maxCount) {
      throw err;
    }
    
    return recurrency(
      args, cb, count + 1,
      );
    }
  };
  
  type AsyncPipeFunction = (...args: any[]) => Promise<any>
  
export const pipeAsync = (...fns: AsyncPipeFunction[]) => fns.reduce((result,
  fn) => async (...args) => fn(await result(...args)));
