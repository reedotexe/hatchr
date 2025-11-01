const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Utility function to upload buffer to Cloudinary using streams
const uploadToCloudinary = (buffer, folder = 'instagram_clone') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Automatically detect if it's image or video
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'], // Allowed formats
        transformation: { quality: 'auto:good' }, // Automatic quality optimization
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
