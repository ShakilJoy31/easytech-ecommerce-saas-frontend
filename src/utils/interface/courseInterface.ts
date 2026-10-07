// utils/interface/courseInterface.ts
export interface Course {
  id: number;
  courseId?: string;
  courseName?: string;
  description?: string;
  duration?: number;
  durationUnit?: 'days' | 'weeks' | 'months' | 'years';
  totalFee?: number;
  status: 'active' | 'inactive';
  thumbnail?: string;
  syllabus?: string;
  prerequisites?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  classSchedule?: string;
  materials?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface SingleCourseResponse {
  success: boolean;
  message: string;
  data: Course;
}

export interface CourseStatsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    active: number;
    inactive: number;
    byCategory: Array<{ category: string; count: number }>;
    byLevel: Array<{ level: string; count: number }>;
  };
}