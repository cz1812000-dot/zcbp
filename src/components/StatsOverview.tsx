import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { BPReading, getBPCategory } from '../types';

interface StatsOverviewProps {
  readings: BPReading[];
}

export function StatsOverview({ readings }: StatsOverviewProps) {
  if (readings.length === 0) {
    return null;
  }

  const last7 = readings.slice(0, 7);
  const prev7 = readings.slice(7, 14);

  const avgSys = Math.round(last7.reduce((sum, r) => sum + r.systolic, 0) / last7.length);
  const avgDia = Math.round(last7.reduce((sum, r) => sum + r.diastolic, 0) / last7.length);
  const avgPulse = last7.filter(r => r.pulse).length > 0
    ? Math.round(last7.filter(r => r.pulse).reduce((sum, r) => sum + (r.pulse || 0), 0) / last7.filter(r => r.pulse).length)
    : null;

  let sysTrend: 'up' | 'down' | 'same' = 'same';
  let diaTrend: 'up' | 'down' | 'same' = 'same';

  if (prev7.length > 0) {
    const prevAvgSys = Math.round(prev7.reduce((sum, r) => sum + r.systolic, 0) / prev7.length);
    const prevAvgDia = Math.round(prev7.reduce((sum, r) => sum + r.diastolic, 0) / prev7.length);

    const sysDiff = avgSys - prevAvgSys;
    const diaDiff = avgDia - prevAvgDia;

    sysTrend = sysDiff > 2 ? 'up' : sysDiff < -2 ? 'down' : 'same';
    diaTrend = diaDiff > 2 ? 'up' : diaDiff < -2 ? 'down' : 'same';
  }

  const latest = readings[0];
  const categoryInfo = getBPCategory(latest.systolic, latest.diastolic);

  const TrendIcon = sysTrend === 'up' || diaTrend === 'up'
    ? TrendingUp
    : sysTrend === 'down' || diaTrend === 'down'
      ? TrendingDown
      : Minus;

  return (
    <div className="px-4 pb-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">Systolic</div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{avgSys}</span>
            {prev7.length > 0 && (
              sysTrend === 'up' ? <TrendingUp className="w-4 h-4 text-amber-500 mb-0.5" /> :
              sysTrend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-500 mb-0.5" /> :
              <Minus className="w-4 h-4 text-gray-400 mb-0.5" />
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">avg last 7</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">Diastolic</div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-gray-900">{avgDia}</span>
            {prev7.length > 0 && (
              diaTrend === 'up' ? <TrendingUp className="w-4 h-4 text-amber-500 mb-0.5" /> :
              diaTrend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-500 mb-0.5" /> :
              <Minus className="w-4 h-4 text-gray-400 mb-0.5" />
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">avg last 7</div>
        </div>

        {avgPulse && (
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-0.5">Pulse</div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-gray-900">{avgPulse}</span>
              <Activity className="w-4 h-4 text-red-500 mb-0.5" />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">avg last 7</div>
          </div>
        )}
      </div>

      <div className={`rounded-xl border-2 ${categoryInfo.borderColor} ${categoryInfo.bgColor} p-3`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-sm font-semibold ${categoryInfo.color}`}>
              Latest: {latest.systolic}/{latest.diastolic}
            </div>
            <div className={`text-xs ${categoryInfo.color} opacity-75`}>
              {categoryInfo.label}
            </div>
          </div>
          {!categoryInfo.urgent && (
            <TrendIcon className={`w-5 h-5 ${
              sysTrend === 'down' || diaTrend === 'down' ? 'text-emerald-600' :
              sysTrend === 'up' || diaTrend === 'up' ? 'text-amber-600' : 'text-gray-400'
            }`} />
          )}
        </div>
      </div>
    </div>
  );
}
