const bcrypt = require('bcrypt');

const encrypt = (value) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(value, salt);
}

module.exports = {
    encrypt
}