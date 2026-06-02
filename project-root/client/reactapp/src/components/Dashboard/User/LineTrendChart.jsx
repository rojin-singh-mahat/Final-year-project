import { useMemo, useState } from "react";
import { X } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function LineTrendChart({
  title,
  subtitle,
  points = [],
  lineClassName = "stroke-cyan-300",
  fillClassName = "fill-cyan-500/10",
  emptyMessage = "No graph data available yet.",
  compactWindow = 30,
  showAllPoints = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const visiblePoints = useMemo(() => {
    const MAX_POINTS = 300;
    if (expanded || showAllPoints) {
      // avoid rendering extremely large arrays — show the most recent slice when huge
      if (points.length > MAX_POINTS) return points.slice(-MAX_POINTS);
      return points;
    }
    return points.slice(-Math.max(1, compactWindow));
  }, [points, compactWindow, expanded, showAllPoints]);

  const chart = useMemo(() => {
    const values = visiblePoints.map((point) => Number(point?.value) || 0);
    if (values.length === 0) return null;

    const width = expanded ? Math.max(760, visiblePoints.length * 56 + 42) : 760;
    const height = expanded ? 280 : 220;
    const yAxisWidth = 42;
    const paddingX = 16;
    const paddingY = 24;
    const xAxisHeight = expanded ? 72 : 52;
    const plotHeight = height - xAxisHeight;
    // compute min/max by reduction to avoid spreading large arrays
    let maxValue = -Infinity;
    let minValue = Infinity;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v > maxValue) maxValue = v;
      if (v < minValue) minValue = v;
    }
    if (!isFinite(maxValue)) maxValue = 1;
    if (!isFinite(minValue)) minValue = 0;
    const range = Math.max(maxValue - minValue, 1);
    const plotLeft = yAxisWidth;
    const plotRight = paddingX;
    const plotWidth = width - plotLeft - plotRight;
    const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;
    const labelEvery = expanded ? 1 : Math.max(1, Math.ceil(values.length / 8));

    const coords = values.map((value, index) => {
      const x = plotLeft + stepX * index;
      const normalized = (value - minValue) / range;
      const y = plotHeight - paddingY - normalized * (plotHeight - paddingY * 2);
      return { x, y, value, label: visiblePoints[index]?.label || "" };
    });

    const linePath = coords
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const areaPath = `${linePath} L ${coords.at(-1)?.x || plotLeft} ${plotHeight - paddingY} L ${coords[0]?.x || plotLeft} ${plotHeight - paddingY} Z`;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
      fraction,
      value: Math.round((maxValue - minValue) * fraction + minValue),
      y: plotHeight - paddingY - fraction * (plotHeight - paddingY * 2),
    }));

    return { width, height, coords, linePath, areaPath, minValue, maxValue, yAxisWidth, plotRight, ticks, xAxisHeight, plotHeight, labelEvery };
  }, [visiblePoints, expanded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="bg-[#0f141a] border border-stone-700 rounded-2xl p-5 text-left hover:border-cyan-400/40 transition-colors w-full"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-['Cinzel'] text-stone-100">{title}</h3>
            {subtitle ? <p className="text-xs text-stone-500 mt-1">{subtitle}</p> : null}
          </div>
          <span className="text-[10px] uppercase tracking-[0.16em] text-stone-500">Click to expand</span>
        </div>

        {!chart ? (
          <div className="text-center py-10 text-stone-400">{emptyMessage}</div>
        ) : (
          <div className="space-y-3">
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full overflow-visible" style={{ height: `${chart.height}px` }}>
              <defs>
                <linearGradient id="line-trend-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = chart.height - 24 - fraction * (chart.height - 48);
                const value = Math.round((chart.maxValue - chart.minValue) * fraction + chart.minValue);
                return (
                  <g key={fraction}>
                    <line x1={chart.yAxisWidth} y1={y} x2={chart.width - chart.plotRight} y2={y} stroke="rgba(120,130,150,0.18)" strokeWidth="1" />
                    <text x={chart.yAxisWidth - 6} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(150,160,175,0.8)">
                      {value}
                    </text>
                  </g>
                );
              })}

              <path d={chart.areaPath} fill="url(#line-trend-fill)" className={fillClassName} />
              <path d={chart.linePath} fill="none" strokeWidth="3" className={lineClassName} strokeLinecap="round" strokeLinejoin="round" />

              {(() => {
                const SHOW_DOTS_LIMIT = 120;
                if (chart.coords.length > SHOW_DOTS_LIMIT) return null;
                return chart.coords.map((point, index) => (
                  <g key={`${point.label}-${index}`}>
                    <circle cx={point.x} cy={point.y} r="4.5" fill="currentColor" className={lineClassName} />
                    <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                  </g>
                ));
              })()}

              {chart.coords.map((point, index) => {
                const shouldShowLabel = index % chart.labelEvery === 0 || index === chart.coords.length - 1;
                if (!shouldShowLabel) return null;

                return (
                  <g key={`label-${point.label}-${index}`}>
                    <line x1={point.x} y1={chart.plotHeight - 2} x2={point.x} y2={chart.plotHeight + 4} stroke="rgba(120,130,150,0.3)" strokeWidth="1" />
                    <text
                      x={point.x}
                      y={chart.plotHeight + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill="rgba(150,160,175,0.85)"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </button>

      {expanded && (
        <div className="fixed inset-y-0 right-0 left-0 md:left-[240px] z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-3xl border border-stone-700 bg-[#0b1016] shadow-2xl flex flex-col relative z-[10000]">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-stone-800">
              <div>
                <h3 className="text-xl font-['Cinzel'] text-stone-100">{title}</h3>
                {subtitle ? <p className="text-xs text-stone-500 mt-1">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-2 rounded-lg border border-stone-700 text-stone-300 hover:text-stone-100 hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-auto">
              {!chart ? (
                <div className="text-center py-10 text-stone-400">{emptyMessage}</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0 w-10 sm:w-12">
                      <div className="sticky top-0 z-30 w-full pt-1 pb-10 bg-[#0b1016] pr-2 h-[280px]">
                        {chart.ticks.map((tick) => (
                          <div
                            key={tick.fraction}
                            className="absolute right-2 text-[10px] text-right text-stone-500"
                            style={{ top: `${tick.y}px`, transform: "translateY(-50%)" }}
                          >
                            {tick.value}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 overflow-x-auto pb-2 relative z-20">
                      <div style={{ minWidth: `${chart.width}px` }}>
                        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="relative z-20 w-full" style={{ height: `${chart.height}px` }}>
                          <defs>
                            <linearGradient id="line-trend-fill-expanded" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
                            </linearGradient>
                          </defs>

                          {chart.ticks.map((tick) => (
                            <line
                              key={tick.fraction}
                              x1={chart.yAxisWidth}
                              y1={tick.y}
                              x2={chart.width - chart.plotRight}
                              y2={tick.y}
                              stroke="rgba(120,130,150,0.18)"
                              strokeWidth="1"
                            />
                          ))}

                          <path d={chart.areaPath} fill="url(#line-trend-fill-expanded)" className={fillClassName} />
                          <path d={chart.linePath} fill="none" strokeWidth="3" className={lineClassName} strokeLinecap="round" strokeLinejoin="round" />

                          {(() => {
                            const SHOW_DOTS_LIMIT = 120;
                            if (chart.coords.length > SHOW_DOTS_LIMIT) return null;
                            return chart.coords.map((point, index) => (
                              <g key={`${point.label}-${index}`}>
                                <circle cx={point.x} cy={point.y} r="4.5" fill="currentColor" className={lineClassName} />
                                <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                              </g>
                            ));
                          })()}

                          {chart.coords.map((point, index) => {
                            const shouldShowLabel = index % chart.labelEvery === 0 || index === chart.coords.length - 1;
                            if (!shouldShowLabel) return null;

                            return (
                              <g key={`label-${point.label}-${index}`}>
                                <line x1={point.x} y1={chart.plotHeight - 2} x2={point.x} y2={chart.plotHeight + 4} stroke="rgba(120,130,150,0.3)" strokeWidth="1" />
                                <text
                                  x={point.x}
                                  y={chart.plotHeight + 20}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="rgba(150,160,175,0.85)"
                                >
                                  {point.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}