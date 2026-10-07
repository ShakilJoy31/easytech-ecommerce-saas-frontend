"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Calendar,
  Users as UsersIcon,
  Briefcase,
  Landmark,
  CreditCard,
  Save,
  RefreshCw,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  ChevronRight,
  FileText,
  Hash,
  Award,
  CalendarDays,
  Users2,
  Landmark as BankIcon,
  BookOpen,
  MapPinned,
  Building,
  Globe2,
  MailCheck,
  PhoneCall,
  UserCircle,
  Store,
  FileSignature,
  IdCard,
  Newspaper,
  BriefcaseBusiness,
  CalendarClock,
  UsersRound,
  PiggyBank,
  Receipt,
  ScrollText,
  Building2 as BuildingIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  useGetEnterpriseByIdQuery,
  useUpdateEnterpriseMutation,
  useChangeEnterprisePasswordMutation
} from "@/redux/api/authentication/authApi";
import { getUserInfo } from "@/utils/helper/userFromToken";
import { useAddThumbnailMutation } from "@/redux/features/file/fileApi";

// Profile update schema
const profileSchema = z.object({
  // Company Information
  companyName: z.string().min(1, "Company name is required"),
  tradeLicenseNo: z.string().optional(),
  binNo: z.string().optional(),
  tinNo: z.string().optional(),
  
  // Owner Information
  ownerName: z.string().min(1, "Owner name is required"),
  ownerPhoto: z.string().optional(),
  ownerNidOrPassportNo: z.string().optional(),
  ownerNidFrontSide: z.string().optional(),
  ownerNidBackSide: z.string().optional(),
  
  // Contact Information
  phoneNo: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  website: z.string().optional(),
  
  // Address
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  
  // Business Details
  businessType: z.string().optional(),
  yearOfEstablishment: z.number().optional().nullable(),
  numberOfEmployees: z.number().optional().nullable(),
  
  // Bank Details
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankBranch: z.string().optional(),
  
  // Notes
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(1, "New password is required"),
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UploadedFiles {
  ownerPhoto?: string;
  nidFront?: string;
  nidBack?: string;
}

// Helper function to check if URL is valid
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function ProfileUpdate() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});
  const [isUploading, setIsUploading] = useState({
    ownerPhoto: false,
    nidFront: false,
    nidBack: false,
  });
  
  // Get user info from token
  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await getUserInfo();
      if (!userInfo) {
        router.push("/");
      } else {
        setUser(userInfo);
      }
    };
    fetchUser();
  }, [router]);

  // Fetch enterprise data
  const { data: enterpriseData, isLoading, refetch } = useGetEnterpriseByIdQuery(userId, {
    skip: !userId,
  });

  // Update enterprise mutation
  const [updateEnterprise, { isLoading: isUpdating }] = useUpdateEnterpriseMutation();
  
  // Change password mutation
  const [changePassword, { isLoading: isPasswordChanging }] = useChangeEnterprisePasswordMutation();
  
  // File upload mutation
  const [addThumbnail] = useAddThumbnailMutation();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: "",
      tradeLicenseNo: "",
      binNo: "",
      tinNo: "",
      ownerName: "",
      ownerPhoto: "",
      ownerNidOrPassportNo: "",
      ownerNidFrontSide: "",
      ownerNidBackSide: "",
      phoneNo: "",
      email: "",
      website: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Bangladesh",
      businessType: "",
      yearOfEstablishment: null,
      numberOfEmployees: null,
      bankName: "",
      bankAccountNo: "",
      bankBranch: "",
      notes: "",
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }
  });

  const newPassword = passwordForm.watch("newPassword");
  const confirmNewPassword = passwordForm.watch("confirmNewPassword");

  // Set form values when data is loaded
  useEffect(() => {
    if (enterpriseData?.data) {
      const data = enterpriseData.data;
      profileForm.reset({
        companyName: data.companyName || "",
        tradeLicenseNo: data.tradeLicenseNo || "",
        binNo: data.binNo || "",
        tinNo: data.tinNo || "",
        ownerName: data.ownerName || "",
        ownerPhoto: data.ownerPhoto || "",
        ownerNidOrPassportNo: data.ownerNidOrPassportNo || "",
        ownerNidFrontSide: data.ownerNidFrontSide || "",
        ownerNidBackSide: data.ownerNidBackSide || "",
        phoneNo: data.phoneNo || "",
        email: data.email || "",
        website: data.website || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "Bangladesh",
        businessType: data.businessType || "",
        yearOfEstablishment: data.yearOfEstablishment || null,
        numberOfEmployees: data.numberOfEmployees || null,
        bankName: data.bankName || "",
        bankAccountNo: data.bankAccountNo || "",
        bankBranch: data.bankBranch || "",
        notes: data.notes || "",
      });
      
      // Set uploaded files only if URLs are valid
      const validOwnerPhoto = isValidUrl(data.ownerPhoto) ? data.ownerPhoto : "";
      const validNidFront = isValidUrl(data.ownerNidFrontSide) ? data.ownerNidFrontSide : "";
      const validNidBack = isValidUrl(data.ownerNidBackSide) ? data.ownerNidBackSide : "";
      
      setUploadedFiles({
        ownerPhoto: validOwnerPhoto,
        nidFront: validNidFront,
        nidBack: validNidBack,
      });
    }
  }, [enterpriseData, profileForm]);

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'ownerPhoto' | 'nidFront' | 'nidBack') => {
    try {
      setIsUploading(prev => ({ ...prev, [type]: true }));

      const formData = new FormData();
      formData.append('image', file);

      const response = await addThumbnail(formData).unwrap();

      if (response.success && response.data && response.data[0]) {
        const fileUrl = response.data[0];

        setUploadedFiles(prev => ({ ...prev, [type]: fileUrl }));

        if (type === 'ownerPhoto') {
          profileForm.setValue('ownerPhoto', fileUrl);
        } else if (type === 'nidFront') {
          profileForm.setValue('ownerNidFrontSide', fileUrl);
        } else if (type === 'nidBack') {
          profileForm.setValue('ownerNidBackSide', fileUrl);
        }

        toast.success(`${type === 'ownerPhoto' ? 'Photo' : 'Document'} uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'ownerPhoto' | 'nidFront' | 'nidBack') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      handleFileUpload(file, type);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent, type: 'ownerPhoto' | 'nidFront' | 'nidBack') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      handleFileUpload(file, type);
    }
  };

  // Remove file
  const removeFile = (type: 'ownerPhoto' | 'nidFront' | 'nidBack') => {
    setUploadedFiles(prev => ({ ...prev, [type]: undefined }));
    if (type === 'ownerPhoto') {
      profileForm.setValue('ownerPhoto', '');
    } else if (type === 'nidFront') {
      profileForm.setValue('ownerNidFrontSide', '');
    } else if (type === 'nidBack') {
      profileForm.setValue('ownerNidBackSide', '');
    }
  };

  // File Upload Area Component
  const FileUploadArea = ({ 
    type, 
    label, 
    accept = "image/*",
    maxSize = "5MB"
  }: { 
    type: 'ownerPhoto' | 'nidFront' | 'nidBack', 
    label: string,
    accept?: string,
    maxSize?: string
  }) => {
    const getFieldValue = () => {
      if (type === 'ownerPhoto') return uploadedFiles.ownerPhoto;
      if (type === 'nidFront') return uploadedFiles.nidFront;
      return uploadedFiles.nidBack;
    };

    const fileUrl = getFieldValue();
    const isValidFileUrl = isValidUrl(fileUrl);

    return (
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, type)}
          className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
            fileUrl && isValidFileUrl
              ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/10"
              : "border-gray-300 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500"
          }`}
        >
          {fileUrl && isValidFileUrl ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={fileUrl}
                    alt={label}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Uploaded successfully
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(type)}
                className="p-1 cursor-pointer hover:bg-red-100 rounded-full transition-colors"
              >
                <XCircle className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Camera className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop or{' '}
                <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={(e) => handleFileSelect(e, type)}
                    disabled={isUploading[type]}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Support: JPG, PNG, GIF (Max {maxSize})
              </p>
            </div>
          )}
          {isUploading[type] && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!userId) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateEnterprise({
        id: parseInt(userId),
        ...data,
        yearOfEstablishment: data.yearOfEstablishment || null,
        numberOfEmployees: data.numberOfEmployees || null,
      }).unwrap();

      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Profile updated successfully!</span>
          </div>,
          { duration: 3000 }
        );
        refetch();
      }
    } catch (error: any) {
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>{error?.data?.message || "Failed to update profile"}</span>
        </div>,
        { duration: 4000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!userId) return;
    
    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        id: userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }).unwrap();

      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Password changed successfully!</span>
          </div>,
          { duration: 3000 }
        );
        passwordForm.reset();
      }
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Current password is incorrect", { duration: 4000 });
      } else {
        toast.error(error?.data?.message || "Failed to change password", { duration: 4000 });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your profile information and security settings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative",
              activeTab === "profile"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>Profile Information</span>
            </div>
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("password")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative",
              activeTab === "password"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <div className="flex items-center gap-2">
              <Lock size={18} />
              <span>Change Password</span>
            </div>
            {activeTab === "password" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "profile" && (
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
            {/* Company Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BuildingIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Company Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your business details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Store size={16} className="text-blue-500" />
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.companyName && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter company name"
                      {...profileForm.register("companyName")}
                    />
                    {profileForm.formState.errors.companyName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Trade License No */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FileSignature size={16} className="text-purple-500" />
                      Trade License No
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter trade license number"
                      {...profileForm.register("tradeLicenseNo")}
                    />
                  </div>

                  {/* BIN No */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Hash size={16} className="text-green-500" />
                      BIN No
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter BIN number"
                      {...profileForm.register("binNo")}
                    />
                  </div>

                  {/* TIN No */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Award size={16} className="text-yellow-500" />
                      TIN No
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter TIN number"
                      {...profileForm.register("tinNo")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <UserCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Owner Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update owner/contact person details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <User size={16} className="text-purple-500" />
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.ownerName && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter owner name"
                      {...profileForm.register("ownerName")}
                    />
                    {profileForm.formState.errors.ownerName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.ownerName.message}
                      </p>
                    )}
                  </div>

                  {/* NID/Passport No */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <IdCard size={16} className="text-indigo-500" />
                      NID/Passport No
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter NID or passport number"
                      {...profileForm.register("ownerNidOrPassportNo")}
                    />
                  </div>
                </div>

                {/* Owner Photo Upload */}
                <div className="mt-6">
                  <FileUploadArea type="ownerPhoto" label="Owner Photo" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* NID Front Side Upload */}
                  <FileUploadArea type="nidFront" label="NID Front Side" />

                  {/* NID Back Side Upload */}
                  <FileUploadArea type="nidBack" label="NID Back Side" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <MailCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your contact details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <PhoneCall size={16} className="text-green-500" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.phoneNo && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter phone number"
                      {...profileForm.register("phoneNo")}
                    />
                    {profileForm.formState.errors.phoneNo && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.phoneNo.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Mail size={16} className="text-blue-500" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.email && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter email address"
                      {...profileForm.register("email")}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Globe2 size={16} className="text-cyan-500" />
                      Website
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter website URL"
                      {...profileForm.register("website")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <MapPinned className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Address Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your business address</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin size={16} className="text-yellow-500" />
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.address && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter full address"
                      {...profileForm.register("address")}
                    />
                    {profileForm.formState.errors.address && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Building size={16} className="text-orange-500" />
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.city && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter city"
                      {...profileForm.register("city")}
                    />
                    {profileForm.formState.errors.city && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MapPin size={16} className="text-red-500" />
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.state && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter state"
                      {...profileForm.register("state")}
                    />
                    {profileForm.formState.errors.state && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.state.message}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Hash size={16} className="text-gray-500" />
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter postal code"
                      {...profileForm.register("postalCode")}
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Globe size={16} className="text-emerald-500" />
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        profileForm.formState.errors.country && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter country"
                      {...profileForm.register("country")}
                    />
                    {profileForm.formState.errors.country && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {profileForm.formState.errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <BriefcaseBusiness className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Additional business information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Business Type */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Store size={16} className="text-indigo-500" />
                      Business Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., Retail, Wholesale"
                      {...profileForm.register("businessType")}
                    />
                  </div>

                  {/* Year of Establishment */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <CalendarClock size={16} className="text-amber-500" />
                      Year of Establishment
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., 2020"
                      {...profileForm.register("yearOfEstablishment", { valueAsNumber: true })}
                    />
                  </div>

                  {/* Number of Employees */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <UsersRound size={16} className="text-teal-500" />
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., 50"
                      {...profileForm.register("numberOfEmployees", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                    <BankIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bank Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your banking information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bank Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Building2 size={16} className="text-pink-500" />
                      Bank Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter bank name"
                      {...profileForm.register("bankName")}
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <CreditCard size={16} className="text-rose-500" />
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter account number"
                      {...profileForm.register("bankAccountNo")}
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Building size={16} className="text-fuchsia-500" />
                      Branch
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter branch name"
                      {...profileForm.register("bankBranch")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <ScrollText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Notes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Any additional information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <textarea
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter any additional notes..."
                  {...profileForm.register("notes")}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className={cn(
                  "px-8 py-3 rounded-xl cursor-pointer font-medium flex items-center gap-2",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "hover:from-blue-700 hover:to-purple-700",
                  "text-white shadow-lg shadow-blue-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200"
                )}
              >
                {isSubmitting || isUpdating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Lock size={16} className="text-red-500" />
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border pr-12",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        passwordForm.formState.errors.currentPassword && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter current password"
                      {...passwordForm.register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Shield size={16} className="text-orange-500" />
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border pr-12",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        passwordForm.formState.errors.newPassword && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Enter new password"
                      {...passwordForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <CheckCircle size={16} className="text-green-500" />
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border pr-12",
                        "bg-gray-50 dark:bg-gray-800",
                        "border-gray-300 dark:border-gray-700",
                        "text-gray-900 dark:text-gray-100",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
                        "transition-all duration-200",
                        passwordForm.formState.errors.confirmNewPassword && "border-red-500 focus:ring-red-500/50"
                      )}
                      placeholder="Confirm new password"
                      {...passwordForm.register("confirmNewPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} className="text-gray-500" /> : <Eye size={18} className="text-gray-500" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={14} />
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Match Indicator */}
                {newPassword && confirmNewPassword && (
                  <div className={cn(
                    "p-3 rounded-lg flex items-center gap-2",
                    newPassword === confirmNewPassword
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  )}>
                    {newPassword === confirmNewPassword ? (
                      <>
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <span className="text-sm font-medium">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword || isPasswordChanging || !passwordForm.formState.isDirty}
                className={cn(
                  "px-8 py-3 rounded-xl font-medium flex items-center gap-2",
                  "bg-gradient-to-r from-red-600 to-pink-600",
                  "hover:from-red-700 hover:to-pink-700",
                  "text-white shadow-lg shadow-red-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200"
                )}
              >
                {isChangingPassword || isPasswordChanging ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}