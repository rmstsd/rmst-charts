type eventName = keyof GlobalEventHandlers

export const eventList: eventName[] = ['onmousemove', 'onmousedown', 'onmouseup', 'onclick']

export const absMap = {
  onmousedown: 'handleMouseDown',
  onmouseup: 'handleMouseUp',
  onclick: 'handleClick'
}
