import React from 'react';
import './Range.scss'

interface Props {
  className?: string;
  value: number;
  onChange: Function;
  min: number;
  max: number;
}

const Component = (props: Props) => {
  const rangeRef = React.useRef<HTMLInputElement>(null)
  const valueRef = React.useRef<HTMLSpanElement>(null)

  const [range, setRange] = React.useState<number>(props.value)
  const [rect, setRect] = React.useState<DOMRect>()
  const [windowWidth, setWindowWidth] = React.useState<number>(window.innerWidth)

  React.useEffect(() => {
    if (! rangeRef.current) {
      return
    }

    const rect = rangeRef.current.getBoundingClientRect()
    setRect(rect)
  }, [rangeRef, windowWidth])

  React.useEffect(() => {
    if (! valueRef.current || ! rect) {
      return
    }

    const valueRefRect = valueRef.current.getBoundingClientRect()
    const offset = ((rect.width - valueRefRect.width) / (props.max - props.min)) * (range - props.min)
    valueRef.current.style.left = `${rect.x + offset}px`
  }, [range, valueRef, rect])

  const onchange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event)
    setRange(Number(event.target.value))
  }

  window.addEventListener("resize", function(event) {
    setWindowWidth(window.innerWidth)
  });

  return (
    <div className={props.className}>
      <div id="reat-range-container">
        <div><input type="range" ref={rangeRef} min={props.min} max={props.max} defaultValue={props.value} onChange={onchange} /></div>
        <div><span ref={valueRef}>{range}</span></div>
      </div>
    </div>
  );
}

export default Component
