"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Search,
  Trash2,
  Mail,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Eye,
  MessageSquare,
  Reply,
  X,
  Filter,
} from "lucide-react";
import {
  useGetAllPublicSmsQuery,
  useDeletePublicSmsMutation,
  useGetPublicSmsStatsQuery,
  useUpdatePublicSmsMutation,
  PublicSms,
} from "@/redux/api/communication/publicSmsApi";

export default function PublicSmsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterRead, setFilterRead] = useState("all");
  const [filterReplied, setFilterReplied] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSms, setSelectedSms] = useState<PublicSms | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Queries
  const { data, isLoading, refetch } = useGetAllPublicSmsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    isRead: filterRead,
    isReplied: filterReplied,
  });

  const { data: statsData, isLoading: isLoadingStats } = useGetPublicSmsStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [deleteSms, { isLoading: isDeleting }] = useDeletePublicSmsMutation();
  const [updateSms, { isLoading: isUpdating }] = useUpdatePublicSmsMutation();

  const smsList = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, currentPage, filterRead, filterReplied, refetch]);

  const handleDelete = (sms: PublicSms) => {
    setSelectedSms(sms);
    setDeleteModalOpen(true);
  };

  const handleView = (sms: PublicSms) => {
    setSelectedSms(sms);
    setViewModalOpen(true);
    // Mark as read when viewed
    if (!sms.isRead) {
      updateSms({ id: sms.id, isRead: true }).unwrap().then(() => {
        refetch();
      }).catch(() => {});
    }
  };

  const handleReply = (sms: PublicSms) => {
    setSelectedSms(sms);
    setReplyMessage(sms.replyMessage || "");
    setReplyModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSms) return;

    try {
      await deleteSms(selectedSms.id).unwrap();
      toast.success("Message deleted successfully!");
      setDeleteModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete message");
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedSms) return;
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsReplying(true);
    try {
      await updateSms({
        id: selectedSms.id,
        isReplied: true,
        replyMessage: replyMessage.trim(),
      }).unwrap();
      
      toast.success("Reply sent successfully!");
      setReplyModalOpen(false);
      setReplyMessage("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (isRead: boolean, isReplied: boolean) => {
    if (isReplied) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5" />
          Replied
        </span>
      );
    }
    if (isRead) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Eye className="w-3.5 h-3.5" />
          Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Mail className="w-3.5 h-3.5" />
        Unread
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold pb-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Public Messages
            </h1>
            <p className="text-gray-600 mt-2">
              Manage messages from website visitors.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoadingStats && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.unread}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-100">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.replied}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <Reply className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.responseRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
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
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <select
            value={filterRead}
            onChange={(e) => {
              setFilterRead(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>

          <select
            value={filterReplied}
            onChange={(e) => {
              setFilterReplied(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Reply Status</option>
            <option value="false">Not Replied</option>
            <option value="true">Replied</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterRead("all");
              setFilterReplied("all");
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Show search results count */}
        {searchTerm && smsList.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Found {pagination?.totalItems || smsList.length} result(s) for &quot;{searchTerm}&quot;
          </div>
        )}
        {searchTerm && smsList.length === 0 && !isLoading && (
          <div className="mt-2 text-sm text-yellow-600">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">From</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Message</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Received</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {smsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">
                        {searchTerm ? `No messages found for "${searchTerm}"` : "No messages found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                smsList.map((sms: PublicSms, index: number) => (
                  <tr key={sms.id} className={`hover:bg-gray-50 transition-colors ${!sms.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{sms.name}</p>
                        <p className="text-sm text-gray-500">{sms.email}</p>
                        {sms.phone && (
                          <p className="text-xs text-gray-400">{sms.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {sms.subject || "No subject"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {sms.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sms.isRead, sms.isReplied)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(sms.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(sms)}
                          className="p-2 cursor-pointer rounded-lg hover:bg-blue-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        {!sms.isReplied && (
                          <button
                            onClick={() => handleReply(sms)}
                            className="p-2 cursor-pointer rounded-lg hover:bg-green-100 transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sms)}
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
              {Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} messages
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

      {/* View Modal */}
      {viewModalOpen && selectedSms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Message Details
              </h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium text-gray-900">{selectedSms.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedSms.email}</p>
                </div>
                {selectedSms.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedSms.phone}</p>
                  </div>
                )}
                {selectedSms.country && (
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium text-gray-900">{selectedSms.country}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium text-gray-900">{selectedSms.subject || "No subject"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Message</p>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSms.message}</p>
                </div>
              </div>

              {selectedSms.isReplied && selectedSms.replyMessage && (
                <div>
                  <p className="text-sm text-gray-500">Reply</p>
                  <div className="mt-1 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedSms.replyMessage}</p>
                    {selectedSms.repliedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Replied on {formatDate(selectedSms.repliedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {!selectedSms.isReplied && (
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleReply(selectedSms);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-colors"
                  >
                    <Reply className="w-4 h-4 inline mr-2" />
                    Reply
                  </button>
                )}
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && selectedSms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Reply className="w-5 h-5 text-green-600" />
                Reply to {selectedSms.name}
              </h3>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">Original Message:</p>
                <p className="text-gray-700 mt-1">{selectedSms.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  From: {selectedSms.name} ({selectedSms.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply Message *
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={5}
                  placeholder="Type your reply here..."
                  className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This reply will be marked as sent in the system.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setReplyModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isReplying && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Message
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the message from{" "}
                <span className="font-semibold text-gray-900">
                  {selectedSms.name}
                </span>
                ? This action cannot be undone.
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