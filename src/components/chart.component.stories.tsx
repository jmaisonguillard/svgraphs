import React from "react";
import { Line } from "./chart/chart.component";

export default {
  title: "Charts/Line Chart",
  component: Line,
};

const LineChartTemplate = (args: any) => <Line {...args} />;

export const LineChart = LineChartTemplate.bind({});
LineChart.args = {
  type: "line",
  width: 877,
  height: 450,
  options: {
    labels: {
      type: "date",
      format: "ddd\nM/DD",
    },
  },
  data: {
    labels: [
      "2020-09-15T00:00:00-05:00",
      "2020-09-16T00:00:00-05:00",
      "2020-09-17T00:00:00-05:00",
      "2020-09-18T00:00:00-05:00",
      "2020-09-19T00:00:00-05:00",
      "2020-09-20T00:00:00-05:00",
      "2020-09-21T00:00:00-05:00",
      "2020-09-22T00:00:00-05:00",
    ],
    indicators: [130, 80],
    datasets: [
      {
        borderColor: "blue",
        pointColor: "red",
        data: [20, 40, 60, 80, 100, 120, 140],
      },
      {
        borderColor: "blue",
        pointColor: "red",
        data: [80, 100, 120, 140, 120, 100, 80],
      },
    ],
  },
};
