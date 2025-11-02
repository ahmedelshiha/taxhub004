'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEntityForm, type EntityFormConfig, type FieldValidation } from '@/app/admin/users/hooks'

interface TeamMemberFormData {
  name: string
  email: string
  title: string
  department: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  phone?: string
  specialties?: string[]
  certifications?: string[]
  availability?: string
  notes?: string
}

interface TeamMemberFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (memberId: string) => void
  mode?: 'create' | 'edit'
  initialData?: Partial<Record<string, any>> & { id?: string }
  title?: string
  description?: string
}

export const TeamMemberFormModal = React.forwardRef<HTMLDivElement, TeamMemberFormModalProps>(
  function TeamMemberFormModal({
    isOpen,
    onClose,
    onSuccess,
    mode = 'create',
    initialData,
    title,
    description,
  }, ref) {
    const defaultTitle = mode === 'create' ? 'Add Team Member' : 'Edit Team Member'
    const defaultDescription = mode === 'create'
      ? 'Add a new team member to your organization'
      : 'Update team member information'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const validation: FieldValidation = {
      name: { validate: (v) => !!v?.trim(), message: 'Team member name is required' },
      email: [
        { validate: (v) => !!v?.trim(), message: 'Email is required' },
        { validate: (v) => emailRegex.test(v), message: 'Invalid email format' },
      ],
      title: { validate: (v) => !!v?.trim(), message: 'Job title is required' },
      department: { validate: (v) => !!v?.trim(), message: 'Department is required' },
    }

    const formConfig: EntityFormConfig = {
      endpoint: (mode, id) =>
        mode === 'create' ? '/api/admin/entities/team-members' : `/api/admin/entities/team-members/${id}`,
      method: (mode) => (mode === 'create' ? 'POST' : 'PATCH'),
      successMessage: (mode) =>
        mode === 'create' ? 'Team member added successfully' : 'Team member updated successfully',
      onSuccess: (id) => {
        onSuccess?.(id)
        onClose()
      },
    }

    const form = useEntityForm<TeamMemberFormData>({
      initialData: {
        name: initialData?.name || '',
        email: initialData?.email || '',
        title: initialData?.title || '',
        department: initialData?.department || '',
        status: initialData?.status || 'ACTIVE',
        phone: initialData?.phone || '',
        specialties: initialData?.specialties || [],
        certifications: initialData?.certifications || [],
        availability: initialData?.availability || '9am-5pm',
        notes: initialData?.notes || '',
      },
      validation,
      config: formConfig,
      entityId: initialData?.id,
      mode: mode,
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      form.submit()
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent ref={ref} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || defaultTitle}</DialogTitle>
            <DialogDescription>{description || defaultDescription}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Team member name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Accountant"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger id="department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="Tax">Tax</SelectItem>
                    <SelectItem value="Audit">Audit</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value as any)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input
                id="availability"
                placeholder="e.g., 9am-5pm, Mon-Fri"
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input
                id="specialties"
                placeholder="e.g., Tax Planning, Compliance, Audit"
                value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : ''}
                onChange={(e) => handleChange('specialties', e.target.value.split(',').map(s => s.trim()))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications (comma-separated)</Label>
              <Input
                id="certifications"
                placeholder="e.g., CPA, CIA, CFE"
                value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : ''}
                onChange={(e) => handleChange('certifications', e.target.value.split(',').map(s => s.trim()))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Adding...' : 'Updating...'}
                  </>
                ) : (
                  mode === 'create' ? 'Add Member' : 'Update Member'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

TeamMemberFormModal.displayName = 'TeamMemberFormModal'
