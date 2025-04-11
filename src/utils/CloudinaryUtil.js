const cloundinary = require("cloudinary").v2;

const uploadFileToCloudinary = async (file) => {
  cloundinary.config({
    cloud_name: "dbddct7bj",
    api_key: "929751252864828",
    api_secret: "euCknzvAkSagGYgxNk0GS8byM7A",
  });

  const cloundinaryResponse = await cloundinary.uploader.upload(file.path);
  return cloundinaryResponse;
};
module.exports = {
  uploadFileToCloudinary,
};
