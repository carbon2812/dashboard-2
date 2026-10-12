import { NextResponse } from 'next/server';
import { getExpenseById, updateExpense, deleteExpense } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await getExpenseById(params.id);
    if (!expense) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateExpense(params.id, {
      ...(body.amount !== undefined && { amount: Number(body.amount) }),
      ...(body.currency && { currency: body.currency }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.date && { date: body.date }),
      ...(body.description !== undefined && { description: body.description.trim() }),
      ...(body.merchant !== undefined && { merchant: body.merchant.trim() }),
      ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
      ...(body.status && { status: body.status }),
      ...(body.attachment !== undefined && { attachment: body.attachment }),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteExpense(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
