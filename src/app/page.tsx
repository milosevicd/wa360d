"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import config from "@/../amplify_outputs.json";
import { Amplify } from "aws-amplify";

Amplify.configure(config);

export default function Home() {
  return (
    <Authenticator>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-bold">Hello World</h1>
      </div>
    </Authenticator>
  );
}
