const algoliasearch = require('algoliasearch');
/**
 * Developer - swap in whatever numeric fields you need
 * If you are using the firestore-native Algolia extension (deployed from Marketplace in GCP console),
 * any firstore timestamp fields will automatically be converted to Unix timestamp in milliseconds.
 **/
const expirationFiltersFields = ['algoliaExpiration', 'expirationDate'];

/**
 * Configured for a GCP Pub/Sub trigger, intended for use with GCP Scheduler. Trigger can be swapped out to http if desired,
 * or just export the function without the firebase structure for general use.
**/
module.exports.algoliaExpiredCleanup = async () => {
      console.log('starting algolia ticket index cleanup');
      const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_API_KEY);
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
