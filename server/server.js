const express = require("express");
const app = express();
const cors = require("cors");

const { Pool } = require("pg");
const expresession = require("express-session");

const pgSession = require("connect-pg-simple")(expresession);
const pgPool = new Pool({
    user: "itgelt",
    database: "sessionstore",
    password: "",
    host: "localhost",
    port: 5432,
});

const sessionMiddleWare = expresession({
    secret: "malchin",
    resave: false,
    saveUninitialized: false,
    //httpOnly: false,
    cookie: {
        maxAge: 60000,
    },
    store: new pgSession({
        pool: pgPool,
        tableName: "session",
    }),
});

const PORT = process.env.PORT || 4000;

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");

app.use(express.json());

app.use(sessionMiddleWare);

const database = [
    {
        ROOMS: [
            {
                ROOM: "test",
                messages: [
                    {
                        roomID: "test",
                        sender: "bob",
                        message: "hi",
                        date: "1234",
                    },
                    {
                        roomID: "test",
                        sender: "mash",
                        message: "hello",
                        date: "135",
                    },
                    {
                        roomID: "test",
                        sender: "john",
                        message: "yo",
                        date: "12412",
                    },
                ],
            },
            {
                ROOM: "test2",
                messages: [
                    {
                        roomID: "test2",
                        sender: "bob",
                        message: "polo",
                        date: "1234",
                    },
                    {
                        roomID: "test2",
                        sender: "mash",
                        message: "123",
                        date: "135",
                    },
                    {
                        roomID: "test2",
                        sender: "john",
                        message: "testing1",
                        date: "12412",
                    },
                ],
            },
        ],
    },
    {
        USERS: [
            {
                USERNAME: "bob",
                EMAIL: "bob@gmail.com",
                PASSWORD: "1234",
                JOINED_ROOMS: ["test", "test2"],
            },
            {
                USERNAME: "masha",
                EMAIL: "bmasha12@gmail.com",
                PASSWORD: "1234",
                JOINED_ROOMS: ["test"],
            },
            {
                USERNAME: "john",
                EMAIL: "johnysin5@gmail.com",
                PASSWORD: "1234",
                JOINED_ROOMS: ["test", "test2"],
            },
        ],
    },
];

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
app.post("/signUp", (req, res) => {
    const new_user = req.body;
    res.json({ signIn: true, confirmed_user: new_user.name });
});

app.post("/login", (req, res) => {
    //here keep session id and if too many attempts made give redir and block for set amount of time
    const CLIENT = req.body;
    if (CLIENT.PASSWORD && CLIENT.USERNAME) {
        if (req.session.authenticated) {
            res.json(req.session);
        } else {
            const result = database[1].USERS.find(
                (user) =>
                    user.USERNAME === CLIENT.USERNAME &&
                    user.PASSWORD === CLIENT.PASSWORD
            );
            if (result) {
                //store this session data on a db so when the client connects i can instantly look up session data with client's cookie
                req.session.authenticated = true;
                req.session.user = {
                    username: result.USERNAME,
                    password: result.PASSWORD,
                };
                req.session.save();
                //use cookies for persist
                res.json({
                    REQUEST: true,
                    result,
                });
                console.log("responded: REQUEST: true \n");
            } else if (!result) {
                res.status(403).json({ REQUEST: false, attempt: 1 });
            }
        }
    }
});
//client NAVBAR
app.get("/api/v1/users/@me/availablerooms", (req, res) => {
    //auth
    const userCreds = req.session.user;

    if (userCreds) {
        const { JOINED_ROOMS } = database[1].USERS.find(
            (user) =>
                user.USERNAME === userCreds.username &&
                user.PASSWORD === userCreds.password
        );
        res.json(JOINED_ROOMS);
    } else {
        res.status(401);
    }
});

app.get("/api/v1/uruunuud/:paramsuruu/", (req, res) => {
    const { paramsuruu } = req.params;
    console.log(req.params);
    //auth!
    const client_creds = req.session.user;
    const userInfo = database[1].USERS.find(
        (user) =>
            user.USERNAME === client_creds.username &&
            user.PASSWORD === client_creds.password
    );
    const { JOINED_ROOMS } = userInfo;
    //user is authorized to see room's chat
    const match = JOINED_ROOMS.find((room) => room === paramsuruu);
    //find that room's chat
    const RESULT = database[0].ROOMS.find((room) => room.ROOM === match);
    res.json(RESULT);
    //!error handling 403 401 req or 404
});
app.post("/api/v1/uruunuud", (req, res) => {
    const userCreds = req.session.user;

    if (!userCreds) return;
    //create a id for that room and respond back with room name and its id
    //create room in the db and join the user to it

    const users = database[1].USERS.map((user) => {
        if (
            user.USERNAME === userCreds.username &&
            user.PASSWORD === userCreds.password
        ) {
        }
    });
    console.log(req.body);
});

//client socket io need this info
app.get("/getUserCredentials", (req, res) => {
    const credentials = req.session;
    //cookie --> session data
    if (credentials.authenticated) {
        console.log(credentials.user);
        res.json(credentials.user);
    } else {
        res.status(401).send(false);
    }
});
//login using socket io middleware
io.use((socket, next) => {
    const client_credentials = socket.handshake.auth.json_reponse;
    if (client_credentials) {
        socket.username = client_credentials.username;
        next();
    } else {
        console.log("**disconnected");
        socket.disconnect();
    }
});

io.on("connection", (socket) => {
    //restore previous data;
    function RestoreCurrentSocket() {
        const client_credentials = socket.handshake.auth.json_reponse;
        const { JOINED_ROOMS } = database[1].USERS.find(
            (USER) =>
                USER.USERNAME === client_credentials.username &&
                USER.PASSWORD === client_credentials.password
        );
        for (let i = 0; i < JOINED_ROOMS.length; i++) {
            socket.join(JOINED_ROOMS[i]);
        }
        io.to(socket.id).emit("FROM_SERVER_RESTORE", JOINED_ROOMS);
        console.log(socket.rooms);
    }
    //check if this only runs once
    RestoreCurrentSocket();
    //JOIN room

    socket.on("createJoinRoom", (roomID, isRecieved) => {
        socket.join(roomID);
        console.log(socket.rooms);
        //isRecieved is true from client
        isRecieved(true, roomID);
    });

    //HANDLE CLIENT'S MESSAGE

    socket.on("FROM_CLIENT", (object) => {
        const { roomID, message, date } = object;
        console.log(`SERVER: 
                      sender: ${socket.username} at ${date},
                      room:  ${roomID},
                      message:  ${message}`);

        //sender
        io.to(`${roomID}`).emit("FROM_SERVER", {
            roomID,
            sender: socket.username,
            message,
            date,
        });
        for (let i = 0; i < database[0].ROOMS.length; i++) {
            if (database[0].ROOMS[i].ROOM === roomID) {
                database[0].ROOMS[i].messages.push({
                    roomID,
                    sender: socket.username,
                    message,
                    date,
                });
            }
        }
    });
});
server.listen(PORT, () => console.log("*** server here ***"));
