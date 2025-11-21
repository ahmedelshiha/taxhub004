'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  BarChart3,
  AlertTriangle,
  Loader,
  Eye,
  Trash2,
  Shield,
  Filter,
} from 'lucide-react'
import { DocumentCard } from '@/components/shared'
import { formatFileSize, formatDate, formatRelativeTime } from '@/lib/shared/formatters'
import { toast } from 'sonner'

interface DocumentStats {
  totalDocuments: number
  byStatus: Record<string, number>
  byContentType: Record<string, number>
  infectedDocuments: number
  pendingScans: number
  totalSize: number
  metrics: {
    totalDocuments: number
    infectionRate: string
    avgUploadSize: number
    healthStatus: 'healthy' | 'warning'
  }
}

interface AdminDocument {
  id: string
  name: string
  size: number
  contentType: string
  url: string
  uploadedAt: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
  status: string
  avThreatName?: string
  isQuarantined: boolean
  key: string
  provider: string
  recentActivity: Array<{
    action: string
    timestamp: string
  }>
}

interface DocumentsState {
  documents: AdminDocument[]
  stats: DocumentStats | null
  total: number
  isLoading: boolean
  isLoadingStats: boolean
  error: string | null
}

/**
 * Admin Documents Management Page
 *
 * Allows admin to:
 * - View all documents across organization
 * - Filter by status, uploader, date range
 * - View document statistics and metrics
 * - Approve/reject documents
 * - Trigger antivirus scans
 * - Force delete documents
 * - Monitor infection rates
 *
 * @route /admin/documents
 */
export default function AdminDocumentsPage() {
  const [state, setState] = useState<DocumentsState>({
    documents: [],
    stats: null,
    total: 0,
    isLoading: true,
    isLoadingStats: true,
    error: null,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'name' | 'size'>('uploadedAt')
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Fetch statistics
  const fetchStats = async () => {
    setState((prev) => ({ ...prev, isLoadingStats: true }))

    try {
      const response = await fetch('/api/admin/documents/stats')

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setState((prev) => ({
        ...prev,
        stats: data.data,
        isLoadingStats: false,
      }))
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setState((prev) => ({ ...prev, isLoadingStats: false }))
    }
  }

  // Fetch documents
  const fetchDocuments = async (search?: string, status?: string, pageOffset?: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams()
      params.append('limit', String(limit))
      params.append('offset', String(pageOffset || 0))
      params.append('sortBy', sortBy)
      params.append('sortOrder', 'desc')

      if (search) {
        params.append('search', search)
      }
      if (status) {
        params.append('status', status)
      }

      const response = await fetch(`/api/admin/documents?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()

      setState((prev) => ({
        ...prev,
        documents: data.data || [],
        total: data.meta?.total || 0,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch documents'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      toast.error(message)
    }
  }

  // Initial load
  useEffect(() => {
    fetchStats()
    fetchDocuments(searchQuery, statusFilter, 0)
  }, [statusFilter, sortBy])

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setOffset(0)
    setTimeout(() => {
      fetchDocuments(value, statusFilter, 0)
    }, 300)
  }

  // Handle delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('This action is permanent and cannot be undone. Continue?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      toast.success('Document permanently deleted')
      fetchDocuments(searchQuery, statusFilter, offset)
      fetchStats()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document'
      toast.error(message)
    }
  }

  // Handle scan document
  const handleScanDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to trigger scan')
      }

      toast.success('Scan initiated')
      fetchDocuments(searchQuery, statusFilter, offset)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to trigger scan'
      toast.error(message)
    }
  }

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'clean':
        return 'bg-green-100 text-green-800'
      case 'infected':
        return 'bg-red-100 text-red-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Documents Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage all documents across the organization</p>
      </div>

      {/* Statistics */}
      {!state.isLoadingStats && state.stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{state.stats.metrics.totalDocuments}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(state.stats.totalSize)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Infection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${state.stats.infectedDocuments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {state.stats.metrics.infectionRate}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {state.stats.infectedDocuments} infected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${state.stats.pendingScans > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                {state.stats.pendingScans}
              </p>
              <p className="text-xs text-gray-500 mt-1">awaiting analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  state.stats.metrics.healthStatus === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {state.stats.metrics.healthStatus === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending Scan</option>
            <option value="clean">Clean</option>
            <option value="infected">Infected</option>
            <option value="approved">Approved</option>
          </select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Infected Warning */}
      {state.stats && state.stats.infectedDocuments > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {state.stats.infectedDocuments} document(s) are quarantined due to security concerns.
            Review and remove them immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {state.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Documents Table */}
      {!state.isLoading && state.documents.length > 0 && (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Uploader</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Uploaded</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.contentType}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium">{doc.uploadedBy.name}</p>
                        <p className="text-xs text-gray-500">{doc.uploadedBy.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        {doc.isQuarantined && (
                          <span className="text-xs font-semibold text-red-600" title={doc.avThreatName}>
                            {doc.avThreatName?.substring(0, 15)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>{formatRelativeTime(new Date(doc.uploadedAt))}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(new Date(doc.uploadedAt), 'short')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScanDocument(doc.id)}
                            title="Re-scan"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/admin/documents/${doc.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {state.total > limit && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {offset + 1} to {Math.min(offset + limit, state.total)} of {state.total} documents
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={offset === 0}
                  onClick={() => {
                    setOffset(Math.max(0, offset - limit))
                    fetchDocuments(searchQuery, statusFilter, Math.max(0, offset - limit))
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={offset + limit >= state.total}
                  onClick={() => {
                    setOffset(offset + limit)
                    fetchDocuments(searchQuery, statusFilter, offset + limit)
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!state.isLoading && state.documents.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1">No documents found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No documents match your search' : 'No documents in this category'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
