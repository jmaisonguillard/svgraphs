import React, { useCallback, useEffect } from "react";
import { Chart } from "./chart.utils";
import "./chart.component.scss";

interface ChartProps {
  data: any[];
  id?: string;
  width?: number;
  height?: number;
  options?: object;
  redraw?: boolean;
  type: "line" | "bar" | "smart";
  ref: any;
}

const Canvas = React.forwardRef((props: any, ref: any) => (
  <svg
    id={props.id || `svg-chart-${Math.floor(Math.random() * 10000)}`}
    className={`svg-chart-${Math.floor(Math.random() * 10000)} chart-renderer`}
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
