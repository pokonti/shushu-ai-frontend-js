import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import AIPodcastEditor from './components/AIPodcastEditor'
import NotFoundPage from './components/NotFoundPage';
import AudioVideoUpload from './components/AudioVideoUpload';

function App() {

  return (
    <>
       <Router>

            <Routes>
                <Route path="/" element={<AIPodcastEditor />} />
                {/* <Route path='/login' element={<Login/>}/>
                <Route path="/signup" element={<SignUp />} /> */}
                <Route path="/editor" element={<AudioVideoUpload />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    </>
  )
}


export default App
