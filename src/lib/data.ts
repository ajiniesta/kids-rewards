import { createClient } from "@/lib/supabase/server";
import type {
  Child,
  ChildWithBalance,
  FamilyInvite,
  FamilyMember,
  HistoryItem,
  InviteDetails,
  Reward,
  RewardRedemption,
  Task,
  TaskCompletion,
} from "@/lib/types";

export async function getChildren(familyId: string): Promise<ChildWithBalance[]> {
  const supabase = await createClient();

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  const rows = (children ?? []) as Child[];
  if (rows.length === 0) return [];

  const { data: balances } = await supabase
    .from("child_balances")
    .select("child_id, balance")
    .in(
      "child_id",
      rows.map((child) => child.id),
    );

  const balanceByChild = new Map<string, number>(
    ((balances ?? []) as { child_id: string; balance: number }[]).map((row) => [
      row.child_id,
      row.balance,
    ]),
  );

  return rows.map((child) => ({ ...child, balance: balanceByChild.get(child.id) ?? 0 }));
}

export async function getChild(childId: string): Promise<Child | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("children").select("*").eq("id", childId).maybeSingle();
  return (data as Child | null) ?? null;
}

export async function getChildBalance(childId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("child_balances")
    .select("balance")
    .eq("child_id", childId)
    .maybeSingle();
  return (data as { balance: number } | null)?.balance ?? 0;
}

export async function getChildTasks(childId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Task[];
}

export async function getChildRewards(childId: string): Promise<Reward[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rewards")
    .select("*")
    .eq("child_id", childId)
    .order("cost", { ascending: true });
  return (data ?? []) as Reward[];
}

export async function getChildHistory(childId: string, limit = 60): Promise<HistoryItem[]> {
  const supabase = await createClient();

  const [{ data: completions }, { data: redemptions }] = await Promise.all([
    supabase
      .from("task_completions")
      .select("*, profiles(full_name, email)")
      .eq("child_id", childId)
      .order("completed_at", { ascending: false })
      .limit(limit),
    supabase
      .from("reward_redemptions")
      .select("*, profiles(full_name, email)")
      .eq("child_id", childId)
      .order("redeemed_at", { ascending: false })
      .limit(limit),
  ]);

  const items: HistoryItem[] = [
    ...((completions ?? []) as TaskCompletion[]).map((data) => ({ kind: "task" as const, data })),
    ...((redemptions ?? []) as RewardRedemption[]).map((data) => ({ kind: "reward" as const, data })),
  ];

  items.sort((a, b) => {
    const dateA = a.kind === "task" ? a.data.completed_at : a.data.redeemed_at;
    const dateB = b.kind === "task" ? b.data.completed_at : b.data.redeemed_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return items.slice(0, limit);
}

export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_members")
    .select("user_id, role, created_at, profiles(full_name, email)")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  return (data ?? []) as unknown as FamilyMember[];
}

export async function getFamilyInvites(familyId: string): Promise<FamilyInvite[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_invites")
    .select("*, profiles!family_invites_invited_by_fkey(full_name, email)")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as FamilyInvite[];
}

export async function getInviteDetails(token: string): Promise<InviteDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_family_invite", { p_token: token });
  if (error) return null;
  const rows = (data ?? []) as InviteDetails[];
  return rows[0] ?? null;
}