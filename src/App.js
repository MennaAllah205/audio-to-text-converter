import React from "react";
import AudioToText from "./components/Transcriber";
import "./Css/Style.css";

const App = () => {
  return (
    <div>
      <h1 className="logo">MoonVerse</h1>
      <AudioToText />
    </div>
  );
};

export default App;
