/**
 * 实时波形图 — 使用 ECharts 渲染呼吸+心跳混合波形
 */
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface Props {
  data: number[]
  streaming: boolean
}

export default function WaveformChart({ data, streaming }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current, 'dark')

    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      grid: { left: 50, right: 20, top: 20, bottom: 35 },
      xAxis: {
        type: 'value',
        name: '帧序号',
        nameTextStyle: { color: '#9aa0a6', fontSize: 11 },
        axisLine: { lineStyle: { color: '#2d3140' } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#2d3140', type: 'dashed' } },
      },
      yAxis: {
        type: 'value',
        name: '幅值',
        nameTextStyle: { color: '#9aa0a6', fontSize: 11 },
        axisLine: { lineStyle: { color: '#2d3140' } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#2d3140', type: 'dashed' } },
        min: -1,
        max: 1,
      },
      series: [
        {
          type: 'line',
          data: [],
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#4fc3f7', width: 1.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79, 195, 247, 0.3)' },
              { offset: 1, color: 'rgba(79, 195, 247, 0.02)' },
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
  }, [])

  // 更新数据
  useEffect(() => {
    if (!chartInstance.current) return
    const chartData = data.map((v, i) => [i, v])
    chartInstance.current.setOption({
      series: [{ data: chartData }],
      xAxis: {
        min: Math.max(0, data.length - 500), // 显示最近 500 点
        max: data.length + 10,
      },
    })
  }, [data])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      {!streaming && data.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#555',
          fontSize: 14,
        }}>
          等待采集开始...
        </div>
      )}
    </div>
  )
}
