import { io } from 'socket.io-client';

const socket = io('https://browser-party-server.vercel.app/', {
  transports: ['polling']  // Forçar a utilização de polling
});

export default socket;
