import { Routes, Route } from 'react-router-dom';
import Home from './layouts/Home/Home';
import Dashboard from './layouts/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';

function App() {

  return (
    <>
    <Navbar/>
      <Routes>
        
        <Route path="/" element={<Home/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    </>
  )
}

export default App
