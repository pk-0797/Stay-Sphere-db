const routes = require("express").Router();

const userController = require("../controllers/UserController");
// routes.post("/user",userController.addUser)
routes.post("/user", userController.signup);
routes.post("/user/login", userController.loginUser);
routes.get("/users", userController.getAllUsers);
routes.get("/user/:id", userController.getUserById);
routes.delete("/user/:id", userController.deleteUserById);

routes.post("/user/forgotpassword", userController.forgotPassword);
routes.post("/user/resetpassword", userController.resetpassword);
routes.post("/user/logout", userController.logoutUser);

routes.put("/user/:id", userController.updateUserById);
routes.get("/user/wishlist/:userId", userController.getUserWishlist);
routes.post("/user/wishlist/add", userController.addToWishlist);
routes.post("/user/wishlist/remove", userController.removeFromWishlist);


module.exports = routes;

