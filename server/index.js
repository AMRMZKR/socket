import {
    createServer
} from "http";
import {
    Server
} from "socket.io";

const httpServer = createServer();

const articleRooms = {};
/**
 * {
 *  'articleId': {
 *     'user': user //to be used for useremail
 *      'role': role
 *      'takeoverToken': some random number
 *      'socket': socket
 *  }
 * }
 */

/**
 * socket.emit will send back to the current user
 * 
 * socket.to(room).emit will send to all the other user in the room except current user
 */

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

io.on('connection', socket => {
    const {
        articleId
    } = socket.handshake.query;
    socket.join(articleId);

    socket.on('content-room', ({
        status,
        user,
        role,
        token
    }) => {
        switch (status) {
            case 'connect':
                //no one at the article
                if (!articleRooms[articleId]) {
                    articleRooms[articleId] = {
                        user,
                        role,
                        token: Date.now(),
                        socket
                    }
                } else if (role === 'admin') {
                    let currentUser = {
                        user: articleRooms[articleId].user,
                        role: articleRooms[articleId].role,
                        token: articleRooms[articleId].token
                    }
                    socket.emit('content-room', {
                        status: "locked-admin",
                        by: currentUser.user,
                        token: currentUser.token
                    })


                } else if (role === 'creator') {
                    socket.emit('content-room', {
                        status: "locked-user",
                        by: null,
                        token: null
                    })
                }
                break;
            case 'takeover':
                let currentUser = {
                    user: articleRooms[articleId].user,
                    role: articleRooms[articleId].role,
                    token: articleRooms[articleId].token
                }
                if (articleRooms[articleId].token === token) {
                    if (currentUser.role === "admin") {
                        socket.to(articleId).emit('content-room', {
                            status: "leave-room-admin",
                            by: user,
                            token: null
                        })
                    } else {
                        socket.to(articleId).emit('content-room', {
                            status: "leave-room-user",
                            by: null,
                            token: null
                        })
                    }
                    articleRooms[articleId] = {
                        user,
                        role,
                        token: Date.now(),
                        socket
                    }
                    socket.emit('content-room', {
                        status: "takeover-complete",
                        by: user,
                        token: null
                    })
                } else {
                    //send invalid token status and new token
                    //we need to assume takeover will always be done by an admin

                    socket.emit('content-room', {
                        status: "invalid-token",
                        by: user,
                        token: articleRooms[articleId].token
                    })
                }
                break
            default:
                socket.disconnect()
                break
        }
    })
    // socket.on('takeover', ({user, role, token}) => {

    // })

    socket.on('disconnect', () => {
        if (articleRooms[articleId] && articleRooms[articleId].socket.id === socket.id) {
            delete articleRooms[articleId];
        }
    })
})

io.on('disconnect', socket => {
})
httpServer.listen(4040);