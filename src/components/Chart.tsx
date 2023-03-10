import useMeasure from "react-use-measure";
import * as d3 from "d3";
import { differenceInWeeks, add, format, startOfYear, eachYearOfInterval, endOfYear } from "date-fns";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { type CovidData, KEYS } from "../utils/covid";

type Props = {
  data: CovidData[string];
};

export function Chart({ data }: Props) {
  const [ref, bounds] = useMeasure();

  return (
    <div className="relative mt-2 mb-4 aspect-21/9 w-full" ref={ref}>
      {bounds.width > 0 && <ChartInner list={data} width={bounds.width} height={bounds.height} />}
    </div>
  );
}

type ChartInnerProps = {
  list: CovidData[string];
  width: number;
  height: number;
};

function ChartInner({ list, width, height }: ChartInnerProps) {
  const margin = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 45,
  };

  const yDomain = d3.extent(list.map((item) => item[KEYS.Kum_fall_100000inv])) as [number, number];
  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .range([height - margin.bottom, margin.top]);

  const yTicks = yScale.ticks(5);

  const dates = list.map((item) => {
    const date = new Date(`${item[KEYS.år]}-01-01`);
    return add(date, { weeks: item[KEYS.veckonummer] });
  });

  const startDate = startOfYear(dates.at(0)!);
  const endDate = endOfYear(dates.at(-1)!);
  const years = eachYearOfInterval({ start: startDate, end: endDate });

  const xScale = d3
    .scaleTime()
    .domain([startDate, endDate])
    .range([margin.left, width - margin.right]);

  const yPoints = list.map((item) => yScale(item[KEYS.Kum_fall_100000inv]));
  const xPoints = dates.map((date) => xScale(date));

  const data: Array<[number, number]> = yPoints.map((y, i) => [xPoints[i], y]);
  const lineGenerator = d3.line();
  const d = lineGenerator(data)!;

  const ref = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

  const handleMouseMove = ({ clientX }: { clientX: number }) => {
    const svgElement = ref.current;
    const tooltipElement = tooltipRef.current;
    if (!svgElement || !tooltipElement) {
      return;
    }

    const plottedWeeks = differenceInWeeks(dates.at(-1)!, dates.at(0)!) + 1;

    const startOffset = xScale(dates.at(0)!) - xScale(startDate);
    const endOffset = xScale(endDate) - xScale(dates.at(-1)!);

    const bounds = svgElement.getBoundingClientRect();
    const plottedWidth = bounds.width - margin.left - margin.right - startOffset - endOffset;
    const mouseX = clientX - bounds.left - margin.left - startOffset;

    const fractionX = mouseX / plottedWidth;

    let index = Math.round(fractionX * plottedWeeks);
    index = Math.min(list.length - 1, Math.max(0, index));

    const y = yScale(list[index][KEYS.Kum_fall_100000inv]);
    const x = xScale(dates[index]);

    //clamp tooltip position
    const { width: tooltipWidth } = tooltipElement.getBoundingClientRect();
    const halfW = tooltipWidth * 0.5;
    const minX = halfW;
    const maxX = bounds.width - halfW;
    tooltipElement.style.top = `${Math.max(y, 0)}px`;
    tooltipElement.style.left = `${clamp(x, minX, maxX)}px`;

    setHoveredIndex(index);
  };

  return (
    <>
      <div
        ref={tooltipRef}
        className={`${
          hoveredIndex === undefined
            ? "invisible"
            : "pointer-events-none absolute translate-x-[-50%] translate-y-[-105%] select-none rounded-sm bg-white p-2 text-black dark:bg-black dark:text-white"
        }`}
      >
        {hoveredIndex !== undefined && (
          <>
            <p className="whitespace-nowrap text-sm">{format(dates[hoveredIndex], "yyyy-MM-dd")}</p>
            <p className="whitespace-nowrap text-sm">
              procent: {Math.round(list[hoveredIndex][KEYS.Kum_fall_100000inv] / 1000)}%
            </p>
            <p className="whitespace-nowrap text-sm">antal totalt</p>
            <p className="whitespace-nowrap text-sm">fall: {list[hoveredIndex][KEYS.Kum_antal_fall]}</p>
            <p className="whitespace-nowrap text-sm">avlidna: {list[hoveredIndex][KEYS.Kum_antal_avlidna]}</p>
            <p className="whitespace-nowrap text-sm">
              intensivvårdade {list[hoveredIndex][KEYS.Kum_antal_intensivvårdade]}
            </p>
          </>
        )}
      </div>
      <svg
        ref={ref}
        onPointerMove={(e) => handleMouseMove({ clientX: e.clientX })}
        onPointerLeave={() => setHoveredIndex(undefined)}
        onTouchStart={(e) => handleMouseMove({ clientX: e.touches[0].clientX })}
        onTouchMove={(e) => handleMouseMove({ clientX: e.touches[0].clientX })}
        onTouchCancel={() => setHoveredIndex(undefined)}
        className="h-full w-full select-none overflow-x-hidden"
        viewBox={`0 0 ${width} ${height}`}
      >
        {years.map((year, i) => {
          const rectWidth = xScale(endOfYear(year)) - xScale(year);
          return (
            <g key={i} transform={`translate(${xScale(year)},0)`}>
              {i % 2 == 0 && (
                <rect
                  width={rectWidth}
                  height={height - margin.bottom}
                  fill="currentColor"
                  className="text-neutral-200 dark:text-neutral-800"
                />
              )}
              <text
                x={0.5 * rectWidth}
                y={height}
                textAnchor="middle"
                fill="currentColor"
                className="text-md font-semibold text-neutral-600 dark:text-neutral-300"
              >
                {format(year, "yyyy")}
              </text>
            </g>
          );
        })}

        {yTicks.map((val, i) => {
          return (
            <g key={i} transform={`translate(0,${yScale(val)})`}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                //y1={yScale(tick)}
                //y2={yScale(tick)}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="1,3"
                className="text-neutral-400 dark:text-neutral-600"
              />
              <text
                dominantBaseline="middle"
                textAnchor="end"
                x={margin.left - 5}
                //y={yScale(tick)}
                fill="currentColor"
                className="text-xs text-neutral-600 dark:text-neutral-300"
              >
                {val / 1000}%
              </text>
            </g>
          );
        })}

        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-blue-500"
        />

        {/* y.map((val, i) => {
          return <circle key={i} r="2" cx={xPoints[i]} cy={yScale(val)} />;
        }) */}

        {hoveredIndex !== undefined && (
          <circle
            r="6"
            cx={xPoints[hoveredIndex]}
            cy={yScale(list[hoveredIndex][KEYS.Kum_fall_100000inv])}
            fill="currentColor"
            className="text-blue-400"
          />
        )}
      </svg>
    </>
  );
}

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(x, b));
}
