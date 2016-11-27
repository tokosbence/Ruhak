'use strict'

const Database = use('Database')
const Ruha = use('App/Model/Ruha')
const Category = use('App/Model/Category')
const User = use('App/Model/User')
const Validator = use('Validator')
const Helpers = use('Helpers')
const fs = use('fs')
class RuhakController {
    *main(request, response){
        
        const categories = yield Category.all()

         for (let category of categories) {
            const latestRuha = yield category.ruhas().orderBy('id', 'desc').limit(3).fetch()
            category.latestRuha = latestRuha.toJSON()
        }

        yield response.sendView('main',{
            categories: categories
            .filter(category => category.latestRuha.length > 0)
            .toJSON()
        })
    

    }


     * create (request, response) {
    const categories = yield Category.all()

    yield response.sendView('ruha_create', { categories: categories.toJSON() })
  }

  /**
   *
   */
  * doCreate (request, response) {
    const ruhaData = request.all()
    const validation = yield Validator.validateAll(ruhaData, {
      name: 'required',
      description: 'required',
      anyag: 'required',
      szin: 'required'
    })

    if (validation.fails()) {
      yield request
        .withAll()
        .andWith({ errors: validation.messages() })
        .flash()

      response.route('ruha_create')
	  return;
    }
    const category = yield Category.find(ruhaData.category)

    if (!category) {
      yield request
        .withAll()
        .andWith({ errors: [{ message: 'category doesn\'t exist' }] })
        .flash()

      response.route('ruha_create')
	  return;
    }
	
    const ruhaImage = request.file('image', { maxSize: '1mb', allowedExtensions: ['jpg', 'JPG'] })

    if (ruhaImage.clientSize() > 0 && !ruhaImage.validate()) {
      yield request
        .withAll()
        .andWith({ errors: [{ message: ruhaImage.errors() }] })
        .flash()

      response.route('ruha_create')
      return
    }

    const ruha = new Ruha()
    ruha.name = ruhaData.name
    ruha.description = ruhaData.description
    ruha.anyag = ruhaData.anyag
    ruha.szin = ruhaData.szin
    ruha.category_id = ruhaData.category
    ruha.created_by_id = request.currentUser.id

    // TODO: these lines should be executed atomically
    yield ruha.save()
    yield ruhaImage.move(Helpers.publicPath() + '/images', `${ruha.id}.jpg`)

    response.route('ruha_page', { id: ruha.id })
  }


  * show (request, response) {
    const ruhaId = request.param('id')
    const ruha = yield Ruha.find(ruhaId)

    if (ruha) {
      yield ruha.related('category').load()
      yield ruha.related('created_by').load()

      const fileName = `/images/${ruha.id}.jpg`
      const imageExists = yield fileExists(`${Helpers.publicPath()}/${fileName}`)
      const ruhaImage = imageExists ? fileName : false

      yield response.sendView('ruha', { ruha: ruha.toJSON(), ruhaImage })
    } else {
      response.notFound('Ruha not found.')
    }
  }


  * edit (request, response) {
    const ruhaId = request.param('id')
    const ruha = yield Ruha.find(ruhaId)

	
    if (!ruha || ruha.deleted == true) {
	  yield response.notFound('Ruha not found.')
	  return;
    } 
	
    if (ruha.created_by_id !== request.currentUser.id) {
      response.unauthorized('Access denied.')
    }

    yield ruha.related('category').load()
    yield ruha.related('created_by').load()

    const categories = yield Category.all()

    yield response.sendView('ruha_edit', { categories: categories.toJSON(), ruha: ruha.toJSON() })
  }

  /**
   *
   */
  * doEdit (request, response) {
    const ruhaId = request.param('id')
    const ruha = yield Ruha.find(ruhaId)

    if (!ruha || ruha.deleted) {
	  yield response.notFound('Ruha not found.')
	  return;
    } 
	
    if (ruha.created_by_id !== request.currentUser.id) {
      yield response.unauthorized('Access denied.')
	  return;
    }
	  
    const ruhaData = request.all()
    const validation = yield Validator.validateAll(ruhaData, {
      name: 'required',
      description: 'required',
      anyag: 'required',
      szin: 'required'
    })

    if (validation.fails()) {
      yield request
        .with({ errors: validation.messages() })
        .flash()

      yield response.route('ruha_edit', {id: ruha.id})
	  return;
    } 
      const category = yield Category.find(ruhaData.category)

    if (!category) {
      yield request
        .with({ errors: [{ message: 'category doesn\'t exist' }] })
        .flash()

      yield response.route('ruha_edit', {id: ruha.id})
	  return;
    } 
    const ruhaImage = request.file('image', { maxSize: '1mb', allowedExtensions: ['jpg', 'JPG'] })

    if (ruhaImage.clientSize() > 0) {
      yield ruhaImage.move(Helpers.publicPath() + '/images', `${ruha.id}.jpg`)

      if (!ruhaImage.moved()) {
        yield request
          .with({ errors: [{ message: ruhaImage.errors() }] })
          .flash()

        response.route('ruha_edit', {id: ruha.id})
        return
      }
    }

    ruha.name = ruhaData.name
    ruha.description = ruhaData.description
    ruha.anyag = ruhaData.anyag
    ruha.szin = ruhaData.szin
    ruha.category_id = ruhaData.category

    yield ruha.update()

    response.route('ruha_page', { id: ruha.id })
    
  }

  /**
   *
   */
  * doDelete (request, response) {
    const ruhaId = request.param('id')
    const ruha = yield Ruha.find(ruhaId)

    if (ruha) {
      if (ruha.created_by_id !== request.currentUser.id) {
        response.unauthorized('Access denied.')
      }

      ruha.deleted = true
      yield ruha.update()

      response.route('main')
    } else {
      response.notFound('Ruha not found.')
    }
  }


* index (request, response) {
    const page = Math.max(1, request.input('p'))
    const filters = {
      ruhaName: request.input('ruhaName') || '',
      category: request.input('category') || 0,
      createdBy: request.input('createdBy') || 0
    }

    const recipes = yield Ruha.query()
      .active()
      .where(function () {
        if (filters.category > 0) this.where('category_id', filters.category)
        if (filters.createdBy > 0) this.where('created_by_id', filters.createdBy)
        if (filters.ruhaName.length > 0) this.where('name', 'LIKE', `%${filters.ruhaName}%`)
      })
      .with('created_by')
      .paginate(page, 9)

    const categories = yield Category.all()
    const users = yield User.all()

    yield response.sendView('ruha', {
      ruha: ruha.toJSON(),
      categories: categories.toJSON(),
      users: users.toJSON(),
      filters
    })
  }




}


function fileExists(fileName) {
  return new Promise((resolve, reject) => {
    fs.access(fileName, fs.constants.F_OK, err => {
      if (err) resolve(false)
      else resolve(true)
    })
  })
}

module.exports = RuhakController
