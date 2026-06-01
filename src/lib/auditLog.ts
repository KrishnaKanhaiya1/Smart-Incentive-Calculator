/**
 * Audit logging for tracking admin actions
 * Provides compliance and security tracking
 */

import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "CREATE_CAR"
  | "UPDATE_CAR"
  | "DELETE_CAR"
  | "CREATE_SLAB"
  | "UPDATE_SLAB"
  | "DELETE_SLAB"
  | "PUBLISH_SLABS"
  | "LOGIN"
  | "LOGOUT"
  | "ACCESS_DENIED";

export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  status: "SUCCESS" | "FAILURE" = "SUCCESS"
) {
  try {
    // Store in database for persistence
    await prisma.slabHistoryLog.create({
      data: {
        snapshot: {
          action,
          userId,
          resourceType,
          resourceId,
          details,
          status,
          timestamp: new Date().toISOString(),
        } as unknown as any,
        changedBy: userId,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[AUDIT] ${action} by ${userId} on ${resourceType}:${resourceId} - ${status}`);
    }
  } catch (error) {
    console.error("[AUDIT LOG ERROR]", error);
    // Don't throw - audit log failure shouldn't break the app
  }
}
