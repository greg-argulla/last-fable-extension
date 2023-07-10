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
  const [skillName, setSkillName] = useState("");
  const [info, setInfo] = useState("");
  const [detail, setDetail] = useState("");
  const [dex, setDex] = useState("d8");
  const [ins, setIns] = useState("d8");
  const [mig, setMig] = useState("d8");
  const [wil, setWil] = useState("d8");
  const [diceOneResult, setDiceOneResult] = useState(0);
  const [diceTwoResult, setDiceTwoResult] = useState(0);
  const [diceLabelOne, setDiceLabelOne] = useState("");
  const [diceLabelTwo, setDiceLabelTwo] = useState("");
  const [bonus, setBonus] = useState(0);
  const [damage, setDamage] = useState("");
  const [text, setText] = useState("");
  const [isOBRReady, setIsOBRReady] = useState(false);
  const [cooldown, setCoolDown] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [preparedDice, setPreparedDice] = useState([]);
  const [useHR, setUseHR] = useState(true);
  const [role, setRole] = useState("PLAYER");
  const [rollData, setRollData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [chat, setChat] = useState([]);
  const [chatToCheckChanges, setChatToCheckChanges] = useState([]);
  const [myChat, setMyChat] = useState([]);
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [player, setPlayer] = useState(null);
  const [ignoreFirstUpdate, setIgnoreFirstUpdate] = useState(false);

  const updateNoteItem = async (id, value, key, max) => {
    if (id === "") return;
    const valueGet = isNaN(value) ? 0 : value;
    const maxGet = isNaN(max) ? 0 : max;
    await OBR.scene.items.updateItems([id], (images) => {
      for (let image of images) {
        if (key === "defense" || key === "mDefense") {
          const format =
            valueGet > 9 ? valueGet.toString() : " " + valueGet.toString();

          const fontSize = valueGet > 9 ? 16 : 18;
          image.text.richText[0].children[0].text = format;
          image.text.style.fontSize = fontSize;
        } else if (key === "fabula") {
          const format =
            valueGet > 9 ? valueGet.toString() : " " + valueGet.toString();
          image.text.richText[0].children[0].text = format;
        } else if (maxGet) {
          image.text.richText[0].children[0].text =
            valueGet.toString() + "/" + maxGet.toString();
        } else {
          image.text.richText[0].children[0].text = valueGet.toString();
        }
      }
    });
  };

  const toggleHR = () => {
    setUseHR(!useHR);
  };

  const setToPM = (user) => {
    if (role === "GM") {
      setText("[" + user + "]");
    }
  };

  function evaluateMath(str) {
    for (var i = 0; i < str.length; i++) {
      if (isNaN(str[i]) && !["+", "-", "/", "*"].includes(str[i])) {
        return NaN;
      }
    }

    try {
      return eval(str);
    } catch (e) {
      if (e.name !== "SyntaxError") throw e;
      return NaN;
    }
  }

  const rollInstance = (item, index) => {
    const HR =
      item.diceOneResult > item.diceTwoResult
        ? item.diceOneResult
        : item.diceTwoResult;
    return (
      <div className="roll-detail" style={{ textAlign: "center" }}>
        * {item.characterName ? `${item.characterName}` : item.user} Rolled{" "}
        <span style={{ color: "#FFF" }}>{item.result}</span>
        {item.diceOneResult} {item.diceLabelOne}
        {item.diceTwoResult !== 0 ? (
          <>{` + ${item.diceTwoResult} ${item.diceLabelTwo}`}</>
        ) : (
          ""
        )}
        {!isNaN(parseInt(item.bonus)) && parseInt(item.bonus) !== 0
          ? (parseInt(item.bonus) > -1 ? " + " : " - ") + Math.abs(item.bonus)
          : ""}
        {(item.diceTwoResult !== 0 ||
          (!isNaN(parseInt(item.bonus)) && parseInt(item.bonus) !== 0)) &&
          ` = `}
        {item.diceTwoResult === 0 &&
          !isNaN(parseInt(item.bonus)) &&
          parseInt(item.bonus) !== 0 && (
            <span
              style={{
                marginRight: 2,
                marginLeft: 2,
                fontSize: 11,
              }}
            >
              {item.diceOneResult + item.bonus}
            </span>
          )}
        {item.diceTwoResult !== 0 && (
          <span
            style={{
              color:
                (item.diceOneResult + item.diceTwoResult + item.bonus) % 2 === 0
                  ? "lightgreen"
                  : "lightblue",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 11,
            }}
          >
            {item.diceOneResult + item.diceTwoResult + item.bonus}
          </span>
        )}
        {parseInt(item.damage) > 0
          ? (item.useHR ? ` HR: ${HR} ` : " ") + "DMG:"
          : ""}
        {parseInt(item.damage) > 0 ? (
          <span
            style={{
              color: "red",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 11,
            }}
          >
            {item.useHR ? HR + item.damage : item.damage}
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
          item.diceOneResult > 1 && <span style={{ color: "orange" }}>*</span>}
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
  };

  const getImage = (str) => {
    return str.substring(str.indexOf("<") + 1, str.lastIndexOf(">"));
  };

  const ChatInstance = (props) => {
    let propsString = JSON.stringify(props);
    const imageURL = getImage(propsString);

    if (imageURL) {
      propsString = propsString.replace("<" + imageURL + ">", "");
    }

    const { item, index } = JSON.parse(propsString);

    if (item.skillName) {
      return (
        <div style={{ marginTop: 4 }}>
          <div className="outline">
            <div onClick={() => setToPM(item.user)}>
              {item.user} ({item.characterName})
            </div>
          </div>
          <div className="skill-detail">
            <div style={{ fontSize: 13, color: "darkorange" }}>
              {item.skillName}
            </div>
            <div style={{ color: "darkgrey" }}>{item.info}</div>
            <hr
              style={{
                marginTop: 4,
                marginBottom: 4,
                borderColor: "grey",
                backgroundColor: "grey",
                color: "grey",
              }}
            ></hr>
            <div>{item.detail}</div>
            {item.diceOneResult && rollInstance(item, index)}
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  marginLeft: "auto",
                  marginRight: "auto",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        </div>
      );
    }

    if (item.message || imageURL) {
      if (item.message.charAt(0) === "=") {
        const mathToEvaluate = item.message.substring(1, item.message.length);
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: "#D2691E" }}>
              {mathToEvaluate + " = " + evaluateMath(mathToEvaluate)}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        );
      }

      if (item.user === name) {
        return (
          <div className="outline" style={{ textAlign: "right", marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisperTarget ? " - " + item.whisperTarget : ""}
              {item.whisper ? "*" : ""}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                  marginLeft: "auto",
                }}
              ></div>
            )}
          </div>
        );
      }

      if (!item.whisper || role === "GM") {
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisper ? "*" : ""}
            </span>
            {imageURL && (
              <div
                style={{
                  backgroundImage: `url(${imageURL})`,
                  backgroundSize: "cover",
                  height: 150,
                  width: 200,
                  overflow: "hidden",
                  borderRadius: 5,
                }}
              ></div>
            )}
          </div>
        );
      }

      if (item.whisper && item.whisperTarget === name) {
        return (
          <div className="outline" style={{ marginTop: 4 }}>
            <div onClick={() => setToPM(item.user)}>{item.user}</div>
            <span style={{ color: item.whisper ? "violet" : "#FFF" }}>
              {item.whisper ? "*" : ""}
              {item.message}
              {item.whisper ? "*" : ""}
            </span>
          </div>
        );
      }
      return "";
    } else {
      return rollInstance(item, index);
    }
  };

  const savePrepareDice = () => {
    if (preparedDice.length > 1) preparedDice.pop();
    const newPreparedDice = [...preparedDice];
    newPreparedDice.unshift({
      diceLabelOne,
      diceLabelTwo,
      damage,
      bonus,
      skillName,
      characterName,
      useHR,
    });

    setPreparedDice(newPreparedDice);
  };

  const clearPreparedDice = () => {
    setCharacterName("");
    setPlayer(null);
    setPreparedDice([]);
    clearAllDice();
  };

  useEffect(() => {
    OBR.onReady(async () => {
      OBR.scene.onReadyChange(async (ready) => {
        if (ready) {
          const metadata = await OBR.scene.getMetadata();
          if (metadata["ultimate.story.extension/metadata"]) {
            setMetadata(metadata["ultimate.story.extension/metadata"]);
          }

          if (metadata["last.fable.extension/metadata"]) {
            const currentChat = await createChatArray(metadata);
            setChatToCheckChanges(currentChat);
          }

          setIsOBRReady(true);
          setTimeout(() => {
            var objDiv = document.getElementById("chatbox");
            if (objDiv) {
              objDiv.scrollTop = objDiv.scrollHeight;
            }
          }, 100);

          OBR.action.setBadgeBackgroundColor("orange");
          setName(await OBR.player.getName());
          setId(await OBR.player.getId());

          OBR.player.onChange(async (player) => {
            setName(await OBR.player.getName());
          });

          setRole(await OBR.player.getRole());
        } else {
          setIsOBRReady(false);
          setMetadata(false);
          setPlayer(null);
          setChat([]);
        }
      });
    });

    try {
      localStorage.getItem("last.fable.extension/rolldata");
    } catch {
      setCookiesNotEnabled(true);
    }
  }, []);

  const clearAllDice = () => {
    setDiceLabelOne("");
    setDiceLabelTwo("");
    setDiceOneResult(0);
    setDiceTwoResult(0);
    setDamage("");
    setBonus("");
    setInfo("");
    setSkillName("");
    setDetail("");
    if (player && player.isGMPlayer) {
      setCharacterName("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addMessage();
    }
  };

  const createChatArray = async (metadata) => {
    const metadataGet = metadata["last.fable.extension/metadata"];
    let messages = [];
    const keys = Object.keys(metadataGet);

    const playerId = await OBR.player.getId();
    setId(playerId);

    keys.forEach((key) => {
      messages = messages.concat(metadataGet[key]);
      if (key === playerId) {
        setMyChat(metadataGet[key]);
      }
    });

    return messages.sort((a, b) => a.id - b.id);
  };

  const checkForRolls = async (metadata) => {
    const rollData = metadata["ultimate.story.extension/sendroll"];
    setRollData(rollData);
  };

  const checkForSkills = async (metadata) => {
    const skillData = metadata["ultimate.story.extension/sendskill"];
    setSkillData(skillData);
  };

  const checkForCharacter = async (metadata) => {
    const characterData = metadata["ultimate.story.extension/sendcharacter"];
    setCharacterData(characterData);
  };

  useEffect(() => {
    try {
      localStorage.getItem("last.fable.extension/rolldata");
    } catch {
      setCookiesNotEnabled(true);
      return;
    }
    if (rollData) {
      if (rollData.userId === id) {
        const localRollData = JSON.parse(
          localStorage.getItem("last.fable.extension/rolldata")
        );

        if (localRollData) {
          if (localRollData.id !== rollData.id) {
            clearAllDice();
            rollSkillDice(rollData);
          }
        } else {
          rollSkillDice(rollData);
        }
        localStorage.setItem(
          "last.fable.extension/rolldata",
          JSON.stringify(rollData)
        );
      }
    }
  }, [rollData]);

  useEffect(() => {
    try {
      localStorage.getItem("last.fable.extension/rolldata");
    } catch {
      setCookiesNotEnabled(true);
      return;
    }
    if (skillData) {
      if (skillData.userId === id) {
        const localSkillData = JSON.parse(
          localStorage.getItem("last.fable.extension/skilldata")
        );

        if (localSkillData) {
          if (localSkillData.id !== skillData.id) {
            addSkillMessage(skillData);
          }
        } else {
          addSkillMessage(skillData);
        }
        localStorage.setItem(
          "last.fable.extension/skilldata",
          JSON.stringify(skillData)
        );
      }
    }
  }, [skillData]);

  const observePlayerList = async (metadata) => {
    const metadataGet = metadata["ultimate.story.extension/metadata"];
    setMetadata(metadataGet);
  };

  const [timeoutID, setTimeoutID] = useState(null);

  const updatePlayer = (playerGet) => {
    if (!timeoutID) {
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    } else {
      clearTimeout(timeoutID);
      const myTimeout = setTimeout(() => {
        savePlayer();
      }, 500);
      setTimeoutID(myTimeout);
    }
    setIgnoreFirstUpdate(true);
    setPlayer(playerGet);
  };

  const savePlayer = async () => {
    if (player) {
      const metadataData = await OBR.scene.getMetadata();
      const metadata = metadataData["ultimate.story.extension/metadata"];
      let metadataChange = { ...metadata };
      metadataChange[player.id] = { ...player, lastEdit: id + "-chat" };

      OBR.scene.setMetadata({
        "ultimate.story.extension/metadata": metadataChange,
      });
      setTimeoutID(null);
    }
  };

  useEffect(() => {
    if (player && !ignoreFirstUpdate) {
      if (metadata[player.id].lastEdit !== id + "-chat") {
        setPlayer(metadata[player.id]);
      }
    }
    if (ignoreFirstUpdate) {
      setIgnoreFirstUpdate(false);
    }
  }, [metadata]);

  useEffect(() => {
    if (player) {
      setDex(player.attributes.currentdex);
      setIns(player.attributes.currentins);
      setMig(player.attributes.currentmig);
      setWil(player.attributes.currentwil);
    }
  }, [player]);

  useEffect(() => {
    if (characterData) {
      if (characterData.userId === id) {
        setPlayer(metadata[characterData.characterID]);
        setCharacterName(characterData.characterName);
        setDex(characterData.dex);
        setIns(characterData.ins);
        setMig(characterData.mig);
        setWil(characterData.wil);
      }
    }
  }, [characterData]);

  useEffect(() => {
    if (chatToCheckChanges.length !== chat.length) {
      setChat(chatToCheckChanges);
      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  }, [chatToCheckChanges]);

  useEffect(() => {
    if (isOBRReady) {
      OBR.scene.onMetadataChange(async (metadata) => {
        const currentChat = await createChatArray(metadata);
        setChatToCheckChanges(currentChat);
        observePlayerList(metadata);
      });

      OBR.room.onMetadataChange(async (metadata) => {
        checkForRolls(metadata);
        checkForSkills(metadata);
        checkForCharacter(metadata);
      });

      OBR.action.onOpenChange(async (isOpen) => {
        // React to the action opening or closing
        if (isOpen) {
          setUnreadCount(0);
          OBR.action.setBadgeText(undefined);
        }
      });

      try {
        localStorage.getItem("last.fable.extension/rolldata");
      } catch {
        setCookiesNotEnabled(true);
        return;
      }

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
      }
    }
  }, [isOBRReady]);

  useEffect(() => {
    const updateMessages = async () => {
      const lastMessage = chat[chat.length - 1];

      const isOpen = await OBR.action.isOpen();

      if (lastMessage && !cooldown && isOBRReady && !isOpen) {
        if (lastMessage.message) {
          if (!lastMessage.whisper || role === "GM") {
            OBR.notification.show(
              lastMessage.user +
                ": " +
                lastMessage.message +
                (lastMessage.whisper ? " (WHISPER)" : ""),
              "DEFAULT"
            );
          }
        } else if (lastMessage.diceOneResult) {
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
                ? " DMG: " +
                  (lastMessage.useHR
                    ? HR + lastMessage.damage
                    : lastMessage.damage)
                : ""),
            isCrit ? "WARNING" : isFumble ? "ERROR" : "INFO"
          );
          setCoolDown(true);
        }
        if (isOBRReady) {
          const isOpen = await OBR.action.isOpen();
          if (!isOpen) {
            if (!lastMessage.whisper || role === "GM") {
              if (
                lastMessage.message !== "/line" &&
                lastMessage.message !== "/newround"
              ) {
                setUnreadCount(unreadCount + 1);
                OBR.action.setBadgeText("" + (unreadCount + 1));
              }
            }
          }
        }
      }
      setTimeout(() => {
        setCoolDown(false);
      }, 4000);
    };

    if (isOBRReady) {
      updateMessages();
    }
  }, [chat]);

  function getSubstring(str, start, end) {
    const char1 = str.indexOf(start) + 1;
    const char2 = str.lastIndexOf(end);
    return str.substring(char1, char2);
  }

  const clearChat = async () => {
    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["last.fable.extension/metadata"];
    const keys = Object.keys(metadata);

    let clearedMetaData = { ...metadata };

    keys.forEach((key) => {
      clearedMetaData[key] = [];
    });

    OBR.scene.setMetadata({
      "last.fable.extension/metadata": clearedMetaData,
    });
  };

  const addMessage = async () => {
    if (text !== "") {
      if (role === "GM") {
        if (text.charAt(0) === "[") {
          const target = getSubstring(text, "[", "]");
          addWhisper(target);
          return;
        }

        if (text === "/clearchat") {
          clearChat();
          setText("");
          return;
        }
      }

      const newMessage = { id: Date.now(), user: name, message: text.trim() };
      const newChat = [...myChat, newMessage];

      const metadataGet = await OBR.scene.getMetadata();
      const metadata = metadataGet["last.fable.extension/metadata"];

      let metadataChange = { ...metadata };
      metadataChange[id] = newChat;

      OBR.scene.setMetadata({
        "last.fable.extension/metadata": metadataChange,
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  };

  const addWhisper = async (target) => {
    if (text !== "") {
      const message = target ? text.replace("[" + target + "]", "") : text;

      const newMessage = {
        id: Date.now(),
        user: name,
        message: message.trim(),
        whisper: true,
        whisperTarget: target,
      };
      const newChat = [...myChat, newMessage];

      const metadataGet = await OBR.scene.getMetadata();
      const metadata = metadataGet["last.fable.extension/metadata"];

      let metadataChange = { ...metadata };
      metadataChange[id] = newChat;

      OBR.scene.setMetadata({
        "last.fable.extension/metadata": metadataChange,
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  };

  const addSkillMessage = async (skill) => {
    const newMessage = {
      id: Date.now(),
      user: name,
      skillName: skill.skillName,
      characterName: skill.characterName,
      info: skill.info,
      detail: skill.detail,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["last.fable.extension/metadata"];

    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "last.fable.extension/metadata": metadataChange,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const rollPreparedDice = (index) => {
    const prepared = preparedDice[index];
    if (prepared.diceLabelOne != "") {
      const result1 = getRandomNumberByDice(prepared.diceLabelOne);
      setDiceOneResult(result1);
    }

    if (prepared.diceLabelTwo != "") {
      const result2 = getRandomNumberByDice(prepared.diceLabelTwo);
      setDiceTwoResult(result2);
    }

    setSkillName(prepared.skillName);
    setInfo(prepared.info);
    setDetail(prepared.detail);
    setUseHR(prepared.useHR);
    setDiceLabelOne(prepared.diceLabelOne);
    setDiceLabelTwo(prepared.diceLabelTwo);
    setDamage(prepared.damage);
    setBonus(prepared.bonus);
    setCharacterName(prepared.characterName);
  };

  const rollSkillDice = (roll) => {
    if (roll.diceLabelOne != "") {
      const result1 = getRandomNumberByDice(roll.diceLabelOne);
      setDiceOneResult(result1);
    }

    if (roll.diceTwo != "") {
      const result2 = getRandomNumberByDice(roll.diceLabelTwo);
      setDiceTwoResult(result2);
    }

    setSkillName(roll.skillName);
    setCharacterName(roll.characterName);
    setInfo(roll.info);
    setDetail(roll.detail);
    setDex(roll.dex);
    setIns(roll.ins);
    setMig(roll.mig);
    setWil(roll.wil);
    setUseHR(roll.useHR);
    setDiceLabelOne(roll.diceLabelOne);
    setDiceLabelTwo(roll.diceLabelTwo);
    setDamage(roll.damage);
    setBonus(roll.bonus);
    if (preparedDice.length > 1) preparedDice.pop();
    const newPreparedDice = [...preparedDice];
    newPreparedDice.unshift(roll);
    setPreparedDice(newPreparedDice);
  };

  const addRoll = async () => {
    const newMessage = {
      id: Date.now(),
      user: name,
      diceOneResult,
      diceTwoResult,
      diceLabelOne: role === "GM" ? "" : diceLabelOne,
      diceLabelTwo: role === "GM" ? "" : diceLabelTwo,
      damage,
      bonus,
      useHR,
      info,
      skillName,
      detail,
      characterName,
    };
    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["last.fable.extension/metadata"];
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "last.fable.extension/metadata": metadataChange,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const rollDiceOne = () => {
    if (diceLabelOne != "") {
      const result1 = getRandomNumberByDice(diceLabelOne);
      setDiceOneResult(result1);
    }
  };

  const rollDiceTwo = () => {
    if (diceLabelTwo != "") {
      const result2 = getRandomNumberByDice(diceLabelTwo);
      setDiceTwoResult(result2);
    }
  };

  const rollDice = () => {
    rollDiceOne();
    rollDiceTwo();
    savePrepareDice();
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
    if (dice === "D4") {
      return generateRandomNumber(4);
    }
    if (dice === "D6") {
      return generateRandomNumber(6);
    }
    if (dice === "D8") {
      return generateRandomNumber(8);
    }
    if (dice === "D10") {
      return generateRandomNumber(10);
    }
    if (dice === "D12") {
      return generateRandomNumber(12);
    }
    if (dice === "D20") {
      return generateRandomNumber(20);
    }
    if (dice === "DEX") {
      return generateRandomNumber(getDiceStat(dex));
    }
    if (dice === "INS") {
      return generateRandomNumber(getDiceStat(ins));
    }
    if (dice === "MIG") {
      return generateRandomNumber(getDiceStat(mig));
    }
    if (dice === "WIL") {
      return generateRandomNumber(getDiceStat(wil));
    }
  };

  const saveStats = (replace) => {
    localStorage.setItem(
      "last.fable.extension/metadata",
      JSON.stringify({
        dex,
        ins,
        mig,
        wil,
        damage,
        bonus,
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
      setBonus(parseInt(evt.target.value, ""));
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

  const setDice = (label) => {
    if (diceOneResult !== 0) {
      setDiceLabelOne(label.toUpperCase());
      setDiceLabelTwo("");
      setDiceOneResult(0);
      setDiceTwoResult(0);
    } else if (diceLabelOne === "") {
      setDiceLabelOne(label.toUpperCase());
    } else if (diceLabelTwo === "") {
      setDiceLabelTwo(label.toUpperCase());
    }
  };

  const Result = () => {
    const HR = diceOneResult > diceTwoResult ? diceOneResult : diceTwoResult;
    return (
      <div
        style={{
          marginLeft: 25,
          marginRight: 25,
          display: "flex",
          alignItems: "center",
        }}
        className="dice-result"
      >
        {diceOneResult} {diceLabelOne}
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
              {`+ ${diceTwoResult} ${diceLabelTwo}`}
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
          {!isNaN(parseInt(bonus)) && parseInt(bonus) !== 0
            ? (parseInt(bonus) > -1 ? " + " : " - ") + Math.abs(bonus)
            : ""}
          {` = `}
          <span
            style={{
              color:
                (diceOneResult + diceTwoResult + bonus) % 2 === 0
                  ? "lightgreen"
                  : "lightblue",
              marginRight: 2,
              marginLeft: 2,
              fontSize: 13,
            }}
          >
            {diceOneResult + diceTwoResult + bonus}
          </span>
          {parseInt(damage) > 0 ? (useHR ? `HR: ${HR} ` : " " + "DMG: ") : ""}
          {parseInt(damage) > 0 ? (
            <span
              style={{
                color: "red",
                marginRight: 2,
                marginLeft: 2,
                fontSize: 13,
              }}
            >
              {useHR ? HR + damage : damage}
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
        <span style={{ fontSize: 11 }}>Previous:</span>
        {preparedDice.map((item, index) => {
          return (
            <button
              key={index}
              className="button-dice"
              style={{ marginLeft: 5, width: "auto" }}
              onClick={() => {
                rollPreparedDice(index);
              }}
            >
              {item.skillName ? (
                <div style={{ padding: 4 }}>{item.skillName}</div>
              ) : (
                <>
                  【{item.diceLabelOne}
                  {item.diceLabelTwo ? " + " + item.diceLabelTwo : ""}
                  {!isNaN(parseInt(item.bonus)) && parseInt(item.bonus) !== 0
                    ? (parseInt(item.bonus) > -1 ? " + " : " - ") +
                      Math.abs(item.bonus)
                    : ""}
                  】{item.damage != "" ? "【HR +" + item.damage + "】" : ""}
                </>
              )}
            </button>
          );
        })}
      </Text>
    );
  };

  const RollInput = () => {
    const hasDice = diceLabelOne != "";
    return (
      <div
        style={{
          marginTop: 5,
          marginLeft: 25,
          marginRight: 30,
          display: "flex",
          alignItems: "center",
          minHeight: 25,
        }}
      >
        {hasDice && (
          <div className="dice-result">
            【{diceLabelOne}
            {diceLabelTwo != 0 ? " + " + diceLabelTwo : ""}
            {bonus != 0 ? (bonus > -1 ? " + " : " - ") + Math.abs(bonus) : ""}】
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
        {hasDice && (
          <button
            className="button-dice"
            style={{ marginLeft: 5 }}
            onClick={() => clearAllDice()}
          >
            Clear
          </button>
        )}
        {!hasDice && renderPreparedDice()}
      </div>
    );
  };

  const [windowInnerHeight, setWindowInnerHeight] = useState(
    window.innerHeight
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function autoResize() {
      setWindowInnerHeight(window.innerHeight);
    }

    window.addEventListener("resize", autoResize);

    // Return a function to disconnect the event listener
    return () => window.removeEventListener("resize", autoResize);
  }, []);

  if (cookiesNotEnabled) {
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
        <div
          style={{
            paddingLeft: 30,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            Error:
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to enable 3rd Party cookies for this extention to work.
            This is because some chat data is stored in the browser localstorage
            that enables to cache some user data and settings.
          </div>
        </div>
      </div>
    );
  }

  if (!isOBRReady) {
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
        <div
          style={{
            paddingLeft: 30,
            paddingRight: 20,
            paddingTop: 40,
          }}
        >
          <div className="outline" style={{ color: "red", font: 14 }}>
            No Scene found.
          </div>
          <div className="outline" style={{ fontSize: 14 }}>
            You need to load a scene to enable the chat and dice roller. If a
            scene is already loaded, kindly refresh the page.
          </div>
        </div>
      </div>
    );
  }

  const renderRoller = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 30,
          paddingRight: 20,
          paddingTop: 20,
        }}
      >
        <div>
          <div
            style={{ display: "flex", flexDirection: "row", marginRight: 2 }}
          >
            <div style={{ width: 52 }}>
              <select
                style={{
                  backgroundColor: "#333",
                  color: "#ffd433",
                  fontSize: 12,
                  padding: 1,
                  borderRadius: 3,
                  border: "1px solid #222",
                }}
                value={dex}
                onChange={changeDex}
              >
                <option value="d12">d12</option>
                <option value="d10">d10</option>
                <option value="d8">d8</option>
                <option value="d6">d6</option>
              </select>
              <button className="button-dice" onClick={() => setDice("dex")}>
                DEX
              </button>
            </div>
            <div style={{ width: 52 }}>
              <select
                style={{
                  backgroundColor: "#333",
                  color: "#ffd433",
                  fontSize: 12,
                  padding: 1,
                  borderRadius: 3,
                  border: "1px solid #222",
                }}
                value={ins}
                onChange={changeIns}
              >
                <option value="d12">d12</option>
                <option value="d10">d10</option>
                <option value="d8">d8</option>
                <option value="d6">d6</option>
              </select>
              <button className="button-dice" onClick={() => setDice("ins")}>
                INS
              </button>
            </div>
            <div style={{ width: 52 }}>
              <select
                style={{
                  backgroundColor: "#333",
                  color: "#ffd433",
                  fontSize: 12,
                  padding: 1,
                  borderRadius: 3,
                  border: "1px solid #222",
                }}
                value={mig}
                onChange={changeMig}
              >
                <option value="d12">d12</option>
                <option value="d10">d10</option>
                <option value="d8">d8</option>
                <option value="d6">d6</option>
              </select>
              <button className="button-dice" onClick={() => setDice("mig")}>
                MIG
              </button>
            </div>
            <div style={{ width: 52 }}>
              <select
                style={{
                  backgroundColor: "#333",
                  color: "#ffd433",
                  fontSize: 12,
                  padding: 1,
                  borderRadius: 3,
                  border: "1px solid #222",
                }}
                value={wil}
                onChange={changeWil}
              >
                <option value="d12">d12</option>
                <option value="d10">d10</option>
                <option value="d8">d8</option>
                <option value="d6">d6</option>
              </select>
              <button className="button-dice" onClick={() => setDice("wil")}>
                WIL
              </button>
            </div>
            <div style={{ width: 45, marginLeft: 3 }}>
              <button
                className="button-dice"
                onClick={() => clearPreparedDice()}
                style={{ backgroundColor: "#6F0509", color: "#F7E7CE" }}
              >
                Reset
              </button>
              <button className="button-dice" onClick={() => toggleHR()}>
                {useHR ? "With HR" : "No HR"}
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 5,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span className="dice-result">Modifier:</span>
            <input
              className="input-stat"
              type="number"
              style={{
                width: 20,
                color: "lightblue",
              }}
              value={bonus}
              onChange={changeBonus}
            />
            <span className="dice-result" style={{ marginLeft: 6 }}>
              Damage:
            </span>
            <input
              className="input-stat"
              type="number"
              style={{
                width: 20,
                color: "red",
              }}
              value={damage}
              onChange={changeDamage}
            />
            <span className="checkbox-container"></span>
          </div>
        </div>

        <div style={{ marginLeft: 3 }}>
          <div>
            <button
              className="button-dice"
              style={{ marginRight: 2 }}
              onClick={() => setDice("d4")}
            >
              d4
            </button>
            <button className="button-dice" onClick={() => setDice("d6")}>
              d6
            </button>
          </div>
          <div>
            <button
              className="button-dice"
              style={{ marginRight: 2 }}
              onClick={() => setDice("d8")}
            >
              d8
            </button>
            <button className="button-dice" onClick={() => setDice("d10")}>
              d10
            </button>
          </div>
          <div>
            <button
              className="button-dice"
              style={{ marginRight: 2 }}
              onClick={() => setDice("d12")}
            >
              d12
            </button>
            <button className="button-dice" onClick={() => setDice("d20")}>
              d20
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getDiceStat = (dice) => {
    if (dice === "d6") {
      return 6;
    }
    if (dice === "d8") {
      return 8;
    }
    if (dice === "d10") {
      return 10;
    }
    if (dice === "d12") {
      return 12;
    }
  };

  const getCurrentAttribute = (attr) => {
    if (attr == "dex") {
      let stat = getDiceStat(player.attributes.dex);
      if (player.debuff.slow) {
        stat = stat - 2;
      }
      if (player.debuff.enraged) {
        stat = stat - 2;
      }
      if (stat < 6) stat = 6;
      return "d" + stat;
    }
    if (attr == "ins") {
      let stat = getDiceStat(player.attributes.ins);
      if (player.debuff.dazed) {
        stat = stat - 2;
      }
      if (player.debuff.enraged) {
        stat = stat - 2;
      }
      if (stat < 6) stat = 6;
      return "d" + stat;
    }
    if (attr == "mig") {
      let stat = getDiceStat(player.attributes.mig);
      if (player.debuff.weak) {
        stat = stat - 2;
      }
      if (player.debuff.poisoned) {
        stat = stat - 2;
      }
      if (stat < 6) stat = 6;
      return "d" + stat;
    }
    if (attr == "wil") {
      let stat = getDiceStat(player.attributes.wil);
      if (player.debuff.shaken) {
        stat = stat - 2;
      }
      if (player.debuff.poisoned) {
        stat = stat - 2;
      }
      if (stat < 6) stat = 6;
      return "d" + stat;
    }
  };

  const conditionButton = (stat, condition) => {
    return (
      <button
        className="button"
        style={{
          marginRight: 4,
          marginTop: 4,
          fontSize: 10,
          width: 53,
          textTransform: "capitalize",
          backgroundColor: player.debuff[condition] ? "darkred" : "#222",
          color: player.debuff[condition] ? "white" : "#ffd433",
        }}
        onClick={() => {
          const playerGet = { ...player };
          playerGet.debuff[condition] = !player.debuff[condition];
          playerGet.attributes["current" + stat] = getCurrentAttribute(stat);
          if (!playerGet.stats.martialDef) {
            playerGet.stats.defense =
              parseInt(playerGet.stats.defenseMod) +
              getDiceStat(playerGet.attributes.currentdex);
            if (playerGet.linkedStats) {
              updateNoteItem(
                playerGet.linkedStats.defense,
                playerGet.stats.defense,
                "defense"
              );
            }
          }
          playerGet.stats.mDefense =
            parseInt(playerGet.stats.mDefenseMod) +
            getDiceStat(playerGet.attributes.currentins);
          if (playerGet.linkedStats) {
            updateNoteItem(
              playerGet.linkedStats.mDefense,
              playerGet.stats.mDefense,
              "mDefense"
            );
          }
          updatePlayer(playerGet);
        }}
      >
        {condition}
      </button>
    );
  };

  const renderCharacter = () => {
    const stats = ["dex", "ins", "mig", "wil"];
    return (
      <div
        style={{
          paddingLeft: 30,
          paddingRight: 20,
          paddingTop: 15,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginTop: 1,
          }}
        >
          <Text>Name: </Text>
          <div
            className="outline"
            style={{
              width: 100,
              textAlign: "center",
              borderBottom: "1px solid #222",
              marginRight: 4,
              color: "orange",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "inline-block",
              paddingLeft: 4,
              fontSize: 10,
            }}
          >
            {characterName}
          </div>
          <Text>HP:</Text>
          <input
            className="input-stat"
            type="number"
            style={{
              width: 20,
              color: "Red",
            }}
            onChange={(evt) => {
              const playerGet = { ...player };
              const maxHP = player.stats.maxHP;
              let value = parseInt(evt.target.value, 0);

              if (!isNaN(value)) {
                playerGet.stats.currentHP = maxHP > value ? value : maxHP;
              } else {
                playerGet.stats.currentHP = value;
              }

              if (playerGet.linkedStats) {
                updateNoteItem(
                  playerGet.linkedStats.currentHP,
                  playerGet.stats.currentHP,
                  "currentHP",
                  maxHP
                );
              }

              updatePlayer(playerGet);
            }}
            value={player.stats.currentHP}
          />
          <Text>MP: </Text>
          <input
            className="input-stat"
            type="number"
            style={{
              width: 20,
              color: "LightBlue",
            }}
            onChange={(evt) => {
              const playerGet = { ...player };
              const maxMP = player.stats.maxMP;
              let value = parseInt(evt.target.value, 0);

              if (!isNaN(value)) {
                playerGet.stats.currentMP = maxMP > value ? value : maxMP;
              } else {
                playerGet.stats.currentMP = value;
              }

              if (playerGet.linkedStats) {
                updateNoteItem(
                  playerGet.linkedStats.currentMP,
                  playerGet.stats.currentMP,
                  "currentMP",
                  maxMP
                );
              }

              updatePlayer(playerGet);
            }}
            value={player.stats.currentMP}
          />
          <Text>IP: </Text>
          <input
            className="input-stat"
            type="number"
            style={{
              width: 20,
              color: "Orange",
            }}
            onChange={(evt) => {
              const playerGet = { ...player };
              const maxIP = player.stats.maxIP;

              let value = parseInt(evt.target.value, 0);
              if (!isNaN(value)) {
                playerGet.stats.currentIP = maxIP > value ? value : maxIP;
              } else {
                playerGet.stats.currentIP = value;
              }
              if (playerGet.linkedStats) {
                updateNoteItem(
                  playerGet.linkedStats.currentIP,
                  playerGet.stats.currentIP,
                  "currentIP"
                );
              }

              updatePlayer(playerGet);
            }}
            value={player.stats.currentIP}
          />
          <Text>FP: </Text>
          <input
            className="input-stat"
            type="number"
            style={{
              width: 20,
              color: "white",
            }}
            onChange={(evt) => {
              const playerGet = { ...player };
              playerGet.stats.fabula = parseInt(evt.target.value);
              if (playerGet.linkedStats) {
                updateNoteItem(
                  playerGet.linkedStats.fabula,
                  playerGet.stats.fabula,
                  "fabula"
                );
              }
              updatePlayer(playerGet);
            }}
            value={player.stats.fabula}
          />
        </div>
        <div>
          {conditionButton("dex", "slow")}
          {conditionButton("ins", "dazed")}
          {conditionButton("mig", "weak")}
          {conditionButton("wil", "shaken")}
          <button
            className="button"
            style={{
              marginRight: 4,
              marginTop: 4,
              fontSize: 10,
              width: 53,
              textTransform: "capitalize",
              backgroundColor: player.debuff.enraged ? "darkred" : "#222",
              color: player.debuff.enraged ? "white" : "#ffd433",
            }}
            onClick={() => {
              const playerGet = { ...player };
              playerGet.debuff.enraged = !player.debuff.enraged;
              playerGet.attributes["currentdex"] = getCurrentAttribute("dex");
              playerGet.attributes["currentins"] = getCurrentAttribute("ins");
              if (!playerGet.stats.martialDef) {
                playerGet.stats.defense =
                  parseInt(playerGet.stats.defenseMod) +
                  getDiceStat(playerGet.attributes.currentdex);
                if (playerGet.linkedStats) {
                  updateNoteItem(
                    playerGet.linkedStats.defense,
                    playerGet.stats.defense,
                    "defense"
                  );
                }
              }

              playerGet.stats.mDefense =
                parseInt(playerGet.stats.mDefenseMod) +
                getDiceStat(playerGet.attributes.currentins);
              if (playerGet.linkedStats) {
                updateNoteItem(
                  playerGet.linkedStats.mDefense,
                  playerGet.stats.mDefense,
                  "mDefense"
                );
              }
              updatePlayer(playerGet);
            }}
          >
            Enraged
          </button>
          <button
            className="button"
            style={{
              marginRight: 4,
              marginTop: 4,
              fontSize: 10,
              width: 53,
              textTransform: "capitalize",
              backgroundColor: player.debuff.poisoned ? "darkred" : "#222",
              color: player.debuff.poisoned ? "white" : "#ffd433",
            }}
            onClick={() => {
              const playerGet = { ...player };
              playerGet.debuff.poisoned = !player.debuff.poisoned;
              playerGet.attributes["currentmig"] = getCurrentAttribute("mig");
              playerGet.attributes["currentwil"] = getCurrentAttribute("wil");
              updatePlayer(playerGet);
            }}
          >
            Poisoned
          </button>
        </div>
        <div style={{ marginTop: 4, marginRight: 8, marginBottom: 4 }}>
          {stats.map((item, index) => {
            return (
              <button
                className="button-dice"
                style={{ marginRight: 4, width: 45 }}
                onClick={() => {
                  setDice(item);
                  setDamage(0);
                }}
                key={index}
              >
                {item.toUpperCase()}
              </button>
            );
          })}
          <span style={{ display: "inline-block" }}>
            <Text>Modifier:</Text>
            <input
              className="input-stat"
              type="number"
              style={{
                width: 20,
                color: "lightblue",
              }}
              value={bonus}
              onChange={(evt) => {
                if (evt.target.value != "") {
                  setBonus(parseInt(evt.target.value, ""));
                  saveStats({ bonus: parseInt(evt.target.value) });
                } else {
                  setBonus("");
                  saveStats({ bonus: "" });
                }
              }}
            />
          </span>
          <button
            className="button-dice"
            style={{
              marginRight: 4,
              width: 40,
              color: "red",
              float: "right",
              marginTop: 2,
            }}
            onClick={() => {
              clearPreparedDice();
            }}
          >
            Close
          </button>
        </div>
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
      {player && !player.isGMPlayer ? renderCharacter() : renderRoller()}
      {diceOneResult !== 0 ? <Result /> : <RollInput />}
      <div
        style={{
          marginLeft: 25,
          marginRight: 30,
          marginTop: 10,
          height: "100%",
        }}
      >
        <div
          id="chatbox"
          className="scrollable-container"
          style={{
            backgroundColor: "#333",
            padding: 10,
            overflow: "scroll",
            height: windowInnerHeight - 280,
            border: "1px solid #222",
          }}
        >
          {chat.length
            ? chat.map((item, index) => (
                <ChatInstance key={index} item={item} index={index} />
              ))
            : ""}
        </div>
        <div style={{ marginTop: 5, display: "flex", alignItems: "center" }}>
          <input
            id="chatbox"
            style={{
              color: "#FFF",
              width: 280,
              height: 24,
              marginRight: 2,
              paddingLeft: 4,
              backgroundColor: "#333",
              fontSize: 12,
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
              height: 32,
              fontSize: 10,
              padding: 0,
              color: "#ffd433",
              backgroundColor: "#222",
              marginTop: -2,
            }}
            onClick={() => addWhisper()}
          >
            Whisper GM
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
