// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { socket } from '../../utils/socket.js';
// import Host from './Host.jsx';

// const HostGuard = () => {
//   const { roomCode } = useParams();
//   const navigate = useNavigate();
//   const [isHost, setIsHost] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Ask the server to verify if the current user is the host
//     socket.emit('verify-host', roomCode);

//     const handleVerification = ({ isHost: hostStatus, error }) => {
//       if (error) {
//         // Handle cases where the room doesn't exist
//         navigate('/');
//         return;
//       }

//       if (hostStatus) {
//         setIsHost(true);
//       } else {
//         // If not the host, redirect to the lobby.
//         navigate('/');
//       }
//       setIsLoading(false);
//     };

//     socket.on('host-verified', handleVerification);

//     return () => {
//       socket.off('host-verified', handleVerification);
//     };
//   }, [roomCode, navigate]);

//   if (isLoading) {
//     // You can replace this with a nice loading spinner component
//     return <div className="flex items-center justify-center w-screen h-screen bg-gray-900 text-white">Verifying Access...</div>;
//   }

//   return isHost ? <Host /> : null;
// };

// export default HostGuard;

