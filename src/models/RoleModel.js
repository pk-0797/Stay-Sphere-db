
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    
    roleName:{
        type:String,
    }
})

module.exports = mongoose.model("roles",roleSchema)