import { NextRequest, NextResponse } from "next/server";
import { type Schema } from '@/amplify/data/resource';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import outputs from '@/../amplify_outputs.json';
import { cookies } from 'next/headers';

const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});


export async function GET() {
    return NextResponse.json({ message: "Hello World" });
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    await cookieBasedClient.mutations.newWaMsgHandler({
        content: body,
    });
    return NextResponse.json({ message: "OK" });
}



