/**
 * REALTIME DATABASE INTEGRATION EXAMPLES
 * Copy and adapt these examples into your actual components
 */

// ============================================
// EXAMPLE 1: Login Component with Database
// ============================================

/*
import React, { useState } from 'react';
import { loginUser, registerUser } from './services/firebaseService';
import { createCitizenUser, createStaffUser } from './services/databaseService';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

export const LoginWithDatabase: React.FC<{ onLogin: (role: string) => void }> = ({ onLogin }) => {
  const { user, loading } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Register with Firebase Auth
      const newUser = await registerUser(email, password);
      
      // Create citizen profile in database
      await createCitizenUser(newUser.uid, {
        email,
        name,
        phone: '',
        reportsCount: 0,
      });

      console.log('Registration complete!');
      setEmail('');
      setPassword('');
      setName('');
      setIsRegister(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = await loginUser(email, password);
      console.log('Logged in:', loggedInUser.email);
      onLogin('citizen');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Already logged in as {user.email}</div>;

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        {isRegister ? 'Create Account' : 'Login'}
      </h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <button
        onClick={() => setIsRegister(!isRegister)}
        className="w-full mt-4 text-blue-600 hover:underline text-sm"
      >
        {isRegister ? 'Already have account? Login' : "Don't have account? Register"}
      </button>
    </div>
  );
};
*/

// ============================================
// EXAMPLE 2: Live Bin Status with Database
// ============================================

/*
import React, { useEffect, useState } from 'react';
import { onBinsUpdate } from './services/databaseService';

interface Bin {
  id: string;
  location: string;
  status: string;
  fillLevel: number;
  latitude: number;
  longitude: number;
}

export const LiveBinStatusWithDB: React.FC = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time bin updates
    const unsubscribe = onBinsUpdate(
      (updatedBins) => {
        setBins(updatedBins);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading bins...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Live Bin Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bins.map((bin) => (
          <div
            key={bin.id}
            className={`p-4 rounded-lg border-2 ${
              bin.status === 'full'
                ? 'border-red-500 bg-red-50'
                : bin.status === 'half-full'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-green-500 bg-green-50'
            }`}
          >
            <h3 className="font-semibold">{bin.location}</h3>
            <p className="text-sm text-gray-600">Fill Level: {bin.fillLevel}%</p>
            <p className="font-bold mt-2">
              Status: <span className="uppercase">{bin.status}</span>
            </p>
            <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  bin.status === 'full'
                    ? 'bg-red-600'
                    : bin.status === 'half-full'
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${bin.fillLevel}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
*/

// ============================================
// EXAMPLE 3: Truck Tracking with Database
// ============================================

/*
import React, { useEffect, useState } from 'react';
import { onTrucksUpdate, updateTruckLocation } from './services/databaseService';

interface Truck {
  id: string;
  registrationNumber: string;
  driverName: string;
  status: string;
  latitude: number;
  longitude: number;
  currentFill: number;
  capacity: number;
}

export const TruckTrackingWithDB: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  useEffect(() => {
    // Subscribe to real-time truck updates
    const unsubscribe = onTrucksUpdate(
      (updatedTrucks) => setTrucks(updatedTrucks),
      (error) => console.error('Truck tracking error:', error)
    );

    return () => unsubscribe();
  }, []);

  // Simulate truck location updates (in real app, this comes from GPS)
  const simulateLocationUpdate = async (truckId: string) => {
    const randomLat = 19.0760 + (Math.random() - 0.5) * 0.1;
    const randomLng = 72.8777 + (Math.random() - 0.5) * 0.1;
    await updateTruckLocation(truckId, randomLat, randomLng);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Trucks</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trucks.map((truck) => (
          <div
            key={truck.id}
            onClick={() => setSelectedTruck(truck)}
            className={`p-4 border rounded-lg cursor-pointer transition ${
              selectedTruck?.id === truck.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <h3 className="font-semibold">{truck.registrationNumber}</h3>
            <p className="text-sm">Driver: {truck.driverName}</p>
            <p className="text-sm">
              Status: <span className="font-bold">{truck.status}</span>
            </p>
            <p className="text-sm">Fill: {truck.currentFill}/{truck.capacity}L</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                simulateLocationUpdate(truck.id);
              }}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Update Location
            </button>
          </div>
        ))}
      </div>

      {selectedTruck && (
        <div className="mt-6 p-4 border-2 border-blue-600 rounded-lg">
          <h3 className="text-xl font-bold mb-2">{selectedTruck.registrationNumber}</h3>
          <p>Driver: {selectedTruck.driverName}</p>
          <p>Status: {selectedTruck.status}</p>
          <p>
            Location: {selectedTruck.latitude.toFixed(4)}, {selectedTruck.longitude.toFixed(4)}
          </p>
          <p>Capacity: {selectedTruck.currentFill}L / {selectedTruck.capacity}L</p>
        </div>
      )}
    </div>
  );
};
*/

// ============================================
// EXAMPLE 4: Report Bin Issue (Citizen)
// ============================================

/*
import React, { useState } from 'react';
import { createReport } from './services/databaseService';
import { uploadImage } from './services/firebaseService';

export const ReportBinIssue: React.FC<{ userId: string; binId: string }> = ({
  userId,
  binId,
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('full');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(
          imageFile,
          `reports/${userId}/${Date.now()}-${imageFile.name}`
        );
      }

      // Create report in database
      await createReport(userId, {
        binId,
        description,
        category,
        imageUrl,
        status: 'pending',
      });

      setSuccess(true);
      setDescription('');
      setCategory('full');
      setImageFile(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Report submission failed:', error);
      alert('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Report Bin Issue</h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          ✓ Report submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmitReport} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Issue Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="full">Bin is Full</option>
            <option value="damaged">Bin is Damaged</option>
            <option value="misplaced">Wrong Location</option>
            <option value="other">Other Issue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            required
            className="w-full px-4 py-2 border rounded h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};
*/

// ============================================
// EXAMPLE 5: Admin Dashboard
// ============================================

/*
import React, { useEffect, useState } from 'react';
import {
  getAllCitizens,
  getAllStaff,
  getAllReports,
  getAllBins,
  onReportsUpdate,
} from './services/databaseService';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalStaff: 0,
    pendingReports: 0,
    fullBins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [citizens, staff, reports, bins] = await Promise.all([
          getAllCitizens(),
          getAllStaff(),
          getAllReports(),
          getAllBins(),
        ]);

        setStats({
          totalCitizens: citizens.length,
          totalStaff: staff.length,
          pendingReports: reports.filter((r) => r.status === 'pending').length,
          fullBins: bins.filter((b) => b.status === 'full').length,
        });
        setLoading(false);
      } catch (error) {
        console.error('Dashboard load failed:', error);
      }
    };

    loadDashboardData();

    // Subscribe to live report updates
    const unsubscribe = onReportsUpdate((reports) => {
      setStats((prev) => ({
        ...prev,
        pendingReports: reports.filter((r) => r.status === 'pending').length,
      }));
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-blue-50 border-2 border-blue-600 rounded-lg">
          <h3 className="text-sm text-gray-600">Total Citizens</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalCitizens}</p>
        </div>

        <div className="p-6 bg-green-50 border-2 border-green-600 rounded-lg">
          <h3 className="text-sm text-gray-600">Staff Members</h3>
          <p className="text-4xl font-bold text-green-600">{stats.totalStaff}</p>
        </div>

        <div className="p-6 bg-red-50 border-2 border-red-600 rounded-lg">
          <h3 className="text-sm text-gray-600">Pending Reports</h3>
          <p className="text-4xl font-bold text-red-600">{stats.pendingReports}</p>
        </div>

        <div className="p-6 bg-yellow-50 border-2 border-yellow-600 rounded-lg">
          <h3 className="text-sm text-gray-600">Full Bins</h3>
          <p className="text-4xl font-bold text-yellow-600">{stats.fullBins}</p>
        </div>
      </div>
    </div>
  );
};
*/

// ============================================
// EXAMPLE 6: Community Forum with Database
// ============================================

/*
import React, { useEffect, useState } from 'react';
import { createPost, getAllPosts, likePost } from './services/databaseService';

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
}

export const CommunityForumWithDB: React.FC<{ userId: string }> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setLoading(false);
    };
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createPost(userId, { title, content });
      const newPost = await getAllPosts();
      setPosts(newPost);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      const updatedPosts = await getAllPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  if (loading) return <div>Loading posts...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Community Forum</h2>

      <form onSubmit={handleCreatePost} className="mb-8 p-4 border rounded-lg">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded mb-2"
        />
        <textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded h-20 mb-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded-lg">
            <h3 className="text-lg font-bold">{post.title}</h3>
            <p className="text-gray-700 my-2">{post.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleLike(post.id)}
                className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
              >
                ❤️ {post.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
*/

export default {};
