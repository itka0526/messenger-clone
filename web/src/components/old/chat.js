//Sat 5 Feb 23:00
// function OldNavbar(props) {
//     const [list, setList] = useState([]);

//     const [customCSSforSelectedItem, setCustomCSSforSelectedItem] =
//         useState(null);
//     useEffect(() => {
//         if (!props.socket) return;
//         function Restore(rooms) {
//             return setList([...rooms]);
//         }
//         props.socket.on("FROM_SERVER_RESTORE", Restore);
//         return () => props.socket.on("FROM_SERVER_RESTORE", Restore);
//     }, [props.socket]);
//     const activeRoom = useRef({ elements: [] });
//     //handle create join requests
//     function isRecieved(boolean, roomID) {
//         if (boolean) setList((prev) => [...prev, roomID]);
//     }

//     async function universal(option) {
//         if (!props.socket) return;
//         let id;
//         function rand32genV1() {
//             let gen = [];
//             for (let i = 0; i < 32; i++) {
//                 gen[i] = Math.floor(Math.random() * 10);
//             }
//             const string = `${gen.join("")}`;
//             return string;
//         }
//         if (option) {
//             id = rand32genV1();
//             props.socket.emit("createJoinRoom", id, isRecieved);

//             return;
//         } else if (option === false) {
//             id = props.room;
//             if (typeof id === "string" || typeof id === "number") {
//                 props.socket.emit("createJoinRoom", id, isRecieved);
//             }
//             return;
//         }
//     }

//     function selectedRoomFunction(idx) {
//         const SELECTED_ROOM = activeRoom.current.elements[idx].dataset.val;
//         props.setSelectedRoom(SELECTED_ROOM);
//         setCustomCSSforSelectedItem(idx);
//     }
//     return (
//         <div className="navbar-container">
//             <div className="navbar-control flex-items">
//                 <button onClick={() => universal(true)}>create</button>
//                 <button onClick={() => universal(false)}>join</button>
//                 <input onChange={(e) => props.genRoom(e.target.value)}></input>
//             </div>

//             <div className="list flex-items">
//                 <div>
//                     {list.map((room, idx) => {
//                         return (
//                             <div
//                                 className="list-child"
//                                 data-val={room}
//                                 ref={(element) => {
//                                     if (element === null) return;
//                                     activeRoom.current.elements[idx] = element;
//                                 }}
//                                 onClick={() => selectedRoomFunction(idx)}
//                                 key={`${idx}-div`}
//                                 style={
//                                     customCSSforSelectedItem === idx
//                                         ? { background: "#f1f2f3" }
//                                         : null
//                                 }
//                             >
//                                 {room}
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function reducer(state, action) {
//     switch (action.type) {
//         case "new":
//             const { ROOM, messages } = action;
//             console.log("new");
//             return { ...state, ...{ [ROOM]: { messages } } };
//         case "add":
//             //duplicate {sender, message, date} because of react strict mode;
//             console.log("add func ran");
//             const { roomID, sender, message, date } = action;

//             // return (state[roomID]["messages"] = [
//             //     ...state[roomID]["messages"],
//             //     { sender, message, date },
//             // ])
//             return state[roomID]["messages"]
//                 ? state[roomID]["messages"].push({ sender, message, date })
//                 : null;
//         default:
//             return state;
//     }
// }

// function OldMainChat() {
//     const [socket, setSocket] = useState();

//     const [room, genRoom] = useState("");
//     const [selectedRoom, setSelectedRoom] = useState("");

//     const [currentMessage, setCurrentMessage] = useState("");
//     const [chat, dispatch] = useReducer(reducer, {});
//     const [subChat, setSubChat] = useState([]);

//     const [alreadyRequestedRooms, setRequestedRooms] = useState([]);

//     // const location = useLocation();
//     // const [searchParams, setSearchParams] = useSearchParams();
//     //initaite ws
//     useEffect(() => {
//         async function RequestUserCreds() {
//             const response = await fetch("/getUserCredentials");
//             const json_reponse = await response.json();
//             if (!response) return;
//             const ws = io("http://localhost:4000", {
//                 auth: {
//                     json_reponse,
//                 },
//             });
//             setSocket(ws);
//         }
//         RequestUserCreds();
//     }, []);
//     {
//         /*
//     handle incoming
//     useEffect(() => {
//         if (!socket) return;
//         function GetOldData(object) {
//             const { ROOM, messages } = object;
//             for (let i = 0; i < messages.length; i++) {
//                 messages[i].roomID = ROOM;
//                 setChat((prev) => [...prev, messages[i]]);
//             }
//         }
//         socket.on("FROM_SERVER_GET_OLD_CHAT", GetOldData);
//         return () => socket.on("FROM_SERVER_GET_OLD_CHAT", GetOldData);
//     }, [socket]);*/
//     }

//     async function FetchRoomSChat() {
//         if (!selectedRoom) return;
//         console.info("fetching room's chat");

//         const pending_respone = await fetch(`/api/v1/messages/${selectedRoom}`);
//         const response = await pending_respone.json();
//         dispatch({ type: "new", ...response });
//         setRequestedRooms((prev) => [...prev, response.ROOM]);
//         setSubChat([...response.messages]);
//     }

//     function ChachedRoomSChat() {
//         console.info("returning cachedChat\n", chat);
//         setSubChat([...chat[selectedRoom]["messages"]]);
//     }
//     useEffect(() => {
//         const req_or_not = alreadyRequestedRooms.some(
//             (room) => room === selectedRoom
//         );
//         req_or_not ? ChachedRoomSChat() : FetchRoomSChat();
//     }, [selectedRoom]);
//     useEffect(() => {
//         if (!socket) return;
//         function Incoming(object) {
//             //set chat
//             console.log("INCOMING CALLED!");
//             dispatch({ type: "add", ...object });
//             //set subchat for ws
//             const { roomID, sender, message, date } = object;
//             // suspect culprit -->  setSubChat((prev) => [...prev, { sender, message, date }]);
//             //CHANGING!
//             //user joined in multiple rooms(socket io) so the chat is listening for all the chat from server
//             //make it so that chat listens if the current room is the same as the server's sent roomID
//             //why selectedRoom === null
//             //setChat((prev) => ({}));
//         }
//         socket.on("FROM_SERVER", Incoming);
//         return () => socket.on("FROM_SERVER", Incoming);
//     }, [socket]);

//     function send() {
//         if (!socket) return;
//         socket.emit("FROM_CLIENT", {
//             roomID: selectedRoom,
//             message: currentMessage,
//             date: new Date(),
//         });
//         setCurrentMessage("");
//     }
//     //MAKE LOCALSTORAGE THING WHERE USER CAN STORE CHATS because its replicating chats
//     //HANDLING OF ERASING PREVIOUS ROOM'S CHAT IS EACH MESSAGE HAS ROOMID IF DIFFERENT ROOMID IT DOES NOT RENDER!

//     return (
//         <div className="main-container">
//             <div className="flex-child">
//                 <Navbar
//                     socket={socket}
//                     room={room}
//                     genRoom={genRoom}
//                     selectedRoom={selectedRoom}
//                     setSelectedRoom={setSelectedRoom}
//                     //setChat={setChat}
//                 />
//             </div>
//             <div className="flex-child chat-container">
//                 <div className="sub-flex">
//                     {subChat.map((item, idx) => {
//                         return (
//                             <div key={idx} className="user-message-container ">
//                                 <h5 className="user-container">
//                                     {item.sender}
//                                 </h5>
//                                 <h3 className="message-container">
//                                     {item.message}
//                                 </h3>
//                                 <h5 className="user-container">{item.date}</h5>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 <div className="sub-flex messenger">
//                     <input
//                         className="sender-text-field"
//                         value={currentMessage}
//                         onChange={(e) => setCurrentMessage(e.target.value)}
//                     ></input>
//                     <button className="sender-button" onClick={() => send()}>
//                         send
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import Navbar from "./navbar";
// import { io } from "socket.io-client";

// export default function Chat() {
//   const [rooms, addRooms] = useState([]);

//   const [socket, setSocket] = useState();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [user, setUser] = useState("");
//   const [textField, setTextField] = useState("");
//   const history = useNavigate();

//   const [chat, setChat] = useState([]);
//   const [currentRoomID, setCurrentRoomID] = useState();

//   useEffect(() => {
//     const username = searchParams.get("n");
//     setUser(username);
//     //if username empty redir to register page!
//     if (!username) history("/");
//     //set a connection
//     const ws = io("http://localhost:4000");
//     setSocket(ws);
//     ws.emit("new-userS-username", `${username}`); //good

//     return () => {
//       //before comp unmounts disconnect!
//       ws.disconnect();
//     };
//   }, [searchParams]);
//   //customizing!

//   //if currentChat changes then empty Chat
//   useEffect(() => {
//     setChat([]);
//   }, [currentRoomID]);
//   //handle incoming messages
//   useEffect(() => {
//     if (socket == null) return;
//     const handleRecievedData1 = (data) => {
//       // all good
//       console.log("handleRecievedData()");
//       console.log(data);
//       setChat((prev) => [...prev, data]);
//     };
//     socket.on("newIncomingMessageFromSERVER", handleRecievedData1);
//     return () =>
//       socket.off("newIncomingMessageFromSERVER", handleRecievedData1);
//   }, [socket]);

//   //handle sending messages
//   const sendMessage = () => {
//     console.log("sendMessage()");
//     setChat((prev) => [...prev, { sender: user, message: textField }]);
//     console.log(currentRoomID);
//     socket.emit("newIncomingMessageFromCLIENT", { currentRoomID, textField }); //good
//   };

//   return (
//     <div>
//       <Navbar
//         currentRoomID={currentRoomID}
//         setCurrentRoomID={setCurrentRoomID}
//         setChat={setChat}
//         user={user}
//         socket={socket}
//         rooms={rooms}
//         addRooms={addRooms}
//       />
//       <h1>welcome to chat</h1>
//       <input onChange={(e) => setTextField(e.target.value)}></input>
//       <button onClick={() => sendMessage()}>Send</button>

//       <div>
//         <ul>
//           {chat.map((item) => {
//             return (
//               <div key={`${item.message + Math.random()}-div`}>
//                 <h5 key={`${item.message + Math.random()}-h5`}>
//                   {item.sender}
//                 </h5>
//                 <li key={`${item.message + Math.random()}-li`}>
//                   {item.message}
//                 </li>
//               </div>
//             );
//           })}
//         </ul>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import Navbar from "./navbar";
// import { io } from "socket.io-client";

// export default function Chat() {
//   const [socket, setSocket] = useState();
//   const [searchParams, setSearchParams] = useSearchParams();
//   //user related stuff for client-side
//   const [user, setUser] = useState("");
//   const history = useNavigate();
//   //all created or joined rooms list
//   const [rooms, addRooms] = useState([]);
//   useEffect(() => {
//     const username = searchParams.get("n");
//     setUser(username);
//     //if username empty redir to register page!
//     if (!username) history("/");
//     //set a connection
//     const ws = io("http://localhost:4000");
//     setSocket(ws);
//     ws.emit("new-userS-username", `${username}`); //good
//     return () => {
//       //before comp unmounts disconnect!
//       ws.disconnect();
//     };
//   }, [searchParams]);

//   useEffect(() => {
//     if (!socket) return;
//     function IncomingData(data) {
//       console.log(data);
//     }
//     socket.on("FROM_SERVER", IncomingData);
//     return () => socket.off("FROM_SERVER", IncomingData);
//   }, [socket]);
//   const fakeTextArr = [
//     "hi",
//     "hello",
//     "bye",
//     "seeya",
//     "hi12",
//     "hello44",
//     "bye3",
//     "seeya2",
//     "idiot",
//     "smart man",
//   ];

//   useEffect(() => {
//     console.log(`${JSON.stringify(rooms)}<< remove me`);
//   }, [rooms]);
//   const fakeText = fakeTextArr[Math.floor(Math.random() * 10)];

//   function sendData() {
//     socket.emit("FROM_CLIENT", { roomID: rooms[0], message: fakeText });
//     //Handle the sender-side rendering its own username and message [user fakeText]

//   }
//   return (
//     <div>
//       <div>
//         <Navbar socket={socket} rooms={rooms} addRooms={addRooms} />
//       </div>

//       <div>
//         <div>{fakeText}</div>
//         <button onClick={() => sendData()}>send</button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { io } from "socket.io-client";
import "../styles/chat.css";
export default function Chat() {
    const [socket, setSocket] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    //user related stuff for client-side
    const [user, setUser] = useState("");
    const [INPUT_text, SET_INPUT_text] = useState("");
    //chat
    const [chat, setChat] = useState([]);
    useEffect(() => {
        if (!socket) return;
        socket.emit("createJoinRoom", "default");
    }, [socket]);

    //url
    const location = useLocation();
    const history = useNavigate();
    //all created or joined rooms list
    //selectedRoom, setSelectedRoom
    const [selectedRoom, setSelectedRoomFromChat] = useState("");

    useEffect(() => {
        const username = searchParams.get("n");
        setUser(username);
        //if username empty redir to register page!
        if (!username) history("/");
        //set a connection
        const ws = io("http://localhost:4000");
        setSocket(ws);
        ws.emit("new-userS-username", `${username}`); //good
        return () => {
            //before comp unmounts disconnect!
            ws.disconnect();
        };
    }, [searchParams]);

    useEffect(() => {
        if (socket === null) return;

        function IncomingData(data) {
            setChat((prev) => [...prev, data]);

            console.log(data);
        }
        socket.on("FROM_SERVER", IncomingData);
        return () => socket.off("FROM_SERVER", IncomingData);
    }, [socket]);

    function sendData() {
        //Handle the sender-side rendering its own username and message [user fakeText]
        socket.emit("FROM_CLIENT", {
            roomID: selectedRoom,
            message: INPUT_text,
        });

        setChat((prev) => [
            ...prev,
            {
                sender: user,
                message: INPUT_text,
            },
        ]);
    }

    return (
        <div className="main-container">
            <div className="flex-child">
                <Navbar
                    user={user}
                    socket={socket}
                    selectedRoom={selectedRoom}
                    setSelectedRoomFromChat={setSelectedRoomFromChat}
                />
            </div>

            <div className="flex-child chat-container">
                <div className="sub-flex">
                    {chat.map((item, idx) => (
                        <div key={idx} className="user-message-container ">
                            <h5 className="user-container">{item.sender}</h5>
                            <h3 className="message-container">
                                {item.message}
                            </h3>
                        </div>
                    ))}
                </div>

                <div className="sub-flex messenger">
                    <input
                        className="sender-text-field"
                        onChange={(e) => SET_INPUT_text(e.target.value)}
                    ></input>
                    <button
                        className="sender-button"
                        onClick={() => sendData()}
                    >
                        send
                    </button>
                </div>
            </div>
        </div>
    );
}
