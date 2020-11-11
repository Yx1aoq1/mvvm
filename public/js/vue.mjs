import { isPlainObject } from './utils.mjs'
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
    vm.$mount(vm.$options.el)
  }
}

Vue.prototype.$mount = function (el) {
  return new Compile(el, this)
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: undefined,
  set: undefined
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

function initState (vm) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) initWatch(vm, opts.watch)
}

function initProps (vm, propsOptions) {}

function initData (vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
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

function initMethods (vm, methodsOptions) {}

function initComputed (vm, computedOptions) {}

function initWatch (vm, watchOptions) {}

function getData (data, vm) {
  return data.call(vm, vm)
}

