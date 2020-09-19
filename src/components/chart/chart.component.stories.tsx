import dayjs from "dayjs";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  BloodPressureCategory,
  VitalsChecker,
} from "../../classes/vitals-checker.class";
import useEventBus from "../../helpers/useEventBus";
import { Line } from "./chart.component";

export default {
  title: "Charts/Line Chart",
  component: Line,
};

const vitalsChecker = new VitalsChecker();

var getDates = function (startDate: Date, endDate: Date) {
  var dates = [],
    currentDate: Date = startDate,
    addDays = function (days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear(),
      month = currentDate.getMonth(),
      day = currentDate.getDate(),
      formattedMonth = month.toString().length < 2 ? `0${month}` : month,
      formattedDay = day.toString().length < 2 ? `0${day}` : day,
      date = [year, formattedMonth, formattedDay].join("-");
    dates.push(date);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

var dates = getDates(new Date(2020, 9, 17), new Date(2020, 9, 23));

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
  {
    diastolic: "100",
    systolic: "220",
    heartRate: "90",
    patientId: 47,
    vitalId: 112,
    alertId: 100,
    takenAtDateTime: "2020-09-20T17:23:17",
    source: null,
  },
  {
    diastolic: "70",
    systolic: "116",
    heartRate: "90",
    patientId: 47,
    vitalId: 112,
    alertId: 100,
    takenAtDateTime: "2020-09-22T17:23:17",
    source: null,
  },
];

const remappedChartDataByDate = dates.map((date: string) => {
  const sets = chartData.filter(
    (data) => data.takenAtDateTime.indexOf(date) > -1
  );

  return sets;
});

function createSubArrays(parent, index, data, ...children) {
  for (let child of children) {
    parent[index][child] = data.map((data: any[], index: number) => []);
  }
}

function setSubArray(parent, parentIndex, index, ...children: any[]) {
  let i = 0;
  const l = children.length;
  while (i < l) {
    const key = children[i - 1];
    const value = children[i];
    if (i % 2) {
      parent[parentIndex][key][index].push(value);
    }
    i++;
  }
}

const chartDataMap = [...new Array(2)].map((arr, index) => ({
  type:
    index > 0
      ? BloodPressureCategory.DIASTOLIC
      : BloodPressureCategory.SYSTOLIC,
  pointColor: [],
  strokeColor: [],
  strokeWidth: [],
  data: [],
  tooltip: [],
  alertId: [],
  vitalId: [],
}));

let currentIndex: number = 0;
const length: number = chartDataMap.length;

while (currentIndex < length) {
  createSubArrays(
    chartDataMap,
    currentIndex,
    remappedChartDataByDate,
    "pointColor",
    "strokeColor",
    "strokeWidth",
    "data",
    "tooltip",
    "alertId",
    "vitalId"
  );

  for (let i = 0; i < remappedChartDataByDate.length; i++) {
    for (let x = 0; x < remappedChartDataByDate[i].length; x++) {
      const data = remappedChartDataByDate[i][x],
        bpType = chartDataMap[currentIndex]["type"],
        bpValue = parseInt(data[bpType], 10),
        pointColor = vitalsChecker.bloodPresureCheck(bpType, bpValue),
        strokeColor = pointColor,
        vitalPriorityColor = vitalsChecker.bloodPressurePrioritySeverity(
          data.systolic,
          data.diastolic
        ),
        tooltip = renderToString(
          <div>
            {dayjs(data.takenAtDateTime).format("ddd, MMM DD [at] h:mm A")}
            <h1 className={`vital-severity-text ${vitalPriorityColor}`}>
              {data.systolic}/{data.diastolic}
            </h1>
          </div>
        );

      setSubArray(
        chartDataMap,
        currentIndex,
        i,
        "pointColor",
        pointColor,
        "strokeColor",
        strokeColor,
        "strokeWidth",
        1,
        "data",
        bpValue,
        "tooltip",
        tooltip,
        "alertId",
        data.alertId,
        "vitalId",
        data.vitalId
      );
    }
  }
  currentIndex++;
}

const LineChartTemplate = (args: any) => {
  const { dispatch } = useEventBus;
  return (
    <>
      <Line {...args} />
      <button
        onClick={() => {
          dispatch("selectAll");
        }}
      >
        Select All
      </button>
    </>
  );
};

export const LineChart = LineChartTemplate.bind({});
LineChart.args = {
  type: "line",
  width: 749,
  height: 377,
  options: {
    padding: [30, 50, 50, 77],
    labels: {
      type: "date",
      format: "ddd\nM/DD",
    },
    graph: {
      point: {
        backdropPoint: true,
        radius: 5,
        singleHoverHighlight: false,
        dataAttributes: ["alertId", "vitalId"],
        customClass: (data: any) => {
          const classes: string[] = [];

          const parsedData = JSON.parse(data);

          if (parsedData.alertId) classes.push("unread");

          return classes.join(" ");
        },
      },
    },
    onPointClick: (event: React.MouseEvent<HTMLElement>) => {
      if (event && event.target) {
        const element = event.currentTarget,
          stringifiedData = element.getAttribute("data-resources"),
          data = JSON.parse(stringifiedData);
        console.log(data);
      }
    },
  },
  data: {
    labels: [...dates],
    labelBox: ["HD", null, "PD", null, null, "HD", null],
    indicators: [130, 80],
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
    datasets: chartDataMap,
  },
};
