import React from "react";
import {BrowserRouter , Route,Routes} from "react-router-dom"
import {LOg} from './login'
import Talk from "./talk";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LOg/>}/>
          <Route path="/talk"  element={<Talk/>}/>

        </Routes>

      
      </BrowserRouter>
    </div>
  );
}

export default App;
