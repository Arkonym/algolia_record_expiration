__algolia_record_expiration__

Simple Algolia index cleanup based on configurable expiration filters.
Runs native deleteBy on all indices available to the provided Application ID and API key.

API key must have the following ACLs assigned:
- listIndexes
- deleteObject
