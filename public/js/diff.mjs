const oldCh = ['A', 'B', 'C', 'D', 'E']
const newCh = ['C', 'A', 'D', 'E', 'G']

const patch = (a, b) => {
  console.log(`Patch 节点 -> ${a} ${b}`)
}

const insertBefore = (target, node) => {
  if (node) {
    console.log(`节点 ${target} 插入到 ${node} 之前`)
  } else {
    console.log(`节点 ${target} 添加到末尾`)
  }
}

const mount = (node) => {
  console.log(`新增节点 ${node}`)
}

const unmount = (node) => {
  console.log(`删除节点 ${node}`)
}

const move = (node, anchor) => {
  if (anchor) {
    console.log(`移动节点 ${node} 到 ${anchor} 之前`)
  } else {
    console.log(`节点 ${node} 添加到末尾`)
  }
}

;(function (c1, c2) {
  let oldCh = [...c1]
  let newCh = [...c2]

  const Vue2Diff = (oldCh, newCh) => {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx
    let idxInOld
    let elmToMove
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      console.log(
        `当前指针位置 -> oldStartIdx: ${oldStartIdx} newStartIdx: ${newStartIdx} oldEndIdx: ${oldEndIdx} newEndIdx: ${newEndIdx}`
      )
      console.log(
        `当前所指元素 -> oldStartVnode: ${oldStartVnode} newStartVnode: ${newStartVnode} oldEndVnode: ${oldEndVnode} newEndVnode: ${newEndVnode}`
      )
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
      } else if (oldStartVnode === newStartVnode) {
        console.log(`头头相同`)
        patch(oldStartVnode, newStartVnode)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (oldEndVnode === newEndVnode) {
        console.log(`尾尾相同`)
        patch(oldEndVnode, newEndVnode)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (oldStartVnode === newEndVnode) {
        console.log(`旧头新尾相同`)
        insertBefore(oldStartVnode, oldCh[oldEndIdx + 1])
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (oldEndVnode === newStartVnode) {
        console.log(`新头旧尾相同`)
        insertBefore(oldEndVnode, oldStartVnode)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        console.log(`查找到与 ${newStartVnode} 相同的节点的位置`)
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = new Map()
          oldCh.map((item, idx) => {
            if (idx >= oldStartIdx && idx <= oldEndIdx) {
              oldKeyToIdx.set(item, idx)
            }
          })
        }
        idxInOld = oldKeyToIdx.get(newStartVnode)
        if (!idxInOld && idxInOld !== 0) {
          console.log(`未找到与 ${newStartVnode} 相同的节点，创建新的元素 ${newStartVnode}`)
          insertBefore(newStartVnode, oldStartVnode)
        } else {
          // 当找到相同Key节点时
          elmToMove = oldCh[idxInOld]
          oldCh[idxInOld] = undefined
          console.log(`找到元素 ${elmToMove}，位置 ${idxInOld}`)
          insertBefore(elmToMove, oldStartVnode)
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }

    if (newStartIdx <= newEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1]
      newCh.map((item, idx) => {
        if (item && idx >= newStartIdx && idx <= newEndIdx) {
          insertBefore(item, before)
        }
      })
    }
    if (oldStartIdx <= oldEndIdx) {
      oldCh.map((item, idx) => {
        if (item && idx >= oldStartIdx && idx <= oldEndIdx) {
          unmount(item)
        }
      })
    }
  }

  console.log('----------vue2 diff--------------')
  Vue2Diff(oldCh, newCh)
})(oldCh, newCh)

/**
 * 获取最长递增子序列
 *
 * @param {*} arr
 * @returns
 */
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  // 遍历数组
  for (i = 0; i < len; i++) {
    // 取出当前元素
    const arrI = arr[i]

    // 只看进行过patch的数据
    if (arrI !== 0) {
      j = result[result.length - 1]
      // 如果当前元素比最后一个元素要大
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i) // 将当前索引存入结果索引
        continue
      }

      u = 0
      v = result.length - 1
      // 二分查找，在结果数组中找到当前值得位置
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      // 将当前值替换到比它大一点的位置
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1] // 存起来
        }
        result[u] = i
      }
    }
  }

  // 修正索引
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

;(function (c1, c2) {
  let oldCh = [...c1]
  let newCh = [...c2]

  const Vue3Diff = (c1, c2) => {
    let i = 0 // 起始索引
    const l2 = c2.length // 新节点数组长度
    let e1 = c1.length - 1 // 老节点数组结束索引
    let e2 = l2 - 1 // 新节点数组结束索引

    // 1. 从头部开始同步节点
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (n1 === n2) {
        patch(n1, n2)
      } else {
        // 否则，中断循环
        break
      }
      // 每有一个相同的节点，起始索引加1
      i++
    }
    // 2. 从尾部开始同步节点
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (n1 === n2) {
        patch(n1, n2)
      } else {
        break
      }
      e1--
      e2--
    }
    console.log(`预处理后所有值 -> i: ${i} e1: ${e1} e2: ${e2}`)
    if (i > e1) {
      // 新节点还有，老节点没了
      if (i <= e2) {
        // 添加多出来的节点
        while (i <= e2) {
          mount(c2[i])
          i++
        }
      }
    } else if (i > e2) {
      // 老节点还有，新节点没了
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    } else {
      // 处于中间的乱序节点
      const s1 = i // 记录剩下老节点的起始位置
      const s2 = i // 记录剩下新节点的起始位置
      // 5.1 将剩下未执行比较的新节点数组转map
      // key就是节点的key，value是新节点数组的index
      const keyToNewIndexMap = new Map()
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        if (nextChild) {
          keyToNewIndexMap.set(nextChild, i)
        }
      }
      console.log('keyToNewIndexMap:', keyToNewIndexMap)
      // 5.2 遍历剩余老节点，把能处理的处理了（patch, unmout）
      let j
      let patched = 0
      const toBePatched = e2 - s2 + 1 // 需要patch的数量，就是剩下所有的新节点的数量
      let moved = false // 记录是否有节点移动
      let maxNewIndexSoFar = 0 // 记录最大的新节点索引，用于辅助判断是否有节点移动的
      // 用于记录剩下的节点是否有移动，索引是剩余新节点index（从0开始），值是老节点下标
      const newIndexToOldIndexMap = new Array(toBePatched)
      console.log('记录剩下的节点是否有移动:', newIndexToOldIndexMap)
      // 初始化为0
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      // 遍历剩下的老节点
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 如果已经没有需要patch的节点了，证明后面的节点都是要删除的，直接删除
        if (patched >= toBePatched) {
          unmount(prevChild)
          continue
        }

        let newIndex // 新节点数组的index
        if (prevChild) {
          // 如果有key，直接从map中获取index
          newIndex = keyToNewIndexMap.get(prevChild)
        } else {
          // 针对部分没有key的节点，遍历剩余新节点数组
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && prevChild === c2[j]) {
              newIndex = j
              break
            }
          }
        }
        // 如果找不到新节点的索引，证明老节点没法复用，删除
        if (newIndex === undefined) {
          unmount(prevChild)
        } else {
          // 每次找到可以复用的节点，设置值为老节点索引加1
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 记录新节点的索引，如果索引突然变小了，证明有节点的位置变了
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
            console.log('maxNewIndexSoFar:', maxNewIndexSoFar)
          } else {
            moved = true
          }
          console.log('newIndex:', newIndex)
          console.log('moved:', moved)
          patch(prevChild, c2[newIndex])
          patched++
        }
      }

      // 5.3 移动和新建
      // 获取最长递增子序列
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      console.log('获取最长递增子序列:', increasingNewIndexSequence)

      j = increasingNewIndexSequence.length - 1

      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i // i是相对坐标，要加上起始值，转为新节点真实坐标
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1] : undefined

        // 如果没有进行patch操作，证明是新增节点
        if (newIndexToOldIndexMap[i] === 0) {
          mount(nextChild)
        } else if (moved) {
          // 如果没有稳定的子序列（e.g. 数组倒序）或者 当前节点不在稳定序列中，移动节点
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  console.log('----------vue3 diff--------------')
  Vue3Diff(oldCh, newCh)
})(oldCh, newCh)
