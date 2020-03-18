const { addUser, removeUser, getUser, getUserInRoom } = require("./users.js");

module.exports = function(io) {
  io.on("connection", socket => {
    console.log("We have a new connection...");

    socket.on("join", ({ name, room }, callback) => {
      console.log(`[name]: ${name}, [room]: ${room}`);
      const { error, user } = addUser({ id: socket.id, name, room });
      if (error) return callback(error);

      socket.emit("message", {
        user: "admin",
        text: `${user.name} welcome to the room ${user.room}`
      });
      socket.broadcast
        .to(user.room)
        .emit("message", { user: "admin", text: `${user.name}, has joined!` });

      socket.join(user.room, () => {
        const rooms = Object.keys(socket.rooms);
      });

      io.to(user.room).emit("roomData", {
        room: "default",
        users: getUserInRoom(user)
      });

      callback();
    });

    socket.on("sendMessage", (message, callback) => {
      const user = getUser(socket.id);

      io.emit("message", { user: user.name, text: message });

      callback();
    });

    socket.on("disconnect", () => {
      console.log(socket.id);
      console.log(`[id]: left...`);

      const user = removeUser(socket.id);
      if (user) {
        io.to(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has left`
        });
      }
    });
  });
};
