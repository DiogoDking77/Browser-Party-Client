/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/pages/MainPage.jsx",
    "./src/pages/ListRoomsPage.jsx",
    "./src/pages/RoomPage.jsx",
    "./src/components/Chat.jsx",
    "./src/components/Board/BasicBoard.jsx",
    "./src/components/Countdown.jsx",
    "./src/components/ShuffleOrder.jsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}