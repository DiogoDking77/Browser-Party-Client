import { io } from 'socket.io-client';

const socket = io('https://browser-party-server.vercel.app/');  // Substitua pela URL do seu servidor

export default socket;