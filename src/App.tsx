import { Route,Routes,HashRouter} from "react-router-dom";
import { Log } from "./Log";
import { Talk } from './Talk'
import './all.css'
function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Log/>}/>
                <Route path="/talk" element={<Talk/>}/>
            </Routes>
        </HashRouter>
    );
}

export default App;
