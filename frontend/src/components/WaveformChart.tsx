import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface Props {
  data: number[]
  streaming: boolean
  color?: string
  title?: string
  emptyText?: string
  min?: number
  max?: number
}

export default function WaveformChart({
  data,
  streaming,
  color = '#70e5ce',
  title = 'waveform',
  emptyText = '等待采集开始，实时数据流会显示在这里。',
  min = -1,
  max = 1,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current, 'dark')

    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      grid: { left: 46, right: 18, top: 34, bottom: 32 },
      title: {
        text: title,
        left: 8,
        top: 2,
        textStyle: {
          color: '#8fa5a4',
          fontFamily: 'JetBrains Mono, SF Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
        },
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(166,232,224,0.18)' } },
        axisLabel: { color: '#6f8584', fontSize: 10 },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(166,232,224,0.08)', type: 'dashed' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(166,232,224,0.18)' } },
        axisLabel: { color: '#6f8584', fontSize: 10 },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(166,232,224,0.08)', type: 'dashed' } },
        min,
        max,
      },
      series: [
        {
          type: 'line',
          data: [],
          smooth: true,
          symbol: 'none',
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}42` },
              { offset: 1, color: `${color}03` },
            ]),
          },
          animation: false,
        },
      ],
    })

    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [color, max, min, title])

  useEffect(() => {
    if (!chartInstance.current) return
    const chartData = data.map((value, index) => [index, value])
    chartInstance.current.setOption({
      series: [{ data: chartData }],
      xAxis: {
        min: Math.max(0, data.length - 500),
        max: Math.max(40, data.length + 10),
      },
    })
  }, [data])

  return (
    <div className="chart-shell">
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      {!streaming && data.length === 0 && <div className="chart-empty">{emptyText}</div>}
    </div>
  )
}
