import Login from './Pages/login'
import Register from './Pages/Register'
import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path='./login' element={<Login></Login>}></Route>
        <Route path='./register' element={<Register></Register>}></Route>
      </Routes>
    </Router>
  )
}

export default App
