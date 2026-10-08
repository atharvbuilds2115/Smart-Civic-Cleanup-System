import React, { useState } from 'react';
import { executeImport } from '../scripts/importData';

/**
 * Data Import Component
 * Allows importing sample data to Firebase Realtime Database from the browser
 * Only show this to admins!
 */

export const DataImportPanel: React.FC<{ onImportComplete?: () => void }> = ({
  onImportComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'importing' | 'success' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setStatus('importing');
    setMessage('Importing data to Firebase...');

    try {
      const result = await executeImport();

      if (result.success) {
        setStatus('success');
        setMessage(
          '✅ Data imported successfully! Check your Firebase Console to verify.'
        );
        setShowConfirm(false);
        setTimeout(() => onImportComplete?.(), 2000);
      } else {
        setStatus('error');
        setMessage('❌ Import failed. Check console for details.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-50 border-2 border-gray-300 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">📥 Import Sample Data</h2>

      <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
        <p className="text-sm text-gray-700 mb-3">
          This will import sample data to your Firebase Realtime Database:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-4">
          <li>✓ 4 Trash Bins with different statuses</li>
          <li>✓ 3 Citizen users with report history</li>
          <li>✓ 2 Staff members for garbage collection</li>
          <li>✓ 2 Garbage collection trucks</li>
          <li>✓ 3 Sample detection/analysis reports</li>
        </ul>
      </div>

      {status === 'success' && (
        <div className="bg-green-100 border-l-4 border-green-600 p-4 mb-4 rounded">
          <p className="text-green-800 font-semibold">{message}</p>
          <p className="text-green-700 text-sm mt-2">
            View your data at:{' '}
            <a
              href="https://console.firebase.google.com/project/cleanup-system/database"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Firebase Console
            </a>
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-4 rounded">
          <p className="text-red-800 font-semibold">{message}</p>
        </div>
      )}

      {status === 'importing' && (
        <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mb-4 rounded">
          <p className="text-blue-800 font-semibold flex items-center">
            <span className="animate-spin mr-2">⏳</span>
            {message}
          </p>
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading || status === 'success'}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Importing...' : 'Import Sample Data'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded">
            <p className="text-yellow-800 font-semibold mb-2">⚠️ Confirm Import?</p>
            <p className="text-yellow-700 text-sm">
              This will add sample data to your database. Existing data will not be
              affected.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? '⏳ Importing...' : '✓ Confirm Import'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 disabled:opacity-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded">
        <p className="font-semibold mb-1">💡 Tip:</p>
        <p>
          You can also import data programmatically by calling{' '}
          <code className="bg-gray-200 px-2 py-1 rounded">executeImport()</code> in your
          code.
        </p>
      </div>
    </div>
  );
};

export default DataImportPanel;
