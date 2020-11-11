export function isUndef (v) {
  return v === undefined || v === null
}

export function isDef (v) {
  return v !== undefined || v != null
}

export function isTrue (v) {
  return v === true
}

export function isFalse (v) {
  return v === false
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

const _toString = Object.prototype.toString
export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

export function toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

export function toNumber (val) {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}

export function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function warn (msg) {
  console.error(`[Vue warn]: ${msg}`)
}

/**
 * Define a property.
 */
export function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
// can we use __proto__?
export const hasProto = '__proto__' in {}