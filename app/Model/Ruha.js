'use strict'

const Lucid = use('Lucid')

class Ruha extends Lucid {
    category () {
        return this.belongsTo('App/Model/Category')
    }

     created_by () {
    return this.belongsTo('App/Model/User', 'id', 'created_by_id')
  }

}

module.exports = Ruha
