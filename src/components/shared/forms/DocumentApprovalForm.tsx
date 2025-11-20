'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

const DocumentApprovalSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
  expiresIn: z.coerce.number().int().positive().optional(),
})

type DocumentApprovalFormData = z.infer<typeof DocumentApprovalSchema>

interface DocumentApprovalFormProps {
  documentId: string
  documentName: string
  documentStatus?: string
  avThreatName?: string
  onApprove?: (result: any) => void
  onReject?: (result: any) => void
  onError?: (error: Error) => void
}

/**
 * DocumentApprovalForm Component
 *
 * Allows admins to approve or reject documents.
 * Features: Approval notes, expiration dates, threat tracking
 *
 * @example
 * ```tsx
 * <DocumentApprovalForm
 *   documentId="doc-123"
 *   documentName="Invoice.pdf"
 *   onApprove={(result) => console.log('Approved')}
 * />
 * ```
 */
export function DocumentApprovalForm({
  documentId,
  documentName,
  documentStatus,
  avThreatName,
  onApprove,
  onReject,
  onError,
}: DocumentApprovalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)

  const form = useForm<DocumentApprovalFormData>({
    resolver: zodResolver(DocumentApprovalSchema),
    defaultValues: {
      approved: false,
      notes: '',
      expiresIn: 365,
    },
  })

  const onSubmit = async (formData: DocumentApprovalFormData) => {
    if (!approvalAction) {
      toast.error('Please select an action')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        approved: approvalAction === 'approve',
        notes: formData.notes,
        ...(approvalAction === 'approve' && formData.expiresIn && { expiresIn: formData.expiresIn }),
      }

      const response = await fetch(`/api/admin/documents/${documentId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process approval')
      }

      const result = await response.json()

      if (approvalAction === 'approve') {
        toast.success('Document approved successfully')
        onApprove?.(result.data)
      } else {
        toast.success('Document rejected')
        onReject?.(result.data)
      }

      form.reset()
      setApprovalAction(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process approval'
      toast.error(errorMessage)
      onError?.(error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Document Approval</CardTitle>
          <CardDescription>Review and approve or reject document</CardDescription>
          <div className="pt-2">
            <p className="text-sm font-semibold text-gray-700">{documentName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Document Status Alert */}
        {documentStatus && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Current Status: <span className="font-semibold capitalize">{documentStatus}</span>
              {avThreatName && (
                <>
                  <br />
                  Threat Detected: <span className="font-semibold text-red-600">{avThreatName}</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Action Selection */}
            <div className="space-y-3">
              <FormLabel>Approval Decision</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setApprovalAction('approve')
                    form.setValue('approved', true)
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    approvalAction === 'approve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <CheckCircle2
                    className={`h-6 w-6 mx-auto mb-2 ${
                      approvalAction === 'approve' ? 'text-green-600' : 'text-green-300'
                    }`}
                  />
                  <p className="font-medium text-sm">Approve</p>
                  <p className="text-xs text-gray-600 mt-1">Accept this document</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApprovalAction('reject')
                    form.setValue('approved', false)
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    approvalAction === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <XCircle
                    className={`h-6 w-6 mx-auto mb-2 ${
                      approvalAction === 'reject' ? 'text-red-600' : 'text-red-300'
                    }`}
                  />
                  <p className="font-medium text-sm">Reject</p>
                  <p className="text-xs text-gray-600 mt-1">Decline this document</p>
                </button>
              </div>
            </div>

            {/* Approval Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        approvalAction === 'approve'
                          ? 'Optional notes about the approval...'
                          : 'Explain why you are rejecting this document...'
                      }
                      disabled={isSubmitting}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {approvalAction === 'approve'
                      ? 'Add any comments or conditions for approval'
                      : 'Provide feedback to the uploader'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Approval Expiration (only if approving) */}
            {approvalAction === 'approve' && (
              <FormField
                control={form.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Approval Validity (Days)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        placeholder="365"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      How long this approval is valid (1-365 days). Leave empty for permanent
                      approval.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {approvalAction === 'approve'
                  ? 'Approving this document will mark it as safe and allow other users to access it.'
                  : approvalAction === 'reject'
                    ? 'Rejecting this document will notify the uploader and prevent its use.'
                    : 'Select an action to proceed.'}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!approvalAction || isSubmitting}
                className={
                  approvalAction === 'approve'
                    ? 'flex-1 bg-green-600 hover:bg-green-700'
                    : approvalAction === 'reject'
                      ? 'flex-1 bg-red-600 hover:bg-red-700'
                      : 'flex-1'
                }
              >
                {isSubmitting ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : approvalAction === 'approve' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Document
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Document
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setApprovalAction(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default DocumentApprovalForm
