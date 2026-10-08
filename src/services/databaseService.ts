import {
  ref,
  set,
  get,
  update,
  push,
  onValue,
  off,
  runTransaction,
} from 'firebase/database';
import { rtdb } from '../firebase.config';

/**
 * Firebase Realtime Database Service
 * Handles storing all user, staff, and admin data in cleanup-system database
 * Structure:
 * /users/{userId}
 * /staff/{staffId}
 * /admins/{adminId}
 * /bins/{binId}
 * /reports/{reportId}
 * /trucks/{truckId}
 * /communityPosts/{postId}
 */

// ==================== USERS COLLECTION ====================
/**
 * Create a citizen user profile
 */
export const createCitizenUser = async (
  userId: string,
  userData: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    avatar?: string;
    language?: string;
    reportsCount?: number;
  }
) => {
  try {
    const userRef = ref(rtdb, `users/${userId}`);
    await set(userRef, {
      ...userData,
      userId,
      role: 'citizen',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      points: userData.reportsCount ? userData.reportsCount * 10 : 0,
      rewardPoints: userData.reportsCount ? userData.reportsCount * 10 : 0,
    });
    console.log('Citizen user created:', userId);
    return { success: true, userId };
  } catch (error) {
    console.error('Error creating citizen user:', error);
    throw error;
  }
};

type UserRole = 'citizen' | 'staff' | 'admin';

type LoginAuditData = {
  userId: string;
  role: UserRole;
  email: string;
  name?: string;
  loginAt?: string;
  source?: string;
};

type UserInputAuditData = {
  userId: string;
  type: string;
  role?: UserRole;
  screen?: string;
  payload: Record<string, any>;
  createdAt?: string;
};

export type RewardStatus = 'pending_approval' | 'active' | 'used' | 'expired' | 'rejected';
export type RewardAudience = 'citizen' | 'staff' | 'both';
export type RewardKind = 'voucher' | 'points' | 'money';
export type RewardRequestStatus = 'pending' | 'approved' | 'rejected';

export type RewardItem = {
  rewardId: string;
  name: string;
  icon: string;
  pointsRequired: number;
  description: string;
  partner: string;
  limitDays: number;
  active: boolean;
  audience?: RewardAudience;
  rewardKind?: RewardKind;
  moneyValue?: number;
  voucherValue?: string;
  createdAt: string;
  updatedAt: string;
};

export type RewardRedemption = {
  redemptionId: string;
  rewardId: string;
  rewardName: string;
  rewardIcon: string;
  pointsSpent: number;
  couponCode: string;
  qrValue: string;
  status: RewardStatus;
  redeemedAt: string;
  expiresAt: string;
  limitDays: number;
  audience?: RewardAudience;
  rewardKind?: RewardKind;
  approvedAt?: string;
};

export type RewardRequest = {
  requestId: string;
  userId: string;
  role: UserRole;
  rewardType: 'complaint_verified' | 'complaint_completed_bonus' | 'staff_task_base' | 'staff_extra_bonus' | 'staff_streak_bonus' | 'reward_redemption';
  status: RewardRequestStatus;
  reason: string;
  sourceId?: string;
  rewardId?: string;
  points?: number;
  money?: number;
  voucherRewardId?: string;
  voucherName?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminId?: string;
};

export type UserNotification = {
  notificationId: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  createdAt: string;
  read: boolean;
};

const DEFAULT_REWARDS: Omit<RewardItem, 'createdAt' | 'updatedAt'>[] = [
  { rewardId: 'free-bus-pass', name: 'Free Bus Pass', icon: '🚌', pointsRequired: 100, description: 'Claim a city bus pass for your daily commute.', partner: 'City Transit', limitDays: 7, active: true },
  { rewardId: 'metro-pass-discount', name: 'Metro Pass Discount', icon: '🚇', pointsRequired: 80, description: 'Get a discount on your next metro pass recharge.', partner: 'Metro Connect', limitDays: 7, active: true },
  { rewardId: 'grocery-voucher', name: 'Grocery Voucher', icon: '🛒', pointsRequired: 50, description: 'Save on groceries with a partner-store voucher.', partner: 'FreshMart', limitDays: 7, active: true },
  { rewardId: 'cafe-coupon', name: 'Cafe Coupon', icon: '☕', pointsRequired: 30, description: 'Enjoy a warm drink at a nearby cafe.', partner: 'Cafe Circle', limitDays: 7, active: true },
  { rewardId: 'fast-food-voucher', name: 'Fast Food Voucher', icon: '🍔', pointsRequired: 40, description: 'Redeem a discount at a participating outlet.', partner: 'QuickBite', limitDays: 7, active: true },
  { rewardId: 'movie-ticket-discount', name: 'Movie Ticket Discount', icon: '🎬', pointsRequired: 70, description: 'Apply a discount on your next movie booking.', partner: 'City Cinemas', limitDays: 7, active: true },
  { rewardId: 'fuel-cashback', name: 'Fuel Cashback', icon: '⛽', pointsRequired: 120, description: 'Unlock cashback on your next fuel purchase.', partner: 'FuelFirst', limitDays: 7, active: true },
  { rewardId: 'mobile-recharge', name: 'Mobile Recharge', icon: '📱', pointsRequired: 60, description: 'Redeem recharge credit for your mobile number.', partner: 'Recharge Hub', limitDays: 7, active: true },
  { rewardId: 'shopping-coupon', name: 'Shopping Coupon', icon: '🛍️', pointsRequired: 90, description: 'Use this coupon on fashion and essentials.', partner: 'ShopSquare', limitDays: 7, active: true },
  { rewardId: 'electricity-bill-discount', name: 'Electricity Bill Discount', icon: '🧾', pointsRequired: 150, description: 'Reduce your upcoming electricity bill.', partner: 'PowerPay', limitDays: 7, active: true },
  { rewardId: 'online-course-coupon', name: 'Online Course Coupon', icon: '🎓', pointsRequired: 110, description: 'Access discounted learning on a partner platform.', partner: 'SkillSpring', limitDays: 7, active: true },
  { rewardId: 'gym-pass', name: 'Gym Pass', icon: '🏋️', pointsRequired: 100, description: 'Enjoy a weekly fitness pass at partner gyms.', partner: 'FitZone', limitDays: 7, active: true },
  { rewardId: 'data-pack-recharge', name: 'Data Pack Recharge', icon: '📶', pointsRequired: 45, description: 'Redeem a bonus mobile data pack.', partner: 'DataWave', limitDays: 7, active: true },
  { rewardId: 'ride-discount', name: 'Ride Discount', icon: '🚖', pointsRequired: 75, description: 'Get a discount on your next local ride.', partner: 'RideNow', limitDays: 7, active: true },
];

const rewardsCatalogPath = 'rewardsCatalog';
const userRewardHistoryPath = (userId: string) => `rewardRedemptions/${userId}`;
const userRewardStatePath = (userId: string) => `userRewardRedemptionState/${userId}`;
const rewardRequestsPath = 'rewardRequests';
const userNotificationsPath = (userId: string) => `notifications/${userId}`;

const normalizeRewardItem = (reward: RewardItem): RewardItem => ({
  ...reward,
  audience: reward.audience || 'citizen',
  rewardKind: reward.rewardKind || 'voucher',
});

const getRewardPointsBucket = (role: UserRole) => (role === 'staff' ? 'rewardPoints' : 'points');
const getRewardProfilePath = (role: UserRole, userId: string) => `${getRolePath(role)}/${userId}`;

const createNotificationRecord = (
  userId: string,
  role: UserRole,
  title: string,
  message: string,
  type: UserNotification['type'] = 'info'
): UserNotification => ({
  notificationId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  userId,
  role,
  title,
  message,
  type,
  createdAt: new Date().toISOString(),
  read: false,
});

const computeStaffBadges = (staffProfile: any) => {
  const badges = new Set<string>(Array.isArray(staffProfile?.badges) ? staffProfile.badges : []);
  const tasksCompleted = Number(staffProfile?.tasksCompleted || 0);
  const averageResponseMinutes = Number(staffProfile?.averageResponseMinutes || 0);
  const streakCount = Number(staffProfile?.streakCount || 0);
  const extraTaskCount = Number(staffProfile?.extraTaskCount || 0);

  if (tasksCompleted >= 15) badges.add('Cleanliness Champion');
  if (averageResponseMinutes > 0 && averageResponseMinutes <= 45) badges.add('Quick Responder');
  if (extraTaskCount >= 3) badges.add('Extra Work Hero');
  if (streakCount >= 10) badges.add('Streak Master');

  return Array.from(badges);
};

const generateCouponCode = (rewardId: string, userId: string, redemptionId: string) => {
  const base = `${rewardId}-${userId}-${redemptionId}`.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return `${base.slice(0, 4)}-${base.slice(4, 8)}-${base.slice(8, 12)}`;
};

const addDays = (isoDate: string, days: number) => {
  const next = new Date(isoDate);
  next.setDate(next.getDate() + days);
  return next.toISOString();
};

const mapCollection = <T extends object>(data: Record<string, T> | null | undefined) => {
  if (!data) return [];
  return Object.keys(data).map((key) => ({
    id: key,
    ...data[key],
  }));
};

export const getCreditRewardForCategory = (category?: string) => {
  switch (category) {
    case 'illegal_dumping':
      return 50;
    case 'damaged':
      return 30;
    case 'full':
      return 20;
    default:
      return 10;
  }
};

const getRolePath = (role: UserRole) => {
  if (role === 'staff') return 'staff';
  if (role === 'admin') return 'admins';
  return 'users';
};

export const ensureUserProfile = async (
  role: UserRole,
  userId: string,
  userData: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }
) => {
  try {
    const collectionPath = getRolePath(role);
    const userRef = ref(rtdb, `${collectionPath}/${userId}`);
    const snapshot = await get(userRef);
    const now = new Date().toISOString();

    const baseData = {
      ...userData,
      updatedAt: now,
      active: true,
      lastLoginAt: now,
    };

    if (snapshot.exists()) {
      await update(userRef, baseData);
    } else {
      const idKey = role === 'staff' ? 'staffId' : role === 'admin' ? 'adminId' : 'userId';
      const defaults =
        role === 'staff'
          ? {
              role,
              status: 'available',
              rewardPoints: 0,
              walletBalance: 0,
              totalBonusMoney: 0,
              dailyEarnings: 0,
              tasksCompleted: 0,
              averageResponseMinutes: 0,
              streakCount: 0,
              lastTaskCompletedAt: null,
              extraTaskCount: 0,
              badges: [],
            }
          : { role, rewardPoints: 0 };

      await set(userRef, {
        ...baseData,
        ...defaults,
        [idKey]: userId,
        points: 0,
        reportsCount: 0,
        createdAt: now,
      });
    }

    return { success: true, userId, role };
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    throw error;
  }
};

export const recordLoginEvent = async (loginData: LoginAuditData) => {
  try {
    const loginsRef = ref(rtdb, 'loginHistory');
    const newLoginRef = push(loginsRef);
    const loginAt = loginData.loginAt || new Date().toISOString();

    await set(newLoginRef, {
      ...loginData,
      loginId: newLoginRef.key,
      loginAt,
    });

    return { success: true, loginId: newLoginRef.key };
  } catch (error) {
    console.error('Error recording login event:', error);
    throw error;
  }
};

export const recordUserInput = async (inputData: UserInputAuditData) => {
  try {
    const inputsRef = ref(rtdb, 'userInputs');
    const newInputRef = push(inputsRef);
    const createdAt = inputData.createdAt || new Date().toISOString();

    await set(newInputRef, {
      ...inputData,
      inputId: newInputRef.key,
      createdAt,
    });

    return { success: true, inputId: newInputRef.key };
  } catch (error) {
    console.error('Error recording user input:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = ref(rtdb, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const ensureRewardsCatalog = async () => {
  const rewardsRef = ref(rtdb, rewardsCatalogPath);
  const snapshot = await get(rewardsRef);
  if (snapshot.exists()) return snapshot.val();

  const now = new Date().toISOString();
  const seeded = DEFAULT_REWARDS.reduce<Record<string, RewardItem>>((acc, reward) => {
    acc[reward.rewardId] = {
      ...normalizeRewardItem(reward as RewardItem),
      createdAt: now,
      updatedAt: now,
    };
    return acc;
  }, {});

  await set(rewardsRef, seeded);
  return seeded;
};

export const getRewardsCatalog = async (): Promise<RewardItem[]> => {
  try {
    const data = await ensureRewardsCatalog();
    return mapCollection<RewardItem>(data)
      .map((item) => ({
        ...normalizeRewardItem(item as RewardItem),
        rewardId: (item as RewardItem & { id?: string }).rewardId || (item as { id: string }).id,
      }))
      .filter((reward) => reward.active)
      .sort((a, b) => a.pointsRequired - b.pointsRequired);
  } catch (error) {
    console.error('Error fetching rewards catalog:', error);
    throw error;
  }
};

export const getUserRewardRedemptions = async (userId: string): Promise<RewardRedemption[]> => {
  try {
    const redemptionsRef = ref(rtdb, userRewardHistoryPath(userId));
    const snapshot = await get(redemptionsRef);
    return mapCollection<RewardRedemption>(snapshot.exists() ? snapshot.val() : null)
      .map((item) => ({
        ...(item as RewardRedemption & { id?: string }),
        redemptionId: (item as RewardRedemption & { id?: string }).redemptionId || (item as { id: string }).id,
      }))
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
  } catch (error) {
    console.error('Error fetching user reward redemptions:', error);
    throw error;
  }
};

export const updateRewardRedemptionStatus = async (
  userId: string,
  redemptionId: string,
  status: RewardStatus
) => {
  try {
    const redemptionRef = ref(rtdb, `${userRewardHistoryPath(userId)}/${redemptionId}`);
    await update(redemptionRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    return { success: true, userId, redemptionId, status };
  } catch (error) {
    console.error('Error updating reward redemption status:', error);
    throw error;
  }
};

export const createRewardRequest = async (
  request: Omit<RewardRequest, 'requestId' | 'status' | 'createdAt'>
) => {
  try {
    const requestsRef = ref(rtdb, rewardRequestsPath);
    const newRequestRef = push(requestsRef);
    const requestId = newRequestRef.key;
    if (!requestId) {
      throw new Error('Could not create reward request.');
    }

    const record: RewardRequest = {
      ...request,
      requestId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await set(newRequestRef, record);
    return { success: true, requestId, request: record };
  } catch (error) {
    console.error('Error creating reward request:', error);
    throw error;
  }
};

export const redeemReward = async (
  userId: string,
  rewardId: string,
  role: UserRole = 'citizen'
) => {
  try {
    await ensureRewardsCatalog();

    const rewardSnapshot = await get(ref(rtdb, `${rewardsCatalogPath}/${rewardId}`));
    if (!rewardSnapshot.exists()) {
      throw new Error('This reward is not available right now.');
    }

    const reward = normalizeRewardItem(rewardSnapshot.val() as RewardItem);
    if (reward.active === false) {
      throw new Error('This reward is not available right now.');
    }

    if (!(reward.audience === 'both' || reward.audience === role)) {
      throw new Error('This reward is not available for this account.');
    }

    const profileSnapshot = await get(ref(rtdb, getRewardProfilePath(role, userId)));
    if (!profileSnapshot.exists()) {
      throw new Error('User profile was not found.');
    }

    const profile = profileSnapshot.val();
    const pointBucket = getRewardPointsBucket(role);
    const availablePoints = Number(profile?.[pointBucket] || 0);
    if (availablePoints < reward.pointsRequired) {
      throw new Error('Not enough points to redeem this reward.');
    }

    const stateSnapshot = await get(ref(rtdb, `${userRewardStatePath(userId)}/${rewardId}`));
    const state = stateSnapshot.exists() ? stateSnapshot.val() : null;
    const cooldownEndsAt = state?.cooldownEndsAt;
    if (cooldownEndsAt && new Date(cooldownEndsAt).getTime() > Date.now()) {
      throw new Error('This reward can only be redeemed once per week.');
    }

    const requestsSnapshot = await get(ref(rtdb, rewardRequestsPath));
    const requests = requestsSnapshot.exists() ? requestsSnapshot.val() : {};
    const hasPending = Object.values(requests).some((entry: any) =>
      entry?.userId === userId &&
      entry?.role === role &&
      entry?.rewardType === 'reward_redemption' &&
      entry?.rewardId === rewardId &&
      entry?.status === 'pending'
    );

    if (hasPending) {
      throw new Error('A redemption request for this reward is already pending admin approval.');
    }

    const result = await createRewardRequest({
      userId,
      role,
      rewardType: 'reward_redemption',
      rewardId,
      points: reward.pointsRequired,
      money: reward.moneyValue || 0,
      voucherRewardId: reward.rewardKind === 'voucher' ? reward.rewardId : undefined,
      voucherName: reward.name,
      reason: `${reward.name} redemption requested by ${role}.`,
    });

    return {
      success: true,
      requestId: result.requestId,
      pendingApproval: true,
      remainingPoints: availablePoints,
    };
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const userRef = ref(rtdb, `users/${userId}`);
    await update(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('User profile updated:', userId);
    return { success: true, userId };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const awardCitizenCredits = async (
  userId: string,
  creditData: {
    points: number;
    reportId: string;
    category?: string;
    severity?: string;
  }
) => {
  try {
    const requestsSnapshot = await get(ref(rtdb, rewardRequestsPath));
    const requests = requestsSnapshot.exists() ? requestsSnapshot.val() : {};
    const alreadyPending = Object.values(requests).some((entry: any) =>
      entry?.userId === userId &&
      entry?.sourceId === creditData.reportId &&
      entry?.rewardType === 'complaint_verified' &&
      entry?.status === 'pending'
    );

    if (alreadyPending) {
      return { success: true, userId, awardedPoints: 0, skipped: true };
    }

    const result = await createRewardRequest({
      userId,
      role: 'citizen',
      rewardType: 'complaint_verified',
      points: creditData.points,
      sourceId: creditData.reportId,
      reason: `Citizen earned ${creditData.points} points for verified complaint.`,
    });

    return { success: true, userId, awardedPoints: creditData.points, requestId: result.requestId };
  } catch (error) {
    console.error('Error awarding citizen credits:', error);
    throw error;
  }
};

export const approveRewardRequest = async (adminId: string, requestId: string) => {
  try {
    await ensureRewardsCatalog();
    const rootRef = ref(rtdb);
    let failureReason = 'Reward request could not be approved.';

    const transactionResult = await runTransaction(rootRef, (currentData) => {
      const rootData = currentData || {};
      const request: RewardRequest | undefined = rootData?.rewardRequests?.[requestId];
      const nowIso = new Date().toISOString();

      if (!request) {
        failureReason = 'Reward request was not found.';
        return;
      }

      if (request.status !== 'pending') {
        failureReason = 'This reward request has already been processed.';
        return;
      }

      const profileBucket = getRolePath(request.role);
      const profile = rootData?.[profileBucket]?.[request.userId];
      if (!profile) {
        failureReason = 'User profile was not found.';
        return;
      }

      const nextData = {
        ...rootData,
        rewardRequests: {
          ...(rootData.rewardRequests || {}),
        },
        notifications: {
          ...(rootData.notifications || {}),
          [request.userId]: {
            ...(rootData.notifications?.[request.userId] || {}),
          },
        },
      } as any;

      const notificationsBucket = nextData.notifications[request.userId];
      const notification = createNotificationRecord(
        request.userId,
        request.role,
        'Reward Approved',
        request.rewardType === 'reward_redemption'
          ? `${request.voucherName || 'Reward'} redeemed successfully after admin approval.`
          : `${request.reason} Approved by admin.`,
        'success'
      );
      notificationsBucket[notification.notificationId] = notification;

      if (request.rewardType === 'reward_redemption') {
        if (!request.rewardId) {
          failureReason = 'Reward definition was not found.';
          return;
        }
        const reward = normalizeRewardItem(rootData?.rewardsCatalog?.[request.rewardId] as RewardItem);
        if (!reward?.rewardId) {
          failureReason = 'Reward definition was not found.';
          return;
        }

        const pointsBucket = getRewardPointsBucket(request.role);
        const availablePoints = Number(profile?.[pointsBucket] || 0);
        if (availablePoints < reward.pointsRequired) {
          failureReason = 'User no longer has enough points for this reward.';
          return;
        }

        const rewardState = rootData?.userRewardRedemptionState?.[request.userId]?.[reward.rewardId];
        const cooldownEndsAt = rewardState?.cooldownEndsAt;
        if (cooldownEndsAt && new Date(cooldownEndsAt).getTime() > Date.now()) {
          failureReason = 'This reward is still on cooldown.';
          return;
        }

        const userRedemptions = rootData?.rewardRedemptions?.[request.userId] || {};
        const redemptionId = push(ref(rtdb, userRewardHistoryPath(request.userId))).key;
        if (!redemptionId) {
          failureReason = 'Could not create redemption record.';
          return;
        }

        const couponCode = generateCouponCode(reward.rewardId, request.userId, redemptionId);
        const redemptionRecord: RewardRedemption = {
          redemptionId,
          rewardId: reward.rewardId,
          rewardName: reward.name,
          rewardIcon: reward.icon,
          pointsSpent: reward.pointsRequired,
          couponCode,
          qrValue: `${couponCode}|${reward.rewardId}|${request.userId}|${redemptionId}`,
          status: 'active',
          redeemedAt: nowIso,
          expiresAt: addDays(nowIso, reward.limitDays),
          limitDays: reward.limitDays,
          audience: reward.audience,
          rewardKind: reward.rewardKind,
          approvedAt: nowIso,
        };

        nextData[profileBucket] = {
          ...(rootData?.[profileBucket] || {}),
          [request.userId]: {
            ...profile,
            [pointsBucket]: availablePoints - reward.pointsRequired,
            ...(request.role === 'citizen' ? { points: availablePoints - reward.pointsRequired } : {}),
            updatedAt: nowIso,
          },
        };
        nextData.rewardRedemptions = {
          ...(rootData.rewardRedemptions || {}),
          [request.userId]: {
            ...userRedemptions,
            [redemptionId]: redemptionRecord,
          },
        };
        nextData.userRewardRedemptionState = {
          ...(rootData.userRewardRedemptionState || {}),
          [request.userId]: {
            ...(rootData.userRewardRedemptionState?.[request.userId] || {}),
            [reward.rewardId]: {
              rewardId: reward.rewardId,
              lastRedeemedAt: nowIso,
              cooldownEndsAt: addDays(nowIso, reward.limitDays),
              totalRedemptions: Number(rewardState?.totalRedemptions || 0) + 1,
              lastRedemptionId: redemptionId,
            },
          },
        };
      } else {
        const pointsToAdd = Number(request.points || 0);
        const moneyToAdd = Number(request.money || 0);
        const currentRewardPoints = Number(profile?.[getRewardPointsBucket(request.role)] || 0);

        if (request.role === 'citizen') {
          nextData.users = {
            ...(rootData.users || {}),
            [request.userId]: {
              ...profile,
              points: Number(profile?.points || 0) + pointsToAdd,
              rewardPoints: currentRewardPoints + pointsToAdd,
              updatedAt: nowIso,
            },
          };
        } else {
          const resolvedAt = request.rewardType === 'staff_streak_bonus' ? nowIso : profile?.lastTaskCompletedAt;
          const nextProfile = {
            ...profile,
            rewardPoints: currentRewardPoints + pointsToAdd,
            walletBalance: Number(profile?.walletBalance || 0) + moneyToAdd,
            totalBonusMoney: Number(profile?.totalBonusMoney || 0) + moneyToAdd,
            dailyEarnings: Number(profile?.dailyEarnings || 0) + moneyToAdd,
            streakCount:
              request.rewardType === 'staff_streak_bonus'
                ? Number(profile?.streakCount || 0) + 1
                : Number(profile?.streakCount || 0),
            lastTaskCompletedAt: resolvedAt,
            badges: computeStaffBadges({
              ...profile,
              rewardPoints: currentRewardPoints + pointsToAdd,
              walletBalance: Number(profile?.walletBalance || 0) + moneyToAdd,
              totalBonusMoney: Number(profile?.totalBonusMoney || 0) + moneyToAdd,
            }),
            updatedAt: nowIso,
          };

          nextData.staff = {
            ...(rootData.staff || {}),
            [request.userId]: nextProfile,
          };
        }
      }

      nextData.rewardRequests[requestId] = {
        ...request,
        status: 'approved',
        approvedAt: nowIso,
        adminId,
      };

      return nextData;
    });

    if (!transactionResult.committed) {
      throw new Error(failureReason);
    }

    return { success: true, requestId };
  } catch (error) {
    console.error('Error approving reward request:', error);
    throw error;
  }
};

export const rejectRewardRequest = async (adminId: string, requestId: string, reason = 'Reward request rejected.') => {
  try {
    const requestRef = ref(rtdb, `${rewardRequestsPath}/${requestId}`);
    const requestSnapshot = await get(requestRef);
    if (!requestSnapshot.exists()) {
      throw new Error('Reward request was not found.');
    }

    const request = requestSnapshot.val() as RewardRequest;
    if (request.status !== 'pending') {
      throw new Error('This reward request has already been processed.');
    }

    const notification = createNotificationRecord(
      request.userId,
      request.role,
      'Reward Rejected',
      reason,
      'warning'
    );

    await update(ref(rtdb), {
      [`${rewardRequestsPath}/${requestId}/status`]: 'rejected',
      [`${rewardRequestsPath}/${requestId}/adminId`]: adminId,
      [`${rewardRequestsPath}/${requestId}/rejectedAt`]: new Date().toISOString(),
      [`${userNotificationsPath(request.userId)}/${notification.notificationId}`]: notification,
    });

    return { success: true, requestId };
  } catch (error) {
    console.error('Error rejecting reward request:', error);
    throw error;
  }
};

export const createRewardType = async (
  rewardData: Omit<RewardItem, 'createdAt' | 'updatedAt'>
) => {
  try {
    const reward = normalizeRewardItem(rewardData as RewardItem);
    const now = new Date().toISOString();
    await update(ref(rtdb), {
      [`${rewardsCatalogPath}/${reward.rewardId}`]: {
        ...reward,
        createdAt: now,
        updatedAt: now,
      },
    });
    return { success: true, rewardId: reward.rewardId };
  } catch (error) {
    console.error('Error creating reward type:', error);
    throw error;
  }
};

/**
 * Get all citizen users
 */
export const getAllCitizens = async () => {
  try {
    const userRef = ref(rtdb, 'users');
    const snapshot = await get(userRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data)
      .map((key) => ({ id: key, ...data[key] }))
      .filter((user) => user.role === 'citizen');
  } catch (error) {
    console.error('Error fetching citizens:', error);
    throw error;
  }
};

// ==================== STAFF COLLECTION ====================
/**
 * Create a staff profile
 */
export const createStaffUser = async (
  staffId: string,
  staffData: {
    email: string;
    name: string;
    phone?: string;
    designation?: string;
    vehicleId?: string;
    assignedArea?: string;
    avatar?: string;
  }
) => {
  try {
    const staffRef = ref(rtdb, `staff/${staffId}`);
    await set(staffRef, {
      ...staffData,
      staffId,
      role: 'staff',
      status: 'available',
      rewardPoints: 0,
      walletBalance: 0,
      totalBonusMoney: 0,
      dailyEarnings: 0,
      tasksCompleted: 0,
      averageResponseMinutes: 0,
      streakCount: 0,
      extraTaskCount: 0,
      badges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    });
    console.log('Staff user created:', staffId);
    return { success: true, staffId };
  } catch (error) {
    console.error('Error creating staff user:', error);
    throw error;
  }
};

/**
 * Get staff profile
 */
export const getStaffProfile = async (staffId: string) => {
  try {
    const staffRef = ref(rtdb, `staff/${staffId}`);
    const snapshot = await get(staffRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    throw error;
  }
};

/**
 * Update staff status (available, on-route, collecting, offline)
 */
export const updateStaffStatus = async (staffId: string, status: string) => {
  try {
    const statusRef = ref(rtdb, `staff/${staffId}/status`);
    await set(statusRef, status);
    console.log('Staff status updated:', status);
    return { success: true, staffId, status };
  } catch (error) {
    console.error('Error updating staff status:', error);
    throw error;
  }
};

/**
 * Get all staff members
 */
export const getAllStaff = async () => {
  try {
    const staffRef = ref(rtdb, 'staff');
    const snapshot = await get(staffRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

/**
 * Get available staff members
 */
export const getAvailableStaff = async () => {
  try {
    const staffData = await getAllStaff();
    return staffData.filter((staff) => staff.status === 'available');
  } catch (error) {
    console.error('Error fetching available staff:', error);
    throw error;
  }
};

// ==================== ADMIN COLLECTION ====================
/**
 * Create an admin profile
 */
export const createAdminUser = async (
  adminId: string,
  adminData: {
    email: string;
    name: string;
    phone?: string;
    permissions?: string[];
    avatar?: string;
  }
) => {
  try {
    const adminRef = ref(rtdb, `admins/${adminId}`);
    await set(adminRef, {
      ...adminData,
      adminId,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
    });
    console.log('Admin user created:', adminId);
    return { success: true, adminId };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

/**
 * Get admin profile
 */
export const getAdminProfile = async (adminId: string) => {
  try {
    const adminRef = ref(rtdb, `admins/${adminId}`);
    const snapshot = await get(adminRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

/**
 * Get all admins
 */
export const getAllAdmins = async () => {
  try {
    const adminRef = ref(rtdb, 'admins');
    const snapshot = await get(adminRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

// ==================== BINS COLLECTION ====================
/**
 * Add a new trash bin location
 */
export const addBinLocation = async (binData: {
  location: string;
  latitude: number;
  longitude: number;
  capacity?: number;
  fillLevel?: number;
  status?: string;
}) => {
  try {
    const binsRef = ref(rtdb, 'bins');
    const newBinRef = push(binsRef);
    await set(newBinRef, {
      ...binData,
      status: binData.status || 'empty',
      fillLevel: binData.fillLevel || 0,
      capacity: binData.capacity || 100,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    console.log('Bin added:', newBinRef.key);
    return { success: true, binId: newBinRef.key };
  } catch (error) {
    console.error('Error adding bin:', error);
    throw error;
  }
};

/**
 * Get all bins
 */
export const getAllBins = async () => {
  try {
    const binsRef = ref(rtdb, 'bins');
    const snapshot = await get(binsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching bins:', error);
    throw error;
  }
};

/**
 * Update bin status and fill level
 */
export const updateBinStatus = async (
  binId: string,
  updates: {
    status?: string;
    fillLevel?: number;
  }
) => {
  try {
    const binRef = ref(rtdb, `bins/${binId}`);
    await update(binRef, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
    console.log('Bin updated:', binId);
    return { success: true, binId };
  } catch (error) {
    console.error('Error updating bin:', error);
    throw error;
  }
};

export const updateBinDetails = async (
  binId: string,
  updates: {
    status?: string;
    fillLevel?: number;
    wasteType?: string;
    areaType?: string;
    lastCollectedAt?: string;
    location?: string;
    capacity?: number;
    latitude?: number;
    longitude?: number;
  }
) => {
  try {
    const binRef = ref(rtdb, `bins/${binId}`);
    await update(binRef, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
    return { success: true, binId };
  } catch (error) {
    console.error('Error updating bin details:', error);
    throw error;
  }
};

// ==================== REPORTS COLLECTION ====================
/**
 * Create a citizen report (full bin, damaged bin, etc)
 */
export const createReport = async (
  userId: string,
  reportData: {
    binId: string;
    description: string;
    imageUrl?: string;
    category?: string; // 'full', 'damaged', 'misplaced', 'other'
    severity?: string;
    awardedPoints?: number;
    latitude?: number;
    longitude?: number;
    status?: string;
    address?: string;
    imageMeta?: {
      fileName?: string;
      fileType?: string;
      fileSize?: number;
    };
  }
) => {
  try {
    const reportsRef = ref(rtdb, 'reports');
    const newReportRef = push(reportsRef);
    await set(newReportRef, {
      ...reportData,
      reportId: newReportRef.key,
      userId,
      status: reportData.status || 'pending',
      citizenCompletionRewardRequested: false,
      staffTaskRewardRequested: false,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
    console.log('Report created:', newReportRef.key);
    return { success: true, reportId: newReportRef.key };
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

/**
 * Get all reports
 */
export const getAllReports = async () => {
  try {
    const reportsRef = ref(rtdb, 'reports');
    const snapshot = await get(reportsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get reports by user
 */
export const getUserReports = async (userId: string) => {
  try {
    const allReports = await getAllReports();
    return allReports.filter((report) => report.userId === userId);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
};

/**
 * Update report status
 */
export const updateReportStatus = async (reportId: string, status: string) => {
  try {
    const reportRef = ref(rtdb, `reports/${reportId}`);
    await update(reportRef, {
      status,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null,
    });
    console.log('Report status updated:', status);
    return { success: true, reportId, status };
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

export const dispatchTruckToReport = async (
  reportId: string,
  truckData: {
    truckId: string;
    truckName: string;
  }
) => {
  try {
    const reportRef = ref(rtdb, `reports/${reportId}`);
    await update(reportRef, {
      status: 'dispatched',
      assignedTruckId: truckData.truckId,
      assignedTruckName: truckData.truckName,
      dispatchedAt: new Date().toISOString(),
    });

    const truckRef = ref(rtdb, `trucks/${truckData.truckId}`);
    await update(truckRef, {
      status: 'active',
      assignedReportId: reportId,
      lastUpdated: new Date().toISOString(),
    });

    return { success: true, reportId, truckId: truckData.truckId };
  } catch (error) {
    console.error('Error dispatching truck to report:', error);
    throw error;
  }
};

export const completeReportCollection = async (reportId: string, truckId?: string) => {
  try {
    const reportSnapshot = await get(ref(rtdb, `reports/${reportId}`));
    if (!reportSnapshot.exists()) {
      throw new Error('Report not found.');
    }

    const report = reportSnapshot.val();
    const nowIso = new Date().toISOString();
    await update(ref(rtdb, `reports/${reportId}`), {
      status: 'resolved',
      resolvedAt: nowIso,
      collectionCompletedAt: nowIso,
      citizenCompletionRewardRequested: true,
      staffTaskRewardRequested: true,
    });

    let driverId = report?.assignedDriverId || null;
    if (truckId) {
      const truckRef = ref(rtdb, `trucks/${truckId}`);
      const truckSnapshot = await get(truckRef);
      const truck = truckSnapshot.exists() ? truckSnapshot.val() : null;
      driverId = truck?.driverId || driverId;

      await update(truckRef, {
        status: 'available',
        assignedReportId: null,
        lastUpdated: nowIso,
      });
    }

    const requestsSnapshot = await get(ref(rtdb, rewardRequestsPath));
    const requests = requestsSnapshot.exists() ? requestsSnapshot.val() : {};

    const hasCitizenCompletionRequest = Object.values(requests).some((entry: any) =>
      entry?.sourceId === reportId &&
      entry?.rewardType === 'complaint_completed_bonus' &&
      entry?.status === 'pending'
    );
    const hasStaffBaseRequest = Object.values(requests).some((entry: any) =>
      entry?.sourceId === reportId &&
      entry?.rewardType === 'staff_task_base' &&
      entry?.status === 'pending'
    );

    if (report?.userId && !hasCitizenCompletionRequest) {
      await createRewardRequest({
        userId: report.userId,
        role: 'citizen',
        rewardType: 'complaint_completed_bonus',
        points: 5,
        sourceId: reportId,
        reason: 'Citizen earned 5 bonus points after complaint completion.',
      });
    }

    if (driverId && !hasStaffBaseRequest) {
      const createdAt = report?.createdAt ? new Date(report.createdAt).getTime() : Date.now();
      const responseMinutes = Math.max(1, Math.round((Date.now() - createdAt) / 60000));
      const qualifiesExtraBonus = responseMinutes <= 45;
      const staffSnapshot = await get(ref(rtdb, `staff/${driverId}`));
      const staffProfile = staffSnapshot.exists() ? staffSnapshot.val() : {};
      const lastTaskCompletedAt = staffProfile?.lastTaskCompletedAt ? new Date(staffProfile.lastTaskCompletedAt) : null;
      const isNextDay =
        !lastTaskCompletedAt ||
        new Date(nowIso).toDateString() !== lastTaskCompletedAt.toDateString();

      await createRewardRequest({
        userId: driverId,
        role: 'staff',
        rewardType: 'staff_task_base',
        points: 15,
        money: 50,
        sourceId: reportId,
        reason: 'Base staff reward pending approval for completed collection task.',
      });

      if (qualifiesExtraBonus) {
        await createRewardRequest({
          userId: driverId,
          role: 'staff',
          rewardType: 'staff_extra_bonus',
          points: 10,
          money: 20,
          sourceId: reportId,
          reason: 'Extra fast-response bonus pending approval.',
        });
      }

      if (isNextDay) {
        await createRewardRequest({
          userId: driverId,
          role: 'staff',
          rewardType: 'staff_streak_bonus',
          points: 5,
          money: 10,
          sourceId: `${reportId}-streak`,
          reason: 'Daily streak bonus pending approval.',
        });
      }

      await update(ref(rtdb, `staff/${driverId}`), {
        tasksCompleted: Number(staffProfile?.tasksCompleted || 0) + 1,
        averageResponseMinutes: staffProfile?.averageResponseMinutes
          ? Math.round((Number(staffProfile.averageResponseMinutes) + responseMinutes) / 2)
          : responseMinutes,
        extraTaskCount: Number(staffProfile?.extraTaskCount || 0) + (qualifiesExtraBonus ? 1 : 0),
        lastTaskCompletedAt: nowIso,
        badges: computeStaffBadges({
          ...staffProfile,
          tasksCompleted: Number(staffProfile?.tasksCompleted || 0) + 1,
          averageResponseMinutes: staffProfile?.averageResponseMinutes
            ? Math.round((Number(staffProfile.averageResponseMinutes) + responseMinutes) / 2)
            : responseMinutes,
          extraTaskCount: Number(staffProfile?.extraTaskCount || 0) + (qualifiesExtraBonus ? 1 : 0),
        }),
        updatedAt: nowIso,
      });
    }

    return { success: true, reportId, truckId, driverId };
  } catch (error) {
    console.error('Error completing report collection:', error);
    throw error;
  }
};

// ==================== TRUCKS COLLECTION ====================
/**
 * Add a garbage collection truck
 */
export const addTruck = async (truckData: {
  registrationNumber: string;
  driverName: string;
  driverId: string;
  capacity?: number;
  currentFill?: number;
  status?: string;
  latitude?: number;
  longitude?: number;
}) => {
  try {
    const trucksRef = ref(rtdb, 'trucks');
    const newTruckRef = push(trucksRef);
    await set(newTruckRef, {
      ...truckData,
      truckId: newTruckRef.key,
      capacity: truckData.capacity || 5000,
      currentFill: truckData.currentFill || 0,
      status: truckData.status || 'available',
      latitude: truckData.latitude || 19.9975,
      longitude: truckData.longitude || 73.7898,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    console.log('Truck added:', newTruckRef.key);
    return { success: true, truckId: newTruckRef.key };
  } catch (error) {
    console.error('Error adding truck:', error);
    throw error;
  }
};

/**
 * Get all trucks
 */
export const getAllTrucks = async () => {
  try {
    const trucksRef = ref(rtdb, 'trucks');
    const snapshot = await get(trucksRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching trucks:', error);
    throw error;
  }
};

/**
 * Update truck location
 */
export const updateTruckLocation = async (
  truckId: string,
  latitude: number,
  longitude: number
) => {
  try {
    const truckRef = ref(rtdb, `trucks/${truckId}`);
    await update(truckRef, {
      latitude,
      longitude,
      lastUpdated: new Date().toISOString(),
    });
    return { success: true, truckId };
  } catch (error) {
    console.error('Error updating truck location:', error);
    throw error;
  }
};

/**
 * Update truck status
 */
export const updateTruckStatus = async (truckId: string, status: string) => {
  try {
    const truckRef = ref(rtdb, `trucks/${truckId}`);
    await update(truckRef, {
      status,
      lastUpdated: new Date().toISOString(),
    });
    return { success: true, truckId, status };
  } catch (error) {
    console.error('Error updating truck status:', error);
    throw error;
  }
};

// ==================== COMMUNITY POSTS ====================
/**
 * Create a community post
 */
export const createPost = async (
  userId: string,
  postData: {
    title: string;
    content: string;
    imageUrl?: string;
    category?: string;
  }
) => {
  try {
    const postsRef = ref(rtdb, 'communityPosts');
    const newPostRef = push(postsRef);
    await set(newPostRef, {
      ...postData,
      postId: newPostRef.key,
      userId,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Post created:', newPostRef.key);
    return { success: true, postId: newPostRef.key };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Get all community posts
 */
export const getAllPosts = async () => {
  try {
    const postsRef = ref(rtdb, 'communityPosts');
    const snapshot = await get(postsRef);
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Like a post
 */
export const likePost = async (postId: string) => {
  try {
    const likesRef = ref(rtdb, `communityPosts/${postId}/likes`);
    const snapshot = await get(likesRef);
    const currentLikes = snapshot.val() || 0;
    await set(likesRef, currentLikes + 1);
    return { success: true, postId, likes: currentLikes + 1 };
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS ====================
/**
 * Listen to real-time updates for users
 * Usage: const unsubscribe = onUsersUpdate(callback);
 *        return () => unsubscribe();
 */
export const onUsersUpdate = (
  callback: (users: any[]) => void,
  onError?: (error: Error) => void
) => {
  const usersRef = ref(rtdb, 'users');
  const listener = onValue(
    usersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const users = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        callback(users);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error listening to users:', error);
      onError?.(error);
    }
  );

  return () => off(usersRef);
};

export const onStaffUpdate = (
  callback: (staff: any[]) => void,
  onError?: (error: Error) => void
) => {
  const staffRef = ref(rtdb, 'staff');
  onValue(
    staffRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(
          Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        );
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error listening to staff:', error);
      onError?.(error);
    }
  );

  return () => off(staffRef);
};

export const onRewardsCatalogUpdate = (
  callback: (rewards: RewardItem[]) => void,
  onError?: (error: Error) => void
) => {
  ensureRewardsCatalog().catch((error) => {
    console.error('Error ensuring rewards catalog:', error);
    onError?.(error as Error);
  });

  const rewardsRef = ref(rtdb, rewardsCatalogPath);
  onValue(
    rewardsRef,
    (snapshot) => {
      const rewards = mapCollection<RewardItem>(snapshot.exists() ? snapshot.val() : null)
        .map((item) => ({
          ...normalizeRewardItem(item as RewardItem),
          rewardId: (item as RewardItem & { id?: string }).rewardId || (item as { id: string }).id,
        }))
        .filter((reward) => reward.active)
        .sort((a, b) => a.pointsRequired - b.pointsRequired);
      callback(rewards);
    },
    (error) => {
      console.error('Error listening to rewards catalog:', error);
      onError?.(error);
    }
  );

  return () => off(rewardsRef);
};

export const onUserRewardRedemptionsUpdate = (
  userId: string,
  callback: (redemptions: RewardRedemption[]) => void,
  onError?: (error: Error) => void
) => {
  const redemptionsRef = ref(rtdb, userRewardHistoryPath(userId));
  onValue(
    redemptionsRef,
    (snapshot) => {
      const redemptions = mapCollection<RewardRedemption>(snapshot.exists() ? snapshot.val() : null)
        .map((item) => ({
          ...(item as RewardRedemption & { id?: string }),
          redemptionId: (item as RewardRedemption & { id?: string }).redemptionId || (item as { id: string }).id,
        }))
        .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
      callback(redemptions);
    },
    (error) => {
      console.error('Error listening to user reward redemptions:', error);
      onError?.(error);
    }
  );

  return () => off(redemptionsRef);
};

export const onAllRewardRedemptionsUpdate = (
  callback: (redemptions: Array<RewardRedemption & { userId: string }>) => void,
  onError?: (error: Error) => void
) => {
  const allRedemptionsRef = ref(rtdb, 'rewardRedemptions');
  onValue(
    allRedemptionsRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      if (!data) {
        callback([]);
        return;
      }

      const redemptions = Object.keys(data).flatMap((userId) => {
        const userRedemptions = data[userId] || {};
        return Object.keys(userRedemptions).map((redemptionId) => ({
          ...userRedemptions[redemptionId],
          redemptionId: userRedemptions[redemptionId]?.redemptionId || redemptionId,
          userId,
        }));
      });

      redemptions.sort(
        (a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      );
      callback(redemptions);
    },
    (error) => {
      console.error('Error listening to all reward redemptions:', error);
      onError?.(error);
    }
  );

  return () => off(allRedemptionsRef);
};

export const onRewardRequestsUpdate = (
  callback: (requests: RewardRequest[]) => void,
  onError?: (error: Error) => void
) => {
  const requestsRef = ref(rtdb, rewardRequestsPath);
  onValue(
    requestsRef,
    (snapshot) => {
      const requests = mapCollection<RewardRequest>(snapshot.exists() ? snapshot.val() : null)
        .map((item) => ({
          ...(item as RewardRequest & { id?: string }),
          requestId: (item as RewardRequest & { id?: string }).requestId || (item as { id: string }).id,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(requests);
    },
    (error) => {
      console.error('Error listening to reward requests:', error);
      onError?.(error);
    }
  );

  return () => off(requestsRef);
};

export const onUserNotificationsUpdate = (
  userId: string,
  callback: (notifications: UserNotification[]) => void,
  onError?: (error: Error) => void
) => {
  const notificationsRef = ref(rtdb, userNotificationsPath(userId));
  onValue(
    notificationsRef,
    (snapshot) => {
      const notifications = mapCollection<UserNotification>(snapshot.exists() ? snapshot.val() : null)
        .map((item) => ({
          ...(item as UserNotification & { id?: string }),
          notificationId:
            (item as UserNotification & { id?: string }).notificationId || (item as { id: string }).id,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(notifications);
    },
    (error) => {
      console.error('Error listening to notifications:', error);
      onError?.(error);
    }
  );

  return () => off(notificationsRef);
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  try {
    await update(ref(rtdb, `${userNotificationsPath(userId)}/${notificationId}`), {
      read: true,
    });
    return { success: true, notificationId };
  } catch (error) {
    console.error('Error marking notification read:', error);
    throw error;
  }
};

/**
 * Listen to real-time updates for bins
 */
export const onBinsUpdate = (
  callback: (bins: any[]) => void,
  onError?: (error: Error) => void
) => {
  const binsRef = ref(rtdb, 'bins');
  const listener = onValue(
    binsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const bins = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        callback(bins);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error listening to bins:', error);
      onError?.(error);
    }
  );

  return () => off(binsRef);
};

/**
 * Listen to real-time updates for trucks
 */
export const onTrucksUpdate = (
  callback: (trucks: any[]) => void,
  onError?: (error: Error) => void
) => {
  const trucksRef = ref(rtdb, 'trucks');
  const listener = onValue(
    trucksRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const trucks = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        callback(trucks);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error listening to trucks:', error);
      onError?.(error);
    }
  );

  return () => off(trucksRef);
};

/**
 * Listen to real-time updates for reports
 */
export const onReportsUpdate = (
  callback: (reports: any[]) => void,
  onError?: (error: Error) => void
) => {
  const reportsRef = ref(rtdb, 'reports');
  const listener = onValue(
    reportsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reports = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        callback(reports);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error listening to reports:', error);
      onError?.(error);
    }
  );

  return () => off(reportsRef);
};
