import { io } from 'socket.io-client';

// Usa a variável de ambiente ou o valor padrão para desenvolvimento
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000');

export default socket;
