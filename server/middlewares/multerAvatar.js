import multer from 'multer';

// Middleware simple solo para avatares
const storage = multer.diskStorage({
    destination: './public/images/avatars',
    filename: (req, file, callback) => {
        callback(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

export const uploadAvatar = multer({
    storage,
    fileFilter: (req, file, callback) => {
        // Solo imágenes
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Solo se permiten archivos de imagen'), false);
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB máximo
    }
}).single('avatar');