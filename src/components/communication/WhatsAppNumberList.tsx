"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Phone,
  Check,
  AlertCircle,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetAllWhatsAppNumbersQuery,
  useGetActiveWhatsAppNumberQuery,
  useCreateWhatsAppNumberMutation,
  useUpdateWhatsAppNumberMutation,
  useDeleteWhatsAppNumberMutation,
  useSetActiveWhatsAppNumberMutation,
  WhatsAppNumber,
} from "@/redux/api/communication/whatsappApi";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppNumberList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<WhatsAppNumber | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    whatsappNumber: "",
    message: "",
    isActive: false,
  });

  // Queries - passing search term to API
  const { data, isLoading, refetch } = useGetAllWhatsAppNumbersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
  });

  const { data: activeNumberData } = useGetActiveWhatsAppNumberQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [createNumber, { isLoading: isCreating }] = useCreateWhatsAppNumberMutation();
  const [updateNumber, { isLoading: isUpdating }] = useUpdateWhatsAppNumberMutation();
  const [deleteNumber, { isLoading: isDeleting }] = useDeleteWhatsAppNumberMutation();
  const [setActiveNumber, { isLoading: isActivating }] = useSetActiveWhatsAppNumberMutation();

  const numbers = data?.data || [];
  const pagination = data?.pagination;
  const activeNumber = activeNumberData?.data as WhatsAppNumber | undefined;

  // Debounced search to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch when debounced search term changes
  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, currentPage, refetch]);

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      whatsappNumber: "",
      message: "",
      isActive: false,
    });
    setFormModalOpen(true);
  };

  const handleEdit = (number: WhatsAppNumber) => {
    setIsEditing(true);
    setFormData({
      whatsappNumber: number.whatsappNumber,
      message: number.message || "",
      isActive: number.isActive,
    });
    setSelectedNumber(number);
    setFormModalOpen(true);
  };

  const handleDelete = (number: WhatsAppNumber) => {
    setSelectedNumber(number);
    setDeleteModalOpen(true);
  };

  const handleSetActive = async (id: number) => {
    try {
      await setActiveNumber(id).unwrap();
      toast.success("WhatsApp number set as active successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to set active number");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.whatsappNumber) {
        toast.error("WhatsApp number is required");
        return;
      }

      // Remove any non-numeric characters
      const cleanNumber = formData.whatsappNumber.replace(/\D/g, '');

      if (isEditing && selectedNumber) {
        await updateNumber({
          id: selectedNumber.id,
          whatsappNumber: cleanNumber,
          message: formData.message,
          isActive: formData.isActive,
        }).unwrap();
        toast.success("WhatsApp number updated successfully!");
      } else {
        await createNumber({
          whatsappNumber: cleanNumber,
          message: formData.message,
          isActive: formData.isActive,
        }).unwrap();
        toast.success("WhatsApp number created successfully!");
      }

      setFormModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save WhatsApp number");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNumber) return;

    try {
      await deleteNumber(selectedNumber.id).unwrap();
      toast.success("WhatsApp number deleted successfully!");
      setDeleteModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete WhatsApp number");
    }
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <XCircle className="w-3.5 h-3.5" />
        Inactive
      </span>
    );
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (!message) return "No message set";
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading WhatsApp numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              WhatsApp Numbers
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your organization&apos;s WhatsApp numbers. Only one number can be active at a time.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-5 cursor-pointer py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium flex items-center gap-2 shadow-lg shadow-green-500/25 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Number
          </button>
        </div>
      </div>

      {/* Active Number Card */}
      {activeNumber && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaWhatsapp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active WhatsApp Number</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPhoneNumber(activeNumber.whatsappNumber)}
                </p>
                {activeNumber.message && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {truncateMessage(activeNumber.message, 60)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="w-4 h-4" />
                Currently Active
              </span>
              <button
                onClick={() => handleEdit(activeNumber)}
                className="p-2 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4 text-green-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by WhatsApp number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
            />
          </div>
          
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
        
        {/* Show search results count */}
        {searchTerm && numbers.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Found {pagination?.totalItems || numbers.length} result(s) for &quot;{searchTerm}&quot;
          </div>
        )}
        {searchTerm && numbers.length === 0 && !isLoading && (
          <div className="mt-2 text-sm text-yellow-600">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* WhatsApp Numbers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">WhatsApp Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Message</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Added On</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {numbers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MessageCircle className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">
                        {searchTerm ? `No WhatsApp numbers found for "${searchTerm}"` : "No WhatsApp numbers found"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleAdd}
                          className="mt-2 text-green-600 hover:text-green-700 font-medium"
                        >
                          Add your first WhatsApp number
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                numbers.map((number: WhatsAppNumber, index: number) => (
                  <tr key={number.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatPhoneNumber(number.whatsappNumber)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate" title={number.message || "No message set"}>
                          {number.message ? truncateMessage(number.message, 40) : "No message set"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(number.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(number.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!number.isActive && (
                          <button
                            onClick={() => handleSetActive(number.id)}
                            disabled={isActivating}
                            className="p-2 cursor-pointer rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Set as Active"
                          >
                            {isActivating ? (
                              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                            ) : (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(number)}
                          className="p-2 cursor-pointer rounded-lg hover:bg-purple-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(number)}
                          disabled={isDeleting}
                          className="p-2 cursor-pointer rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} numbers
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {isEditing ? "Edit WhatsApp Number" : "Add WhatsApp Number"}
                </h3>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, whatsappNumber: value });
                    }}
                    placeholder="e.g., 1234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                    maxLength={15}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter numbers only (e.g., 1234567890)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter the default message to be sent when someone clicks on WhatsApp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 min-h-[100px] resize-y"
                    rows={4}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This message will be pre-filled when users click the WhatsApp button
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  Characters: {formData.message.length}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                  Set as active immediately
                </label>
              </div>

              {formData.isActive && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    This will deactivate all other WhatsApp numbers. Only one number can be active at a time.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFormModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(isCreating || isUpdating) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedNumber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete WhatsApp Number
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete WhatsApp number{" "}
                <span className="font-semibold text-gray-900">
                  {formatPhoneNumber(selectedNumber.whatsappNumber)}
                </span>
                ?{selectedNumber.isActive && " This is the active number and it will be deactivated."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



