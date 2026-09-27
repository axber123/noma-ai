import { useState } from "react";
import Login from "./pages/Login.tsx";
import Home from "./pages/Home";

export default function App() {
  const [entered, setEntered] = useState(false);

  return entered ? <Home /> : <Login onEnter={() => setEntered(true)} />;
}
