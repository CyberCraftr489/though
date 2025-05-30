function getTouch(el: HTMLElement | Window, x: number, y: number) {
  return {
    identifier: Date.now(),
    target: el,
    pageX: x,
    pageY: y,
    clientX: x,
    clientY: y,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5,
  }
}

// Trigger pointer/touch event
export function trigger(
  wrapper: any,
  eventName: string,
  x = 0,
  y = 0,
  options: any = {}
) {
  var el = 'element' in wrapper ? wrapper.element : wrapper
  var touchList = options.touchList || [getTouch(el, x, y)]

  if (options.x || options.y) {
    touchList.push(getTouch(el, options.x, options.y))
  }

  var event = document.createEvent('CustomEvent')
  event.initCustomEvent(eventName, true, true, {})

  Object.assign(event, {
    clientX: x,
    clientY: y,
    touches: touchList,
    targetTouches: touchList,
    changedTouches: touchList,
  })

  el.dispatchEvent(event)
}

export function sleep(delay = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}

// simulate drag gesture
export function triggerDrag(el: any, relativeX = 0, relativeY = 0): void {
  let x = relativeX
  let y = relativeY
  let startX = 0
  let startY = 0
  if (relativeX < 0) {
    startX = Math.abs(relativeX)
    x = 0
  }
  if (relativeY < 0) {
    startY = Math.abs(relativeY)
    y = 0
  }
  trigger(el, 'touchstart', startX, startY)
  trigger(el, 'touchmove', x / 4, y / 4)
  trigger(el, 'touchmove', x / 3, y / 3)
  trigger(el, 'touchmove', x / 2, y / 2)
  trigger(el, 'touchmove', x, y)
  trigger(el, 'touchend', x, y)
}

/**
 * 模拟触摸移动方法
 * @param {HTMLElement} element 要进行触摸移动的 HTML 元素
 * @param {number} startX 起始触摸点的 X 坐标
 * @param {number} startY 起始触摸点的 Y 坐标
 * @param {number} endX 结束触摸点的 X 坐标
 * @param {number} endY 结束触摸点的 Y 坐标
 * @param {number} duration 移动持续时间（毫秒）
 */
export async function simulateTouchMove(
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number
) {
  var touch = getTouch(element, startX, startY)
  var touchList = [touch]

  // 触摸开始事件
  trigger(element, 'touchstart', startX, startY, {
    touchList,
  })

  var distanceX = endX - startX
  var distanceY = endY - startY
  var startTime = Date.now()

  // 移动过程中的触摸事件
  while (Date.now() - startTime < duration) {
    var elapsed = Date.now() - startTime
    var progress = elapsed / duration

    var currentX = startX + distanceX * progress
    var currentY = startY + distanceY * progress

    var currentTouch = getTouch(element, currentX, currentY)
    var currentTouchList = [currentTouch]

    trigger(element, 'touchmove', currentX, currentY, {
      touchList: currentTouchList,
    })

    await sleep(duration / 100)
  }

  // 触摸结束事件
  trigger(element, 'touchend', endX, endY, {
    touchList,
  })
}

/**
 * 模拟触摸缩放方法
 * @param {HTMLElement} element 要进行缩放操作的 HTML 元素
 * @param {number} startDistance 起始触摸点的距离
 * @param {number} endDistance 结束触摸点的距离
 * @param {number} duration 缩放持续时间（毫秒）
 */
export async function simulateTouchZoom(
  element: HTMLElement,
  startDistance: number,
  endDistance: number,
  duration: number
) {
  var centerX = element.clientWidth / 2
  var centerY = element.clientHeight / 2

  var startScale = startDistance / endDistance
  var endScale = 1

  var startTouches = [
    getTouch(element, centerX - startDistance / 2, centerY),
    getTouch(element, centerX + startDistance / 2, centerY),
  ]

  var endTouches = [
    getTouch(element, centerX - endDistance / 2, centerY),
    getTouch(element, centerX + endDistance / 2, centerY),
  ]

  // 触摸开始事件
  trigger(element, 'touchstart', centerX, centerY, {
    touchList: startTouches,
  })

  // 缩放过程中的触摸事件
  for (let progress = 0; progress < 1; progress += 0.01) {
    var currentScale = startScale + (endScale - startScale) * progress
    var currentDistance = startDistance / currentScale
    var currentTouches = [
      getTouch(element, centerX - currentDistance / 2, centerY),
      getTouch(element, centerX + currentDistance / 2, centerY),
    ]

    trigger(element, 'touchmove', centerX, centerY, {
      touchList: currentTouches,
    })

    await sleep(duration / 100)
  }

  // 触摸结束事件
  trigger(element, 'touchend', centerX, centerY, {
    touchList: endTouches,
  })
}
