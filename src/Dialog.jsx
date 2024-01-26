/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import landingBG from "./assets/bg.jpg";
import refresh from "./assets/refresh.png";
import "./App.css";
import { ChatInstance } from "./App";

function Dialog() {
  const [lastMessage, setLastMessage] = useState(undefined);
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        setLastMessage(
          localStorage.getItem("last.fable.extension/lastmessage")
        );
      } catch {
        console.log("No localstorage allowed");
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (lastMessage) {
    const chat = JSON.parse(lastMessage);
    return (
      <div
        style={{
          height: chat.height,
          width: 345,
          padding: 10,
          overflow: "hidden",
          cursor: "pointer",
        }}
        onClick={() => {
          OBR.popover.close("chat/popover");
        }}
      >
        <ChatInstance
          key={chat.id}
          item={chat}
          index={30}
          chatLength={10}
          setToPm={() => {}}
        />
      </div>
    );
  }
  return "";
}

export default Dialog;
