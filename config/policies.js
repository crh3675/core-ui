/**
 * Policies are enforced for matching component routes
 * Wildcard * may be used as well as a placeholder
 */
module.exports.policies = {
  '/': [],
  'Main.*': ['isAuthenticated']
};
