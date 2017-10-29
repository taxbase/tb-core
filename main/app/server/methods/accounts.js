/**
 * Accounts handlers
 * creates a login type "anonymous"
 * default for all unauthenticated visitors
 */
/*
Accounts.registerLoginHandler(function (options) {
  if (!options.anonymous) {
    return void 0;
  }
  let loginHandler;
  let stampedToken = Accounts._generateStampedLoginToken();
  let userId = Accounts.insertUserDoc({
    services: {
      anonymous: true
    },
    token: stampedToken.token
  });
  loginHandler = {
    type: "anonymous",
    userId: userId
  };
  return loginHandler;
});
*/

/**
 * Accounts.onCreateUser event
 * adding either a guest or anonymous role to the user on create
 * adds Accounts record for user profile
 *
 * see: http://docs.meteor.com/#/full/accounts_oncreateuser
 */

Accounts.onCreateUser(function (options, user) {
  let tenantId = options.tenantId;
  let roles = {};

  user.profile = {};
  
  let fullName = [options.firstname, options.lastname];


  user.profile['fullName'] = fullName.join(" ");
  user.profile['firstname'] = options.firstname;
  user.profile['lastname'] = options.lastname;  
  user.profile['phoneNumber'] = options.phoneNumber;  
  
  user.roles = options.roles || {};
  // assign user to his tenant Partition
  Partitioner.setUserGroup(user._id, tenantId);
  return user;
});  

/**
 * Accounts.onLogin event
 * automatically push checkoutLogin when users login.
 * let"s remove "anonymous" role, if the login type isn't "anonymous"
 * @param
 * @returns
 */ 
Accounts.onLogin(function (options) { 
  /*
  let update = {
    $pullAll: {}
  };

  update.$pullAll["roles." + Core.getTenantId()] = ["anonymous"];

  Meteor.users.update({
    _id: options.user._id
  }, update, {
    multi: true
  });*/
  Meteor.users.update(options.user._id, {$set: {lastSignedInAt: new Date}})
});


/**
 * Core Account Methods
 */
Meteor.methods({
  /*
   * check if current user has password
   */
  "accounts/currentUserHasPassword": function () {
    let user;
    user = Meteor.users.findOne(Meteor.userId());
    if (user.services.password) {
      return true;
    }
    return false;
  },

  "account/update": function (user, userId) {
    check(user, Object);
    check(userId, String);
    if (!Meteor.userId()){
      throw new Meteor.Error(404, "Unauthorized");
    }
    let account =  Meteor.users.findOne(userId);
    if (account){
      Meteor.users.update({_id: account._id}, {$set: {
        "emails.0.address": user.emails[0].address,
        "profile.fullName": user.profile.fullName,
        "profile.workPhone": user.profile.workPhone,
        "profile.homePhone": user.profile.homePhone,
        "roles": user.roles,
        "notifications": user.notifications,
        "salesProfile": user.salesProfile
      }});
      return true
    } else {
      throw new Meteor.Error(404, "Account Not found");
    }
  },

  "account/getUsernamesByIds": function (userIds) {
    if (!Meteor.userId()){
      throw new Meteor.Error(404, "Unauthorized");
    }
    this.unblock();
    let users = Meteor.users.find({_id: {$in: userIds}}).fetch();
    let data = {};

    _.each(users, function (user) {
        data[user._id] = {
          username: user.username,
          email: user.emails[0].address,
          assigneeCode: user.salesProfile ? user.salesProfile.originCode : "",
          fullName: user.profile.fullName
              };
    });
    return data
  },

  "account/updateNotifications": function(notifications, userId){
    check(notifications, Object);
    check(userId, String);
    if (!Meteor.userId()){
      throw new Meteor.Error(404, "Unauthorized");
    }
    let account =  Meteor.users.findOne(userId);
    if (account){
      Meteor.users.update({_id: account._id}, {$set: {
        "notifications": notifications
      }});
      return true
    } else {
      throw new Meteor.Error(404, "Account Not found");
    }
  },
  "account/create": function (user, sendEnrollmentEmail) {
    check(user, Object);
    check(sendEnrollmentEmail, Boolean);
    if (!Meteor.userId()){
      throw new Meteor.Error(404, "Unauthorized");
    }

    let foundUser =  Accounts.findUserByEmail(user.email); //changed to use Meteor's proposed approach to handle case sensitivity
    if (foundUser){
     throw new Meteor.Error(404, "Email already exists");
    }

    let options = {};

    options.email = user.email; // temporary
    options.firstname = user.firstName;
    options.lastname =  user.lastName;
    options.salesProfile = user.salesProfile;
    options.tenantId = Core.getTenantId(Meteor.userId());
    options.roles = user.roles;

    let accountId = Accounts.createUser(options);
    if (sendEnrollmentEmail){
      try {
        Accounts.sendEnrollmentEmail(accountId, user.email);
      } catch (e) {
        throw new Meteor.Error(408, "Unable to send a notification mail to the user")
      }
    }
    
    if(accountId) {
      Meteor.users.update(accountId, {$set: {
        'profile.middlename': user.middleName,
        'profile.phoneNumber': user.phoneNumber,
        'profile.mobileNumber': user.mobileNumber,
        'profile.address': user.address,
        'profile.gender': user.gender,
        'profile.maritalStatus': user.maritalStatus,
        'profile.dateOfBirth': user.dateOfBirth,
        plateNumber: user.plateNumber
      }})
    }

    return true
  },
  
  /*
   * invite new admin users
   * (not consumers) to secure access in the dashboard
   * to permissions as specified in packages/roles
   */
  "accounts/inviteTenantMember": function (tenantId, email, name) {
    if (!Core.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    let currentUserName;
    let tenant;
    let token;
    let user;
    let userId;
    check(tenantId, String);
    check(email, String);
    check(name, String);
    this.unblock();
    tenant = Tenants.findOne(tenantId);

    if (!Core.hasOwnerAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }

    if (tenant && email && name) {
      let currentUser = Meteor.user();
      if (currentUser) {
        if (currentUser.profile) {
          currentUserName = currentUser.profile.name;
        } else {
          currentUserName = currentUser.username;
        }
      } else {
        currentUserName = "Admin";
      }

      user = Meteor.users.findOne({
        "emails.address": email
      });

      if (!user) {
        userId = Accounts.createUser({
          email: email,
          username: name
        });
        user = Meteor.users.findOne(userId);
        if (!user) {
          throw new Error("Can't find user");
        }
        token = Random.id();
        Meteor.users.update(userId, {
          $set: {
            "services.password.reset": {
              token: token,
              email: email,
              when: new Date()
            }
          }
        });
        SSR.compileTemplate("tenantMemberInvite", Assets.getText("server/emailTemplates/tenantMemberInvite.html"));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + tenant.emails[0] + ">",
            subject: "You have been invited to join " + tenant.name,
            html: SSR.render("tenantMemberInvite", {
              homepage: Meteor.absoluteUrl(),
              tenant: tenant,
              currentUserName: currentUserName,
              invitedUserName: name,
              url: Accounts.urls.enrollAccount(token)
            })
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      } else {
        SSR.compileTemplate("tenantMemberInvite", Assets.getText("server/emailTemplates/tenantMemberInvite.html"));
        try {
          Email.send({
            to: email,
            from: currentUserName + " <" + tenant.emails[0] + ">",
            subject: "You have been invited to join the " + tenant.name,
            html: SSR.render("tenantMemberInvite", {
              homepage: Meteor.absoluteUrl(),
              tenant: tenant,
              currentUserName: currentUserName,
              invitedUserName: name,
              url: Meteor.absoluteUrl()
            })
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      }
    } else {
      throw new Meteor.Error(403, "Access denied");
    }
    return true;
  },

  /*
   * send an email to consumers on sign up
   */
  "accounts/sendWelcomeEmail": function (tenantId, userId) {
    let email;
    check(tenant, Object);
    this.unblock();
    email = Meteor.user(userId).emails[0].address;
    Core.configureMailUrl();
    SSR.compileTemplate("welcomeNotification", Assets.getText("server/emailTemplates/welcomeNotification.html"));
    Email.send({
      to: email,
      from: tenant.emails[0],
      subject: "Welcome to " + tenant.name + "!",
      html: SSR.render("welcomeNotification", {
        homepage: Meteor.absoluteUrl(),
        tenant: tenant,
        user: Meteor.user()
      })
    });
    return true;
  },
  

  /*
   * accounts/addUserPermissions
   * @param {Array|String} permission
   *               Name of role/permission.  If array, users
   *               returned will have at least one of the roles
   *               specified but need not have _all_ roles.
   * @param {String} [group] Optional name of group to restrict roles to.
   *                         User"s Roles.GLOBAL_GROUP will also be checked.
   * @returns {Boolean} success/failure
   */
  "accounts/addUserPermissions": function (userId, permissions, group) {
    if (!Core.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, Match.OneOf(String, Array));
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.addUsersToRoles(userId, permissions, group);
    } catch (error) {
      return Core.Log.info(error);
    }
  },

  /*
   * accounts/removeUserPermissions
   */
  "accounts/removeUserPermissions": function (userId, permissions, group) {
    if (!Core.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String, null));
    this.unblock();
    try {
      return Roles.removeUsersFromRoles(userId, permissions, group);
    } catch (error) {
      Core.Log.info(error);
      throw new Meteor.Error(403, "Access Denied");
    }
  },

  /*
   * accounts/setUserPermissions
   */
  "accounts/setUserPermissions": function (userId, permissions, group) {
    if (!Core.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access denied");
    }
    check(userId, String);
    check(permissions, Match.OneOf(String, Array));
    check(group, Match.Optional(String));
    this.unblock();
    try {
      return Roles.setUserRoles(userId, permissions, group);
    } catch (error) {
      return Core.Log.info(error);
    }
  },

  "accounts/getUsers": function (searchText, options) {
    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    options = options || {};
    options.limit = 10;
    options.fields = {
      "profile.fullName": 1
    };
    options.sort = { name: 1 };

    if(searchText && searchText.length > 0) {
      var regExp = Core.buildRegExp(searchText);
      var selector =
      { $or: [
        {"profile.fullName": regExp},
        {"salesProfile.originCode": regExp}
      ]};
      return Meteor.users.find(selector, options).fetch();
    }
  },
  /*
   * accounts/updateServiceConfiguration
   */
    "accounts/updateServiceConfiguration": (service, fields) => {
    check(service, String);
    check(fields, Array);
    const dataToSave = {};

    _.each(fields, function (field) {
      dataToSave[field.property] = field.value;
    });

    if (Core.hasPermission(["dashboard/accounts"])) {
      return ServiceConfiguration.configurations.upsert({
        service: service
      }, {
        $set: dataToSave
      });
    }
    return false;
  }, 

  /*
  * Send reset email
  */
  "accounts/sendResetPasswordEmail": (email) => {
    let user = Accounts.findUserByEmail(email);
    
    if(!user)
      throw new Meteor.Error(404, "User not found");

    try {
      Accounts.sendResetPasswordEmail(user._id, email);
      return true;
    } catch (error) {
      Core.Log.info(error);
    }
  },

  /*
   * Send reset email
   */
  "accounts/checkEmailExists": (email) => {
    let account;
    Partitioner.directOperation(function () {
      if (Accounts.findUserByEmail(email)) {
        account = true 
      }
    });
    if (account){
      return true
    } else {
      return false
    }
  },

  "accounts/assignVanSales"(userIds){
    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }

    let users = Meteor.users.find({_id: {$in: userIds}, "salesProfile.vanLocationId": {$exists: false}}).fetch();
    _.each(users, function (user) {
      // create location for user
      let location = {};
      location.name = `${user.profile.fullName}'s Van`;
      location.isMobile = true;
      location.locationType = "Sales Van";
      let locationId = Locations.insert(location);
      Meteor.users.update(user._id, {$set: {
        "salesProfile.vanLocationId": locationId
      }});
      Roles.setUserRoles(user._id, _.uniq(["orders/manage"]), locationId);
    });
    return true
  },

  "accounts/resendEnrollmentEmail"(id, email){
    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    Accounts.sendEnrollmentEmail(id, email);
    return true
  },
  "accounts/getEnrollment"(userId){
    this.unblock();

    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let user = Meteor.users.findOne(userId);

    return user.services && user.services.password && user.services.password.bcrypt ? true : false
  }
});
