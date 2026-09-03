import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({sha:(process.env.NEXT_PUBLIC_BUILD_SHA??process.env.VERCEL_GIT_COMMIT_SHA??'development').slice(0,40),environment:process.env.VERCEL_ENV??'development'});}
