// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom";
import { merge, get } from "lodash";
import dayjs from "dayjs";

type ChartInterface = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} & Partial<DefaultProps>;

const tooltipRegex = /{(?<resource>label|dsd)([\|date:](?<format>[a-zA-Z,: [\]]+)|.(?<index>[0-9{1, 9}]))}/gm;

const defaultProps = {
  data: {} as any,
  id: "" as string,
  width: 300 as number,
  height: 150 as number,
  options: {
    backgroundColor: "rgba(38, 55, 76, 1)" as string,
    padding: 0 as string | number[],
    onPointClick: () => {},
    labels: {
      type: "" as string,
      format: "" as string,
      textColor: "rgba(141, 171, 196, 1)" as string,
    },
    graph: {
      border: true as boolean,
      borderWidth: 1 as number,
      borderColor: "rgba(63, 83, 110, 1)" as string,
      backgroundColor: "rgba(33, 47, 64, 1)" as string,
      point: {
        backdropPoint: false as boolean,
        pointColor: "rgba(33, 47, 64, 1)" as string,
        strokeColor: "rgba(33, 47, 64, 1)" as string,
        strokeWidth: 1 as number,
        radius: 5 as number,
        singleHoverHighlight: true as boolean,
        selected: {
          pointColor: "transparent" as string,
          strokeColor: "rgba(255, 255, 255, 1)" as string,
          strokeWidth: 2 as number,
        },
      },
      path: {
        borderColor: "rgba(141, 171, 196, 1)" as string,
        borderWidth: 2 as number,
      },
    },
    indicators: {
      borderWidth: 1 as number,
      borderColor: "rgba(141, 171, 196, 1)" as string,
      backgroundColor: "rgba(33, 47, 64, 1)" as string,
      fontSize: 9 as number,
      letterSpacing: 0.5 as number,
      fontColor: "rgba(255, 255, 255, 1)" as string,
    },
    yAxis: {
      min: 1 as number,
      max: 300 as number,
    },
    XAxis: {
      min: 1 as number,
      max: 1 as number,
    },
  } as any,
  redaw: false as boolean,
  type: "line" as "line" | "bar" | "smart",
};

type DefaultProps = Readonly<typeof defaultProps>;

export class Chart extends React.Component<ChartInterface> {
  chart: SVGSVGElement;
  chartPadding: number[] = [];
  points: number[] = [];

  static defaultProps = defaultProps;

  constructor(props: any, ref: any) {
    super(merge(defaultProps, props));
    if (ref && ref.current) {
      this.chart = ref.current;
      this.init();
    }
  }

  updateGraph() {
    this.generatePadding();
  }

  generatePadding() {
    const padding = this.getOption("padding");

    if (Array.isArray(padding)) {
      if (padding.length === 4) {
        this.chartPadding = padding;
      } else if (padding.length === 2) {
        this.chartPadding = Array.from({ length: 2 }, () => padding).flat();
      } else if (padding.length === 1) {
        this.chartPadding = Array(4).fill(padding[0]);
      }
    } else {
      this.chartPadding = Array(4).fill(padding);
    }

    // Recalculate Width & Height
    const [top, right, bottom, left] = this.chartPadding;
    const width = this.chart.clientWidth + left + right;
    const height = this.chart.clientHeight + top + bottom;

    this.chart.style.width = `${width}px`;
    this.chart.style.height = `${height}px`;
  }

  componentDidMount() {
    this.updateGraph();
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

  getOption(option) {
    return get(this.props.options, option, "");
  }

  drawLineChart() {
    this.updateGraph();

    const [top, right, bottom, left] = this.chartPadding;
    const [graphWidth, graphHeight] = [
      this.chart.clientWidth - right - left,
      this.chart.clientHeight - top - bottom,
    ];
    const sections = this.props.data.labels.length || 0;
    const sectionWidth = graphWidth / sections;

    this.calculatePointLocations(
      top,
      right,
      bottom,
      left,
      sectionWidth,
      graphWidth,
      graphHeight
    );

    const html = (
      <>
        {this.getOption("backgroundColor") && (
          <>
            {/* Display SVG Background */}
            <rect
              x={0}
              y={0}
              width={this.chart.clientWidth}
              height={this.chart.clientHeight}
              fill={this.getOption("backgroundColor")}
            />

            {/* Display Graph */}
            <rect
              id={`graph-rect`}
              x={left}
              y={top}
              width={graphWidth}
              height={graphHeight}
              fill={this.getOption("graph.backgroundColor")}
              stroke={this.getOption("graph.borderColor")}
              strokeWidth={this.getOption("graph.borderWidth")}
            />

            {/* Display Indicators */}
            {this.props.data.indicators &&
              this.props.data.indicators.map((indicator) => {
                const width = 37,
                  height = 16,
                  x = width / 2,
                  y = graphHeight - indicator;

                return (
                  <g
                    key={`${this.chart.id}-indicator-${indicator}`}
                    id={`${this.chart.id}-indicator-${indicator}`}
                    className="indicator"
                  >
                    <rect
                      x={x}
                      y={y - height / 2}
                      width={width}
                      height={height}
                      rx={height / 2}
                      fill={this.getOption("indicators.backgroundColor")}
                      stroke={this.getOption("indicators.borderColor")}
                      strokeWidth={this.getOption("indicators.borderWidth")}
                    />
                    <foreignObject
                      x={x}
                      y={y - height / 2}
                      width={width}
                      height={height}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <div>{indicator}</div>
                    </foreignObject>
                    <line
                      x1={x + width}
                      y1={y}
                      x2={graphWidth + left + 20}
                      y2={y + height / 2}
                      stroke={this.getOption("indicators.borderColor")}
                      strokeWidth={this.getOption("indicators.borderWidth")}
                      strokeDasharray={4}
                    />
                  </g>
                );
              })}

            {/* Display Labels */}
            {this.props.data.labels &&
              this.props.data.labels.map((label: string, index: number) => {
                let displayLabel = label;
                if (this.getOption("labels.type") === "date") {
                  displayLabel = dayjs(label).format(
                    this.getOption("labels.format")
                  );
                }
                const x = left + sectionWidth * index,
                  y = graphHeight + bottom,
                  lines = displayLabel.split("\n").length,
                  height = 9 / 2 + 9 * lines;
                return (
                  <g
                    key={`${this.chart.id}-x-axis-labels-${index}`}
                    className="x-axis-labels"
                  >
                    <foreignObject
                      x={x}
                      y={y}
                      width={sectionWidth}
                      height={height}
                    >
                      <div>{displayLabel}</div>
                    </foreignObject>
                  </g>
                );
              })}

            {/* Generate Bars */}
            {sections > 0 &&
              Array(sections)
                .fill(true)
                .map((section: number, index: number) => {
                  if (index > 0) {
                    return (
                      <line
                        key={`${this.chart.id}-x-axis-dividers-${index}`}
                        className={`${this.chart.id}-x-axis-dividers-${index}`}
                        x1={left + sectionWidth * index}
                        y1={top}
                        x2={left + sectionWidth * index}
                        y2={this.chart.clientHeight - bottom}
                        stroke={this.getOption("graph.borderColor")}
                        strokeWidth={this.getOption("graph.borderWidth")}
                      />
                    );
                  }
                })}

            {/* Generate Label Blocks */}
            {this.props.data.labelBox &&
              this.props.data.labelBox.map((box, index) => {
                const width = 40,
                  height = 16,
                  radius = height / 2,
                  x = left + sectionWidth * index + width - height / 2,
                  y = graphHeight + bottom - height - height / 4;
                if (!box) return null;
                return (
                  <g
                    key={`${this.chart.id}-label-box-${index}`}
                    className={`x-axis-box`}
                    width={sectionWidth}
                    x={x}
                    y={y}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={radius}
                      fill={this.getOption("indicators.backgroundColor")}
                      stroke={this.getOption("indicators.borderColor")}
                      strokeWidth={this.getOption("indicators.borderWidth")}
                    />
                    <foreignObject x={x} y={y} width={width} height={height}>
                      <div>{box}</div>
                    </foreignObject>
                  </g>
                );
              })}

            {/* Generate Points & Paths */}
            {this.points &&
              this.points.map((points, index) => (
                <g key={`dataset-${index}`} id={`dataset-${index}`}>
                  {/* Generate Paths */}
                  {this.drawPaths(points, index)}

                  {/* Generate Points */}
                  {this.drawPoints(points, index)}
                </g>
              ))}

            {/* Generate Tooltip */}
            {this.drawToolTip()}
          </>
        )}
      </>
    );

    ReactDOM.render(html, this.chart);
  }

  drawToolTip() {
    const parseToolTipData = (data) => {
      const matches = [...data.matchAll(tooltipRegex)];
      for (let match of matches) {
        if (match.groups.resource === "label") {
          data = data.replace(match[0], "");
        }
      }
      return data;
    };

    const constructHtml = { __html: parseToolTipData(this.props.data.tooltip) };
    return (
      <foreignObject width="200" x={200} y={200} id="tooltip-fo">
        <div
          className="chart-tooltip"
          dangerouslySetInnerHTML={constructHtml}
        ></div>
      </foreignObject>
    );
  }

  calculatePointLocations(
    top,
    right,
    bottom,
    left,
    sectionWidth,
    graphWidth,
    graphHeight
  ) {
    for (let i = 0; i < this.props.data.datasets.length; i++) {
      this.points.push([]);
      for (let x = 0; x < this.props.data.datasets[i].data.length; x++) {
        if (Array.isArray(this.props.data.datasets[i].data[x])) {
          for (let z = 0; z < this.props.data.datasets[i].data[x].length; z++) {
            const spacing =
              (sectionWidth - 15) / this.props.data.datasets[i].data[x].length;
            this.points[i].push([
              left + sectionWidth * x + (z > 0 ? spacing * z : 15),
              graphHeight - this.props.data.datasets[i].data[x][z],
              0,
              this.props.data.datasets[i].data[x][z],
            ]);
          }
        } else {
          const { radius } = this.getOption("graph.point");
          this.points[i].push([
            left + sectionWidth * x + 1 * 15,
            graphHeight - this.props.data.datasets[i].data[x] + radius / 2,
            0,
            this.props.data.datasets[i].data[x],
          ]);
        }
      }
    }
  }

  getDataSetsOption(dataset: any, index: number, option: string) {
    if (get(dataset, option, false)) {
      if (Array.isArray(dataset[option])) {
        return dataset[option][index]
          ? get(dataset, `${option}.${index}`, false)
          : get(dataset, `${option}.${index - 1}`, false);
      }
      return get(dataset, option, false);
    }
  }

  drawPaths(points: [], i?: number) {
    const line = (pointA: any, pointB: any) => {
      const lengthX = pointB[0] - pointA[0],
        lengthY = pointB[1] - pointA[1];

      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
      };
    };

    let lines = [];

    points.reduce((previous, current, index, array) => {
      const p = array[index - 1] || current;
      const n = array[index + 1] || current;
      const l = line(p, n);

      const length = 0;
      const angle = l.angle + (array ? Math.PI : 0);
      const x = current[0] + angle * length;
      const y = current[1] + angle * length;

      lines.push(
        <line
          key={`${this.chart.id}-point-path-${index}-${
            l.length
          }-${Math.random()}`}
          x1={p[0]}
          y1={p[1]}
          x2={x}
          y2={y}
          stroke={this.getOption("graph.path.borderColor")}
          strokeWidth={this.getOption("graph.path.borderWidth")}
        />
      );

      return false;
    });

    return lines;
  }

  setElementStyle(element: Element, ...args) {
    let i = 0;
    const l = args.length;
    while (i < l) {
      const previous = args[i - 1];
      const current = args[i];

      if (i % 2) {
        element.style[previous] = current;
      }

      i++;
    }
  }

  drawPoints(points: [], index?: number) {
    const handlePointMouseEnter = (event) => {
      const [x, y] = [
        parseInt(event.target.getAttribute("cx"), 10),
        parseInt(event.target.getAttribute("cy"), 10),
      ];
      const tooltip = document.getElementById("tooltip-fo");
      const chart = document.getElementById("graph-rect");
      if (chart && tooltip) {
        tooltip.classList.add("visible");
        if (parseInt(chart.getAttribute("height"), 10) / 2 > y) {
          tooltip.setAttribute(
            "x",
            x - parseInt(tooltip.children[0].clientWidth, 10) / 2
          );
          tooltip.setAttribute(
            "y",
            y - (tooltip.children[0].clientHeight / 2) * 3
          );
          tooltip.children[0].classList.add("down");
        } else {
          tooltip.setAttribute(
            "x",
            x - parseInt(tooltip.children[0].clientWidth, 10) / 2
          );
          tooltip.setAttribute(
            "y",
            y + parseInt(tooltip.children[0].clientHeight, 10) / 2
          );
          tooltip.children[0].classList.remove("down");
        }
      }
    };

    const handlePointMouseLeave = (event) => {
      const tooltip = document.getElementById("tooltip-fo");
      const chart = document.getElementById("graph-rect");
      if (chart && tooltip) {
        tooltip.classList.remove("visible");
      }
    };

    const handlePointMouseClick = (event) => {
      const { onPointClick } = this.props.options,
        { singleHoverHighlight } = this.getOption("graph.point");

      if (!singleHoverHighlight) {
        const pointInfIndex = event.target.getAttribute("data-index"),
          pi = pointInfIndex.split(",")[1],
          dslength = this.props.data.datasets.length;
        for (let i = 0; i < dslength; i++) {
          const element = document.querySelector(
            `circle[data-index="${i},${pi}"]`
          );

          const targetClassList = element.classList;

          if (targetClassList.contains("selected")) {
            const styleData = JSON.parse(element.getAttribute("data-style"));
            targetClassList.remove("selected");
            this.setElementStyle(
              element,
              "stroke",
              styleData.stroke,
              "strokeWidth",
              styleData.strokeWidth
            );
          } else {
            targetClassList.add("selected");
            this.setElementStyle(
              element,
              "stroke",
              this.getOption("graph.point.selected.strokeColor"),
              "strokeWidth",
              this.getOption("graph.point.selected.strokeWidth")
            );
            this.setElementStyle(element, "stroke", "white", "strokeWidth", 2);
          }
        }
      } else {
        if (event && event.target) {
          const targetClassList = event.target.classList;
          if (targetClassList.contains("selected")) {
            const styleData = JSON.parse(
              event.target.getAttribute("data-style")
            );
            targetClassList.remove("selected");
            this.setElementStyle(
              event.target,
              "stroke",
              styleData.stroke,
              "strokeWidth",
              styleData.strokeWidth
            );
          } else {
            targetClassList.add("selected");
            this.setElementStyle(
              event.target,
              "stroke",
              this.getOption("graph.point.selected.strokeColor"),
              "strokeWidth",
              this.getOption("graph.point.selected.strokeWidth")
            );
          }
        }
      }

      if (onPointClick) {
        onPointClick(event, event.target.getAttribute("data-index"));
      }
    };

    const drawnPoints = [];
    points.forEach((p, pIndex) => {
      // const { radius, pointColor, strokeColor, strokeWidth } = this.getOption(
      //   "graph.point"
      // );
      // if (this.getOption("graph.point.backdropPoint")) {
      //   drawnPoints.push(
      //     <circle
      //       key={`point-backdrop-${p[0]}-${[1]}-${Math.random()}`}
      //       cx={p[0]}
      //       cy={p[1]}
      //       r={radius}
      //       fill={pointColor}
      //       stroke={strokeColor}
      //       strokeWidth={strokeWidth}
      //     />
      //   );
      // }
      // const pointFill =
      //   this.getDataSetsOption(
      //     this.props.data.datasets[index],
      //     pIndex,
      //     "pointColor"
      //   ) || pointColor;
      // const pointStroke =
      //   this.getDataSetsOption(
      //     this.props.data.datasets[index],
      //     pIndex,
      //     "strokeColor"
      //   ) || strokeColor;
      // const pointStrokeWidth =
      //   this.getDataSetsOption(
      //     this.props.data.datasets[index],
      //     pIndex,
      //     "strokeWidth"
      //   ) || strokeWidth;
      // drawnPoints.push(
      //   <circle
      //     key={`point-${p[0]}-${[1]}-${Math.random()}`}
      //     className="chart-point"
      //     cx={p[0]}
      //     cy={p[1]}
      //     r={radius}
      //     onMouseEnter={handlePointMouseEnter}
      //     onMouseLeave={handlePointMouseLeave}
      //     onClick={handlePointMouseClick}
      //     data-value={p[3]}
      //     data-index={`${index},${pIndex}`}
      //     data-style={JSON.stringify({
      //       fill: pointFill,
      //       stroke: pointStroke,
      //       strokeWidth: pointStrokeWidth,
      //     })}
      //     fill={pointFill}
      //     stroke={pointStroke}
      //     strokeWidth={pointStrokeWidth}
      //   />
      // );
    });
    return drawnPoints;
  }
}
