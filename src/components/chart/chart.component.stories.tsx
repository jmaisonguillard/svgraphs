import React from "react";
import {
  BloodPressureCategory,
  VitalsChecker,
} from "../../classes/vitals-checker.class";
import { Line } from "./chart.component";
import { groupBy } from "lodash";
import dayjs from "dayjs";

export default {
  title: "Charts/Line Chart",
  component: Line,
};

const vitalsChecker = new VitalsChecker();

const chartData = [
  {
    diastolic: "130",
    systolic: "190",
    heartRate: null,
    patientId: 47,
    vitalId: 215,
    alertId: null,
    takenAtDateTime: "2020-09-17T10:25:47",
    source: "Manual",
  },
  {
    diastolic: "90",
    systolic: "142",
    heartRate: null,
    patientId: 47,
    vitalId: 214,
    alertId: null,
    takenAtDateTime: "2020-19-17T02:15:23.39",
    source: null,
  },
  {
    diastolic: "90",
    systolic: "142",
    heartRate: null,
    patientId: 47,
    vitalId: 212,
    alertId: null,
    takenAtDateTime: "2020-09-18T02:50:54.013",
    source: null,
  },
  {
    diastolic: "94",
    systolic: "153",
    heartRate: null,
    patientId: 47,
    vitalId: 213,
    alertId: null,
    takenAtDateTime: "2020-09-18T02:51:13.403",
    source: null,
  },
  {
    diastolic: "90",
    systolic: "142",
    heartRate: null,
    patientId: 47,
    vitalId: 206,
    alertId: null,
    takenAtDateTime: "2020-09-18T17:54:12.497",
    source: null,
  },
  {
    diastolic: "90",
    systolic: "142",
    heartRate: null,
    patientId: 47,
    vitalId: 207,
    alertId: null,
    takenAtDateTime: "2020-09-19T17:54:23.483",
    source: null,
  },
  {
    diastolic: "72",
    systolic: "137",
    heartRate: "72",
    patientId: 47,
    vitalId: 113,
    alertId: null,
    takenAtDateTime: "2020-09-20T14:23:17",
    source: null,
  },
  {
    diastolic: "80",
    systolic: "140",
    heartRate: "90",
    patientId: 47,
    vitalId: 112,
    alertId: null,
    takenAtDateTime: "2020-09-20T17:23:17",
    source: null,
  },
];

var datas = groupBy(chartData, function (data) {
  return dayjs(data.takenAtDateTime).startOf("d").format();
});

const datasets = [
  {
    pointColor: Object.keys(datas).map((data) =>
      datas[data].map((d) =>
        vitalsChecker.bloodPresureCheck(
          BloodPressureCategory.SYSTOLIC,
          parseInt(d.systolic, 10),
          d.alertId ? 1 : 0.2
        )
      )
    ),
    strokeColor: Object.keys(datas).map((data) =>
      datas[data].map((d) =>
        vitalsChecker.bloodPresureCheck(
          BloodPressureCategory.SYSTOLIC,
          parseInt(d.systolic, 10),
          1
        )
      )
    ),
    strokeWidth: 1,
    data: Object.keys(datas).map((data) =>
      datas[data].map((d) => parseInt(d.systolic, 10))
    ),
  },
  {
    pointColor: Object.keys(datas).map((data) =>
      datas[data].map((d) =>
        vitalsChecker.bloodPresureCheck(
          BloodPressureCategory.DIASTOLIC,
          parseInt(d.diastolic, 10),
          d.alertId ? 1 : 0.2
        )
      )
    ),
    strokeColor: Object.keys(datas).map((data) =>
      datas[data].map((d) =>
        vitalsChecker.bloodPresureCheck(
          BloodPressureCategory.DIASTOLIC,
          parseInt(d.diastolic, 10),
          1
        )
      )
    ),
    strokeWidth: 1,
    data: Object.keys(datas).map((data) =>
      datas[data].map((d) => parseInt(d.diastolic, 10))
    ),
  },
];

const LineChartTemplate = (args: any) => <Line {...args} />;

export const LineChart = LineChartTemplate.bind({});
LineChart.args = {
  type: "line",
  width: 749,
  height: 377,
  options: {
    padding: [30, 50, 40, 77],
    labels: {
      type: "date",
      format: "ddd\nM/DD",
    },
    graph: {
      point: {
        backdropPoint: true,
        radius: 5,
        singleHoverHighlight: false,
      },
    },
    onPointClick: (event, relationId) => {
      // console.log(event, relationId);
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
    ],
    labelBox: ["HD", null, "PD", null, null, "HD", null],
    indicators: [130, 80],
    tooltip:
      "<small>{label|date:ddd,MMM dd [at] H:MM A}</small><h1>{dsd.0}/{dsd.1}</h1>",
    // datasets: [
    //   {
    //     pointColor: "rgba(29,198,108,0.2)",
    //     strokeColor: "rgba(29, 198, 108, 1)",
    //     strokeWidth: 1,
    //     data: [20, 40, 60, 80, 100, 140, 220],
    //   },
    //   {
    //     pointColor: "rgba(254,194,69,0.1)",
    //     strokeColor: "rgba(254, 194, 69, 1)",
    //     strokeWidth: 1,
    //     data: [80, 100, 130, 140, 120, 100, 80],
    //   },
    // ],
    datasets,
  },
};
