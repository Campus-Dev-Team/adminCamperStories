import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/AppRouter"; // Sin alias '@'

import './index.css'

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;