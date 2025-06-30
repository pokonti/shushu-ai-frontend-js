import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/Home'
import NotFoundPage from './pages/NotFoundPage';
import AudioVideoUpload from './pages/AudioVideoUpload';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import GTMPageTracker from './components/GTMPageTracker';
// import Shorts from './pages/Shorts';

function App() {

  return (
    <>
       <Router>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path='/login' element={<AuthPage/>}/>
                <Route path="/editor" element={<AudioVideoUpload />} />
                <Route path="/profile" element={<Profile/>} />
                {/* <Route path="/shorts" element={<Shorts />} /> */}
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/gtm" element={<GTMPageTracker />} />
            </Routes>
        </Router>
    </>
  )
}


export default App
