import { isObject, def, hasOwn, isValidArrayIndex } from './utils.mjs'
import Dep from './dep.mjs'
import arrayMethods from './array.mjs'

// Observer的作用就是将传入的value中的每个属性批量处理
// defineReactive就是处理添加getter与setter的方法
export class Observer {
  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // 对已生成响应对象的value增加__ob__属性进行标识
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 用拦截器替换原来Array上的原型方法
      value.__proto__ = arrayMethods
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 将对象的每一个属性都加上getter与setter
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  // 遍历数组中的元素，将他们都变成响应对象
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// observe 的作用，就是判断传入的value是否符合条件
// 对符合条件的对象，生成一个Observer对象实例
export function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  let ob
  if (
    // 判断是否已经定义过响应对象，避免重复定义
    hasOwn(value, '__ob__') && value.__ob__ instanceof Observer
  ) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

export function defineReactive (obj, key, val) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 监听当前val的所有子属性
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // 依赖收集
        dep.depend()
        // 存在子属性的响应对象，需要对子属性也进行依赖的收集
        if (childOb) {
          childOb.dep.depend()
          if(Array.isArray(value)) {
            // 如果是数组，需要对数组的每个元素都进行依赖收集
            dependArray(value)
          }
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
      // 对新的值进行设置响应对象，保证数据响应式
      childOb = observe(newVal)
      // 派发更新
      dep.notify()
    }
  })
}

export function set (target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, value)
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = target.__ob__
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

export function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

function dependArray (value) {
  // 递归判断元素是否是响应对象，如果是，对其进行依赖收集
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}