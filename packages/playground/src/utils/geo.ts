export const client2World = (evt: MouseEvent | React.MouseEvent, container) => {
  const rect = container.getBoundingClientRect()

  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
}
