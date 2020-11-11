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
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1.trim())
      }

      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile (node) {
    const nodeAttrs = node.attributes
    Array.prototype.slice.call(nodeAttrs, this).forEach(attr => {
      const attrName = attr.name
      if (this.isDirective(attrName)) {
        const exp = attr.value
        const dir = attrName.substring(2)
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir)
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
        }
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

  isEventDirective (dir) {
    return dir.indexOf('on') === 0
  }

  isElementNode (node) {
    return node.nodeType === 1
  }

  isTextNode (node) {
    return node.nodeType === 3
  }
}

const compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },


  model: (node, vm, exp) => {
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

  eventHandler: () => {
    const eventType = dir.split(':')[1]
    const fn = vm.$options.methods && vm.$options.methods[exp]
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  }
}