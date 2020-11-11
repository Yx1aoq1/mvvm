import { isObject } from './utils.mjs'
import Dep from './dep.mjs'

export class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    
    this.walk(value)
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

export function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  let ob = new Observer(value)
  if (asRootData) {
    ob.vmCount++
  }
  return ob
}

export function defineReactive (obj, key, val) {
  const dep = new Dep()
  let childOb = observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      childOb = observe(newVal)
      dep.notify()
    }
  })
}