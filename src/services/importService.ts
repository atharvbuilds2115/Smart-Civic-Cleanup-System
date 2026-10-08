import { rtdb } from '../firebase.config';
import { ref, set, push, update } from 'firebase/database';

/**
 * Import utility for bulk data import to Firebase Realtime Database
 * Handles all data types: citizens, bins, reports, trucks, etc.
 */

// ==================== SAMPLE DATA IMPORT ====================

/**
 * Import sample bins data
 */
export const importBinsData = async (binData: any[]) => {
  try {
    const binsRef = ref(rtdb, 'bins');

    for (const bin of binData) {
      const newBinRef = push(binsRef);
      await set(newBinRef, {
        ...bin,
        binId: newBinRef.key,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    console.log(`✅ Imported ${binData.length} bins`);
    return { success: true, count: binData.length };
  } catch (error) {
    console.error('❌ Error importing bins:', error);
    throw error;
  }
};

/**
 * Import sample citizens data
 */
export const importCitizensData = async (citizenData: any[]) => {
  try {
    const usersRef = ref(rtdb, 'users');

    for (const citizen of citizenData) {
      const userId = citizen.id || citizen.email?.split('@')[0];
      const userRef = ref(rtdb, `users/${userId}`);
      await set(userRef, {
        ...citizen,
        userId,
        role: 'citizen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`✅ Imported ${citizenData.length} citizens`);
    return { success: true, count: citizenData.length };
  } catch (error) {
    console.error('❌ Error importing citizens:', error);
    throw error;
  }
};

/**
 * Import detection/analysis data as reports
 */
export const importDetectionData = async (detectionData: any[]) => {
  try {
    const reportsRef = ref(rtdb, 'reports');

    for (const detection of detectionData) {
      const newReportRef = push(reportsRef);
      await set(newReportRef, {
        ...detection,
        reportId: newReportRef.key,
        userId: 'system_import',
        status: 'completed',
        createdAt: new Date().toISOString(),
        imageStatus: detection.image_status || 'unknown',
        aiScore: detection.ai_detection_score,
      });
    }

    console.log(`✅ Imported ${detectionData.length} detection reports`);
    return { success: true, count: detectionData.length };
  } catch (error) {
    console.error('❌ Error importing detection data:', error);
    throw error;
  }
};

/**
 * Import staff members data
 */
export const importStaffData = async (staffData: any[]) => {
  try {
    for (const staff of staffData) {
      const staffId = staff.id || `staff_${Date.now()}`;
      const staffRef = ref(rtdb, `staff/${staffId}`);
      await set(staffRef, {
        ...staff,
        staffId,
        role: 'staff',
        status: staff.status || 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`✅ Imported ${staffData.length} staff members`);
    return { success: true, count: staffData.length };
  } catch (error) {
    console.error('❌ Error importing staff:', error);
    throw error;
  }
};

/**
 * Import trucks data
 */
export const importTrucksData = async (trucksData: any[]) => {
  try {
    for (const truck of trucksData) {
      const truckId = truck.id || `truck_${Date.now()}`;
      const truckRef = ref(rtdb, `trucks/${truckId}`);
      await set(truckRef, {
        ...truck,
        truckId,
        status: truck.status || 'available',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    console.log(`✅ Imported ${trucksData.length} trucks`);
    return { success: true, count: trucksData.length };
  } catch (error) {
    console.error('❌ Error importing trucks:', error);
    throw error;
  }
};

/**
 * Generic import function for any data type
 */
export const importGenericData = async (path: string, data: any) => {
  try {
    const dataRef = ref(rtdb, path);

    if (Array.isArray(data)) {
      // Import array of objects
      for (const item of data) {
        const itemRef = push(dataRef);
        await set(itemRef, {
          ...item,
          id: itemRef.key,
          importedAt: new Date().toISOString(),
        });
      }
      console.log(`✅ Imported ${data.length} items to ${path}`);
    } else {
      // Import single object
      await set(dataRef, {
        ...data,
        importedAt: new Date().toISOString(),
      });
      console.log(`✅ Imported data to ${path}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`❌ Error importing data to ${path}:`, error);
    throw error;
  }
};

/**
 * Export and clear all data (use with caution!)
 */
export const clearAllData = async (confirm: boolean = false) => {
  if (!confirm) {
    console.warn('⚠️ This will delete ALL data. Pass true to confirm.');
    return { success: false };
  }

  try {
    const paths = ['users', 'staff', 'admins', 'bins', 'reports', 'trucks', 'communityPosts'];

    for (const path of paths) {
      const pathRef = ref(rtdb, path);
      await set(pathRef, null);
    }

    console.log('✅ All data cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
};

/**
 * Batch import multiple data types at once
 */
export const batchImport = async (importMap: Record<string, any[]>) => {
  const results: Record<string, any> = {};

  try {
    for (const [dataType, data] of Object.entries(importMap)) {
      console.log(`📥 Importing ${dataType}...`);

      try {
        switch (dataType) {
          case 'bins':
            results[dataType] = await importBinsData(data);
            break;
          case 'citizens':
            results[dataType] = await importCitizensData(data);
            break;
          case 'detections':
            results[dataType] = await importDetectionData(data);
            break;
          case 'staff':
            results[dataType] = await importStaffData(data);
            break;
          case 'trucks':
            results[dataType] = await importTrucksData(data);
            break;
          default:
            results[dataType] = await importGenericData(dataType, data);
        }
      } catch (error) {
        results[dataType] = { success: false, error: String(error) };
      }
    }

    console.log('✅ Batch import complete:', results);
    return results;
  } catch (error) {
    console.error('❌ Batch import failed:', error);
    throw error;
  }
};

/**
 * Import from JSON files
 */
export const importFromJsonFiles = async (fileMap: Record<string, any>) => {
  return batchImport(fileMap);
};
