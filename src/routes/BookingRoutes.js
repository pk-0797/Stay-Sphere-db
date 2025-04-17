const routes = require('express').Router();
const bookingController = require('../controllers/BookingController');

routes.post("/addbooking", bookingController.addBooking);
routes.get("/getallbookings", bookingController.getAllBooking);

//new
routes.post("/addbookingwithpropertyid/:propertyId", bookingController.addBookingByPropertyId);
routes.put("/confirm/:bookingId", bookingController.confirmBooking);
routes.put("/cancel/:bookingId", bookingController.cancelBooking);
routes.get("/host/:hostId", bookingController.getBookingsByHostId);
routes.get("/total-revenue", bookingController.getTotalRevenueForAdmin);

routes.get('/getbookingsbyuserid/:userId', bookingController.getAllBookingsByUserId);
routes.get("/getpropertyby/:bookingId", bookingController.getPropertyByBookingId);
routes.get("/gethostbypropertyid/:propertyId", bookingController.getHostByPropertyId);
routes.put("/update/:bookingId", bookingController.updateBookingByHost);
routes.post('/check-availability', bookingController.checkBookingAvailability);

module.exports = routes;