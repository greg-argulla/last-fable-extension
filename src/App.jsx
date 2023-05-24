/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import OBR from "@owlbear-rodeo/sdk";
import landingBG from "./assets/bg.jpg";
import refresh from "./assets/refresh.png";
import "./App.css";

document.body.style.overflow = "hidden";

const Text = (props) => {
  const { children } = props;
  return <span className="outline">{children}</span>;
};

function App() {
  const messageLimit = 100;

  const [dex, setDex] = useState("d8");
  const [ins, setIns] = useState("d8");
  const [mig, setMig] = useState("d8");
  const [wil, setWil] = useState("d8");
  const [diceOne, setDiceOne] = useState("");
  const [diceOneResult, setDiceOneResult] = useState(0);
  const [diceTwoResult, setDiceTwoResult] = useState(0);
  const [diceTwo, setDiceTwo] = useState("");
  const [diceLabelOne, setDiceLabelOne] = useState("");
  const [diceLabelTwo, setDiceLabelTwo] = useState("");
  const [bonus, setBonus] = useState(0);
  const [damage, setDamage] = useState("");
  const [text, setText] = useState("");
  const [isOBRReady, setIsOBRReady] = useState(false);
  const [cooldown, setCoolDown] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [name, setName] = useState("");
  const [preparedDice, setPreparedDice] = useState([]);

  const [chat, setChat] = useState([]);

  const ChatInstance = (props) => {
    const { item, index } = props;
    if (item.message) {
      if (item.user === name) {
        return (
          <div className="outline" style={{ textAlign: "right" }}>
            <div>{item.user}</div>
            <span style={{ color: "#FFF" }}>{item.message}</span>
          </div>
        );
      }

      return (
        <div className="outline">
          <div>{item.user}</div>
          <span style={{ color: "#FFF" }}>{item.message}</span>
        </div>
      );
    } else {
      const HR =
        item.diceOneResult > item.diceTwoResult
          ? item.diceOneResult
          : item.diceTwoResult;
      return (
        <div className="outline" style={{ textAlign: "center" }}>
          * {item.user} Rolled{" "}
          <span style={{ color: "#FFF" }}>{item.result}</span>
          {item.diceOneResult}
          {item.diceTwoResult !== 0 ? <>{` + ${item.diceTwoResult}`}</> : ""}
          {parseInt(item.bonus) > 0 ? " + " + item.bonus : ""}
          {item.diceTwoResult !== 0 && ` = `}
          {item.diceTwoResult !== 0 && (
            <span
              style={{
                color:
                  (item.diceOneResult + item.diceTwoResult + item.bonus) % 2 ===
                  0
                    ? "lightgreen"
                    : "lightblue",
                marginRight: 2,
                marginLeft: 2,
                fontSize: 14,
              }}
            >
              {item.diceOneResult + item.diceTwoResult + item.bonus}
            </span>
          )}
          {parseInt(item.damage) > 0 ? ` HR: ${HR} DMG:` : ""}
          {parseInt(item.damage) > 0 ? (
            <span
              style={{
                color: "red",
                marginRight: 2,
                marginLeft: 2,
                fontSize: 14,
              }}
            >
              {HR + item.damage}
            </span>
          ) : (
            ""
          )}
          {item.diceOneResult === item.diceTwoResult &&
            item.diceOneResult > 5 && (
              <>
                <span
                  style={{ color: "#FF4500" }}
                  className={index > chat.length - 8 ? "crit" : ""}
                >
                  CRITICAL
                </span>
              </>
            )}
          {item.diceOneResult === item.diceTwoResult &&
            item.diceOneResult < 6 &&
            item.diceOneResult > 1 && (
              <span style={{ color: "orange" }}>FRENZY</span>
            )}
          {item.diceOneResult === item.diceTwoResult &&
            item.diceOneResult === 1 && (
              <span
                style={{ color: "lightgrey" }}
                className={index > chat.length - 8 ? "crit" : ""}
              >
                FUMBLE
              </span>
            )}
        </div>
      );
    }
  };

  const clickPrepareDice = () => {
    if (preparedDice.length > 1) preparedDice.shift();
    const newPreparedDice = [...preparedDice];
    newPreparedDice.push({
      diceOne,
      diceTwo,
      diceLabelOne,
      diceLabelTwo,
      damage,
      bonus,
    });

    setPreparedDice(newPreparedDice);
    saveStats({ preparedDice: newPreparedDice });
    clearAllDice();
  };

  useEffect(() => {
    OBR.onReady(async () => {
      const metadata = await OBR.room.getMetadata();
      if (metadata["last.fable.extension/metadata"]) {
        const currentChat =
          metadata["last.fable.extension/metadata"].currentChat;
        setChat(currentChat);
      }
      setIsOBRReady(true);
      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 100);

      OBR.action.setBadgeBackgroundColor("orange");
      setName(await OBR.player.getName());
    });
  }, []);

  const clearAllDice = () => {
    setDiceOne("");
    setDiceTwo("");
    setDiceLabelOne("");
    setDiceLabelTwo("");
    setDiceOneResult(0);
    setDiceTwoResult(0);
    setDamage("");
    setBonus("");
  };

  const clearSetDice = () => {
    setDiceOne("");
    setDiceTwo("");
    setDiceLabelOne("");
    setDiceLabelTwo("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addMessage();
    }
  };

  useEffect(() => {
    if (isOBRReady) {
      OBR.room.onMetadataChange((metadata) => {
        const currentChat =
          metadata["last.fable.extension/metadata"].currentChat;
        setTimeout(() => {
          var objDiv = document.getElementById("chatbox");
          objDiv.scrollTop = objDiv.scrollHeight;
        }, 100);

        setChat(currentChat);
      });

      OBR.action.onOpenChange(async (isOpen) => {
        // React to the action opening or closing
        if (isOpen) {
          setUnreadCount(0);
          OBR.action.setBadgeText(undefined);
        }
      });

      const stats = JSON.parse(
        localStorage.getItem("last.fable.extension/metadata")
      );

      if (stats) {
        setDex(stats.dex);
        setIns(stats.ins);
        setMig(stats.mig);
        setWil(stats.wil);
        setDamage(stats.damage);
        setBonus(stats.bonus);
        setPreparedDice(stats.preparedDice);
      }
    }
  }, [isOBRReady]);

  useEffect(() => {
    const updateMessages = async () => {
      const lastMessage = chat[chat.length - 1];

      const isOpen = await OBR.action.isOpen();

      if (lastMessage && !cooldown && isOBRReady && !isOpen) {
        if (lastMessage.message) {
          OBR.notification.show(
            lastMessage.user + ": " + lastMessage.message,
            "DEFAULT"
          );
        } else {
          const HR =
            lastMessage.diceOneResult > lastMessage.diceTwoResult
              ? lastMessage.diceOneResult
              : lastMessage.diceTwoResult;

          const isCrit =
            lastMessage.diceOneResult === lastMessage.diceTwoResult &&
            lastMessage.diceOneResult > 5;

          const isFumble =
            lastMessage.diceOneResult === lastMessage.diceTwoResult &&
            lastMessage.diceOneResult === 1;

          OBR.notification.show(
            lastMessage.user +
              " Rolled " +
              (isCrit
                ? "CRITICAL"
                : isFumble
                ? "FUMBLE"
                : lastMessage.diceOneResult +
                  lastMessage.diceTwoResult +
                  lastMessage.bonus) +
              (lastMessage.damage !== 0 &&
              lastMessage.damage !== "" &&
              !isFumble
                ? " DMG: " + (HR + lastMessage.damage)
                : ""),
            isCrit ? "WARNING" : isFumble ? "ERROR" : "INFO"
          );
          setCoolDown(true);
        }
        if (isOBRReady) {
          const isOpen = await OBR.action.isOpen();
          if (!isOpen) {
            setUnreadCount(unreadCount + 1);
            OBR.action.setBadgeText("" + (unreadCount + 1));
          }
        }
      }
      setTimeout(() => {
        setCoolDown(false);
      }, 4000);
    };
    updateMessages();
  }, [chat]);

  const addMessage = async () => {
    if (text !== "") {
      const newMessage = { user: name, message: text };
      const newChat = [...chat, newMessage];
      OBR.room.setMetadata({
        "last.fable.extension/metadata": {
          currentChat: newChat.splice(-messageLimit),
        },
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 100);
    }
  };

  const rollPreparedDice = async (index) => {
    const prepared = preparedDice[index];

    if (prepared.diceOne != "") {
      const result1 = getRandomNumberByDice(prepared.diceOne);
      setDiceOneResult(result1);
    }

    if (prepared.diceTwo != "") {
      const result2 = getRandomNumberByDice(prepared.diceTwo);
      setDiceTwoResult(result2);
    }
    setDiceOne(prepared.diceOne);
    setDiceTwo(prepared.diceTwo);
    setDiceLabelOne(prepared.diceLabelOne);
    setDiceLabelTwo(prepared.diceLabelTwo);
    setDamage(prepared.damage);
    setBonus(prepared.bonus);
  };

  const addRoll = async () => {
    const newChat = [
      ...chat,
      {
        user: name,
        diceOneResult,
        diceTwoResult,
        damage,
        bonus,
      },
    ];
    OBR.room.setMetadata({
      "last.fable.extension/metadata": {
        currentChat: newChat.splice(-messageLimit),
      },
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 100);
  };

  const rollDiceOne = () => {
    if (diceOne != "") {
      const result1 = getRandomNumberByDice(diceOne);
      setDiceOneResult(result1);
    }
  };

  const rollDiceTwo = () => {
    if (diceTwo != "") {
      const result2 = getRandomNumberByDice(diceTwo);
      setDiceTwoResult(result2);
    }
  };

  const rollDice = () => {
    rollDiceOne();
    rollDiceTwo();
  };

  useEffect(() => {
    if (diceOneResult !== 0) addRoll();
  }, [diceOneResult, diceTwoResult]);

  const generateRandomNumber = (end) => {
    var range = end;
    var randomNum = Math.floor(Math.random() * range) + 1;

    return randomNum;
  };

  const getRandomNumberByDice = (dice) => {
    if (dice === "d4") {
      return generateRandomNumber(4);
    }
    if (dice === "d6") {
      return generateRandomNumber(6);
    }
    if (dice === "d8") {
      return generateRandomNumber(8);
    }
    if (dice === "d10") {
      return generateRandomNumber(10);
    }
    if (dice === "d12") {
      return generateRandomNumber(12);
    }
    if (dice === "d20") {
      return generateRandomNumber(20);
    }
  };

  const saveStats = async (replace) => {
    localStorage.setItem(
      "last.fable.extension/metadata",
      JSON.stringify({
        dex,
        ins,
        mig,
        wil,
        damage,
        bonus,
        preparedDice,
        ...replace,
      })
    );
  };

  const changeDex = (evt) => {
    setDex(evt.target.value);
    saveStats({ dex: evt.target.value });
  };
  const changeIns = (evt) => {
    setIns(evt.target.value);
    saveStats({ ins: evt.target.value });
  };
  const changeMig = (evt) => {
    setMig(evt.target.value);
    saveStats({ mig: evt.target.value });
  };
  const changeWil = (evt) => {
    setWil(evt.target.value);
    saveStats({ wil: evt.target.value });
  };

  const changeBonus = (evt) => {
    if (evt.target.value != "") {
      setBonus(parseInt(evt.target.value.replace(/\D/g, "")));
      saveStats({ bonus: parseInt(evt.target.value) });
    } else {
      setBonus("");
      saveStats({ bonus: "" });
    }
  };
  const changeDamage = (evt) => {
    if (evt.target.value != "") {
      setDamage(parseInt(evt.target.value.replace(/\D/g, "")));
      saveStats({ damage: parseInt(evt.target.value) });
    } else {
      setDamage("");
      saveStats({ damage: "" });
    }
  };

  const setDice = (dice, label) => {
    if (diceOneResult !== 0) {
      setDiceOne(dice);
      setDiceLabelOne(label.toUpperCase());
      setDiceTwo("");
      setDiceLabelTwo("");
      setDiceOneResult(0);
      setDiceTwoResult(0);
    } else if (diceOne === "") {
      setDiceOne(dice);
      setDiceLabelOne(label.toUpperCase());
    } else if (diceTwo === "") {
      setDiceTwo(dice);
      setDiceLabelTwo(label.toUpperCase());
    }
  };

  const clickDice = (stat) => {
    if (stat === "dex") {
      setDice(dex, stat);
    } else if (stat === "ins") {
      setDice(ins, stat);
    } else if (stat === "mig") {
      setDice(mig, stat);
    } else if (stat === "wil") {
      setDice(wil, stat);
    } else {
      setDice(stat, stat);
    }
  };

  const Result = () => {
    const HR = diceOneResult > diceTwoResult ? diceOneResult : diceTwoResult;
    return (
      <div
        style={{
          margin: 10,
          marginTop: 5,
          marginLeft: 40,
          marginRight: 25,
          display: "flex",
          alignItems: "center",
        }}
        className="dice-result"
      >
        {diceOneResult}
        <button
          className="button-dice"
          style={{
            backgroundImage: `url(${refresh})`,
            backgroundSize: "contain",
            width: 28,
            height: 20,
            margin: 5,
          }}
          onClick={() => rollDiceOne()}
        />
        <>
          {diceTwoResult !== 0 ? (
            <>
              {`+ ${diceTwoResult}`}
              <button
                className="button-dice"
                style={{
                  backgroundImage: `url(${refresh})`,
                  backgroundSize: "contain",
                  width: 28,
                  height: 20,
                  margin: 5,
                }}
                onClick={() => rollDiceTwo()}
              />
            </>
          ) : (
            ""
          )}
          {parseInt(bonus) > 0 ? `+ ${bonus}` : ""}
          {` = `}
          <span
            style={{
              color:
                (diceOneResult + diceTwoResult + bonus) % 2 === 0
                  ? "lightgreen"
                  : "lightblue",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 14,
            }}
          >
            {diceOneResult + diceTwoResult + bonus}
          </span>
          {parseInt(damage) > 0 ? ` HR: ${HR} DMG: ` : ""}
          {parseInt(damage) > 0 ? (
            <span
              style={{
                color: "red",
                marginRight: 2,
                marginLeft: 2,
                fontSize: 14,
              }}
            >
              {HR + damage}
            </span>
          ) : (
            ""
          )}

          {diceTwoResult !== 0 ? (
            <button
              className="button-dice"
              style={{
                backgroundImage: `url(${refresh})`,
                backgroundSize: "contain",
                width: 28,
                height: 20,
                marginLeft: 3,
              }}
              onClick={() => rollDice()}
            />
          ) : (
            ""
          )}
        </>
        <button
          className="button-dice"
          style={{ marginLeft: 5, width: 40 }}
          onClick={() => clearAllDice()}
        >
          Clear
        </button>
      </div>
    );
  };

  const renderPreparedDice = () => {
    return (
      <Text>
        <span style={{ fontSize: 11 }}>Prepared:</span>
        {preparedDice.map((item, index) => (
          <button
            key={index}
            className="button-dice"
            style={{ marginLeft: 5, width: "auto" }}
            onClick={() => {
              rollPreparedDice(index);
            }}
          >
            【{item.diceLabelOne} + {item.diceLabelTwo}
            {item.bonus != 0 ? " + " + item.bonus : ""}】
            {item.damage != "" ? "【HR +" + item.damage + "】" : ""}
          </button>
        ))}
      </Text>
    );
  };

  const RollInput = () => {
    const isReadyToPrepare = diceOne != "" && diceTwo != "";
    const hasDice = diceOne != "";
    return (
      <div
        style={{
          margin: 10,
          marginTop: 5,
          marginLeft: 30,
          marginRight: 30,
          display: "flex",
          alignItems: "center",
        }}
      >
        {hasDice && (
          <div className="dice-result">
            【{diceLabelOne}
            {diceLabelTwo != 0 ? " + " + diceLabelTwo : ""}
            {bonus != 0 ? " + " + bonus : ""}】
            {damage != "" ? " 【HR + " + damage + "】" : ""}
          </div>
        )}
        {hasDice && (
          <button
            className="button-dice"
            style={{ marginLeft: 5 }}
            onClick={() => rollDice()}
          >
            Roll
          </button>
        )}
        {isReadyToPrepare && (
          <button
            className="button-dice"
            style={{ marginLeft: 5 }}
            onClick={() => clickPrepareDice()}
          >
            Prepare
          </button>
        )}
        {hasDice && (
          <button
            className="button-dice"
            style={{ marginLeft: 5 }}
            onClick={() => clearSetDice()}
          >
            Clear
          </button>
        )}
        {!hasDice && renderPreparedDice()}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundImage: `url(${landingBG})`,
        backgroundSize: "contain",
        height: 600,
        width: 400,
        overflow: "hidden",
      }}
    >
      <div style={{}}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingLeft: 40,
            paddingRight: 20,
            paddingTop: 25,
          }}
        >
          <div>
            <div
              style={{ display: "flex", flexDirection: "row", marginRight: 2 }}
            >
              <div style={{ width: 50 }}>
                <Text>DEX</Text>
                <select
                  style={{
                    backgroundColor: "#333",
                    color: "#ffd433",
                    fontSize: 12,
                    padding: 1,
                  }}
                  value={dex}
                  onChange={changeDex}
                >
                  <option value="d12">d12</option>
                  <option value="d10">d10</option>
                  <option value="d8">d8</option>
                  <option value="d6">d6</option>
                </select>
                <button
                  className="button-dice"
                  onClick={() => clickDice("dex")}
                >
                  DEX
                </button>
              </div>
              <div style={{ width: 50 }}>
                <Text>INS</Text>
                <select
                  style={{
                    backgroundColor: "#333",
                    color: "#ffd433",
                    fontSize: 12,
                    padding: 1,
                  }}
                  value={ins}
                  onChange={changeIns}
                >
                  <option value="d12">d12</option>
                  <option value="d10">d10</option>
                  <option value="d8">d8</option>
                  <option value="d6">d6</option>
                </select>
                <button
                  className="button-dice"
                  onClick={() => clickDice("ins")}
                >
                  INS
                </button>
              </div>
              <div style={{ width: 50 }}>
                <Text>MIG</Text>
                <select
                  style={{
                    backgroundColor: "#333",
                    color: "#ffd433",
                    fontSize: 12,
                    padding: 1,
                  }}
                  value={mig}
                  onChange={changeMig}
                >
                  <option value="d12">d12</option>
                  <option value="d10">d10</option>
                  <option value="d8">d8</option>
                  <option value="d6">d6</option>
                </select>
                <button
                  className="button-dice"
                  onClick={() => clickDice("mig")}
                >
                  MIG
                </button>
              </div>
              <div style={{ width: 50 }}>
                <Text>WIL</Text>
                <select
                  style={{
                    backgroundColor: "#333",
                    color: "#ffd433",
                    fontSize: 12,
                    padding: 1,
                  }}
                  value={wil}
                  onChange={changeWil}
                >
                  <option value="d12">d12</option>
                  <option value="d10">d10</option>
                  <option value="d8">d8</option>
                  <option value="d6">d6</option>
                </select>
                <button
                  className="button-dice"
                  onClick={() => clickDice("wil")}
                >
                  WIL
                </button>
              </div>
              <div style={{ width: 45 }}>
                <Text>+/DMG</Text>
                <div style={{ marginTop: -0.5 }}>
                  <input
                    type="number"
                    style={{
                      width: 34,
                      height: 17,
                      backgroundColor: "#333",
                      color: "#ffd433",
                      fontSize: 12,
                      border: 4,
                      paddingLeft: 4,
                    }}
                    value={bonus}
                    onChange={changeBonus}
                  />
                </div>
                <div style={{ marginTop: -0.5 }}>
                  <input
                    type="number"
                    style={{
                      width: 34,
                      height: 17,
                      backgroundColor: "#333",
                      color: "#ffd433",
                      fontSize: 12,
                      border: 4,
                      paddingLeft: 4,
                    }}
                    value={damage}
                    onChange={changeDamage}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <button
                className="button-dice"
                style={{ marginRight: 2 }}
                onClick={() => clickDice("d4")}
              >
                d4
              </button>
              <button className="button-dice" onClick={() => clickDice("d6")}>
                d6
              </button>
            </div>
            <div>
              <button
                className="button-dice"
                style={{ marginRight: 2 }}
                onClick={() => clickDice("d8")}
              >
                d8
              </button>
              <button className="button-dice" onClick={() => clickDice("d10")}>
                d10
              </button>
            </div>
            <div>
              <button
                className="button-dice"
                style={{ marginRight: 2 }}
                onClick={() => clickDice("d12")}
              >
                d12
              </button>
              <button className="button-dice" onClick={() => clickDice("d20")}>
                d20
              </button>
            </div>
          </div>
        </div>
        {diceOneResult !== 0 ? <Result /> : <RollInput />}
        <div
          style={{
            marginLeft: 30,
            marginRight: 30,
            marginTop: 10,
          }}
        >
          <div
            id="chatbox"
            style={{
              backgroundColor: "#333",
              padding: 10,
              overflow: "scroll",
              height: 365,
            }}
          >
            {chat.map((item, index) => (
              <ChatInstance key={index} item={item} index={index} />
            ))}
          </div>
          <div style={{ marginTop: 5 }}>
            <input
              style={{
                color: "#FFF",
                width: 280,
                height: 24,
                marginRight: 2,
                paddingLeft: 4,
                backgroundColor: "#333",
              }}
              value={text}
              onChange={(evt) => {
                setText(evt.target.value);
              }}
              onKeyDown={handleKeyDown}
            ></input>
            <button
              style={{
                width: 48,
                height: 28,
                fontSize: 12,
                padding: 0,
                color: "#ffd433",
                backgroundColor: "#222",
              }}
              onClick={() => addMessage()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
