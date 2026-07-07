import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { BPReading } from '../types';

interface BPChartProps {
  readings: BPReading[];
}

function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function BPChart({ readings }: BPChartProps) {
  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
        Add readings to see your trends
      </div>
    );
  }

  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const chartData = sortedReadings.map((reading) => ({
    date: formatDateShort(reading.timestamp),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    fullDate: reading.timestamp,
  }));

  const lastReadings = chartData.slice(-14);

  return (
    <div className="w-full h-[250px] px-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={lastReadings}
          margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis
            domain={[40, 200]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              `${value} mmHg`,
              name === 'systolic' ? 'Systolic' : 'Diastolic',
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const fullDate = payload[0].payload.fullDate;
                return new Date(fullDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }
              return label;
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === 'systolic' ? 'Systolic' : 'Diastolic'
            }
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <ReferenceLine
            y={120}
            stroke="#3b82f6"
            strokeDasharray="5 5"
            strokeOpacity={0.4}
            label={{ value: '120', position: 'right', fontSize: 10, fill: '#3b82f6' }}
          />
          <ReferenceLine
            y={80}
            stroke="#3b82f6"
            strokeDasharray="5 5"
            strokeOpacity={0.4}
            label={{ value: '80', position: 'right', fontSize: 10, fill: '#3b82f6' }}
          />
          <ReferenceLine
            y={140}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
            label={{ value: '140', position: 'right', fontSize: 10, fill: '#ef4444' }}
          />
          <ReferenceLine
            y={90}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
            label={{ value: '90', position: 'right', fontSize: 10, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 2 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
