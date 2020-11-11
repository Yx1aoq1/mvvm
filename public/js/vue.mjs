import { noop, bind, isPlainObject } from './utils.mjs'
import { observe } from './observer.mjs'
import Compile from './compile.mjs'

export default function Vue (options) {
  this._init(options)
}

let uid = 0

Vue.prototype._init = function (options) {
  const vm = this
  vm._uid = uid ++
  vm.$options = options || {}
  initState(vm)
  if (vm.$options.el) {
    vm.$compile = new Compile(vm.$options.el, this)
  }
}

function initState (vm) {
  const opts = vm.$options
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
}

function initData (vm) {
  let data = vm.$options.data
  vm._data = data
  // 判断data的类型是object
  if (!isPlainObject(data)) {
    data = {}
  }
  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    proxy(vm, `_data`, key)
  }
  observe(data, true /* asRootData */)
}

function initMethods (vm, methods) {
  const props = vm.$options.props
  for (const key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

