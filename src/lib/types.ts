export type Family = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

export type Membership = {
  family: Family;
  role: "owner" | "parent";
};

export type Child = {
  id: string;
  family_id: string;
  name: string;
  avatar: string;
  color: string;
  created_at: string;
};

export type ChildWithBalance = Child & {
  balance: number;
};

export type Task = {
  id: string;
  child_id: string;
  title: string;
  description: string | null;
  points: number;
  icon: string;
  active: boolean;
  created_at: string;
};

export type Reward = {
  id: string;
  child_id: string;
  title: string;
  description: string | null;
  cost: number;
  icon: string;
  active: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  task_id: string | null;
  child_id: string;
  completed_by: string | null;
  title: string;
  icon: string;
  points: number;
  completed_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export type RewardRedemption = {
  id: string;
  reward_id: string | null;
  child_id: string;
  redeemed_by: string | null;
  title: string;
  icon: string;
  cost: number;
  redeemed_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export type FamilyMember = {
  user_id: string;
  role: "owner" | "parent";
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export type FamilyInvite = {
  id: string;
  family_id: string;
  email: string;
  token: string;
  invited_by: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export type InviteDetails = {
  family_id: string;
  family_name: string;
  invited_email: string;
  inviter_email: string;
  expires_at: string;
  accepted_at: string | null;
};

export type HistoryItem =
  | { kind: "task"; data: TaskCompletion }
  | { kind: "reward"; data: RewardRedemption };

export type FormState = { error?: string; success?: string } | null;