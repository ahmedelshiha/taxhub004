'use client'

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  Clock,
  User,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatDate, formatRelativeTime, formatFileSize } from '@/lib/shared/formatters'
import { toast } from 'sonner'

interface DocumentVersion {
  id: string
  number: number
  name: string
  size: number
  contentType: string
  uploadedAt: Date | string
  uploadedBy?: {
    id: string
    name: string
    email?: string
  }
  changeDescription?: string
  url: string
}

interface DocumentVersionHistoryProps {
  documentId: string
  documentName: string
  onVersionSelect?: (version: DocumentVersion) => void
  onVersionDownload?: (versionId: string) => void
  variant?: 'compact' | 'full'
}

/**
 * DocumentVersionHistory Component
 *
 * Displays version history for a document with ability to:
 * - View all versions
 * - Download specific versions
 * - See change descriptions
 * - Track who made changes and when
 *
 * @example
 * ```tsx
 * <DocumentVersionHistory
 *   documentId="doc-123"
 *   documentName="Invoice.pdf"
 *   onVersionDownload={handleDownload}
 * />
 * ```
 */
export function DocumentVersionHistory({
  documentId,
  documentName,
  onVersionSelect,
  onVersionDownload,
  variant = 'full',
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)

  // Fetch version history
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/documents/${documentId}/versions`)

        if (!response.ok) {
          throw new Error('Failed to fetch versions')
        }

        const data = await response.json()
        setVersions(data.data || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load versions'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    if (documentId) {
      fetchVersions()
    }
  }, [documentId])

  // Handle download
  const handleDownload = async (version: DocumentVersion) => {
    try {
      if (onVersionDownload) {
        onVersionDownload(version.id)
      } else {
        // Default: redirect to download URL
        window.open(version.url, '_blank')
        toast.success(`Downloading ${version.name}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed'
      toast.error(message)
    }
  }

  const handleSelectVersion = (version: DocumentVersion) => {
    onVersionSelect?.(version)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>No versions available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            This document has no version history yet
          </p>
        </CardContent>
      </Card>
    )
  }

  // Compact variant - just show current version
  if (variant === 'compact') {
    const currentVersion = versions[0]
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Current Version</h3>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">v{currentVersion.number}</p>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(new Date(currentVersion.uploadedAt))}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDownload(currentVersion)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Full variant - show complete history
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Version History</CardTitle>
            <CardDescription>{versions.length} version(s) available</CardDescription>
          </div>
          <Badge variant="outline">{versions.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version) => {
            const uploadDate = new Date(version.uploadedAt)
            const isExpanded = expandedVersion === version.id
            const isCurrent = version.number === versions[0].number

            return (
              <div
                key={version.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                  className="w-full"
                  aria-expanded={isExpanded}
                  aria-label={`Version ${version.number} details`}
                >
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            Version {version.number}
                          </p>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(version.size)} • {formatDate(uploadDate, 'short')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t space-y-3">
                    {/* Uploader Info */}
                    {version.uploadedBy && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600">Uploaded By</p>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm">{version.uploadedBy.name}</span>
                        </div>
                        {version.uploadedBy.email && (
                          <p className="text-xs text-gray-500 ml-5">{version.uploadedBy.email}</p>
                        )}
                      </div>
                    )}

                    {/* Upload Time */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600">Upload Time</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm">{formatDate(uploadDate, 'long')}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">
                        ({formatRelativeTime(uploadDate)})
                      </p>
                    </div>

                    {/* Change Description */}
                    {version.changeDescription && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600">Changes</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {version.changeDescription}
                        </p>
                      </div>
                    )}

                    {/* File Info */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600">File Info</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="truncate">{version.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p>{formatFileSize(version.size)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleDownload(version)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {onVersionSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectVersion(version)}
                          className="flex-1"
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default DocumentVersionHistory
