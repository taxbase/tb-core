Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound'
});


Router.route('/', {
  name: 'home',
  controller: 'HomeController',
  where: 'client'
});

Router.route('/blank-fillings', {
  name: 'home.blank',
  controller: 'HomeController',
  where: 'client',
  action: 'blankFilling'
});


Router.route('fillings', {
  name: 'fillings.list',
  controller: 'HomeController',
  where: 'client',
  action: 'listFillings'
});

Router.route('filling/new', {
  name: 'filling.create',
  controller: 'HomeController',
  where: 'client',
  action: 'createFilling'
});

Router.route('filling/:_id', {
  name: 'filling.detail',
  controller: 'FillingsController',
  action: 'fillingDetail',
  where: 'client'
});

Router.route('exempts/zero-rated-products', {
  name: 'zero-rated-products.list',
  controller: 'ProductsController',
  where: 'client',
  action: 'zeroRatedProducts'
});

Router.route('exempts/none-zero-rated-products', {
  name: 'none-zero-rated-products.list',
  controller: 'ProductsController',
  where: 'client',
  action: 'noneZeroRatedProducts'
});

Router.route('adjustments/sales-adjustments', {
  name: 'adjustments.sales',
  controller: 'AdjustmentsController',
  where: 'client',
  action: 'salesAdjustment'
});

Router.route('breakdown', {
  name: 'breakdown',
  controller: 'BreakdownController',
  where: 'client'
});

Router.route('accounts', {
  name: 'accounts.list',
  controller: 'AccountsController',
  where: 'client',
  action: 'listAccounts'
});

Router.route('accounts/create', {
  name: 'account.create',
  controller: 'AccountsController',
  where: 'client',
  action: 'createAccounts'
});
