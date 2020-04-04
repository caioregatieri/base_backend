const mongoose = require('../../config/mongoose');

const ExampleSchema = new mongoose.Schema({
	'name': String,
	'email': String,
	'address': String,
}, {
    collection: 'example'
});

const Example = mongoose.model('Example', ExampleSchema);

module.exports = Example;