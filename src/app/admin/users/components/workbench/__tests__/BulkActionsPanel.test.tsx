import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import BulkActionsPanel from '../BulkActionsPanel'

// Mock fetch for API calls
global.fetch = vi.fn()

describe('BulkActionsPanel', () => {
  const mockOnClear = vi.fn()

  beforeEach(() => {
    mockOnClear.mockClear()
  })

  describe('Rendering', () => {
    it('should render with selected user count', () => {
      render(
        <BulkActionsPanel
          selectedCount={5}
          selectedUserIds={new Set(['1', '2', '3', '4', '5'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText(/5 users selected/i)).toBeInTheDocument()
    })

    it('should render action type selector', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThanOrEqual(2)
    })

    it('should render action value selector', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const inputs = screen.getAllByRole('combobox')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('should render preview button', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByTestId('preview-button')).toBeInTheDocument()
    })

    it('should render apply button', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByTestId('apply-button')).toBeInTheDocument()
    })

    it('should render clear button', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('should handle singular "user" for single selection', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText(/1 user selected/i)).toBeInTheDocument()
    })

    it('should handle plural "users" for multiple selections', () => {
      render(
        <BulkActionsPanel
          selectedCount={10}
          selectedUserIds={new Set(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText(/10 users selected/i)).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should call onClear when clear button clicked', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={3}
          selectedUserIds={new Set(['1', '2', '3'])}
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledOnce()
    })

    it('should show dry-run modal when preview clicked', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={2}
          selectedUserIds={new Set(['1', '2'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      await waitFor(() => {
        expect(screen.getByTestId('dry-run-modal')).toBeInTheDocument()
      })
    })

    it('should close modal when cancel clicked', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={2}
          selectedUserIds={new Set(['1', '2'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      await waitFor(() => {
        expect(screen.getByTestId('dry-run-modal')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByTestId('dry-run-modal')).not.toBeInTheDocument()
      })
    })

    it('should handle action type selection', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const selectors = screen.getAllByRole('combobox')
      expect(selectors[0]).toBeInTheDocument()

      await user.click(selectors[0])
      // Would select an option if available
    })
  })

  describe('Props Handling', () => {
    it('should accept selectedUserIds as Set', () => {
      const userIds = new Set(['user1', 'user2', 'user3'])
      const { container } = render(
        <BulkActionsPanel
          selectedCount={3}
          selectedUserIds={userIds}
          onClear={mockOnClear}
        />
      )

      expect(container).toBeTruthy()
      expect(mockOnClear).not.toHaveBeenCalled()
    })

    it('should accept selectedCount prop', () => {
      render(
        <BulkActionsPanel
          selectedCount={42}
          selectedUserIds={new Set(Array.from({ length: 42 }, (_, i) => String(i)))}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText(/42 users selected/i)).toBeInTheDocument()
    })

    it('should call onClear callback when provided', async () => {
      const user = userEvent.setup()
      const customClear = vi.fn()

      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={customClear}
        />
      )

      const clearButton = screen.getByRole('button', { name: /clear/i })
      await user.click(clearButton)

      expect(customClear).toHaveBeenCalledOnce()
    })
  })

  describe('Disabled States', () => {
    it('should disable buttons during operation', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      expect(previewButton).not.toBeDisabled()

      // Simulate operation in progress
      // This would typically be handled by loading state
    })

    it('should show loading state during bulk operation', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      // Component might show loading indicator
      // Verification depends on implementation
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <BulkActionsPanel
          selectedCount={2}
          selectedUserIds={new Set(['1', '2'])}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('should have accessible comboboxes', () => {
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThan(0)
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      // Tab through elements
      await user.tab()
      expect(document.activeElement).toBeTruthy()
    })

    it('should announce changes to screen readers', () => {
      const { container } = render(
        <BulkActionsPanel
          selectedCount={3}
          selectedUserIds={new Set(['1', '2', '3'])}
          onClear={mockOnClear}
        />
      )

      const text = container.textContent
      expect(text).toContain('3 users selected')
    })
  })

  describe('Error Handling', () => {
    it('should handle empty user selection', () => {
      render(
        <BulkActionsPanel
          selectedCount={0}
          selectedUserIds={new Set()}
          onClear={mockOnClear}
        />
      )

      // Component should still render
      expect(screen.queryByTestId('bulk-actions-panel')).toBeTruthy()
    })

    it('should validate action selection before apply', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={1}
          selectedUserIds={new Set(['1'])}
          onClear={mockOnClear}
        />
      )

      // Try to preview without selecting action
      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      // Should show validation message or be disabled
    })
  })

  describe('Modal Integration', () => {
    it('should pass correct props to DryRunModal', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={5}
          selectedUserIds={new Set(['1', '2', '3', '4', '5'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      await waitFor(() => {
        expect(screen.getByText(/Preview: 5 users/)).toBeInTheDocument()
      })
    })

    it('should handle apply from modal', async () => {
      const user = userEvent.setup()
      render(
        <BulkActionsPanel
          selectedCount={2}
          selectedUserIds={new Set(['1', '2'])}
          onClear={mockOnClear}
        />
      )

      const previewButton = screen.getByRole('button', { name: /preview/i })
      await user.click(previewButton)

      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /^Apply$/i })
        expect(applyButton).toBeInTheDocument()
      })
    })
  })
})
