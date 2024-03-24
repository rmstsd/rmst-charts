export const style = {
  row: 'display: flex; align-items: center; gap: 8px;',
  tagSign: color => {
    return `width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; background-color: ${color};`
  },
  opening: 'margin-left: 10px',
  value: 'margin-left: auto; '
}

export const tooltipContainerStyle = (x, y) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  backgroundColor: '#fff',
  transform: `translate(${x}px, ${y}px)`,
  boxShadow: 'rgba(0, 0, 0, 0.2) 1px 2px 10px',
  padding: '10px',
  width: tooltipContainerStyle.width + 'px',
  pointerEvents: 'none',
  transition: 'transform 100ms',
  borderRadius: '8px',
  flexDirection: 'column',
  gap: '10px'
})

tooltipContainerStyle.width = 200

tooltipContainerStyle.title = JSON.stringify('font-size: 16px;')
