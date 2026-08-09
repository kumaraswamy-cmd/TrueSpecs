'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bulkImportProducts } from '@/app/admin/actions';

export default function BulkImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    successCount: number;
    skipped: { brand: string; model: string; slug: string; reason: string }[];
    failed: { brand: string; model: string; reason: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        setError('Only .json files are accepted.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setResult(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/json' && !droppedFile.name.endsWith('.json')) {
        setError('Only .json files are accepted.');
        setFile(null);
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('Could not read file content');
        }

        let parsedData;
        try {
          parsedData = JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON format. Please make sure the file is valid JSON.');
        }

        if (!Array.isArray(parsedData)) {
          throw new Error('JSON root must be an array of products.');
        }

        const res = await bulkImportProducts(parsedData);
        if (res.success && res.summary) {
          setResult(res.summary);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          router.refresh();
        } else {
          setError(res.error || 'Failed to complete import.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during file parsing.');
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read the selected file.');
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-theme-primary">
            Bulk Import Products
          </h1>
          <p className="text-sm text-theme-secondary mt-1">
            Import multiple phone and laptop records via a single JSON file.
          </p>
        </div>
        <div>
          <Link
            href="/admin/phones"
            className="px-4 py-2.5 rounded-lg border border-theme bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold text-xs sm:text-sm transition-all cursor-pointer font-sans"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Upload section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-theme-surface border border-theme rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-theme-primary mb-4">Select JSON File</h2>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px] ${
                dragActive
                  ? 'border-accent bg-accent/10'
                  : 'border-theme hover:border-accent hover:bg-theme-surface-hover'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-theme-secondary mb-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-theme-primary">{file.name}</p>
                  <p className="text-xs text-theme-secondary mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-theme-primary">
                    Drag and drop your JSON file here, or{' '}
                    <span className="text-accent hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-theme-secondary mt-1">Accepts .json files only</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-danger-bg border border-danger-border text-danger text-sm font-medium flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={isImporting}
                  className="px-4 py-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold text-sm transition-all cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || isImporting}
                className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <svg
                      className="animate-spin h-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Import JSON'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Documentation Sidebar */}
        <div className="space-y-4">
          <div className="bg-theme-surface border border-theme rounded-2xl p-6 shadow-sm">
            <h2 className="text-md font-bold text-theme-primary mb-3">JSON Format Guide</h2>
            <p className="text-xs text-theme-secondary leading-relaxed mb-4">
              Your JSON file must contain a single array of objects representing products.
            </p>
            <div className="bg-theme-elevated border border-theme rounded-lg p-3 overflow-x-auto text-[10px] font-mono text-theme-secondary max-h-[300px]">
              <pre>{`[
  {
    "category": "phone",
    "brand": "Google",
    "model": "Pixel 8 Pro",
    "releaseDate": "2023-10-12",
    "price": {
      "mrp": 106999,
      "amazonPrice": 99999,
      "flipkartPrice": 99999
    },
    "images": [
      "https://example.com/img1.jpg"
    ],
    "specs": {
      "display": {
        "size": 6.7,
        "resolution": "2992x1344",
        "type": "OLED",
        "refreshRate": 120,
        "peakBrightness": 2400,
        "hdrSupport": true,
        "widevineLevel": "L1"
      },
      "performance": {
        "chipset": "Tensor G3",
        "ram": [12],
        "storage": [128, 256],
        "coolingSystem": "Standard"
      },
      "camera": {
        "rear": [
          { "megapixel": 50, "type": "Wide", "ois": true }
        ],
        "front": "10.5MP",
        "video": "4K @ 60fps"
      },
      "battery": {
        "capacity": 5050,
        "chargingSpeedWatts": 30,
        "wirelessCharging": true,
        "reverseCharging": true
      },
      "build": {
        "weight": 213,
        "thickness": 8.8,
        "materials": "Glass/Aluminum",
        "ipRating": "IP68",
        "stereoSpeakers": true
      },
      "connectivity": {
        "network5G": true,
        "carrierAggregationBands": "Bands",
        "sim": "eSIM",
        "nfc": true,
        "usbType": "Type-C",
        "vowifi": true,
        "bluetoothVersion": "5.3"
      }
    }
  }
]`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-theme-surface border border-theme rounded-2xl p-6 shadow-sm space-y-6 animate-slide-up">
          <div className="flex items-center justify-between border-b border-theme pb-4">
            <h2 className="text-xl font-bold text-theme-primary">Import Results Summary</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-success-bg border border-success-border text-success">
                {result.successCount} Added
              </span>
              {result.skipped.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning-bg border border-warning-border text-warning">
                  {result.skipped.length} Skipped
                </span>
              )}
              {result.failed.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-danger-bg border border-danger-border text-danger">
                  {result.failed.length} Failed
                </span>
              )}
            </div>
          </div>

          {/* Success message */}
          {result.successCount > 0 && (
            <div className="p-4 rounded-xl bg-success-bg border border-success-border text-success text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span>Successfully imported {result.successCount} products! All imported products are set to "Unverified".</span>
            </div>
          )}

          {/* Skipped Items */}
          {result.skipped.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-theme-primary flex items-center gap-1.5 text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Skipped (Already Exists - {result.skipped.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-theme">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-theme-elevated text-theme-secondary border-b border-theme font-bold">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {result.skipped.map((item, idx) => (
                      <tr key={idx} className="hover:bg-theme-surface-hover text-theme-secondary font-medium">
                        <td className="p-3">{item.brand} {item.model}</td>
                        <td className="p-3 font-mono">{item.slug}</td>
                        <td className="p-3 text-warning font-semibold">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed Items */}
          {result.failed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-theme-primary flex items-center gap-1.5 text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                Failed Validation ({result.failed.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-theme">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-theme-elevated text-theme-secondary border-b border-theme font-bold">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Validation Error / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme">
                    {result.failed.map((item, idx) => (
                      <tr key={idx} className="hover:bg-theme-surface-hover text-theme-secondary font-medium">
                        <td className="p-3 font-bold text-theme-primary">
                          {item.brand || item.model ? `${item.brand} ${item.model}` : `Item #${idx + 1}`}
                        </td>
                        <td className="p-3 text-danger font-medium">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
