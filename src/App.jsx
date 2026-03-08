import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import './App.css'

// Placeholder components for screens
import HomeScreen from './screens/HomeScreen'
import TeamManagementScreen from './screens/TeamManagementScreen'
import OpponentManagementScreen from './screens/OpponentManagementScreen'
import GameSetupScreen from './screens/GameSetupScreen'
import InGameScreen from './screens/InGameScreen'
import StatsScreen from './screens/StatsScreen'

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <img src="/logo.jpg" alt="StatsDonkey Logo" className="logo" />
            <h1>StatsDonkey</h1>
          </header>

          <main className="main-content flex-center">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/team" element={<TeamManagementScreen />} />
              <Route path="/opponents" element={<OpponentManagementScreen />} />
              <Route path="/setup" element={<GameSetupScreen />} />
              <Route path="/game" element={<InGameScreen />} />
              <Route path="/stats" element={<StatsScreen />} />
            </Routes>
          </main>
        </div>
      </Router>
    </GameProvider>
  )
}

export default App
