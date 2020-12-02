import { pushTarget, popTarget } from './dep.mjs'
import { parsePath, isObject } from './utils.mjs'
import { traverse } from './traverse.mjs'

let uid = 0

export default class Watcher {
  constructor (
    vm,
    expOrFn,
    cb,
    options
  ) {
    vm._watchers.push(this)
    // 新增传入配置项deep
    if (options) {
      this.deep = !!options.deep
      this.lazy = !!options.lazy
    } else {
      this.deep = this.lazy = false
    }
    this.vm = vm
    this.cb = cb
    this.id = ++uid
    // computed计算属性使用的参数
    this.dirty = this.lazy
    // 存放Dep依赖的数组
    this.deps = []
    this.depIds = new Set()
    this.expression = expOrFn.toString()
    // expOrFn支持传入函数，如果是函数，直接赋值给getter
    // 当执行getter时，会同时触发expOrFn中所依赖的参数的依赖收集
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 当expOrFn不是函数时，则是类似`a.b.c`这样的属性路径
      // parsePath主要功能就是返回一个函数，函数的执行结果则是获取该路径的值
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
      }
    }
    this.value = this.get()
  }

  get () {
    pushTarget(this)
    const vm = this.vm
    // 这里的 this.getter 会触发对应data的defineProperty
    // 触发后会将这个Watcher添加到Dep的队列中
    let value = this.getter.call(vm, vm)
    if (this.deep) {
      // 当deep为true时，收集子属性的依赖
      traverse(value)
    }
    // 执行完成后退出Watcher队列
    popTarget()
    return value
  }

  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  addDep (dep) {
    const id = dep.id
    // 保证同一数据不会被添加多个观察者
    if (!this.depIds.has(id)) {
      // 将自己加入到当前dep的subs队列
      this.depIds.add(dep.id)
      this.deps.push(dep)
      dep.addSub(this)
    }
  }

  update () {
    if (this.lazy) {
      this.dirty = true
    } else {
      this.run()
    }
  }

  run () {
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      this.cb.call(this.vm, value, oldValue)
    }
  }

  teardown () {
    // 获取这个观察对象的所有依赖
    // 在所有依赖中遍历地删掉当前的观察对象
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }
}