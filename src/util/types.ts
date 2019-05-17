export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export type ThenArg<T> = T extends Promise<infer U> ? U : T

export type Nullable<T> = T | null
export type Voidable<T> = T | void
