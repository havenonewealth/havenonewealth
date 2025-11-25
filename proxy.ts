import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
    // This tells Next.js to continue the chain
    return NextResponse.next();
}
