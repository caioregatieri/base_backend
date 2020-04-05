const { Schema, model } = require('../../config/mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true
	},
    password: {
        type: String,
        required: true
    },
},{
    timestamps: true
})

module.exports = model('User', UserSchema);