import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import CountryCard from "./components/CountryCard";

function App() {
    return (
        <>
            <h1>Country Explorer</h1>
            <h2>Browse and learn about countries around the world!</h2>
            <CountryCard name={"Japan"} flag={"japan-flag-url"} region={"Asia"} capital={"2939239"} population={"1 Million"} />
        </>
    );
}

export default App;
