export interface Retailer {
    id: number;
    
    // Shop/Business Information
    shopName: string;
    businessType: string;
    tradeLicenseNo?: string;
    binNo?: string;
    tinNo?: string;
    
    // Owner Information
    ownerName: string;
    monthlyTarget?: number;
    ownerPhoto?: string;
    ownerNidOrPassportNo?: string;
    ownerNidFrontSide?: string;
    ownerNidBackSide?: string;
    
    // Contact Information
    phoneNo: string;
    alternatePhoneNo?: string;
    email: string;
    
    // Address
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    
    // Business Details
    yearOfEstablishment?: number;
    creditLimit: number;
    paymentTerms: string;
    
    // Bank Details
    bankName?: string;
    bankAccountNo?: string;
    bankBranch?: string;
    bankAccountHolderName?: string;
    
    // System Fields
    status: 'active' | 'inactive' | 'blacklisted';
    rating: number;
    notes?: string;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    
    // Purchase Info
    totalPurchases?: number;
    totalPurchaseAmount?: number;
    lastPurchaseDate?: string;
    lastPurchaseDateFormatted?: string;
    joinedDate?: string;
}

export interface RetailerResponse {
    success: boolean;
    message?: string;
    data: Retailer[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export interface SingleRetailerResponse {
    success: boolean;
    message?: string;
    data: Retailer;
}

export interface RetailerStatsResponse {
    success: boolean;
    message?: string;
    data: {
        total: number;
        active: number;
        inactive: number;
        blacklisted: number;
        averageRating: string;
        totalPurchaseAmount: string;
        byCity: Array<{ city: string; count: number }>;
        byBusinessType: Array<{ businessType: string; count: number }>;
    };
}

export interface SearchRetailerResponse {
    success: boolean;
    message?: string;
    data: Array<{
        id: number;
        shopName: string;
        ownerName: string;
        phoneNo: string;
        city: string;
    }>;
}