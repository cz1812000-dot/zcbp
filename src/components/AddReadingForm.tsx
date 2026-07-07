import React, { useState, useCallback, useEffect } from 'react';
import { Camera, X, Sun, Sunset, Moon, CloudMoon, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { BPReading } from '../types';

interface AddReadingFormProps {
  onAdd: (reading: Omit<BPReading, 'id'>) => void;
  onClose: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function isImplausible(systolic: number, diastolic: number): boolean {
  return systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddReadingForm({ onAdd, onClose }: AddReadingFormProps) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<BPReading['timeOfDay']>('');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanWarning, setScanWarning] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetScanState = useCallback(() => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setScanWarning(null);
    setScanSuccess(false);
    setSystolic('');
    setDiastolic('');
    setPulse('');
  }, [imagePreview]);

  const scanImage = useCallback(async (file: File) => {
    setIsScanning(true);
    setScanWarning(null);
    setScanSuccess(false);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const base64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      const response = await fetch(`${SUPABASE_URL}/functions/v1/scan-bp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${response.status}`);
      }

      const data = await response.json();

      if (!('systolic' in data) || !('diastolic' in data)) {
        throw new Error('Unexpected response from scan service');
      }

      const sys: number = data.systolic;
      const dia: number = data.diastolic;
      const pul: number | null = data.pulse ?? null;
      const confidence: string = data.confidence ?? 'low';

      setSystolic(String(sys));
      setDiastolic(String(dia));
      if (pul !== null) setPulse(String(pul));

      if (confidence === 'low' || isImplausible(sys, dia)) {
        setScanWarning("Couldn't read the numbers clearly — please check and correct them before saving.");
      } else {
        setScanSuccess(true);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setScanWarning(
        err instanceof Error ? err.message : 'Failed to read image. Please enter values manually.'
      );
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        scanImage(file);
      }
      e.target.value = '';
    },
    [scanImage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic) return;

    const reading: Omit<BPReading, 'id'> = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : undefined,
      timestamp: new Date().toISOString(),
      timeOfDay,
      notes: notes || undefined,
    };

    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    onAdd(reading);
    onClose();
  };

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning', icon: Sun },
    { value: 'afternoon', label: 'Afternoon', icon: Sunset },
    { value: 'evening', label: 'Evening', icon: Moon },
    { value: 'night', label: 'Night', icon: CloudMoon },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <input
        id="scan-file-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="absolute opacity-0 pointer-events-none"
        onChange={handleFileChange}
      />

      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Reading</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Scan from photo button - above the input fields */}
          <div>
            <label
              htmlFor="scan-file-input"
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                isScanning
                  ? 'border-gray-300 text-gray-400'
                  : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">
                {isScanning ? 'Scanning...' : 'Scan from photo'}
              </span>
            </label>
          </div>

          {/* Scanning overlay */}
          {isScanning && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Processing"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-sm font-medium text-gray-700">
                  Reading monitor display…
                </p>
              </div>
            </div>
          )}

          {/* Image preview after scan */}
          {!isScanning && imagePreview && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <img
                src={imagePreview}
                alt="Scanned"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={resetScanState}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          {/* Warning / success banner */}
          {scanWarning && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{scanWarning}</span>
            </div>
          )}
          {scanSuccess && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Readings extracted — verify and save below.</span>
            </div>
          )}

          {/* Numeric fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Systolic
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                required
                min="60"
                max="250"
                className="w-full px-3 py-2.5 text-lg font-semibold text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Diastolic
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                required
                min="40"
                max="150"
                className="w-full px-3 py-2.5 text-lg font-semibold text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Pulse
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                min="40"
                max="200"
                className="w-full px-3 py-2.5 text-lg font-semibold text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
              />
            </div>
          </div>

          {/* Time of day */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Time of Day
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeOfDayOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setTimeOfDay(
                      timeOfDay === value ? '' : (value as BPReading['timeOfDay'])
                    )
                  }
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                    timeOfDay === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any symptoms or activities?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={!systolic || !diastolic}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save Reading
          </button>
        </form>
      </div>
    </div>
  );
}
