// ============================================================================
// SultiAI Server-Side Supabase Integration
// Shared by BOTH backends:
//   - server.ts       (Learner backend)  -> writes learner activity + audit logs
//   - admin-server.ts (Admin backend)    -> reads/writes the admin console data
//
// Supabase is the SINGLE SOURCE OF TRUTH connecting the two backends, which
// never call each other directly.
// ============================================================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Prefer the service_role key on the server: it bypasses RLS and can read the
// whole learner roster. Fall back to the anon key so local demos still work.
const serverKey = serviceRoleKey || anonKey;

export const isSupabaseServerConfigured = Boolean(supabaseUrl && serverKey);
export const usingServiceRole = Boolean(serviceRoleKey);

export const supabaseServer: SupabaseClient | null = isSupabaseServerConfigured
  ? createClient(supabaseUrl, serverKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export interface AuditLogInput {
  userId?: string;
  eventType: string;
  category: 'AI_INFERENCE' | 'SPEECH_WER' | 'LEARNING_ACTIVITY' | 'SECURITY_RLS' | 'SYSTEM_CONFIG';
  actor?: string;
  actorRole?: string;
  description: string;
  severity?: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  latencyMs?: number;
  metadata?: Record<string, any>;
}

/**
 * Persist an audit/telemetry event to Supabase. Fire-and-forget friendly:
 * returns the inserted row on success, or null when Supabase is not configured
 * or the insert fails (never throws).
 */
export async function writeAuditLog(entry: AuditLogInput): Promise<Record<string, any> | null> {
  if (!supabaseServer) return null;
  try {
    const { data, error } = await supabaseServer
      .from('audit_logs')
      .insert([
        {
          user_id: entry.userId || null,
          event_type: entry.eventType,
          category: entry.category,
          actor: entry.actor || 'system',
          actor_role: entry.actorRole || 'System',
          description: entry.description,
          severity: entry.severity || 'INFO',
          latency_ms: entry.latencyMs ?? null,
          metadata: entry.metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] writeAuditLog error:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('[Supabase] writeAuditLog exception:', err?.message);
    return null;
  }
}

export interface LearnerAccountUpsert {
  id: string;
  name: string;
  email?: string;
  role?: string;
  targetDialect?: string;
  xp?: number;
  streakDays?: number;
  hearts?: number;
  todayMinutes?: number;
  dailyGoalMinutes?: number;
  speechScoreAverage?: number;
  vocabularyMastered?: number;
  status?: string;
  lastActive?: string;
}

/**
 * Upsert a learner's live account/progress row so the Admin Console reflects
 * real activity. Called by the Learner backend on every progress trigger.
 */
export async function upsertLearnerAccount(account: LearnerAccountUpsert): Promise<boolean> {
  if (!supabaseServer) return false;
  try {
    const { error } = await supabaseServer.from('learner_accounts').upsert(
      [
        {
          id: account.id,
          name: account.name,
          email: account.email ?? null,
          role: account.role ?? 'Learner',
          target_dialect: account.targetDialect ?? 'davao_bisaya',
          xp: account.xp ?? 0,
          streak_days: account.streakDays ?? 0,
          hearts: account.hearts ?? 5,
          today_minutes: account.todayMinutes ?? 0,
          daily_goal_minutes: account.dailyGoalMinutes ?? 15,
          speech_score_average: account.speechScoreAverage ?? 0,
          vocabulary_mastered: account.vocabularyMastered ?? 0,
          status: account.status ?? 'ACTIVE',
          last_active: account.lastActive ?? 'Just now',
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[Supabase] upsertLearnerAccount error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase] upsertLearnerAccount exception:', err?.message);
    return false;
  }
}
