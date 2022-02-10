import { useEffect, useState, useRef, useReducer } from "react";
import { io } from "socket.io-client";
import { useLocation, useSearchParams } from "react-router-dom";
import "../styles/chat.css";
import "../styles/navbar.css";

import Modal from "./Modal";
import useModal from "./custom hooks/useModal";

function Navbar({ selectedRoom, setSelectedRoom }) {
    useEffect(() => {
        (async function () {
            const pending_response = await fetch(
                "/api/v1/users/@me/availablerooms"
            );
            const response = await pending_response.json();
            setList(response);
        })();
    }, []);
    const [list, setList] = useState([]);
    const activeRoom = useRef({ elements: [] });

    const [customCSSforSelectedItem, setCustomCSSforSelectedItem] =
        useState(null);

    //pass down to Modal component
    const { isShowing, toggle } = useModal();
    const [createdRoomName, setCreatedRoomName] = useState("");

    function selectedRoomFunction(idx) {
        const SELECTED_ROOM = activeRoom.current.elements[idx].dataset.val;
        setCustomCSSforSelectedItem(idx);
        setSelectedRoom(SELECTED_ROOM);
    }

    async function createRoom() {
        const pending_respone = await fetch("/api/v1/uruunuud", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ createdRoomName, customization: {} }),
        });

        const response = await pending_respone.json();

        setCreatedRoomName("");
        toggle();
    }
    return (
        <div className="navbar-container">
            <div className="navbar-control flex-items">
                <div className="navbar-control flex-items">
                    <button onClick={toggle}>create</button>
                </div>
                <Modal
                    isShowing={isShowing}
                    hide={toggle}
                    createdRoomName={createdRoomName}
                    setCreatedRoomName={setCreatedRoomName}
                    createRoom={createRoom}
                />
            </div>

            <div className="list flex-items">
                {list.map((room, idx) => {
                    return (
                        <div
                            className="list-child"
                            data-val={room}
                            ref={(element) => {
                                if (element === null) return;
                                activeRoom.current.elements[idx] = element;
                            }}
                            onClick={() => selectedRoomFunction(idx)}
                            key={`${idx}-div`}
                            style={
                                customCSSforSelectedItem === idx
                                    ? { background: "#f1f2f3" }
                                    : null
                            }
                        >
                            {room}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function MainChat() {
    const [socket, setSocket] = useState();
    const [chat, setChat] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("");
    const [alreadyRequestedRooms, setRequestedRooms] = useState([]);
    const referenceRequestedRooms = useRef([]);

    const [currentMessage, setCurrentMessage] = useState("");
    useEffect(() => {
        //getting user creds then sending it via socket io
        (async function () {
            const response = await fetch("/getUserCredentials");
            const json_reponse = await response.json();
            if (!response) return;
            const ws = io("http://localhost:4000", {
                auth: {
                    json_reponse,
                },
            });
            setSocket(ws);
        })();
    }, []);
    //update mutable object
    useEffect(() => {
        referenceRequestedRooms.current = alreadyRequestedRooms;
        return () => (referenceRequestedRooms.current = []);
    }, [alreadyRequestedRooms]);
    //if selectedRoom changes fetch chat or look for cached
    useEffect(() => {
        if (selectedRoom === "") return;
        (async function () {
            const req_or_not = alreadyRequestedRooms.some(
                (room) => room === selectedRoom
            );
            //if in alreadyRequestedRoom's list has the selectedRoom then don't request, else request(fetch);
            if (req_or_not) {
                return;
            } else if (!req_or_not) {
                const pending_respone = await fetch(
                    `/api/v1/uruunuud/${selectedRoom}/`
                );
                const { ROOM, messages } = await pending_respone.json();
                setRequestedRooms((prev) => [...prev, ROOM]);

                setChat((prev) => [...prev, ...messages]);
            }
        })();
    }, [selectedRoom]);

    useEffect(() => {
        if (!socket) return;
        //useEffect hooks does not work with useState because its a callback thus it only returns the initial value
        function Incoming(object) {
            //if the currentRoom is not the message's room dont add this setChat cuz on click of the chat it will request the before chat
            const bool = referenceRequestedRooms.current.some(
                (room) => room === object.roomID
            );
            if (bool) {
                setChat((prev) => [...prev, object]);
            } else if (!bool) {
                console.log(object);
            }
        }

        socket.on("FROM_SERVER", Incoming);
        return () => socket.on("FROM_SERVER", Incoming);
    }, [socket]);
    function send(evt) {
        evt.preventDefault();
        if (!socket) return;
        if (!currentMessage === "" || selectedRoom === "") return;
        socket.emit("FROM_CLIENT", {
            roomID: selectedRoom,
            message: currentMessage,
            date: new Date(),
        });
        setCurrentMessage("");
    }
    return (
        <div className="main-container">
            <div className="flex-child">
                <Navbar
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    alreadyRequestedRooms={alreadyRequestedRooms}
                />
            </div>
            <div className="flex-child chat-container">
                <div className="sub-flex">
                    {chat.map((item, idx) => {
                        if (selectedRoom === item.roomID)
                            return (
                                <div
                                    key={idx}
                                    className="user-message-container "
                                >
                                    <h5 className="user-container">
                                        {item.sender}
                                    </h5>
                                    <h3 className="message-container">
                                        {item.message}
                                    </h3>
                                    <h5 className="user-container">
                                        {item.date}
                                    </h5>
                                </div>
                            );
                    })}
                </div>

                <form className="sub-flex messenger" onSubmit={send}>
                    <input
                        className="sender-text-field"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                    ></input>
                    <input
                        className="sender-button"
                        value="Send"
                        type="submit"
                    ></input>
                </form>
            </div>
        </div>
    );
}
