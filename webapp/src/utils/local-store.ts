
export class LocalStore<T extends Object = string> {
  readonly key: string

  constructor(key: string, public def: T) {
    this.key = key
  }

  get(): T {
    const val = window.localStorage.getItem(this.key)
    if (val === null) return this.def
    return JSON.parse(val)
  }

  set(val: T) {
    window.localStorage.setItem(this.key, JSON.stringify(val))
  }

  del() {
    window.localStorage.removeItem(this.key)
  }
}
