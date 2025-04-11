const routes = require('express').Router();
const propertyController = require('../controllers/PropertyController');

// routes.post('/addproperty', propertyController.addProperty);
routes.get('/getallproperties', propertyController.getProperties);
routes.get("/getpropertybystate/:stateId", propertyController.getPropertyByStateId);
routes.post('/addWithFile', propertyController.addPropertyWithFile);
routes.get('/getpropertiesbyuserid/:userId', propertyController.getAllPropertiesByUserId);

routes.put("/update-price/:id", propertyController.updatePropertyPrice);
routes.get("/gettotalprice/:id", propertyController.getPropertyById);
routes.delete("/delete/:id", propertyController.deleteProperty);
routes.get("/details/:id", propertyController.getPropertyWithoutUserId);
routes.put("/update-details/:id", propertyController.updatePropertyDetails);


module.exports = routes;
