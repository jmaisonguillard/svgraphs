// @ts-nocheck
import dayjs from "dayjs";
import React from "react";
import { merge } from "lodash";

type ChartInterface = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} & Partial<DefaultProps>;

const defaultProps = {
  data: {} as any,
  id: "" as string,
  width: 300 as number,
  height: 150 as number,
  options: {
    backgroundColor: "#26374C" as string,
    labels: {
      type: "" as string,
      format: "" as string,
      textColor: "#8DABC4" as string,
    },
    graph: {
      border: true as boolean,
      borderWidth: 1 as number,
      borderColor: "#3F536E" as string,
      backgroundColor: "#212F40" as string,
    },
    indicators: {
      borderWidth: 1 as number,
      borderColor: "#8DABC4" as string,
      backgroundColor: "#212F40" as string,
    },
    yAxis: {
      min: 0 as number,
      max: 300 as number,
    },
    XAxis: {
      min: 0 as number,
      max: 0 as number,
    },
  } as any,
  redaw: false as boolean,
  type: "line" as "line" | "bar" | "smart",
};

type DefaultProps = Readonly<typeof defaultProps>;

export class Chart extends React.Component<ChartInterface> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  maxY: number;
  ratioPointY: number;
  ratioPointX: number;
  xOffset: number = 40;
  points: number[] = [];

  static defaultProps = defaultProps;

  constructor(props: any, ref: any) {
    super(merge(defaultProps, props));
    if (ref && ref.current) {
      this.canvas = ref.current as HTMLCanvasElement;
      this.ctx = this.canvas.getContext("2d");
      this.init();
    }
  }

  componentDidMount() {
    this.updateCanvas();
  }

  roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.stroke();
    ctx.fill();
  }

  calculateRatio() {
    let ctx = this.ctx,
      dpr = window.devicePixelRatio || 1,
      bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
    return dpr / bsr;
  }

  init() {
    switch (this.props.type) {
      case "line":
        this.drawLineChart();
        break;
      default:
        this.drawLineChart();
        break;
    }
  }

  drawLineChart() {
    const graphHeight = this.canvas.clientHeight - 47,
      graphWidth = this.canvas.clientWidth - 128,
      sections = this.props.data.labels.length - 1,
      sectionWidth = graphWidth / sections;

    // Find Max Y value....
    var dataRanges = [];
    for (let dataset of this.props.data.datasets)
      dataRanges = dataRanges.concat(...dataset.data);
    this.maxY = Math.max(...dataRanges);
    this.ratioPointY = graphHeight / this.props.options.yAxis.max;
    this.ratioPointX = graphWidth / this.props.options.XAxis.max;

    // Smooth canvas out...
    this.updateCanvas();

    this.ctx.fillStyle = this.props.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.props.data.indicators.length) {
      this.xOffset = 77.5;
    }

    // Generate Borders
    if (this.props.options.graph.border) {
      this.ctx.strokeStyle = this.props.options.graph.borderColor;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        this.xOffset,
        43,
        this.canvas.clientWidth - 128,
        this.canvas.clientHeight - 73
      );
    }

    // Generate Left Indicators
    if (this.props.data.indicators) {
      for (let indicator of this.props.data.indicators) {
        const x = 20,
          y = graphHeight - indicator * this.ratioPointY;
        const width = 38,
          height = 17;
        this.ctx.strokeStyle = this.props.options.indicators.borderColor;
        this.ctx.fillStyle = this.props.options.indicators.backgroundColor;
        this.ctx.setLineDash([0]);
        this.roundedRect(this.ctx, x, y, width, height, 8.5);
        this.ctx.fillStyle = "white";
        this.ctx.font = "9px serif bold";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          indicator,
          Math.ceil(x + width / 2),
          Math.ceil(y + height / 2)
        );
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.props.options.indicators.borderColor;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4]);
        this.ctx.moveTo(59, Math.ceil(y + height / 2));
        this.ctx.lineTo(
          this.canvas.clientWidth - 30,
          Math.ceil(y + height / 2)
        );
        this.ctx.stroke();
        this.ctx.setLineDash([0]);
      }
    }

    // Generate Horizontal Bars
    if (sections > 0) {
      for (let i = 1; i < sections; i++) {
        this.ctx.strokeStyle = this.props.options.graph.borderColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.xOffset + sectionWidth * i, 43);
        this.ctx.lineTo(this.xOffset + sectionWidth * i, graphHeight + 17);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }

    // Generate Labels...
    for (let i = 1; i < this.props.data.labels.length; i++) {
      let displayLabel = this.props.data.labels[i];
      if (this.props.options.labels.type === "date") {
        displayLabel = dayjs(displayLabel).format(
          this.props.options.labels.format
        );
      }
      this.drawMultiLineString(
        displayLabel,
        sectionWidth * i,
        this.canvas.clientHeight,
        11
      );
    }

    // Generate Points...
    for (let i = 0; i < this.props.data.datasets.length; i++) {
      this.points.push([]);
      for (let x = 0; x < this.props.data.datasets[i].data.length; x++) {
        this.points[i].push([
          this.xOffset + sectionWidth * x,
          graphHeight - this.props.data.datasets[i].data[x] * this.ratioPointY,
        ]);
        this.drawCircle(
          this.xOffset + sectionWidth * x,
          graphHeight - this.props.data.datasets[i].data[x] * this.ratioPointY,
          5,
          0,
          2 * Math.PI
        );
      }

      this.points[i].reduce((previous, current, index, array) => {
        console.log(array, index);
        const p = previous || current;
        const n = array[index + 1] || current;
        const l = this.drawPath(p, n);
      });
    }
  }

  drawPath(pointA: number[], pointB: number[]) {
    console.log(pointA, pointB);
    return "test";
  }

  drawCircle(
    x: number,
    y: number,
    r: number,
    s: number,
    e: number,
    counterclockwise = false
  ) {
    this.ctx.beginPath();
    this.ctx.fillStyle = "blue";
    this.ctx.strokeStyle = "white";
    this.ctx.arc(x, y, r, s, e, counterclockwise);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawMultiLineString(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontColor: string
  ) {
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const lines = text.split("\n");
    this.ctx.save();
    this.ctx.font = `sans-serif ${fontSize}px`;
    const textWidth = this.ctx.measureText(lines).width;
    const midHeight =
      this.ctx.measureText(lines).actualBoundingBoxAscent +
      this.ctx.measureText(lines).actualBoundingBoxDescent;
    this.ctx.translate(x, y - midHeight * lines.length);
    this.ctx.fillStyle = this.props.options.labels.textColor;
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(
        lines[i].toUpperCase(),
        0 + textWidth / 2,
        i * fontSize
      );
    }
    this.ctx.restore();
  }

  updateCanvas() {
    const ratio = this.calculateRatio();
    this.canvas.width = Math.ceil(this.canvas.clientWidth * ratio);
    this.canvas.height = Math.ceil(this.canvas.clientHeight * ratio);
    this.canvas.style.width = this.props.width + "px";
    this.canvas.style.height = this.props.height + "px";
    this.canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    this.ctx = this.canvas.getContext("2d");
  }

  render() {
    return <></>;
  }
}
