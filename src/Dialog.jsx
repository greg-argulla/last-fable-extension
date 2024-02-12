/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import "./App.css";
import dialogBG from "./assets/dialog.webp";

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
          height: 160,
          width: 600,
          padding: 10,
          overflow: "hidden",
          cursor: "pointer",
          backgroundImage: `url(${dialogBG})`,
          backgroundSize: "cover",
          margin: 5,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
        onClick={() => {
          OBR.popover.close("chat/popover");
        }}
      >
        <div
          style={{
            backgroundImage: `url(${chat.avatar})`,
            textAlign: "center",
            width: 100,
            height: 100,
            marginLeft: 30,
            backgroundSize: "cover",
            fontSize: 18,
          }}
        ></div>
        <div style={{ flex: 1 }}>
          <div
            className="outline-strong"
            style={{
              fontSize: 18,
            }}
          >
            {chat.characterName}
          </div>
          <div
            className="outline-strong"
            style={{
              color: "white",
              fontSize: 18,
              maxWidth: 440,
              paddingBottom: 10,
              paddingRight: 25,
            }}
          >
            {chat.message}
          </div>
        </div>
      </div>
    );
  }
  return "";
}

export default Dialog;
