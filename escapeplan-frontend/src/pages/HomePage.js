import React, { useState, useEffect } from "react";
import opensocket from "socket.io-client";
import Socket from "../Socket";
import "../App.css";
import "./HomePage.css";

export const UserContext = React.createContext();

function HomePage({ history }) {
  const [socket, setSocket] = useState(null);
  const initialFormData = Object.freeze({ gameCode: "" });

  const [formData, updateFormData] = useState(initialFormData);

  const newGameHandler = () => {
    console.log("[HomePage.js] newGameHandler");
    socket.emit("createNewGame");
  };

  const inputHandler = (event) => {
    updateFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  };

  const joinGameHandler = (event) => {
    event.preventDefault();
    const gameCode = formData.gameCode;
    socket.emit("joinRoom", gameCode);
  };

  const howToPlayHandler = () => {
    history.push("/howtoplay");
  };
  useEffect(() => {
    const socket = opensocket("http://localhost:5000/");
    setSocket(socket);
    Socket.init(socket);
  }, []);

  useEffect(() => {
    if (socket) {
      console.log("here");
      socket.on("newGame", (input) => {
        const transformedInput = JSON.parse(input);

        const gameCode = transformedInput.gameCode;

        const myRole = transformedInput.myRole;

        const gameState = transformedInput.state;

        // go to game area // user 1
        history.push("/gamearea", {
          transformedInput: transformedInput,
          myRole: myRole,
          gameState: gameState,
          gameCode: gameCode,
        });
      });

      socket.on("joinSuccess", (input) => {
        const transformedInput = JSON.parse(input);
        const myRole = transformedInput.myRole;
        const gameState = transformedInput.state;
        const gameCode = transformedInput.gameCode;

        // go to game area // user 2
        history.push("/gamearea", {
          transformedInput: transformedInput,
          myRole: myRole,
          gameState: gameState,
          gameCode: gameCode,
        });
      });
    }
  });

  return (
    <div className="home">
      <div className="headctn">
      <h1 className="welcome">Welcome to</h1>
      <h1 className="welcome">the escape plan</h1>
      </div>

    <div className="container">
      <button onClick={newGameHandler}>
        <h1>Create Game</h1>
      </button>

      <br></br>
      <button  onClick={howToPlayHandler}>
        <h1>How to play</h1>
      </button>

    
      <label className="submittext">
        <input type="text" name="gameCode" onChange={inputHandler}></input>
      
    <br></br>
      <button onClick={joinGameHandler}>Submit</button>
      </label>

      </div>

    </div>

  );
}

export default HomePage;
