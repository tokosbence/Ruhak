'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.get('/login', 'UserController.login').as('login')
Route.post('/login', 'UserController.doLogin').as('do_login')
Route.get('/logout', 'UserController.doLogout').as('do_logout').middleware('auth')
Route.get('/register', 'UserController.register').as('register')
Route.post('/register', 'UserController.doRegister').as('do_register')
Route.get('/profile', 'UserController.profile').as('profile').middleware('auth')
Route.get('/logout', 'UserController.doLogout').as('do_logout').middleware('auth')
Route.post('/profile/edit', 'UserController.doProfileEdit').as('do_profile_edit').middleware('auth')
Route.post('/profile/edit_password', 'UserController.doPasswordEdit').as('do_password_edit').middleware('auth')


Route.get('/', 'RuhakController.main').as('main')
Route.get('/ruha/create', 'RuhakController.create').as('ruha_create').middleware('auth')
Route.post('/ruha/create', 'RuhakController.doCreate').as('do_ruha_create').middleware('auth')
Route.get('/ruha/:id', 'RuhakController.show').as('ruha_page')
Route.get('/ruha/:id/edit', 'RuhakController.edit').as('ruha_edit')
Route.post('/ruha/:id/edit', 'RuhakController.doEdit').as('do_ruha_edit')
Route.get('/ruha/:id/delete', 'RuhakController.doDelete').as('ruha_delete')