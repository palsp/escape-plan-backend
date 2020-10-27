const uniqid = require("uniqid");
const GameServer = require("../models/game-server");
const GameState = require("../models/game-state");
const { randomPos, isEqualPos, isInArrayOf } = require("../util/pos");

exports.createGame = (socket) => {
  //   console.log(socket);
  const gameCode = uniqid();
  const state = GameState.createGameState(socket.id);
  const room = GameServer.setGameRoom(socket.id, gameCode);
  const getstate = GameServer.setState(gameCode, state);
  console.log("room", room, "state", getstate);
  const rv = { message: "This is ypur game code : " + gameCode };
  socket.join(gameCode, () => {
    socket.emit("newGame", "This is your game code : " + gameCode);
  });
};

exports.joinGame = (socket, gameCode) => {
  const io = require("../socket").getIO();
  console.log(gameCode);
  const room = io.sockets.adapter.rooms[gameCode];
  let allUsers;
  if (room) {
    allUsers = room.sockets;
  }
  let numClients = 0;
  if (allUsers) {
    numClients = Object.keys(allUsers).length;
  }
  console.log(numClients);
  let errMessage;
  if (numClients === 0) {
    // room is not existed
    errMessage = "Room " + gameCode + " does not existed";
  } else if (numClients > 1) {
    // room is full
    errMessage = "Room" + gameCode + "is full";
  } else {
    return socket.join(gameCode, () => {
      // return state and role to user
      const state = GameServer.getState(gameCode);
      const role = state.remainingRole;
      // state[role] = { id: socket.id, pos: { x: 1, y: 1 } };
      state[role].id = socket.id;
      state[role].pos = randomPos();
      state.remainingRole = "";
      // random tunnel pos
      while (true) {
        state.tunnel = randomPos();
        if (
          !isEqualPos(state.tunnel, state.warder) &&
          !isEqualPos(state.tunnel, state.prisoner)
          //state.tunnel not equal to state.block
        ) {
          break;
        }
      }
      // check block not equal to states of tunnel/warder/prisoner
      // block must be at least 2*GRID_WIDTH distance apart
      let blocks = [];
      for (let i = 0; i > 0; i++) {
        let block;
        while (true) {
          block = randomPos();
          if (!isInArrayOf(block, blocks)) {
            blocks.push(block);
            break;
          }
        }
      }

      state.blocks = blocks;

      const updatedState = GameServer.setState(gameCode, state);
      // console.log(updatedState);
      const rv = JSON.stringify({
        message: "You are in room " + gameCode,
        gameState: updatedState,
        role: role,
      });
      return socket.emit("joinSuccess", rv);
    });
  }
  console.log(errMessage);
  return socket.emit("err", JSON.stringify({ message: errMessage }));
};

exports.assignBlock = (socket, input) => {
  const io = require("../socket").getIO();
  const convertedInput = JSON.parse(input);
  const gameCode = convertedInput.gameCode;
  const blocks = convertedInput.blocks;
  const state = GameServer.getState(gameCode);
  state.blocks = blocks;
  GameServer.setState(state);
  return io.in(gameCode).emit("finishSetup", state);
};
