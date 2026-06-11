"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartData = {
  month: string;
  blog: number;
  event: number;
  achievement: number;
};

export function DashboardChart({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='flex h-[436px] flex-col items-center justify-center rounded-xl border border-border bg-background p-6 shadow-sm'>
        <div className='h-full w-full animate-pulse rounded-lg bg-muted/20' />
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
      <div className='mb-6'>
        <h3 className='font-semibold text-base text-foreground tracking-tight'>Thống kê hoạt động đăng bài</h3>
        <p className='text-muted-foreground text-xs'>
          Số lượng bài đăng theo từng loại (Blog, Event, Thành tựu) trong 6 tháng gần nhất
        </p>
      </div>
      <div className='h-[320px] w-full'>
        <ResponsiveContainer height='100%' width='100%'>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid className='stroke-muted/30' strokeDasharray='3 3' vertical={false} />
            <XAxis axisLine={false} dataKey='month' dy={10} fontSize={11} stroke='#888888' tickLine={false} />
            <YAxis
              axisLine={false}
              fontSize={11}
              stroke='#888888'
              tickFormatter={(value) => `${value}`}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))"
              }}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }}
            />
            <Legend
              height={36}
              iconSize={8}
              iconType='circle'
              verticalAlign='top'
              wrapperStyle={{ fontSize: "12px", paddingBottom: "15px" }}
            />
            <Bar dataKey='blog' fill='#f97316' maxBarSize={24} name='Blog' radius={[4, 4, 0, 0]} />
            <Bar dataKey='event' fill='#10b981' maxBarSize={24} name='Event' radius={[4, 4, 0, 0]} />
            <Bar dataKey='achievement' fill='#6366f1' maxBarSize={24} name='Thành tựu' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
