/*
 * DataLoader is a global server object that it can be reused for different collections.
 * It assumes collection data in /private/data
 */

/* eslint no-loop-func: 0*/

DataLoader = class DataLoader {
  /**
   * BootstrapLoader.loadData
   * @summary imports collection initialisation data
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadData(collection, jsonFile) {
    check(collection, Mongo.Collection);
    check(jsonFile, Match.Optional(String));

    // prevent import if existing collection data
    if (collection.find().count() > 0) {
      return false;
    }

    let json = null;
    let result = null;

    Core.Log.debug(
      `Loading initialisation data for ${collection._name}`);
    // if jsonFile was path wasn't provided
    // we'll assume we're loading collection data
    if (!jsonFile) {
      json = EJSON.parse(Assets.getText("data/" + collection._name +
        ".json"));
    } else {
      json = EJSON.parse(jsonFile);
    }

    // loop over each item in json and insert into collection
    for (let item of json) {
      try {
        result = collection.insert(item);
      } catch (err) {
        Core.Log.error("Error adding initialisation data to " +
          collection._name + ":", err.message);
      }
    }

    if (result) {
      Core.Log.info(
        `Success importing initialisation data to ${collection._name}`
      );
    }
  }

  /**
   * BootstrapLoader.loadPartitionData
   * @summary imports collection initialisation data for a specified tenant
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadPartitionData(collection, group, jsonFile) {
    check(collection, Mongo.Collection);
    check(group, Match.Optional(String));
    check(jsonFile, Match.Optional(String)); 


    let tenantId = group || Core.getDefaultTenantId();

    // prevent import if existing collection data for the partition
    if (tenantId) {
      Partitioner.bindGroup(tenantId, function(){ 
        if (collection.find().count() > 0) {
          return false;
        }
    
        let json = null;
        let result = null;
    
        Core.Log.debug(
          `Loading initialisation data for ${collection._name} in tenant ${tenantId}`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
            ".json"));
        } else {
          json = EJSON.parse(jsonFile); 
        }
         
        let totalItems = Object.keys(json).length;
        
        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...` 
        );
          
        // loop over each item in json and insert into collection
        for (let item of json) {
          try {
            result = collection.insert(item);
          } catch (err) {
            Core.Log.error("Error adding initialisation data to " +
              collection._name + ":", err.message);
          }
        }

        if (result) {
          Core.Log.info(
            `Success importing initialisation data to ${collection._name} for tenant ${tenantId}`
          );
        }

      });  
    }
  }

  /**
   * BootstrapLoader.loadPartitionDataBulk
   * @summary imports collection initialisation data for a specified tenant, using bulk insert
   * @param {Object} collection - The collection to import
   * @param {String} group - The tenant to import data for, default to current Tenant if not provided
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadPartitionDataBulk(collection, group, jsonFile) {
    check(collection, Mongo.Collection);
    check(group, Match.Optional(String));
    check(jsonFile, Match.Optional(String)); 

    let tenantId = group || Core.getDefaultTenantId();

    // prevent import if existing collection data for the partition
    if (tenantId) {
      Partitioner.bindGroup(tenantId, function(){ 
        if (collection.find().count() > 0) {
          return false;
        }
    
        let json = null;
        let result = null;
    
        Core.Log.debug(
          `Loading initialisation data for ${collection._name} in tenant ${tenantId}`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
            ".json"));
        } else {
          json = EJSON.parse(jsonFile);
        }
        
        let totalItems = Object.keys(json).length;
        let itemCount = 0;

        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...` 
        );
 
        let bulk = collection.rawCollection().initializeUnorderedBulkOp();

        // loop over each item in json and insert into collection
        for (let item of json) {
          item._groupId = tenantId; //manually insert tenantId
          bulk.insert(item);
        }

        try {
          let syncBulkExecute = Meteor.wrapAsync(bulk.execute, bulk);
          syncBulkExecute();
          Core.Log.info(
              `Success importing initialisation data to ${collection._name} for tenant ${tenantId}`
          );
        } catch (err) {
          Core.Log.error("Error adding initialisation data to " +
              collection._name + ":", err.message);
        }

      });  
    }
  }
 

  /**
   * loadI18n initialisation
   * @summary imports translation initialisation data
   * @param {Object} translationCollection - optional collection object
   * @returns {null} inserts collection
   */
  loadI18n(translationCollection) {
    let collection = translationCollection || Translations;
    let json;

    if (collection.find().count() > 0) {
      return;
    }

    let tenant = Tenants.findOne();
    if (tenant) {
      Core.Log.info(
        `Loading initialisation data for ${collection._name}`);
      if (!(tenant !== null ? tenant.languages : void 0)) {
        tenant.languages = [{
          i18n: "en"
        }];
      }

      for (let language of tenant.languages) {
        json = EJSON.parse(Assets.getText("data/i18n/" + language.i18n +
          ".json"));
        for (let item of json) {
          collection.insert(item, function (error) {
            if (error) {
              Core.Log.warn("Error adding " + language.i18n +
                " to " + collection._name, item, error);
            }
          });
          Core.Log.info("Success adding " + language.i18n +
            " to " +
            collection._name);
        }
      }
    } else {
      Core.Log.error("No tenant found. Failed to load languages.");
      return;
    }
  }

  /**
   * BootstrapLoader.loadBulkData
   * @summary imports collection initialisation data for a specified tenant, using bulk insert
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadBulkData(collection, jsonFile) {
    check(collection, Mongo.Collection);
    check(jsonFile, Match.Optional(String));

    // prevent import if existing collection data for the partition
        if (collection.find().count() > 0) {
          return false;
        }

        let json = null;
        let result = null;

        Core.Log.debug(
            `Loading initialisation data for ${collection._name} in  none partitioned data`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
              ".json"));
        } else {
          json = EJSON.parse(jsonFile);
        }

        let totalItems = Object.keys(json).length;
        let itemCount = 0;

        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...`
        );

        let bulk = collection.rawCollection().initializeUnorderedBulkOp();

        // loop over each item in json and insert into collection
        for (let item of json) {
          bulk.insert(item);
        }

        try {
          let syncBulkExecute = Meteor.wrapAsync(bulk.execute, bulk);
           syncBulkExecute();
           Core.Log.info(
              `Success importing initialisation data to ${collection._name} for tenant`
            );
        } catch (err) {
          Core.Log.error("Error adding initialisation data to " +
          collection._name + ":", err.message);
        }
        
  }

  /**
   * BootstrapLoader.loadData
   * @summary imports collection initialisation data for a specified tenant
   * @param {Object} collection - The collection to import
   * @param {String} jsonFile - path to json File.
   * @return {Boolean} boolean -  returns true on insert
   */
  loadData(collection, jsonFile) {
    check(collection, Mongo.Collection);
    check(jsonFile, Match.Optional(String));
        if (collection.find().count() > 0) {
          return false;
        }

        let json = null;
        let result = null;

        Core.Log.debug(
            `Loading initialisation data for ${collection._name} in none partitioned data`);
        // if jsonFile was path wasn't provided
        // we'll assume we're loading collection data
        if (!jsonFile) {
          json = EJSON.parse(Assets.getText("data/" + collection._name +
              ".json"));
        } else {
          json = EJSON.parse(jsonFile);
        }

        let totalItems = Object.keys(json).length;

        Core.Log.info(
            `Importing ${totalItems} items for ${collection._name}...`
        );

        // loop over each item in json and insert into collection
        for (let item of json) {
          try {
            result = collection.insert(item);
          } catch (err) {
            Core.Log.error("Error adding initialisation data to " +
                collection._name + ":", err.message);
          }
        }

        if (result) {
          Core.Log.info(
              `Success importing initialisation data to ${collection._name} for  none partitioned data`
          );
        }
  }

  initializeSystemUsers(tenant){
      if (tenant.systemUserId) return;

      Partitioner.bindGroup(tenant._id, function(){
        let adminUser = Meteor.users.findOne({"roles.__global_roles__": {$in: ["admin/all"]}});
        if (adminUser) {
          try {
            Tenants.update(tenant._id, {$set: {systemUserId: adminUser._id}});
            Core.Log.info(
                `Success adding tenant systemUserId for tenant ${tenant.id} with user ${adminUser._id}`
            );
          } catch (err){
            Core.Log.error(
                `Error adding tenant systemUserId for tenant ${tenant._id} with user ${adminUser._id}`
            );
          }

        }
      })
  }
};


Meteor.startup(function () {
	//load default data
	
});
