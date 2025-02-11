"use client";

import { Authenticator, Button } from "@aws-amplify/ui-react";
import { amplifyClient } from "./amplify-utils";

export default function Home() {
  const buttonClick = async () => {
    const { data: convos, errors } =
      await amplifyClient.conversations.waChat.list({
        limit: 250,
      });
    if (convos.length > 0) {
      const convo = convos[0];
      const { data: msgs, errors: msgsErrors } = await convo.listMessages();
      console.log("msgs", msgs);
      console.log("msgsErrors", msgsErrors);

      console.log("text", msgs[0].content[0].text);
      console.log("text", msgs[1].content[0].text);
    }
  };

  return (
    <Authenticator>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <Button onClick={buttonClick}>Click me</Button>
      </div>
    </Authenticator>
  );
}
