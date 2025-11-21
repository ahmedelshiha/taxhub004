'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  Loader,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react'
import { DocumentCard } from '@/components/shared'
import { DocumentUploadForm } from '@/components/shared'
import { formatFileSize, formatDate, formatRelativeTime } from '@/lib/shared/formatters'
import { toast } from 'sonner'

interface Document {
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
  isStarred: boolean
  isQuarantined: boolean
}

interface DocumentsListState {
  documents: Document[]
  total: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
}

/**
 * Portal Documents Page
 *
 * Allows portal users to:
 * - View their uploaded documents
 * - Upload new documents
 * - Download documents
 * - Delete documents (soft delete)
 * - Star/favorite documents
 * - Search and filter documents
 *
 * @route /portal/documents
 */
export default function PortalDocumentsPage() {
  const [state, setState] = useState<DocumentsListState>({
    documents: [],
    total: 0,
    isLoading: true,
    error: null,
    hasMore: false,
  })

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'uploadedAt' | 'name' | 'size'>('uploadedAt')
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Fetch documents
  const fetchDocuments = async (
    search?: string,
    status?: string | null,
    pageOffset?: number
  ) => {
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

      const response = await fetch(`/api/documents?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()

      setState({
        documents: data.data || [],
        total: data.meta?.total || 0,
        isLoading: false,
        error: null,
        hasMore: data.meta?.hasMore || false,
      })
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

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      toast.success('Document deleted')
      fetchDocuments(searchQuery, statusFilter, offset)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document'
      toast.error(message)
    }
  }

  // Handle document download
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }
      // Response is redirected by API, should trigger browser download
      toast.success('Download started')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download document'
      toast.error(message)
    }
  }

  // Handle upload success
  const handleUploadSuccess = (document: any) => {
    setShowUploadForm(false)
    fetchDocuments(searchQuery, statusFilter, 0)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-gray-600 mt-1">Manage your uploaded documents and files</p>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Upload New Document</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadForm(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm
              onSuccess={handleUploadSuccess}
              variant="portal"
            />
          </CardContent>
        </Card>
      )}

      {/* Controls */}
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
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Scan</option>
            <option value="clean">Scanned - Clean</option>
            <option value="infected">Quarantined</option>
          </select>

          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            variant={showUploadForm ? 'default' : 'outline'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{state.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {state.documents.filter((d) => d.status === 'pending').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clean</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {state.documents.filter((d) => d.status === 'clean').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quarantined</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {state.documents.filter((d) => d.isQuarantined).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {state.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!state.isLoading && state.documents.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1">No documents</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No documents match your search' : 'Start by uploading your first document'}
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      {!state.isLoading && state.documents.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                data={{
                  id: doc.id,
                  filename: doc.name,
                  size: doc.size,
                  mimeType: doc.contentType,
                  status: (doc.status?.toUpperCase() || 'UNKNOWN') as any,
                  uploadedAt: doc.uploadedAt,
                  uploader: doc.uploadedBy,
                  url: doc.url,
                  category: doc.contentType.split('/')[0],
                  version: 1,
                  isStarred: doc.isStarred,
                }}
                variant="portal"
                showActions={true}
                starred={doc.isStarred}
                onDownload={() => handleDownloadDocument(doc.id)}
                onDelete={() => handleDeleteDocument(doc.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {state.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOffset(offset + limit)
                  fetchDocuments(searchQuery, statusFilter, offset + limit)
                }}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
