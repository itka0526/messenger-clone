import Register from "./components/register";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainChat from "./components/MainChat";
import Login from "./components/Login";
import AttemptExceeded from "./components/AttemptExceeded";
import Dashboard from "./components/dashboard";
import { useState } from "react";
function App() {
    const [auth, setAuth] = useState(false);
    if (auth === false) {
        return <Register setAuth={setAuth} />;
    }
    if (auth === true) {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />}></Route>
                    <Route path="/chat" element={<MainChat />} />
                    <Route path="*" element={<Register />}></Route>
                    <Route
                        path="/attemptsexceeded"
                        element={<AttemptExceeded />}
                    ></Route>
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
