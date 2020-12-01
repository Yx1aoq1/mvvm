import { isObject } from './utils.mjs'

const seenObjects = new Set()

export function traverse (val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (value, seen) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    // 如果传入的值不是数组、对象，或者已被冻结，那么直接返回
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    // 如果传入的之是一个响应对象，收集其依赖
    // 并且保证收集的依赖id不会重复
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  if (isA) {
    // 对数组对象进行遍历
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    // 对对象类型的数据遍历所有的key
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}