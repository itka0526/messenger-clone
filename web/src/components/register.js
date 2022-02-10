import { useEffect, useState } from "react";
import "../styles/register.css";
export default function Register({ setAuth }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [state, setState] = useState("Login");
    const [error, setError] = useState(null);
    //const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        setName("");
        setPassword("");
        return () => state;
    }, [state]);
    //if cookie exist no need for this page
    useEffect(() => {
        const RequestUserCreds = async () => {
            const promise_reponse = await fetch("/getUserCredentials");
            const response = await promise_reponse.json();
            if (response.username) {
                setAuth(true);
            }
        };
        RequestUserCreds();
    }, []);
    async function signUp() {
        //if (attempt > 5) history("/axdttemptsexceeded");
        const response = await fetch("/signUp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        });
        const status = await response.json();
        // if (status.signUp && status.confirmed_user === name) {
        //pass auth to MainChat
        // history(`/chat?n=${name}`);
        // }
    }
    async function Login() {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                USERNAME: name,
                PASSWORD: password,
            }),
        });
        const status = await response.json();

        if (status.REQUEST) {
            setAuth(true);
        } else {
            console.error(new Error("Something went wrong"));
        }
    }

    return (
        <div className="register-container">
            {state === "Login" ? (
                <div className="sub-container">
                    <div className="switch-container">
                        <button
                            className="switch-button"
                            style={state !== "Login" ? { opacity: 0.5 } : null}
                            onClick={() => setState("Login")}
                        >
                            Нэвтрэх
                        </button>
                        <button
                            className="switch-button"
                            style={state !== "signUp" ? { opacity: 0.5 } : null}
                            onClick={() => setState("signUp")}
                        >
                            Бүртгүүлэх
                        </button>
                    </div>
                    <div className="seperating-line"></div>

                    <h1 className="register-title">Нэвтрэх</h1>
                    <h4
                        style={{
                            color: "red",
                            textAlign: "center",
                            fontFamily: "inherit",
                        }}
                    >
                        {error}
                    </h4>
                    <div className="input-container">
                        <input
                            value={name}
                            autoFocus={1}
                            aria-label="Нэвтрэх нэр"
                            placeholder="Нэвтрэх нэр"
                            onChange={(e) => setName(e.target.value)}
                        ></input>
                    </div>
                    <div className="input-container">
                        <input
                            value={password}
                            autoFocus={1}
                            aria-label="Нууц үг"
                            placeholder="Нууц үг"
                            onChange={(e) => setPassword(e.target.value)}
                        ></input>
                    </div>
                    <button className="enter-button" onClick={() => Login()}>
                        Орох
                    </button>
                </div>
            ) : state === "signUp" ? (
                <div className="sub-container">
                    <div className="switch-container">
                        <button
                            className="switch-button"
                            style={state !== "Login" ? { opacity: 0.5 } : null}
                            onClick={() => setState("Login")}
                        >
                            Нэвтрэх
                        </button>
                        <button
                            className="switch-button"
                            style={state !== "signUp" ? { opacity: 0.5 } : null}
                            onClick={() => setState("signUp")}
                        >
                            Бүртгүүлэх
                        </button>
                    </div>
                    <div className="seperating-line"></div>

                    <h1 className="register-title">Бүртгүүлэх</h1>

                    <div className="input-container">
                        <input
                            value={name}
                            autoFocus={1}
                            aria-label="Нэтрэх нэр"
                            placeholder="Нэвтрэх нэр"
                            onChange={(e) => setName(e.target.value)}
                        ></input>
                    </div>
                    <div className="input-container">
                        <input
                            value={password}
                            autoFocus={1}
                            aria-label="Нууц үг"
                            placeholder="Нууц үг"
                            onChange={(e) => setPassword(e.target.value)}
                        ></input>
                    </div>
                    <button className="enter-button" onClick={() => signUp()}>
                        Бүртгүүлэх
                    </button>
                </div>
            ) : (
                <h1>Error? What happened</h1>
            )}
        </div>
    );
}
