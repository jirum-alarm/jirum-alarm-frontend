// Re-export codegen types for backward compatibility
import { OrderOptionType, ProductMappingVerificationStatus } from '@/generated/gql/graphql';

export { OrderOptionType, ProductMappingVerificationStatus };
export { OrderOptionType as OrderBy, ProductMappingVerificationStatus as VerificationStatus };

// VerificationResult is a subset of ProductMappingVerificationStatus (only VERIFIED and REJECTED)
export enum VerificationResult {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

// Type aliases for backward compatibility
export type PendingVerification = {
  id: string;
  productId: number;
  brandProduct?: string | null;
  product?: { title: string; thumbnail?: string | null } | null;
  danawaUrl?: string | null;
  verificationStatus?: ProductMappingVerificationStatus | null;
  verifiedBy?: { id: string; name: string; email: string } | null;
  verifiedAt?: string | null;
  verificationNote?: string | null;
  createdAt: string;
  searchAfter?: string[] | null;
};

export type VerificationHistoryItem = PendingVerification;

export type VerificationStatistics = {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
};
