import React, { useCallback, useEffect } from "react";
import "./chart.component.css";
import { Chart } from "./chart.utils";

interface ChartProps {
  data: () => void | object;
  id?: string;
  width?: number;
  height?: number;
  options?: object;
  redraw?: boolean;
  getElementAtEvent?: () => void;
  type: "line" | "bar" | "smart";
  ref: any;
}

const Canvas = React.forwardRef((props: any, ref: any) => (
  <canvas
    id={props.id || `canvas-chart-${Math.floor(Math.random() * 10000)}`}
    className="chart-renderer"
    ref={ref}
    width={props.width || 300}
    height={props.height || 150}
    style={{
      display: "block",
      width: `${props.width || 300}px`,
      height: `${props.height || 150}px`,
    }}
  />
));

export function ChartComponent(props: ChartProps) {
  const ref = React.createRef();

  const renderChart = useCallback((props: any, ref: any) => {
    new Chart(props, ref);
  }, []);

  useEffect(() => {
    renderChart(props, ref);
  }, [ref, props, renderChart]);

  return <Canvas {...props} ref={ref} />;
}

export const Line = (props: ChartProps) => {
  return <ChartComponent {...props} />;
};
