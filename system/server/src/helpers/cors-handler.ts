export const corsHandler = {
    origin: function (origin, callback) {
        // // Old implementation
        // if (typeof origin === 'undefined') {
        //     // Requests from other services via node-fetch produce undefined value in origin
        //     // Let it pass for now. @TODO: fix undefined 
        //     return callback(null, true);
        // }

        // if (/localhost/.test(origin))
        //     return callback(null, true);

        // callback(new Error("Not allowed"));


        // // For now delegate cors to Nginx and allow all
        return callback(null, true);
    },
    credentials: true,
};