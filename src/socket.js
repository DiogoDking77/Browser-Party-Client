import { io } from 'socket.io-client';

// Usa a variável de ambiente ou o valor padrão para desenvolvimento
const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL || 'https://browser-party-server.onrender.com');

export default socket;
