import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullish(),
  role: z.string(),
  organizationId: z.string().nullish(),
  organizationName: z.string().nullish(),
  orgLogoUrl: z.string().nullish(),
  ownerId: z.string().nullish(),
  unitId: z.string().nullish(),
  unitRef: z.string().nullish(),
});

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
});

export const ClaimSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  unit: z.object({
    lotNumber: z.string().optional(),
    reference: z.string().optional(),
  }).nullable().optional(),
  owner: z.object({
    name: z.string(),
    firstName: z.string().optional(),
  }).nullable().optional(),
  comments: z.array(z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    user: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
    }).nullable().optional(),
  })).optional(),
});

export const DashboardSchema = z.union([
  z.object({
    year: z.union([z.string(), z.number()]).optional(),
    totalReceipts: z.number().optional(),
    totalPayments: z.number().optional(),
    totalContributions: z.number().optional(),
    pendingAmount: z.number().optional(),
    totalOwners: z.number().optional(),
    totalUnits: z.number().optional(),
    activeClaims: z.number().optional(),
  }),
  z.array(z.any()) // Handle empty []
]);

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type DashboardData = z.infer<typeof DashboardSchema>;
