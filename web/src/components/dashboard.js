import { Link } from "react-router-dom";
import MainChat from "./MainChat";

export default function Dashboard() {
    return (
        <div>
            <Link to="/chat">CHAT</Link>
            <br />
            <Link to="/">Log out</Link>
        </div>
    );
}
