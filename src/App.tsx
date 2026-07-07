import { useState, useCallback } from 'react';
import { Plus, BarChart2, List, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { BPReading } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AddReadingForm } from './components/AddReadingForm';
import { ReadingList } from './components/ReadingList';
import { BPChart } from './components/BPChart';
import { StatsOverview } from './components/StatsOverview';

type ViewTab = 'list' | 'chart';

function App() {
  const [readings, setReadings] = useLocalStorage<BPReading[]>('easybptrack_readings', []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [showStats, setShowStats] = useState(true);

  const handleAddReading = useCallback((reading: Omit<BPReading, 'id'>) => {
    const newReading: BPReading = {
      ...reading,
      id: crypto.randomUUID(),
    };
    setReadings((prev) => [newReading, ...prev].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, [setReadings]);

  const handleDeleteReading = useCallback((id: string) => {
    if (window.confirm('Delete this reading?')) {
      setReadings((prev) => prev.filter((r) => r.id !== id));
    }
  }, [setReadings]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">EasyBPTrack</h1>
                <p className="text-xs text-gray-500">Track your blood pressure</p>
              </div>
            </div>
            {readings.length > 0 && (
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {readings.length > 0 && showStats && (
        <StatsOverview readings={readings} />
      )}

      <nav className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
        <div className="max-w-lg mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'list'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              Readings ({readings.length})
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === 'chart'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Trends
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto py-4">
        {readings.length === 0 ? (
          <div className="px-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to EasyBPTrack</h2>
              <p className="text-sm text-gray-600 mb-4">
                Track your blood pressure readings, see trends over time, and keep your health in check.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Your First Reading
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 px-1">Blood Pressure Categories</h3>
              <div className="space-y-2">
                {[
                  { label: 'Optimal', range: '< 120/80', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
                  { label: 'Normal', range: '120-129/80-84', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                  { label: 'High-Normal', range: '130-139/85-89', color: 'bg-amber-100 text-amber-700 border-amber-300' },
                  { label: 'High (Hypertension)', range: '≥ 140/90', color: 'bg-red-100 text-red-700 border-red-300' },
                  { label: 'Hypertensive Crisis', range: '≥ 180/120', color: 'bg-red-600 text-white border-red-700' },
                ].map((cat) => (
                  <div
                    key={cat.label}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${cat.color}`}
                  >
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-sm opacity-75">{cat.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'list' && <ReadingList readings={readings} onDelete={handleDeleteReading} />}
            {activeTab === 'chart' && (
              <div className="px-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Blood Pressure Trend</h3>
                  <BPChart readings={readings} />
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="w-8 h-0.5 bg-red-500"></span>
                      <span>Systolic</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-8 h-0.5 bg-blue-500"></span>
                      <span>Diastolic</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {readings.length > 0 && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-50"
          aria-label="Add reading"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {showAddForm && (
        <AddReadingForm
          onAdd={handleAddReading}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}

export default App;
