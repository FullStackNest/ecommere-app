import { Routes, Route } from 'react-router-dom';
import Home from './layouts/Home/Home';
import Dashboard from './layouts/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import Products from './layouts/Products/Products';

function App() {

  return (
    <>
    <Navbar/>
      <Routes>
        
        <Route path="/" element={<Home/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/products" element={<Products/>} />
      </Routes>
    </>
  )
}

export default App
