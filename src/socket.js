/**
 * Socket.IO Singleton
 * 
 * Módulo centralizado para acceder a la instancia de Socket.IO
 * desde cualquier parte del backend (controllers, services, etc.)
 * sin necesidad de circular dependencies.
 */

let _io = null;

/**
 * Inicializa la instancia de Socket.IO. Debe llamarse desde server.js.
 * @param {import('socket.io').Server} io 
 */
export const initSocket = (io) => {
    _io = io;
};

/**
 * Retorna la instancia de Socket.IO activa.
 * @returns {import('socket.io').Server}
 */
export const getIO = () => {
    if (!_io) {
        throw new Error('Socket.IO no ha sido inicializado. Llama a initSocket(io) primero.');
    }
    return _io;
};
