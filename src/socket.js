import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');  // Substitua pela URL do seu servidor

export default socket;