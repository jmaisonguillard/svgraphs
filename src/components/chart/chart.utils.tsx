import React from "react";
import ReactDOM from "react-dom";
import { merge, get } from "lodash";
import dayjs from "dayjs";
import useEventBus from "../../helpers/useEventBus";

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
    backgroundColor: "rgba(38, 55, 76, 1)" as string,
    padding: (0 as unknown) as string | number[],
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
        customClass: () => {},
        callbacks: {
          selectAll() {},
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
    tooltips: {
      callbacks: {
        innerHtml: (tooltipItem, data) => {},
      },
    },
  } as any,
  redaw: false as boolean,
  type: "line" as "line" | "bar" | "smart",
};

type DefaultProps = Readonly<typeof defaultProps>;

export class Chart extends React.Component<ChartInterface> {
  chart: SVGSVGElement;
  chartPadding: number[] = [];
  points: any[] = [];
  useEventBus = useEventBus;

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

  componentWillUnmount() {
    if (this.props.type === "line")
      useEventBus.remove(`${this.chart.id}-selectAll`, () => {});
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

    useEventBus.on(
      `${this.chart.id}-selectAll`,
      this.selectAllPoints.bind(this)
    );

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
              className="chart-inner-graph"
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
                  y = graphHeight - indicator + top;

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
                      y2={y}
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
                const lines = displayLabel.split("\n").length,
                  height = 9 / 2 + 9 * lines,
                  x = left + sectionWidth * index,
                  y = graphHeight + top + height / 2;
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
                  return index > 0 ? (
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
                  ) : null;
                })}

            {/* Generate Label Blocks */}
            {this.props.data.labelBox &&
              this.props.data.labelBox.map((box: string, index: number) => {
                const width = 40,
                  height = 16,
                  radius = height / 2,
                  x = left + sectionWidth * index + width - height / 2,
                  y = graphHeight + top - height / 2;
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
    const constructHtml = { __html: "" };
    return (
      <foreignObject width={200} height={200} x={200} y={200} id="tooltip-fo">
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
              graphHeight + top - this.props.data.datasets[i].data[x][z],
              0,
              this.props.data.datasets[i].data[x][z],
              get(
                this,
                `props.data.datasets.${i}.pointColor.${x}.${z}`,
                this.getOption("graph.point.pointColor")
              ),
              get(
                this,
                `props.data.datasets.${i}.strokeColor.${x}.${z}`,
                this.getOption("graph.point.strokeColor")
              ),
              get(
                this,
                `props.data.datasets.${i}.strokeWidth.${x}.${z}`,
                this.getOption("graph.point.strokeWidth")
              ),
              get(this, `props.data.datasets.${i}.tooltip.${x}.${z}`, ""),
              JSON.stringify(
                Object.assign(
                  {},
                  ...this.getOption("graph.point.dataAttributes").map(
                    (attribute) => ({
                      [attribute]: get(
                        this,
                        `props.data.datasets.${i}.${attribute}.${x}.${z}`,
                        null
                      ),
                    })
                  )
                )
              ),
            ]);
          }
        } else {
          const { radius } = this.getOption("graph.point");
          this.points[i].push([
            left + sectionWidth * x + 1 * 15,
            graphHeight +
              top -
              this.props.data.datasets[i].data[x] +
              radius / 2,
            0,
            this.props.data.datasets[i].data[x],
            get(
              this,
              `props.data.datasets.${i}.pointColor.${x}`,
              this.getOption("graph.point.pointColor")
            ),
            get(
              this,
              `props.data.datasets.${i}.strokeColor.${x}`,
              this.getOption("graph.point.strokeColor")
            ),
            get(
              this,
              `props.data.datasets.${i}.strokeWidth.${x}`,
              this.getOption("graph.point.strokeWidth")
            ),
            get(this, `props.data.datasets.${i}.tooltip.${x}`, ""),
            JSON.stringify(
              Object.assign(
                {},
                ...this.getOption("graph.point.dataAttributes").map(
                  (attribute) => ({
                    [attribute]: get(
                      this,
                      `props.data.datasets.${i}.${attribute}.${x}`,
                      null
                    ),
                  })
                )
              )
            ),
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

    points.reduce(
      (previous: never, current: never, index: number, array: never[]) => {
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

        return current;
      }
    );

    return lines;
  }

  toKebab(string: string) {
    return string
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  setElementStyle(element: HTMLElement, ...args) {
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

  unsetElementStyle(element: HTMLElement, ...args) {
    for (let arg of args) {
      element.style.removeProperty(this.toKebab(arg));
    }
  }

  selectAllPoints() {
    document.querySelectorAll(".chart-point").forEach((point: HTMLElement) => {
      if (point) {
        const event: any = new Event("click", { bubbles: true });
        event.synthetic = true;
        point.dispatchEvent(event);
        if (point.classList.contains("selected")) {
          this.unsetElementStyle(point, "stroke", "strokeWidth");
          point.classList.remove("selected");
        } else {
          point.classList.add("selected");
          this.setElementStyle(
            point,
            "stroke",
            this.getOption("graph.point.selected.strokeColor"),
            "strokeWidth",
            this.getOption("graph.point.selected.strokeWidth")
          );
        }
      }
    });
  }

  drawPoints(points: [], index?: number) {
    const drawnPoints = [];

    const handlePointMouseEnter = (event) => {
      const [x, y] = [
        parseInt(event.target.getAttribute("cx"), 10),
        parseInt(event.target.getAttribute("cy"), 10),
      ];
      const tooltip: HTMLElement = document.querySelector("#tooltip-fo");
      const tooltipInner: HTMLElement = document.querySelector(
        ".chart-tooltip"
      );
      const chart = document.querySelector(".chart-inner-graph");
      if (chart && tooltip && tooltipInner) {
        tooltip.style.width = `200px`;
        tooltip.style.height = `200px`;
        tooltip.children[0].innerHTML = event.target.getAttribute(
          "data-tooltip"
        );
        const tooltipData: Element = tooltipInner.children[0];
        if (tooltipData) {
          tooltip.style.width = `${tooltipData.clientWidth}px`;
          tooltip.style.height = `${tooltipData.clientHeight}px`;

          const styles: CSSStyleDeclaration = window.getComputedStyle(
            tooltipInner
          );
          const paddingLeftString =
              styles.getPropertyValue("padding-left") || "15",
            paddingLeft = parseInt(
              paddingLeftString.slice(0, paddingLeftString.length - 2),
              10
            ),
            paddingTopString = styles.getPropertyValue("padding-top") || "15",
            paddingTop = parseInt(
              paddingTopString.slice(0, paddingTopString.length - 2),
              10
            );

          tooltip.classList.add("visible");
          const [top] = this.chartPadding,
            chartHeight = parseInt(chart.getAttribute("height"), 10),
            halfChartHeight = chartHeight / 2,
            pointPosition = chartHeight + top - y,
            direction = chartHeight / 2 - pointPosition,
            maxY = -halfChartHeight,
            minY = halfChartHeight;
          if (
            (direction < 0 && direction > maxY + 30) ||
            direction > minY - 30 ||
            halfChartHeight <= direction
          ) {
            tooltip.setAttribute(
              "x",
              `${x - paddingLeft - tooltipData.clientWidth / 2}`
            );
            tooltip.setAttribute(
              "y",
              `${y - tooltipData.clientHeight * 2 - paddingTop * 2}`
            );
            tooltip.children[0].classList.add("down");
          } else if (direction > 0 || halfChartHeight >= direction) {
            tooltip.setAttribute(
              "x",
              `${x - paddingLeft - tooltipData.clientWidth / 2}`
            );
            tooltip.setAttribute(
              "y",
              `${y + paddingTop + tooltipData.clientHeight / 2}`
            );
            tooltip.children[0].classList.remove("down");
          }
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

    const handlePointMouseClick = (
      event: React.MouseEvent<HTMLElement> | any
    ) => {
      const { onPointClick } = this.props.options,
        { singleHoverHighlight } = this.getOption("graph.point");

      if (!singleHoverHighlight) {
        const pointInfIndex = event.target.getAttribute("data-index"),
          pi = pointInfIndex.split(",")[1],
          dslength = this.props.data.datasets.length;
        for (let i = 0; i < dslength; i++) {
          const element: HTMLElement = document.querySelector(
            `circle[data-index="${i},${pi}"]`
          );

          const targetClassList = element.classList;

          if (targetClassList.contains("selected")) {
            targetClassList.remove("selected");
            this.unsetElementStyle(element, "stroke", "strokeWidth");
          } else {
            targetClassList.add("selected");
            this.setElementStyle(
              element,
              "stroke",
              this.getOption("graph.point.selected.strokeColor"),
              "strokeWidth",
              this.getOption("graph.point.selected.strokeWidth")
            );
          }
        }
      } else {
        if (event && event.target) {
          const targetClassList = event.target.classList;
          if (targetClassList.contains("selected")) {
            this.unsetElementStyle(event.target, "stroke", "strokeWidth");
            targetClassList.remove("selected");
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
        onPointClick(event);
      }
    };
    points.forEach((p, pIndex) => {
      const { radius } = this.getOption("graph.point");
      const [
        x,
        y,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        acc,
        value,
        pointColor,
        strokeColor,
        strokeWidth,
        tooltip,
        data,
      ]: any[] = p;
      if (this.getOption("graph.point.backdropPoint")) {
        const { pointColor, strokeColor, strokeWidth } = this.getOption(
          "graph.option"
        );
        drawnPoints.push(
          <circle
            key={`point-backdrop-${x}-${y}-${Math.random()}`}
            cx={x}
            cy={y}
            r={radius}
            fill={pointColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      }

      const circleID = `point-${x}-${y}-${Math.random()}`;
      drawnPoints.push(
        <circle
          key={circleID}
          id={circleID}
          className={`chart-point ${this.getOption("graph.point.customClass")(
            data
          )}`}
          cx={x}
          cy={y}
          r={radius}
          onMouseEnter={handlePointMouseEnter.bind(this)}
          onMouseLeave={handlePointMouseLeave.bind(this)}
          onClick={handlePointMouseClick.bind(this)}
          data-value={value}
          data-index={`${index},${pIndex}`}
          data-style={JSON.stringify({
            fill: pointColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          })}
          data-resources={data}
          data-tooltip={tooltip}
          fill={pointColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      );
    });
    return drawnPoints;
  }
}
