import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './Component/Home'
import Rewards from './Component/Rewards'
import Wallet from './Component/Wallet'
import Auth from './Component/Auth'
import Categories from './Component/Categories'
import Withdraw from './Component/Withdraw'
import Recharge from './Component/Recharge'
import Pay from './Component/pay'

function App() {
  return (
    <>
    <Routes>
      <Route path ="/" element={<Home />}/>
      <Route path ="/pay" element={<Pay/>}/>
       <Route path="/recharge" element={<Recharge />} />
      <Route path="/rewards" element={<Rewards />}/>
      <Route path="/wallet" element={<Wallet />}/>
      <Route path="/categories" element={<Categories/>}/>
      <Route path="/auth" element={<Auth />}/>
      <Route path="/withdraw" element={<Withdraw />} />
    </Routes>
    </>
  )
}

export default App
