import { pushTarget, popTarget } from './dep.mjs'
import { parsePath } from './utils.mjs'

let uid = 0

export default class Watcher {
  constructor (
    vm,
    expOrFn,
    cb
  ) {
    this.vm = vm
    this.cb = cb
    this.id = ++uid
    this.deps = []
    this.depIds = new Set()
    this.expression = expOrFn.toString()
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
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
    // 执行完成后退出Watcher队列
    popTarget()
    return value
  }

  addDep (dep) {
    const id = dep.id
    // 保证同一数据不会被添加多个观察者
    if (!this.depIds.has(id)) {
      // 将自己加入到当前dep的subs队列
      dep.addSub(this)
    }
  }

  update () {
    this.run()
  }

  run () {
    this.getAndInvoke(this.cb)
  }

  getAndInvoke (cb) {
    const value = this.get()
    const oldValue = this.value
    if (value !== oldValue) {
      this.value = value
      cb.call(this.vm, value, oldValue)
    }
  }
}