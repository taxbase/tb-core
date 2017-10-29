/**
 * Core
 * Global tenant permissions methods and tenant initialization
 */
_.extend(Core, {
  tenantId: null,
  init: function () {
    let self;
    self = this;

    

    return Tracker.autorun(function () {
      let domain = document.location.hostname;
      let tenant;
      let tenantHandle;

      // keep an eye out for tenant change
      if (Meteor.userId())
        tenantHandle = Meteor.subscribe('CurrentTenant');
      else {
        tenantHandle = Meteor.subscribe('TenantForDomain', domain);
      }

        

      if (tenantHandle.ready()) {
        //domain = Meteor.absoluteUrl().split("/")[2].split(":")[0];
        tenant = Tenants.findOne({
         // domains: domain
        });
        if (tenant) {
          self.tenantId = tenant._id;
          self.country = tenant.country;
          self.baseCurrency = tenant.baseCurrency;
          self.settings = tenant.settings;
          self.timezone = tenant.timezone;
          return self;
        }
        
      }
    });
  }, 
  getTenantId: function () {
    return this.tenantId;
  },
  getTenantCountry: function () {
      return this.country;
  },
  getTenantTaxRate: function () {
    let tax = Taxes.findOne({});
    if (tax) {
      let rate = tax.rates[0];
      return rate.rate;
    }
  },
  getTenantBaseCurrency: function () {
    return this.baseCurrency;
  },
  getTenantSettings: function () {
    return this.settings;
  },
});

/*
 * configure bunyan logging module for client
 * See: https://github.com/trentm/node-bunyan#levels
 * client we'll cofigure WARN as default
 */
let isDebug = "WARN";

if (Meteor.settings !== undefined) {
  if (Meteor.settings.public) {
    if (Meteor.settings.public.debug) {
      isDebug = Meteor.settings.public.debug;
    }
  }
}

levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
  isDebug = isDebug.toUpperCase();
}

if (!_.contains(levels, isDebug)) {
  isDebug = "INFO";
}

Core.Log = bunyan.createLogger({
  name: "core-client"
});

Core.Log.level(isDebug);

Tracker.autorun(function() {
  Meteor.userId();
});



/**
 *  Startup TradeDepot Central
 *  Init TDC client
 */

Meteor.startup(function () {
  Core.init();
});

