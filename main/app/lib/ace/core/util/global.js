import accounting from 'accounting';

// exported, global/window scope
Core = {};
Core.Schemas = {};
Core.RealmSchemas = {};
Core.Helpers = {};
Core.MetaData = {};
Core.Locale = {};
Core.Log = {};

// registry
CoreRegistry = {};

Core.getSlug = function (slugString) {
  return Transliteration.slugify(slugString);
};

/*
 *  Extend global array object for efficient
 *  array data pagination
 */
Object.defineProperty(Array.prototype, 'chunk', {
  value: function (chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize) {
      R.push(this.slice(i, i + chunkSize));
    }
    return R;
  }
});

/**
 * Match.OptionalOrNull
 * See Meteor Match methods
 * @param {String} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};
/*
 * extend Core and add common methods
 */
_.extend(Core, {
  /**
   * Core.schemaIdAutoValue
   * @summary used for schema injection autoValue
   * @example autoValue: Core.schemaIdAutoValue
   * @return {String} returns randomId
   */
  schemaIdAutoValue: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
      return Random.id();
    }
    return this.unset();
  },


  /**
   * Core.schemaNextSeqNumber
   * @summary used for schemea injection for next seq number
   * @example nextSeqNumber: Core.schemaNextSeqNumber
   * @return {Number} returns next seq number
   */
  schemaNextSeqNumber: function (documentType, tenantId) {
    let docNumber = DocumentNumbers.findAndModify({
      query: {'documentType': documentType, '_groupId': tenantId },
      update: { $inc: { nextSeqNumber: 1 } }
    });
    return docNumber && docNumber.value ? docNumber.value.nextSeqNumber : null;
  },

  schemaRetailOutletNextSeqNumber: function () {
    if (this.isInsert && Meteor.isServer) {
      return Core.schemaNextGlobalSeqNumber('retail_outlet')
    }
  },


  schemaPaymentReferenceNextSeqNumber: function () {
    if (this.isInsert && Meteor.isServer) {
      return `01-${Core.schemaNextGlobalSeqNumber('payment_reference')}`;
    }
  },

  /**
   * Core.numberWithCommas
   * @summary convert number to printable version with commas
   * @param {Number} x - number to be converted
   * @param {Number} num - number of decimals. Zero if omitted
   * @return {String} commarized pretty number
   */
  numberWithCommas: function(x, num) {
    return num ? accounting.formatNumber(x, num) : accounting.formatNumber(x);
    /*
     var parts = x.toString().split(".");
     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     return parts.join(".");
     */
  },

  numberWithDecimals: function(x) {
    return accounting.formatNumber(x, 2);
  },

  /**
   * Core.hasPermission - user permissions checks
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String} group - auth group to check for
   * @return {Boolean} Boolean - true if has permission
   */
  hasPermission: function (checkPermissions, checkUserId, group, readonly) {
    check(checkPermissions, Match.OneOf(String, Array));
    // use current user if userId is not provided
    let userId = checkUserId || this.userId;
    let permissions = [];

    // permissions can be either a string or an array
    // we'll force it into an array so we can add
    // admin roles
    if (!_.isArray(checkPermissions)) {
      permissions = [checkPermissions];
    } else {
      permissions = _.extend([], checkPermissions);
    }
    // Add admin/all or view/all roles to the permissions to check for
    let allAccessRole = readonly ? Core.Permissions.VIEW_ALL : Core.Permissions.ADMIN_ALL;

    if (_.isArray(allAccessRole)) {
      _.each(allAccessRole, function(role) {
        permissions.push(role);
      });
    } else {
      permissions.push(allAccessRole);
    }
    permissions = _.uniq(permissions);

    // check if userIsIntheRoles if group has been specified
    if (group) {
      if (Roles.userIsInRole(userId, permissions, group)) return true;
    } else if (Roles.userIsInRole(userId, permissions, Roles.GLOBAL_GROUP)) {
      return true;
    } else {
      // no group provided, check if user has permissions in any group
      let userGroups = [];

      _.each(permissions, function(permission) {
        userGroups = _.union(userGroups, Roles.getGroupsForUser(userId, permission));
      });

      if (userGroups.length > 0) return true;
    }

    // no specific permissions found, return false
    return false;
  },
  hasOwnerAccess: function (userId) {
    return this.hasPermission(Core.Permissions.TENANT_MAINTAIN, userId);
  },
  hasAdminAccess: function (userId) {
    return this.hasPermission(Core.Permissions.ADMIN_ALL, userId);
  },
  hasViewAllAccess: function (userId) {
    return this.hasPermission(Core.Permissions.VIEW_ALL, userId);
  },
  /**
   * getAuthorizedGroups - check for authorized user groups
   * @param {String} checkUserId - userId, defaults to Meteor.userId()
   * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin/all"
   * @return {Boolean} Boolean - true if has permission
   */
  getAuthorizedGroups: function(checkUserId, checkPermissions) {
    // use current user if userId is not provided
    let userId = checkUserId || this.userId;
    let permissions = [];

    // permissions can be either a string or an array
    // we'll force it into an array if in a string
    if (!_.isArray(checkPermissions)) {
      permissions = [checkPermissions];
    } else {
      permissions = checkPermissions;
    }
    
    // check if user has view all or admin access
    if (Roles.userIsInRole(userId, Core.Permissions.VIEW_ALL)) return Roles.GLOBAL_GROUP;

    // no all access, check if user has unrestricted group access
    if (Roles.userIsInRole(userId, permissions, Roles.GLOBAL_GROUP)) return Roles.GLOBAL_GROUP;

    // no all access, return available groups
    let userGroups = [];
    let user = Meteor.users.findOne(userId);
    
    if (user && user.salesProfile && user.salesProfile.vanLocationId){
      userGroups.push(user.salesProfile.vanLocationId)
    }
    _.each(permissions, function(permission) {
      userGroups = _.union(userGroups, Roles.getGroupsForUser(userId, permission));
    });

    if (userGroups.length > 0) return userGroups;

    // else, user does not have the permissions
    return false;
  },

  getUserPermissions: function(roles){
    let permissions = {};
    const pushin = x => i =>  permissions[i] ? permissions[i].push(x) : permissions[i] = [x];
    Object.keys(roles).forEach(i => {
      roles[i].forEach(pushin(i));
    })
    return permissions;
  },

  // Get rounding value for currentTenant matching same base currency iso
  getTenantRounding: function(currency, currentUserId) {
    let userId = currentUserId || this.userId;
    let rounding = Core.getAllRounding(userId);
    if (currency && rounding){
      return rounding[currency]
    }
  },

  // Round any value for a tenant based on current base currency form the settings
  roundMoney: function(value, currency, currentUserId){
    let userId = currentUserId || this.userId;
    let round = Core.getTenantRounding(currency, userId);
    if (round && round > 0){
      return  Math.round(value/round)*round;
    } else {
      return value
    }
  },

  // Calculate undiscounted document total amount
  // Get tenant TimeZone
  getTimezone: function(userId){
    let tenantId = Core.getTenantId(userId);
    if (tenantId){
      let tenant = Tenants.findOne(tenantId);
      if (tenant && tenant.timezone){
        return tenant.timezone
      } else {
        return "Africa/Lagos"
      }
    }
  },
  
  // Get System User
  getSystemUser(tenantId){
    let tenant = Tenants.findOne(tenantId);
    if (tenant && tenant.systemUserId){
      return tenant.systemUserId;
    }
  }
});
