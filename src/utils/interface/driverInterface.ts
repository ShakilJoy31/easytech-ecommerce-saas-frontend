export interface Driver {
    id: number;
    
    // Personal Information
    driverName: string;
    driverPhoto?: string;
    driverNidOrPassportNo?: string;
    driverNidFrontSide?: string;
    driverNidBackSide?: string;
    drivingLicenseNo: string;
    drivingLicenseFrontSide?: string;
    drivingLicenseBackSide?: string;
    
    // Contact Information
    phoneNo: string;
    alternatePhoneNo?: string;
    email?: string;
    
    // Address
    presentAddress: string;
    permanentAddress?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    
    // Vehicle Information
    vehicleType: string;
    vehicleModel?: string;
    vehicleRegNo: string;
    vehicleRegCertificate?: string;
    vehicleCapacity?: string;
    vehiclePhoto?: string;
    
    // Employment Details
    employmentType?: string;
    joiningDate?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    
    // Payment Information
    salaryType?: string;
    salaryAmount?: number;
    perTripRate?: number;
    commissionPercentage?: number;
    bankName?: string;
    bankAccountNo?: string;
    bankBranch?: string;
    bankAccountHolderName?: string;
    
    // Emergency Contact
    emergencyContactName?: string;
    emergencyContactRelation?: string;
    emergencyContactPhone?: string;
    
    // System Fields
    status: string;
    rating: number;
    notes?: string;
    
    // Statistics
    totalTrips?: number;
    totalEarnings?: number;
    lastTripDate?: string;
    
    // Documents
    documents?: Record<string, any>;
    
    // Metadata
    createdBy?: number;
    updatedBy?: number;
    createdAt: string;
    updatedAt: string;
    
    // Formatted fields (from transform function)
    registeredDate?: string;
    joiningDateFormatted?: string;
    contractStartDateFormatted?: string;
    contractEndDateFormatted?: string;
    lastTripDateFormatted?: string;
    salaryAmountFormatted?: string;
    perTripRateFormatted?: string;
    commissionPercentageFormatted?: string;
    totalEarningsFormatted?: string;
    displayName?: string;
    ratingStars?: string;
    paymentDisplay?: string;
}