import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Bell,
  Clock3,
  Ticket,
} from "lucide-react";
import {
  getUserProfile,
  onRewardsCatalogUpdate,
  onRewardRequestsUpdate,
  onStaffUpdate,
  onUserNotificationsUpdate,
  onUserRewardRedemptionsUpdate,
  onUsersUpdate,
  redeemReward,
  type RewardItem,
  type RewardRedemption,
  type RewardRequest,
  type UserNotification,
  updateRewardRedemptionStatus,
} from "./src/services/databaseService";

const tabs = [
  { id: "available", label: "Rewards" },
  { id: "mine", label: "My Rewards" },
] as const;

type RewardsPageProps = {
  onNavigate: (page: string) => void;
  citizenId?: string;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function RewardsPage({ onNavigate, citizenId }: RewardsPageProps) {
  const activeCitizenId = citizenId || localStorage.getItem("userId") || "anonymous";
  const accountRole = (localStorage.getItem("userRole") as "citizen" | "staff" | "admin" | null) || "citizen";
  const [points, setPoints] = useState(0);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("available");
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [myRewards, setMyRewards] = useState<RewardRedemption[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RewardRequest[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  const [markingUsedId, setMarkingUsedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile =
      accountRole === "staff"
        ? Promise.resolve(null)
        : getUserProfile(activeCitizenId);

    loadProfile
      .then((profile) => {
        if (!mounted || !profile) return;
        setPoints(Number(profile.points || profile.rewardPoints || 0));
      })
      .catch((loadError) => {
        console.error("Failed to load reward profile:", loadError);
        if (mounted) {
          setError("Could not load your reward balance right now.");
        }
      });

    const unsubscribeUsers = onUsersUpdate((users) => {
      const currentUser = users.find((user) => user.userId === activeCitizenId || user.id === activeCitizenId);
      if (currentUser && accountRole !== "staff") {
        setPoints(Number(currentUser.points || 0));
      }
    });

    const unsubscribeStaff = onStaffUpdate((staff) => {
      if (accountRole !== "staff") return;
      const currentStaff = staff.find((member) => member.staffId === activeCitizenId || member.id === activeCitizenId);
      if (currentStaff) {
        setPoints(Number(currentStaff.rewardPoints || 0));
      }
    });

    const unsubscribeRewards = onRewardsCatalogUpdate(
      (nextRewards) => {
        setRewards(
          nextRewards.filter((reward) => reward.audience === "both" || reward.audience === accountRole)
        );
        setLoading(false);
      },
      () => {
        setError("Could not load rewards right now.");
        setLoading(false);
      }
    );

    const unsubscribeMyRewards = onUserRewardRedemptionsUpdate(
      activeCitizenId,
      (redemptions) => {
        setMyRewards(redemptions);
        setLoading(false);
      },
      () => {
        setError("Could not load your reward history right now.");
        setLoading(false);
      }
    );

    const unsubscribeRequests = onRewardRequestsUpdate((requests) => {
      setPendingRequests(
        requests.filter(
          (request) =>
            request.userId === activeCitizenId &&
            request.role === accountRole &&
            request.status === "pending"
        )
      );
    });

    const unsubscribeNotifications = onUserNotificationsUpdate(activeCitizenId, (nextNotifications) => {
      setNotifications(nextNotifications.slice(0, 4));
    });

    return () => {
      mounted = false;
      unsubscribeUsers();
      unsubscribeStaff();
      unsubscribeRewards();
      unsubscribeMyRewards();
      unsubscribeRequests();
      unsubscribeNotifications();
    };
  }, [accountRole, activeCitizenId]);

  const stats = useMemo(() => {
    const activeCount = myRewards.filter((reward) => reward.status === "active").length;
    const usedCount = myRewards.filter((reward) => reward.status === "used").length;
    const expiredCount = myRewards.filter((reward) => reward.status === "expired").length;
    return { activeCount, usedCount, expiredCount };
  }, [myRewards]);

  const handleRedeem = async (reward: RewardItem) => {
    if (redeemingRewardId) return;

    setError("");
    setSuccessMessage("");
    setRedeemingRewardId(reward.rewardId);

    try {
      const result = await redeemReward(activeCitizenId, reward.rewardId, accountRole);
      setSuccessMessage(`${reward.name} redemption sent for admin approval.`);
      setTab("mine");
      setPoints(result.remainingPoints);
    } catch (redeemError: any) {
      console.error("Reward redemption failed:", redeemError);
      setError(redeemError?.message || "Could not redeem this reward.");
    } finally {
      setRedeemingRewardId(null);
    }
  };

  const handleMarkAsUsed = async (redemptionId: string) => {
    if (markingUsedId) return;

    setError("");
    setSuccessMessage("");
    setMarkingUsedId(redemptionId);

    try {
      await updateRewardRedemptionStatus(activeCitizenId, redemptionId, "used");
      setSuccessMessage("Reward marked as used.");
    } catch (updateError: any) {
      console.error("Failed to update reward status:", updateError);
      setError(updateError?.message || "Could not update reward status.");
    } finally {
      setMarkingUsedId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(2,136,209,0.18),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4f8_100%)] text-gray-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => onNavigate(accountRole === "staff" ? "command" : "citizen")}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm backdrop-blur transition hover:border-[#0288D1] hover:text-[#0288D1]"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">Rewards System</h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-gray-600">
              Use your points to claim rewards and unlock benefits from city partners.
            </p>
          </div>

          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-[#0288D1]">Available Points</div>
                <div className="mt-3 text-5xl font-black text-gray-900">{points}</div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E3F2FD] text-[#0288D1] shadow-inner">
                <Gift size={30} />
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-500">Use your points to claim rewards.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="text-xs font-black uppercase tracking-widest text-emerald-700">Active</div>
                <div className="mt-2 text-2xl font-black text-emerald-900">{stats.activeCount}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-black uppercase tracking-widest text-slate-600">Used</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{stats.usedCount}</div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="text-xs font-black uppercase tracking-widest text-amber-700">Pending</div>
                <div className="mt-2 text-2xl font-black text-amber-900">{pendingRequests.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#0288D1]" />
              <h2 className="text-lg font-black text-gray-900">Notifications</h2>
            </div>
            <div className="mt-5 space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                  Reward and points updates will appear here after admin review.
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.notificationId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-black text-gray-900">{notification.title}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {formatDateTime(notification.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-600">{notification.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-black text-gray-900">Awaiting Approval</h2>
            </div>
            <div className="mt-5 space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-500">
                  No reward requests are waiting for admin approval right now.
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.requestId} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <div className="text-[11px] font-black uppercase tracking-widest text-amber-700">{request.rewardType.replace(/_/g, " ")}</div>
                    <div className="mt-2 text-sm font-bold text-gray-900">{request.reason}</div>
                    <div className="mt-2 text-xs font-semibold text-gray-600">{formatDateTime(request.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-black uppercase tracking-[0.2em] transition ${
                    tab === item.id
                      ? "bg-[#0288D1] text-white shadow-lg shadow-sky-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {successMessage}
              </div>
            )}

            {loading ? (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm font-bold text-slate-500">
                Loading rewards...
              </div>
            ) : tab === "available" ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {rewards.map((reward) => {
                  const canRedeem = points >= reward.pointsRequired;
                  const isPending = redeemingRewardId === reward.rewardId;

                  return (
                    <div
                      key={reward.rewardId}
                      className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#0288D1]/40 hover:shadow-[0_24px_60px_rgba(2,136,209,0.16)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E1F5FE] to-[#FFF8E1] text-sm font-black text-[#0288D1] shadow-inner">
                          <span>{reward.icon}</span>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                          {reward.limitDays === 7 ? "Weekly" : `${reward.limitDays} Days`}
                        </div>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-xl font-black tracking-tight text-gray-900">{reward.name}</h3>
                        <p className="mt-2 min-h-[48px] text-sm font-medium leading-6 text-gray-600">{reward.description}</p>
                      </div>

                      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">Required</div>
                          <div className="mt-1 text-2xl font-black text-gray-900">{reward.pointsRequired}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">Partner</div>
                          <div className="mt-1 text-sm font-bold text-gray-700">{reward.partner}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem || isPending}
                        className={`mt-5 w-full rounded-2xl px-4 py-3.5 text-sm font-black uppercase tracking-[0.18em] transition ${
                          canRedeem && !isPending
                            ? "bg-[#0288D1] text-white shadow-lg shadow-sky-200 hover:bg-[#0277BD]"
                            : "cursor-not-allowed bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isPending ? "Sending..." : canRedeem ? "Redeem" : "Not enough points"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {myRewards.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0288D1] shadow-sm">
                      <Ticket size={30} />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-gray-900">No rewards redeemed yet</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Redeemed rewards will appear here with their coupon codes and status.
                    </p>
                  </div>
                ) : (
                  myRewards.map((reward) => (
                    <div
                      key={reward.redemptionId}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0288D1]/30 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8F5E9] to-[#FFF8E1] text-3xl">
                            <span>{reward.rewardIcon}</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-gray-900">{reward.rewardName}</h3>
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest ${
                                  reward.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : reward.status === "expired"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {reward.status}
                              </span>
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-500">
                              Redeemed {formatDateTime(reward.redeemedAt)} • Expires {formatDateTime(reward.expiresAt)}
                            </div>
                            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
                              <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">Coupon Code</div>
                              <div className="mt-1 text-lg font-black tracking-[0.18em] text-gray-900">{reward.couponCode}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
                            QR Token: {reward.qrValue.slice(0, 16)}
                          </div>
                          <button
                            onClick={() => handleMarkAsUsed(reward.redemptionId)}
                            disabled={reward.status !== "active" || markingUsedId === reward.redemptionId}
                            className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition ${
                              reward.status !== "active" || markingUsedId === reward.redemptionId
                                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                                : "bg-slate-900 text-white hover:bg-slate-700"
                            }`}
                          >
                            {reward.status === "used"
                              ? "Used"
                              : reward.status === "expired"
                              ? "Expired"
                              : markingUsedId === reward.redemptionId
                              ? "Updating..."
                              : "Mark Used"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
