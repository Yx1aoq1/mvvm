import { remove } from './utils.mjs'

let uid = 0

export default class Dep {
  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  removeSub (sub) {
    remove(this.subs, sub)
  }

  depend () {
    // 依赖收集，如果当前有正在处理的Wacter
    // 将该Dep放进当前Wacter的deps中
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // slice的作用是复制当前的subs队列
    // 循环处理队列中的每个Watcher的update方法
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
// 标记全局唯一的一个正在处理的Watcher
// 在同一时间内，控制只有一个Watcher正在执行
Dep.target = null
// 待处理的Watcher队列
const targetStack = []

export function pushTarget (_target) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}