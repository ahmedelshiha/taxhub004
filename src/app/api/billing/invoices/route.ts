import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const GET = withTenantContext(async (request: NextRequest) => {
  try {
    const ctx = requireTenantContext()

    if (!ctx.userId || !ctx.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        number: true,
        totalCents: true,
        currency: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    })

    const formattedInvoices = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.number || 'INV-' + inv.id.slice(0, 8),
      date: inv.createdAt.toISOString(),
      amount: inv.totalCents / 100,
      currency: inv.currency || 'USD',
      status: (inv.status === 'PAID' ? 'paid' : inv.paidAt ? 'paid' : 'pending') as 'paid' | 'pending' | 'overdue',
      pdfUrl: null,
    }))

    return NextResponse.json({
      success: true,
      invoices: formattedInvoices,
    })
  } catch (error) {
    logger.error('Error fetching invoices', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
