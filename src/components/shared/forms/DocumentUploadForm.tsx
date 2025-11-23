'use client'

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  File,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

const DocumentUploadSchema = z.object({
  description: z.string().optional(),
  linkedToType: z.string().optional(),
  linkedToId: z.string().optional(),
})

type DocumentUploadFormData = z.infer<typeof DocumentUploadSchema>

interface DocumentUploadFormProps {
  onSuccess?: (document: any) => void
  onError?: (error: Error) => void
  linkedToType?: string
  linkedToId?: string
  variant?: 'portal' | 'admin'
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

/**
 * DocumentUploadForm Component
 *
 * Allows users to upload documents with progress tracking.
 * Features: Drag & drop, file validation, progress bar, metadata input
 *
 * @example
 * ```tsx
 * <DocumentUploadForm
 *   onSuccess={(doc) => console.log('Uploaded:', doc)}
 *   linkedToType="TASK"
 *   linkedToId="task-123"
 * />
 * ```
 */
export function DocumentUploadForm({
  onSuccess,
  onError,
  linkedToType,
  linkedToId,
  variant = 'portal',
}: DocumentUploadFormProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const form = useForm<DocumentUploadFormData>({
    resolver: zodResolver(DocumentUploadSchema),
    defaultValues: {
      description: '',
      linkedToType: linkedToType,
      linkedToId: linkedToId,
    },
  })

  // Get file type icon
  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-600" />
    }
    if (file.type.includes('image')) {
      return <ImageIcon className="h-8 w-8 text-blue-600" />
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-600" />
    }
    if (file.type.includes('sheet') || file.type.includes('excel')) {
      return <FileText className="h-8 w-8 text-green-600" />
    }
    return <File className="h-8 w-8 text-gray-600" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFile(null)
      setUploadError(null)
      return
    }

    const file = files[0]
    setUploadError(null)

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(
        `File type ${file.type} is not allowed. Allowed types: PDF, images, Office documents, CSV, text`
      )
      setSelectedFile(null)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`)
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }, [])

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  // Handle form submission
  const onSubmit = async (formData: DocumentUploadFormData) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataObj = new FormData()
      formDataObj.append('file', selectedFile)
      if (formData.description) {
        formDataObj.append('description', formData.description)
      }
      if (linkedToType) {
        formDataObj.append('linkedToType', linkedToType)
      }
      if (linkedToId) {
        formDataObj.append('linkedToId', linkedToId)
      }

      // Simulate progress (in real implementation, would use XMLHttpRequest or fetch with progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 30
        })
      }, 100)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formDataObj,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      const result = await response.json()

      toast.success('Document uploaded successfully')
      form.reset()
      setSelectedFile(null)
      setUploadProgress(0)

      onSuccess?.(result.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      toast.error(errorMessage)
      onError?.(error as Error)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-3">
            <FormLabel>Document File</FormLabel>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <input
                type="file"
                onChange={handleInputChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept={ALLOWED_TYPES.join(',')}
                aria-label="Upload document"
              />
              <div className="text-center space-y-3 pointer-events-none">
                <Upload className="h-10 w-10 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Drag and drop or click to select'}
                  </p>
                  {!selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <FormDescription className="text-xs">
              Accepted formats: PDF, images (JPEG, PNG, WebP), Office documents, CSV, text files
            </FormDescription>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Error Alert */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a description for this document..."
                    disabled={isUploading}
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Help others understand what this document contains
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-medium text-gray-900">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setSelectedFile(null)
                setUploadError(null)
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>

          {/* Success State */}
          {uploadProgress === 100 && !isUploading && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Document uploaded successfully! AV scan is in progress.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  )
}

export default DocumentUploadForm
