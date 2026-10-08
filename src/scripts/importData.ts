/**
 * Import Script for Firebase Realtime Database
 * Run this script to import all your data files to Firebase
 *
 * Usage:
 * 1. Run: ts-node src/scripts/importData.ts
 * 2. Or manually call: import { executeImport } from './importData'
 */

import { rtdb } from '../firebase.config';
import { ref, set, push } from 'firebase/database';

// Raw data imports (normally these would come from JSON files)
const outData = {
  "dustbin_present": true,
  "image_status": "REAL",
  "ai_detection_score": 0.2,
  "detection_reasons": ["Missing standard camera EXIF data"],
  "dustbin_type": "public",
};

const binData = {
  "wasteType": "Mixed",
  "severityLevel": 9,
  "confidenceScore": 1,
  "verificationStatus": "real",
  "suggestedAction": "Schedule immediate pickup"
};

const fakeData = {
  "dustbin_present": true,
  "image_status": "FAKE",
  "ai_detection_score": 1,
  "detection_reasons": ["Missing standard camera EXIF data", "AI generator watermark"],
};

/**
 * Import sample bins with current data
 */
const sampleBins = [
  {
    location: "Downtown Mumbai - Main Street",
    latitude: 19.0760,
    longitude: 72.8777,
    capacity: 200,
    fillLevel: 75,
    status: "half-full",
    wasteType: "Mixed",
    severity: "high",
  },
  {
    location: "Central Park - East Entrance",
    latitude: 19.0882,
    longitude: 72.8795,
    capacity: 150,
    fillLevel: 45,
    status: "half-full",
    wasteType: "Plastic",
    severity: "medium",
  },
  {
    location: "Market Area - Zone A",
    latitude: 19.0920,
    longitude: 72.8850,
    capacity: 250,
    fillLevel: 95,
    status: "full",
    wasteType: "Organic",
    severity: "critical",
  },
  {
    location: "Residential - Block B",
    latitude: 19.1050,
    longitude: 72.8600,
    capacity: 100,
    fillLevel: 20,
    status: "empty",
    wasteType: "Paper",
    severity: "low",
  },
];

/**
 * Sample citizens data
 */
const sampleCitizens = [
  {
    email: "citizen1@example.com",
    name: "Rajesh Kumar",
    phone: "+91-9876543210",
    address: "Mumbai, India",
    language: "hi",
    reportsCount: 3,
    active: true,
  },
  {
    email: "citizen2@example.com",
    name: "Priya Singh",
    phone: "+91-9876543211",
    address: "Mumbai, India",
    language: "en",
    reportsCount: 5,
    active: true,
  },
  {
    email: "citizen3@example.com",
    name: "Anuj Patel",
    phone: "+91-9876543212",
    address: "Mumbai, India",
    language: "hi",
    reportsCount: 2,
    active: true,
  },
];

/**
 * Sample staff data
 */
const sampleStaff = [
  {
    email: "staff1@cleanup.com",
    name: "Sanjay Worker",
    phone: "+91-8765432101",
    designation: "Garbage Collector",
    assignedArea: "Downtown",
    vehicleId: "truck_001",
    status: "available",
  },
  {
    email: "staff2@cleanup.com",
    name: "Mohan Kumar",
    phone: "+91-8765432102",
    designation: "Vehicle Driver",
    assignedArea: "Central",
    vehicleId: "truck_002",
    status: "on-route",
  },
];

/**
 * Sample admin data
 */
const sampleAdmins = [
  {
    email: "admin@cleanup.com",
    name: "Rajesh Sharma",
    phone: "+91-9876543210",
    department: "Operations",
    permissions: ["manage_staff", "view_reports", "manage_bins", "system_admin"],
    status: "active",
  },
  {
    email: "superadmin@cleanup.com",
    name: "Priya Singh",
    phone: "+91-9876543211",
    department: "IT & Administration",
    permissions: ["all_access", "manage_admins", "system_admin", "data_export"],
    status: "active",
  },
];

/**
 * Sample trucks data
 */
const sampleTrucks = [
  {
    registrationNumber: "MH-01-AB-1234",
    driverName: "Sanjay Worker",
    driverId: "staff_001",
    capacity: 5000,
    currentFill: 2500,
    status: "available",
    latitude: 19.0760,
    longitude: 72.8777,
  },
  {
    registrationNumber: "MH-01-CD-5678",
    driverName: "Mohan Kumar",
    driverId: "staff_002",
    capacity: 5000,
    currentFill: 4000,
    status: "on-route",
    latitude: 19.0882,
    longitude: 72.8795,
  },
];

/**
 * Main import function
 */
export const executeImport = async () => {
  console.log('🚀 Starting Firebase Realtime Database import...\n');

  try {
    // Import Bins
    console.log('📥 Importing bins...');
    for (const bin of sampleBins) {
      const binsRef = ref(rtdb, 'bins');
      const newBinRef = push(binsRef);
      await set(newBinRef, {
        ...bin,
        binId: newBinRef.key,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }
    console.log(`✅ ${sampleBins.length} bins imported\n`);

    // Import Citizens
    console.log('📥 Importing citizens...');
    for (const citizen of sampleCitizens) {
      const userId = citizen.email.split('@')[0];
      const userRef = ref(rtdb, `users/${userId}`);
      await set(userRef, {
        ...citizen,
        userId,
        role: 'citizen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ ${sampleCitizens.length} citizens imported\n`);

    // Import Staff
    console.log('📥 Importing staff...');
    for (const staff of sampleStaff) {
      const staffId = staff.email.split('@')[0];
      const staffRef = ref(rtdb, `staff/${staffId}`);
      await set(staffRef, {
        ...staff,
        staffId,
        role: 'staff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ ${sampleStaff.length} staff members imported\n`);

    // Import Admins
    console.log('📥 Importing admins...');
    for (const admin of sampleAdmins) {
      const adminId = admin.email.split('@')[0];
      const adminRef = ref(rtdb, `admins/${adminId}`);
      await set(adminRef, {
        ...admin,
        adminId,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ ${sampleAdmins.length} admins imported\n`);

    // Import Trucks
    console.log('📥 Importing trucks...');
    for (const truck of sampleTrucks) {
      const trucksRef = ref(rtdb, 'trucks');
      const newTruckRef = push(trucksRef);
      await set(newTruckRef, {
        ...truck,
        truckId: newTruckRef.key,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }
    console.log(`✅ ${sampleTrucks.length} trucks imported\n`);

    // Import sample detection data as reports
    console.log('📥 Importing detection reports...');
    const reportsRef = ref(rtdb, 'reports');

    // Real detection report
    let reportRef = push(reportsRef);
    await set(reportRef, {
      ...outData,
      reportId: reportRef.key,
      userId: 'citizen1',
      status: 'resolved',
      category: 'bin_full',
      createdAt: new Date().toISOString(),
    });

    // Bin severity report
    reportRef = push(reportsRef);
    await set(reportRef, {
      ...binData,
      reportId: reportRef.key,
      userId: 'citizen2',
      status: 'pending',
      category: 'waste_severity',
      createdAt: new Date().toISOString(),
    });

    // Fake detection report
    reportRef = push(reportsRef);
    await set(reportRef, {
      ...fakeData,
      reportId: reportRef.key,
      userId: 'system',
      status: 'completed',
      category: 'ai_detection',
      createdAt: new Date().toISOString(),
    });

    console.log('✅ 3 detection reports imported\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ IMPORT COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`
    📊 Summary:
    - Bins: ${sampleBins.length}
    - Citizens: ${sampleCitizens.length}
    - Staff: ${sampleStaff.length}
    - Admins: ${sampleAdmins.length}
    - Trucks: ${sampleTrucks.length}
    - Reports: 3
    
    🔗 Database URL: https://cleanup-system-default-rtdb.firebaseio.com/
    
    ✨ Check your Firebase Console to verify the data!
    `);

    return { success: true };
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
};

// Auto-run if this is the main module
if (typeof window === 'undefined') {
  executeImport().catch(console.error);
}
