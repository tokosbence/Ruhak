'use strict'

const Lucid = use('Lucid')

class Category extends Lucid {
    ruhas(){
        return this.hasMany('App/Model/Ruha')
    }
}

module.exports = Category
