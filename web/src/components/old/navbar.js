import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import App from "../App";
import "../styles/navbar.css";
export default function Navbar(props) {
    //create vars
    //join vars
    const [INPUT_roomID, setINPUT_roomID] = useState("");

    //visible or not

    const [visible, setVisbility] = useState(false);
    const [selectedCSS, setSelectedCSS] = useState();
    /////////////////////////
    //all created or joined rooms list
    const [rooms, addRooms] = useState([]);
    const activeRoom = useRef({ elements: [] });
    const history = useNavigate();
    useEffect(() => {
        console.log(
            `${JSON.stringify(props.selectedRoom)}: selected<< remove me `
        );
    }, [props.selectedRoom]);
    //create
    function create_join_handler(options) {
        if (!props.socket) return;
        function rand32genV1() {
            let gen = [];
            for (let i = 0; i < 32; i++) {
                gen[i] = Math.floor(Math.random() * 10);
            }
            const string = `${gen.join("")}`;
            return string;
        }
        let id;
        if (options) {
            id = rand32genV1();
            props.socket.emit("createJoinRoom", id);
        } else if (!options) {
            id = INPUT_roomID;
            props.socket.emit("createJoinRoom", id);
        }

        addRooms((prev) => [...prev, id]);
    }

    //SELECTED ROOM
    function selectedRoomFunc(idx) {
        const data = activeRoom.current.elements[idx].dataset.val;
        props.setSelectedRoomFromChat(data);
        const sel_idx = idx;
        setSelectedCSS(sel_idx);
    }
    return (
        <div className="navbar-container">
            <div className="navbar-control flex-items">
                <button onClick={() => create_join_handler(true)}>
                    create
                </button>
                <button onClick={() => setVisbility(!visible)}>join</button>
                <div
                    style={visible ? { display: "block" } : { display: "none" }}
                >
                    <div className="modal-content">
                        <input
                            onChange={(e) => setINPUT_roomID(e.target.value)}
                        ></input>
                        <button onClick={() => create_join_handler(false)}>
                            join
                        </button>
                        <span
                            onClick={() => setVisbility(false)}
                            className="close"
                        >
                            &times;
                        </span>
                    </div>
                </div>
            </div>

            <div className="list flex-items">
                <div>
                    {rooms.map((room, idx) => {
                        return (
                            <div
                                onClick={() => selectedRoomFunc(idx)}
                                style={
                                    selectedCSS === idx
                                        ? { backgroundColor: "#f1f2f3" }
                                        : null
                                }
                                className="list-child"
                                data-val={room}
                                ref={(el) => {
                                    if (el === null) return;
                                    activeRoom.current.elements[idx] = el;
                                }}
                                key={`${idx}-key`}
                            >
                                <a
                                    data-text={room}
                                    key={`${idx}-a`}
                                    onClick={() =>
                                        history(
                                            `/chat?n=${props.user}&room=${room}`
                                        )
                                    }
                                ></a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
