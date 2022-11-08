const algoliasearch = require('algoliasearch');

/**
 * process.env.ALGOLIA_APP_ID and process.env.ALGOLIA_API_KEY must be set for this to work.
 * Ensure the API key has listIndices and deleteObject ACLs set.
**/

/**
 * Developer - swap in whatever numeric fields you need
 * If you are using the firestore-native Algolia extension (deployed from Marketplace in GCP console),
 * any firstore timestamp fields will automatically be converted to Unix timestamp in milliseconds.
 **/
const expirationFiltersFields = ['algoliaExpiration', 'expirationDate'];

/**
 * Function has been generalized for use in any system. 
 * For use in GCP Firebase functions, recommended setup is with an HTTP or Pub/Sub trigger for scheduled jobs.
**/
module.exports.algoliaExpiredCleanup = async () => {
      console.log('starting algolia ticket index cleanup');
      const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
      const {items: indices} = await client.listIndices(); // destructure items into variable indices
      const nowUnix = Date.now(); // milliseconds
      const numericORFilterList = [];
      expirationFiltersFields.forEach((field)=>{
        numericORFilterList.push(`${field} <= ${nowUnix}`);
      });
      const cleanupPrms = indices.map( async (indexObj)=>{
        console.log(`Running cleanup on ${indexObj.name} - ${indexObj.entries} records`);
        const index = client.initIndex(indexObj.name);
        const result = await index.deleteBy({
          numericFilters: [numericORFilterList],
        });
        console.log(result);
      });
      await Promise.allSettled(cleanupPrms);
    });
