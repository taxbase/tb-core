/*
 * instantiate loader
 */
this.Loader = new DataLoader();

/**
 * getDomain
 * local helper for creating admin users
 * @param {String} requestUrl - url
 * @return {String} domain name stripped from requestUrl
 */
function getDomain(requestUrl) {
  let url = requestUrl || process.env.ROOT_URL;
  let domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1];
  return domain;
}

/**
 * CoreRegistry createDefaultAdminUser
 * @summary Method that creates default admin user
 * Settings load precendence:
 *  1. settings in meteor.settings
 *  2. environment variables
 */

CoreRegistry.createDefaultAdminUser = function (tenantId, domain, email, username, firstname, lastName) {
  domain = domain || Core.getDefaultDomain();
  tenantId = tenantId || Core.getDefaultTenantId();
  const options = {};
  const defaultAdminRoles = ["admin/all"];
  
  // defaults use either env or generated
  options.email = email || "baseadmin@firs.co"; // temporary
  options.username = username || "baseUser"; // username
  options.password = process.env.BASE_ADMIN_PASS || '123456';
  options.firstname = firstname || 'Petyr';
  options.lastname = lastName || 'Roman';
  options.tenantId = tenantId;

  // if an admin user has already been created, we'll exit
  if (Accounts.findUserByEmail(options.email)) {
    return;
  }
  // create the new admin user
  let accountId = Accounts.createUser(options);
  // notify user that admin was created
  Core.Log.warn(
      `\n *********************************
      \n  IMPORTANT! DEFAULT ADMIN INFO
      \n  EMAIL/LOGIN: ${options.email}
      \n ********************************* \n\n`);

  Roles.setUserRoles(accountId, _.uniq(defaultAdminRoles), Roles.GLOBAL_GROUP);

  Meteor.users.update(accountId, {$set: {
    'profile.designation': 'Supervisor',
    'profile.role': 'Admin',
    'profile.deduction': '5000'
  }})
};

/*
 * load core initialisation data
 */

CoreRegistry.initData = function () {
  let tenantId = Core.getDefaultTenantId();
  Loader.loadData(Tenants);
  Loader.loadPartitionDataBulk(Transactions);

  // start checking once per second if Tenants collection is ready,
  // then load the rest of the fixtures when it is
  let wait = Meteor.setInterval(function () {
    if (!!Tenants.find().count()) {
      Meteor.clearInterval(wait);
      CoreRegistry.createDefaultAdminUser();
      // initialization complete
      Core.Log.info('FIRS Core initialization finished.');
    }
  }, 1000);
};
