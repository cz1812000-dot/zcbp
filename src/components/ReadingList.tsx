import { Trash2, Sun, Sunset, Moon, CloudMoon, Heart, Calendar } from 'lucide-react';
import { BPReading, getBPCategory } from '../types';

interface ReadingListProps {
  readings: BPReading[];
  onDelete: (id: string) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TimeOfDayIcon({ timeOfDay }: { timeOfDay: BPReading['timeOfDay'] }) {
  const iconProps = { className: 'w-4 h-4' };
  switch (timeOfDay) {
    case 'morning':
      return <Sun {...iconProps} className="w-4 h-4 text-amber-500" />;
    case 'afternoon':
      return <Sunset {...iconProps} className="w-4 h-4 text-orange-500" />;
    case 'evening':
      return <Moon {...iconProps} className="w-4 h-4 text-indigo-500" />;
    case 'night':
      return <CloudMoon {...iconProps} className="w-4 h-4 text-slate-500" />;
    default:
      return null;
  }
}

export function ReadingList({ readings, onDelete }: ReadingListProps) {
  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No readings yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Start tracking your blood pressure by adding your first reading.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pb-4">
      {readings.map((reading) => {
        const categoryInfo = getBPCategory(reading.systolic, reading.diastolic);
        return (
          <div
            key={reading.id}
            className={`relative rounded-xl border-2 ${categoryInfo.borderColor} ${categoryInfo.bgColor} overflow-hidden transition-all hover:shadow-md`}
          >
            {categoryInfo.urgent && (
              <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 text-center">
                {categoryInfo.description}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.color} border ${categoryInfo.borderColor}`}>
                      {categoryInfo.label}
                    </span>
                    {reading.timeOfDay && <TimeOfDayIcon timeOfDay={reading.timeOfDay} />}
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-bold ${categoryInfo.color}`}>
                      {reading.systolic}/{reading.diastolic}
                    </span>
                    <span className="text-sm text-gray-500">mmHg</span>
                  </div>

                  {reading.pulse && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-gray-600">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{reading.pulse}</span>
                      <span className="text-xs text-gray-400">bpm</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>{formatDate(reading.timestamp)}</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatTime(reading.timestamp)}</span>
                  </div>

                  {reading.notes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {reading.notes}
                    </p>
                  )}

                  {reading.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={reading.imageUrl}
                        alt="BP Reading"
                        className="h-20 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDelete(reading.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete reading"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
