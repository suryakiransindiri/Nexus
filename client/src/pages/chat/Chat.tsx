/* eslint-disable @typescript-eslint/no-explicit-any */
import Page from "components/Page";
import "./chat.css";
import { setSnack } from "src/redux/reducers/snack.reducer";
import axios from "axios";
import { useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/redux/hooks";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { get, uniqBy } from "lodash";
import moment from "moment";
import { Icon } from "@iconify/react";

export default function Chat() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [activeUser, setActiveUser] = useState("");
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const { user, socket, chats } = useAppSelector((state) => ({
    user: state.auth.user,
    chats: state.chats.chats,
    socket: state.socket.socket,
  }));

  const [chatMessage, setChatMessage] = useState("");
  const [media, setMedia] = useState<any>(null);

  const handleActiveUser = async (email: string) => {
    setActiveUser(email);
    navigate(`/chat?selected=${email}`);
    if (socket) {
      socket.emit("get-messages-request", {
        sender: user?.email,
        receiver: email,
      });
    }
  };

  function convertFileToDataURL(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleChatMessage(data: any) {
    let chatObj: any = {
      sender: user?.email,
      receiver: activeUser,
      message: data,
      type: "text",
    };
    if (media) {
      chatObj = {
        ...chatObj,
        media: {
          type: media?.type,
          file: media?.file,
          name: media?.file?.name,
        },
        type: media?.type?.includes("image")
          ? "image"
          : media?.type?.includes("video")
          ? "video"
          : "text",
      };
      try {
        const formData = new FormData();
        formData.append("file", media.file);
        const backendServer = `${import.meta.env.VITE_express_server}`;
        const { data } = await axios.post(`${backendServer}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        chatObj = {
          ...chatObj,
          type: media.type,
          media: data.fileUrl,
        };
      } catch (error: any) {
        dispatch(
          setSnack({ type: "error", message: error.message, open: true })
        );
      }
    }
    socket?.emit("send-message-request", chatObj);
    setChatMessage("");
    setShowMediaDialog(false);
    setMedia(null);
  }
  const previewImg =
    "https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg";
  const activeUserDetails = useMemo(() => {
    return user?.friends.find((friend) => friend.email === activeUser);
  }, [activeUser, user?.friends]);
  return (
    <Page title="chat">
      <Modal
        maxWidth="sm"
        fullWidth
        show={showMediaDialog}
        onHide={() => {
          setShowMediaDialog(false);
          setMedia(null);
        }}
      >
        <Modal.Header>
          <Modal.Title>Upload media</Modal.Title>
        </Modal.Header>
        {media && (
          <>
            {media.type.includes("image") ? (
              <img src={media.url} width="100%" height={300} />
            ) : (
              <video src={media.url} width="100%" height={300} controls></video>
            )}
          </>
        )}
        <input
          className="form-control p-3"
          id="textAreaExample2"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChatMessage(get(e, "target.value", ""));
            }
          }}
          placeholder="Type a message"
        />
      </Modal>
      <div className="container-fluid h-100">
        <div className="row justify-content-center h-100">
          <div className="col-md-4 col-xl-3 chat">
            <div className="card mb-sm-3 mb-md-0 contacts_card">
              <div className="card-body contacts_body">
                <ul className="contacts" style={{ minHeight: 500 }}>
                  {user?.friends.map((friend) => (
                    <li
                      key={friend._id}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleActiveUser(friend.email)}
                    >
                      <div className="d-flex bd-highlight">
                        <div className="">
                          <img
                            src={friend.photoURL || previewImg}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 50,
                            }}
                          />
                        </div>
                        <div className="user_info">
                          <span>{friend.displayName}</span>
                          <p>{friend.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer"></div>
            </div>
          </div>
          <div className="col-md-8 col-xl-6 chat">
            <div className="card">
              <div
                className="card-header msg_head"
                style={{
                  display: activeUser ? "flex" : "none",
                }}
              >
                <div className="d-flex bd-highlight border-bottom">
                  <div className="">
                    <img
                      src={activeUserDetails?.photoURL || previewImg}
                      className="user_img"
                      style={{ width: 50, height: 50, borderRadius: 50 }}
                    />
                  </div>
                  <div className="user_info">
                    <span>Chat with {activeUserDetails?.displayName}</span>
                    <p>{chats.length} Messages</p>
                  </div>
                </div>
              </div>
              <div
                className="card-body msg_card_body"
                style={{ maxHeight: 500, minHeight: 500, overflowY: "auto" }}
              >
                {uniqBy(chats, "_id").map((chat) =>
                  chat.sender === user?.email ? (
                    <div className="d-flex justify-content-start mb-4">
                      <div className="img_cont_msg">
                        <img
                          src={user?.photoURL || previewImg}
                          className="user_img_msg"
                          style={{ borderRadius: 50 }}
                        />
                      </div>
                      <div className="msg_cotainer">
                        <p className="m-0">{chat.message}</p>
                        {chat.media && chat.type.includes("image") && (
                          <img
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            src={chat.media}
                            alt={chat.message}
                          />
                        )}
                        {chat.media && chat.type.includes("video") && (
                          <video
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            controls
                            src={chat.media}
                          />
                        )}
                        <span className="msg_time" style={{ minWidth: 200 }}>
                          {moment(chat.timestamp).format("hh:mm, DD MMM")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-end mb-4">
                      <div className="msg_cotainer_send">
                        <p className="m-0">{chat.message}</p>
                        {chat.media && chat.type.includes("image") && (
                          <img
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            src={chat.media}
                            alt={chat.message}
                          />
                        )}
                        {chat.media && chat.type.includes("video") && (
                          <video
                            style={{
                              width: 200,
                              height: 200,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                            controls
                            src={chat.media}
                          />
                        )}
                        <span
                          className="msg_time_send"
                          style={{ minWidth: 200, textAlign: "right" }}
                        >
                          {moment(chat.timestamp).format("hh:mm, DD MMM")}
                        </span>
                      </div>
                      <div className="img_cont_msg">
                        <img
                          src={activeUserDetails?.photoURL || previewImg}
                          style={{ borderRadius: 50 }}
                          className="user_img_msg"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="card-footer">
                <div className="form-outline">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image"
                    onChange={async (e) => {
                      const file: any = get(e, "target.files[0]", null);
                      if (file) {
                        const url = await convertFileToDataURL(file);
                        setMedia({
                          url,
                          type: file.type,
                          file,
                        });
                        setShowMediaDialog(true);
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    style={{ display: "none" }}
                    id="video"
                    onChange={async (e) => {
                      const file: any = get(e, "target.files[0]", null);
                      try {
                        if (file) {
                          const url = await convertFileToDataURL(file);
                          setMedia({
                            url,
                            type: file.type,
                            file,
                          });
                          setShowMediaDialog(true);
                        }
                      } catch (error: any) {
                        console.log(error.message);
                      }
                    }}
                    onAbort={(e) => {
                      console.log(e);
                    }}
                  />
                  <div className="d-flex mb-2">
                    <button
                      className="border-0"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Icon
                        style={{ fontSize: 24 }}
                        icon="mingcute:video-fill"
                      />
                    </button>
                    <button
                      className="border-0 ms-2"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Icon style={{ fontSize: 24 }} icon="ic:outline-image" />
                    </button>
                  </div>
                  <input
                    className="form-control p-3"
                    id="textAreaExample2"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleChatMessage(get(e, "target.value", ""));
                      }
                    }}
                    placeholder="Type a message"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
