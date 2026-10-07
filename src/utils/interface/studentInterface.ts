// utils/interface/studentInterface.ts
export interface EnrolledCourse {
  id: number;
  courseId: number;
  courseName: string;
  courseCode?: string;
  enrollmentDate: string;
  completionDate?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  progress: number;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  lastPaymentDate?: string;
  paymentHistory?: PaymentHistory[];
}


export interface PaymentHistory {
  id: number;
  amount: number;
  method: string;
  date: string;
  transactionId?: string;
  note?: string;
}



export interface Student {
  id: number;
  studentId: string;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  
  // Contact Information
  phoneNo: string;
  alternativePhoneNo?: string;
  email: string;
  
  // NID Information
  nidNo?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  
  // Profile Image
  profileImage?: string;
  
  // Address Information
  presentAddress: string;
  permanentAddress?: string;
  district: string;
  upazila?: string;
  postOffice?: string;
  postalCode?: string;
  
  // Educational Information
  educationLevel?: 'ssc' | 'hsc' | 'diploma' | 'bachelor' | 'masters' | 'other';
  institutionName?: string;
  passingYear?: number;
  
  // Professional Information
  occupation?: string;
  companyName?: string;
  designation?: string;
  
  // Course Related Information
  enrolledCourseId?: number;
  enrolledCourses?: EnrolledCourse[];
  enrolledCourseName?: string;
  enrollmentDate?: string;
  courseCompletionDate?: string;
  certificateIssued: boolean;
  certificateNumber?: string;
  certificateIssuedDate?: string;
  
  // Payment Information
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  lastPaymentDate?: string;
  
  // Class Attendance
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  
  // System Fields
  role: string;
  status: 'active' | 'inactive' | 'suspended' | 'completed';
  lastLoginAt?: string;
  registeredBy?: number;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Formatted fields
  displayName?: string;
  dateOfBirthFormatted?: string;
  enrollmentDateFormatted?: string;
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface SingleStudentResponse {
  success: boolean;
  message: string;
  data: Student;
}

export interface StudentStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    active: number;
    inactive: number;
    completed: number;
    certificateIssued: number;
    paymentStats: {
      paid: number;
      partial: number;
      pending: number;
    };
    financialStats: {
      totalRevenue: number;
      totalDue: number;
    };
    byDistrict: Array<{ district: string; count: number }>;
    byGender: Array<{ gender: string; count: number }>;
  };
}