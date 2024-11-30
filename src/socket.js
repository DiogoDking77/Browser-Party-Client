import { io } from 'socket.io-client';

const socket = io('https://browser-party-server.onrender.com');  // Substitua pela URL do seu servidor

export default socket;