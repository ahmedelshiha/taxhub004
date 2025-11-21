'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Send,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'

const SignatureRequestSchema = z.object({
  signerEmail: z.string().email('Invalid email address'),
  signerName: z.string().min(1, 'Signer name is required'),
  expiresIn: z.coerce.number().int().positive().default(30),
  requireBiometric: z.boolean().optional().default(false),
})

type SignatureRequestFormData = z.infer<typeof SignatureRequestSchema>

interface DocumentSigningFormProps {
  documentId: string
  documentName: string
  onSuccess?: (signatureRequest: any) => void
  onError?: (error: Error) => void
  variant?: 'request' | 'sign'
}

/**
 * DocumentSigningForm Component
 *
 * Allows users to request signatures on documents.
 * Features: Email validation, expiration dates, biometric requirement
 *
 * @example
 * ```tsx
 * <DocumentSigningForm
 *   documentId="doc-123"
 *   documentName="Contract.pdf"
 *   variant="request"
 *   onSuccess={(req) => console.log('Signature requested')}
 * />
 * ```
 */
export function DocumentSigningForm({
  documentId,
  documentName,
  onSuccess,
  onError,
  variant = 'request',
}: DocumentSigningFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successResponse, setSuccessResponse] = useState<any>(null)

  const form = useForm<SignatureRequestFormData>({
    resolver: zodResolver(SignatureRequestSchema),
    defaultValues: {
      signerEmail: '',
      signerName: '',
      expiresIn: 30,
      requireBiometric: false,
    },
  })

  const onSubmit = async (formData: SignatureRequestFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerEmail: formData.signerEmail,
          signerName: formData.signerName,
          expiresIn: formData.expiresIn,
          requireBiometric: formData.requireBiometric,
          signatureFields: [
            // Default single signature field (would be customizable in full implementation)
            { page: 1, x: 100, y: 700 },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to request signature')
      }

      const result = await response.json()
      setSuccessResponse(result.data)
      form.reset()

      toast.success(`Signature request sent to ${formData.signerEmail}`)
      onSuccess?.(result.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request signature'
      toast.error(errorMessage)
      onError?.(error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (successResponse) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle>Signature Request Sent</CardTitle>
              <CardDescription>The signer will receive an email shortly</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Signer</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{successResponse.signerName}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-700">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{successResponse.signerEmail}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-600">Expires In</p>
                <p className="text-gray-700">{successResponse.expiresAt}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Status</p>
                <p className="text-yellow-700 font-medium">Pending</p>
              </div>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              The signer can sign the document from the link in the email or from their portal
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => setSuccessResponse(null)}
            variant="outline"
            className="w-full"
          >
            Send Another Request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Signature</CardTitle>
        <CardDescription>
          Send {documentName} to be signed by another party
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Signer Email */}
            <FormField
              control={form.control}
              name="signerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signer Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="signer@example.com"
                        disabled={isSubmitting}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must be an email address associated with your organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Signer Name */}
            <FormField
              control={form.control}
              name="signerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signer Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        disabled={isSubmitting}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The name that will appear on the signature
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expiration */}
            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signature Request Expires In (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    How many days the signer has to sign the document (1-365 days)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Biometric Requirement */}
            <FormField
              control={form.control}
              name="requireBiometric"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Require Biometric Signature</FormLabel>
                    <FormDescription>
                      Signer must use fingerprint or face recognition
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The signer will receive an email with a link to sign the document. They
                can sign from any device with an internet connection.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default DocumentSigningForm
