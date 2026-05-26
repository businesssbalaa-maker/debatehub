import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Component/Home'
import Rewards from './Component/Rewards'
import Wallet from './Component/Wallet'
import Auth from './Component/Auth'
import Categories from './Component/Categories'

function App() {
  return (
    <>
    <Routes>
      <Route path ="/" element={<Home />}/>
      <Route path="/rewards" element={<Rewards />}/>
      <Route path="/wallet" element={<Wallet />}/>
      <Route path="/categories" element={<Categories/>}/>
      <Route path="/auth" element={<Auth />}/>
    </Routes>
    </>
  )
}

export default App
