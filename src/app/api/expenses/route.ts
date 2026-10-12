import { NextResponse } from 'next/server';
import { getExpenses, createExpense } from '@/lib/db';
import { ExpenseFilterParams } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ExpenseFilterParams = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minAmount: searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined,
      maxAmount: searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      hasAttachment: searchParams.has('hasAttachment') ? searchParams.get('hasAttachment') === 'true' : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'date',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const expenses = await getExpenses(filters);
    return NextResponse.json({ success: true, count: expenses.length, data: expenses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive amount is required' },
        { status: 400 }
      );
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Expense date is required' },
        { status: 400 }
      );
    }

    const newExpense = await createExpense({
      amount: Number(body.amount),
      currency: body.currency || 'INR',
      categoryId: body.categoryId,
      date: body.date,
      description: body.description?.trim() || 'General Expense',
      merchant: body.merchant?.trim() || 'Vendor',
      paymentMethod: body.paymentMethod || 'Corporate Card',
      status: body.status || 'Approved',
      attachment: body.attachment || null,
    });

    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}
