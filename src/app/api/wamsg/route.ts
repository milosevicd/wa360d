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
    await cookieBasedClient.mutations.newWaMsg({
        content: body,
    });
    return NextResponse.json({ message: "OK" });
}




// sched function

    // 1. fetch all convos

    // 2. for each convo / user:

        // fetch all convo().listMsgs()

        // if not all convo msgs in DB.msgs:
            // add them
            // if last msg from user < 24h ago, wap.sendMsg(convo().lastMsg())

    