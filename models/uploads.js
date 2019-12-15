const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const uploadSchema = new Schema({
    data: {
        type:String,
        required: true
    },
    from:{
        type:String,
        required: true
    },
    msgid: {
        type:String,
        required: true
    },
    time:{
        type:Number,
        required:true
    },
    type:{
        type:String,
        required:true
    }

})

const uploads = mongoose.model('uploads', uploadSchema);

module.exports = {
    uploads
};