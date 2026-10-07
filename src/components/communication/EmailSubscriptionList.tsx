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
  Calendar,
} from "lucide-react";
import {
  useGetAllSubscribedEmailsQuery,
  useDeleteEmailSubscriptionMutation,
  useGetSubscriptionStatsQuery,
  EmailSubscription,
} from "@/redux/api/communication/emailSubscriptionApi";

export default function EmailSubscriptionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("true");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<EmailSubscription | null>(null);

  // Queries
  const { data, isLoading, refetch } = useGetAllSubscribedEmailsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    isSubscribed: filterStatus,
  });

  const { data: statsData, isLoading: isLoadingStats } = useGetSubscriptionStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteEmailSubscriptionMutation();

  const subscriptions = data?.data || [];
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
  }, [debouncedSearchTerm, currentPage, filterStatus, refetch]);

  const handleDelete = (subscription: EmailSubscription) => {
    setSelectedSubscription(subscription);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription) return;

    try {
      await deleteSubscription(selectedSubscription.id).unwrap();
      toast.success("Email subscription deleted successfully!");
      setDeleteModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete email subscription");
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

  const getStatusBadge = (isSubscribed: boolean) => {
    if (isSubscribed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5" />
          Subscribed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3.5 h-3.5" />
        Unsubscribed
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading email subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Email Subscriptions
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your newsletter subscribers and email lists.
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
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscribers</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalSubscribed}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.totalUnsubscribed}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New (7 days)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.recentSubscriptions}</p>
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
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="true">Subscribed</option>
            <option value="false">Unsubscribed</option>
            <option value="all">All</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("true");
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Show search results count */}
        {searchTerm && subscriptions.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Found {pagination?.totalItems || subscriptions.length} result(s) for &quot;{searchTerm}&quot;
          </div>
        )}
        {searchTerm && subscriptions.length === 0 && !isLoading && (
          <div className="mt-2 text-sm text-yellow-600">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* Email Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subscribed On</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Unsubscribed On</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Mail className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">
                        {searchTerm ? `No subscriptions found for "${searchTerm}"` : "No email subscriptions found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription: EmailSubscription, index: number) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {subscription.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(subscription.isSubscribed)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(subscription.subscribedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {subscription.unsubscribedAt ? formatDate(subscription.unsubscribedAt) : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(subscription)}
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
              {Math.min(pagination.currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} subscriptions
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Email Subscription
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the subscription for{" "}
                <span className="font-semibold text-gray-900">
                  {selectedSubscription.email}
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