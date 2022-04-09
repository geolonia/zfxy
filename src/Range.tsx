import React from 'react';
import './Range.scss'

interface Props {
  className?: string;
  value: number;
  callback: Function;
}

const min = 0
const max = 25

const Component = (props: Props) => {
  const rangeRef = React.useRef<HTMLInputElement>(null)
  const valueRef = React.useRef<HTMLSpanElement>(null)

  const [range, setRange] = React.useState<number>(props.value)
  const [rect, setRect] = React.useState<DOMRect>()

  React.useEffect(() => {
    if (! rangeRef.current) {
      return
    }

    const rect = rangeRef.current.getBoundingClientRect()
    setRect(rect)
  }, [rangeRef])

  React.useEffect(() => {
    if (! valueRef.current || ! rect) {
      return
    }

    const valueRefRect = valueRef.current.getBoundingClientRect()
    const offset = ((rect.width - valueRefRect.width) / max) * range
    valueRef.current.style.left = `${rect.x + offset}px`
  }, [range, valueRef, rect])

  const onchange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.callback(Number(event.target.value))
    setRange(Number(event.target.value))
  }

  return (
    <div className={props.className}>
      <div id="range-container">
        <div><input type="range" ref={rangeRef} min={min} max={max} defaultValue={props.value} onChange={onchange} /></div>
        <div><span ref={valueRef}>{range}</span></div>
      </div>
    </div>
  );
}

export default Component
