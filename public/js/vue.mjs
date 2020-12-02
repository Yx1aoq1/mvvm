import { noop, bind, isPlainObject } from './utils.mjs'
import { observe, set, del } from './observer.mjs'
import Compile from './compile.mjs'
import Watcher from './watcher.mjs'
import Dep from './dep.mjs'

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
  vm._watchers = []
  const opts = vm.$options
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) {
    initWatch(vm, opts.watch)
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

const computedWatcherOptions = { lazy: true }

function initComputed (vm, computed) {
  // Object.create(null)创建出来的对象没有原型，它不存在__proto__属性
  const watchers = vm._computedWatchers = Object.create(null)
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 生成一个Watcher对象
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    )
    // 将computed定义的key挂载到Vue实例上，为了可以通过this.xxx获取
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
  }
}

function initMethods (vm, methods) {
  const props = vm.$options.props
  for (const key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      // handler可以是多个回调函数的数组
      // 对每个回调函数按顺序创建watcher
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
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

function defineComputed (target, key, userDef) {
  // 初始化getter与setter
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? createComputedGetter(key)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  // 将定义的computed key 定义到vm实例上，并且配置的getter与setter
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createWatcher (vm, expOrFn, handler, options) {
  // 判断handler的是否是对象，如果是对象则是有传入options的情况
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 如果传入的handler是字符类型，说明对应的回调函数被定义在vm实例上
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

Vue.prototype.$set = set
Vue.prototype.$delete = del
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this
  // 判断传入的cb是否是一个对象，如果是对象则调用createWatcher进行处理
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {}
  // 生成一个Watcher对象
  const watcher = new Watcher(vm, expOrFn, cb, options)
  // 配置immediate为true，立即执行传入的回调函数
  if (options.immediate) {
    cb.call(vm, watcher.value)
  }
  return function unwatchFn () {
    watcher.teardown()
  }
}
