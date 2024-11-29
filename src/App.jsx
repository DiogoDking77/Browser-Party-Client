import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ListRoomsPage from './pages/ListRoomsPage';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para a página principal */}
        <Route path="/" element={<MainPage />} />

        {/* Rota para a página de listar salas */}
        <Route path="/rooms" element={<ListRoomsPage />} />

        {/* Rota para a página da sala */}
        <Route path="/room/:roomName" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
