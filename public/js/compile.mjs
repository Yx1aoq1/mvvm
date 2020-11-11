import { isDef } from './utils.mjs'
import Watcher from './watcher.mjs'

export default class Compile {
  constructor (el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      this.$fragment = this.node2Fragment(this.$el)
      this.init()
      this.$el.appendChild(this.$fragment)
    }
  }

  node2Fragment (el) {
    let child
    // createDocumentFragment 创建文档碎片
    // 主要用法是作为一个文档的“占位符”，当插入到文档中时，会插入它的所有子孙节点
    // 作为一个插入节点的过渡，可以减少渲染DOM元素的次数
    const fragment = document.createDocumentFragment()
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  }

  init () {
    this.compileElement(this.$fragment)
  }

  compileElement (el) {
    const childNodes = el.childNodes
    Array.prototype.slice.call(childNodes, this).forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/
      if (this.isElementNode(node)) {
        // 如果节点是DOM元素
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        // 如果节点是一个文本，并且包含模板语法{{xxx}}
        this.compileText(node, RegExp.$1.trim())
      }
      // 递归继续遍历子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile (node) {
    const nodeAttrs = node.attributes
    Array.prototype.slice.call(nodeAttrs, this).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value
      if (
        // 判断v-xxx指令
        this.isDirective(attrName)
      ) {
        const dir = attrName.substring(2)
        compileUtil[dir] && compileUtil[dir](node, this.$vm, exp, dir)
        node.removeAttribute(attrName)
      } else if (
        // 判断@xxx指令
        this.isEventDirective(attrName)
      ) {
        const eventType = attrName.replace('@', '')
        compileUtil.eventHandler(node, this.$vm, exp, eventType)
        node.removeAttribute(attrName)
      } else if (
        // 判断:xxx指令
        this.isAttrDirective(attrName)
      ) {
        const name = attrName.replace(':', '')
        compileUtil.attrHandler(node, this.$vm, exp, name)
        node.removeAttribute(attrName)
      }
    })
  }

  compileText (node, exp) {
    compileUtil.text(node, this.$vm, exp)
  }

  isDirective (attr) {
    return attr.indexOf('v-') === 0
  }

  isAttrDirective (attr) {
    return attr.indexOf(':') === 0
  }

  isEventDirective (attr) {
    return attr.indexOf('@') === 0
  }

  isElementNode (node) {
    return node.nodeType === 1
  }

  isTextNode (node) {
    return node.nodeType === 3
  }
}

const compileUtil = {
  text: function (node, vm, exp, dir) {
    this.bind(node, vm, exp, 'text')
  },

  on: function (node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    this.eventHandler(node, vm, exp, eventType)
  },

  model: function (node, vm, exp, dir) {
    this.bind(node, vm, exp, 'model')
    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', e => {
      var newValue = e.target.value
      if (val === newValue) {
        return
      }

      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  bind: function (node, vm, exp, dir) {
    const updaterFn = updater[dir + 'Updater']
    updaterFn && updaterFn(node, this._getVMVal(vm, exp))
    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  eventHandler: function (node, vm, exp, eventType) {
    const fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  attrHandler: function (node, vm, exp, attrName) {
    const updaterFn = updater['attrUpdater']
    updaterFn && updaterFn(node, attrName, this._getVMVal(vm, exp))
    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, attrName, value)
    })
  },

  _getVMVal: function (vm, exp) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(k => val = val[k])
    return val
  },

  _setVMVal: function (vm, exp, value) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(function(k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}

const updater = {
  // 更新文本
  textUpdater: function (node, value) {
    node.textContent = isDef(value) ? value : ''
  },
  // 更新绑定的value
  modelUpdater: function (node, value, oldValue) {
    node.value = isDef(value) ? value : ''
  },
  // 更新attribute
  attrUpdater: function (node, name, value) {
    node.setAttribute(name, value)
  }
}