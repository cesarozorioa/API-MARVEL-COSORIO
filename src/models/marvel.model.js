const mongoose = require('mongoose')
const bookScchema = new mongoose.Schema(
    {
        id:Number,
        name:String,
        description:String,
        thumbnail:String        
    }
)

module.exports = mongoose.model('Personaje',bookScchema)