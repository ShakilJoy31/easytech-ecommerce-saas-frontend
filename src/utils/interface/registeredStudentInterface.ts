export interface RegisteredStudent {
    id: number;
    registrationId: string;
    fullName: string;
    email: string;
    phoneNo: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    emailVerified: boolean;
    phoneVerified: boolean;
    registeredAt: string;
    approvedAt: string | null;
    approvedBy: number | null;
    rejectionReason: string | null;
    metadata: {
        registrationSource?: string;
        deviceType?: string;
        browserInfo?: string;
        registeredAt?: string;
    } | null;
    studentProfileId?: number | null;
    createdAt: string;
    updatedAt: string;
}