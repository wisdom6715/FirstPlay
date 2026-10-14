import { NextResponse } from 'next/server';
import { flutterwaveUtils } from '../../../../utils/flutterwaveUtils';

/**
 * GET /api/rewards/banks
 * Returns the list of supported Nigerian commercial banks.
 */
export async function GET() {
  try {
    const banks = await flutterwaveUtils.getNigerianBanks();
    return NextResponse.json({
      success: true,
      banks
    });
  } catch (err) {
    console.error('[API] /api/rewards/banks GET error:', err);
    return NextResponse.json({
      success: false,
      banks: flutterwaveUtils.getFallbackNigerianBanks(),
      error: err.message
    });
  }
}

/**
 * POST /api/rewards/banks
 * Resolves account name with Flutterwave bank resolution service.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { accountNumber, bankCode } = body || {};

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { success: false, message: 'Account number and bank code are required' },
        { status: 400 }
      );
    }

    const resolution = await flutterwaveUtils.resolveBankAccount({
      accountNumber,
      bankCode
    });

    return NextResponse.json(resolution);
  } catch (err) {
    console.error('[API] /api/rewards/banks POST error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error resolving bank account' },
      { status: 500 }
    );
  }
}
