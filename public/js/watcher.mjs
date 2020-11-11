import Dep, { pushTarget, popTarget } from './dep.mjs'
import { parsePath, isObject } from './utils.mjs'

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
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
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
    let value = this.getter.call(vm, vm)
    popTarget()
    this.cleanupDeps()
    return value
  }

  addDep (dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
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