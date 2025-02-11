"use client";

import { Authenticator, Button } from "@aws-amplify/ui-react";
import { amplifyClient } from "./amplify-utils";

export default function Home() {
  const buttonClick = async () => {
    const { data: convos, errors } =
      await amplifyClient.conversations.waChat.list({
        limit: 250,
      });
    console.log("errors", errors);
    console.log("convos", convos.length);
    if (convos.length > 0) {
      const convo = convos[0];
      const { data: msgs, errors: msgsErrors } = await convo.listMessages();
      console.log("msgs", msgs);
      console.log("msgsErrors", msgsErrors);
    }
  };

  const buttonClick2 = async () => {
    const id = "f1995aa1-7afa-4f03-9e89-53ab8da626ab";
    const { data: chat, errors } = await amplifyClient.conversations.waChat.get(
      { id }
    );
    console.log("chat", chat);
    console.log("errors", errors);
    if (chat) {
      const { data: msgs, errors: msgsErrors } = await chat.listMessages();
      console.log("msgs", msgs);
      console.log("msgsErrors", msgsErrors);
    }
  };

  return (
    <Authenticator>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-4xl font-bold">Hello World</h1>
        <Button onClick={buttonClick}>Click me</Button>
        <Button onClick={buttonClick2}>Click me 2</Button>
      </div>
    </Authenticator>
  );
}
