# changes made with integration of api protection (and other) 

### first update all packages and clean all local data form dockers !!!

### posible breaking changes:
- all routes require basic authentication with bearer {token}
- some need admin role

### api routes not protected
- auth/google
- /login
- /register
- maybe some else but cant remember right now :)


### changes in backend
- admin user: admin@admin.com; pass: admin_123
- added another decorator for admin calls
- added prehandler to all routes besides the ones that should not be protected
- added another route for user retrieving and manilupation (in controllers)
- sanitize util:
    + output (so when calling user routes it doesn't show their password etc)
    + input (replace escape chars withc html unicode equivalents)
- rate limiting (used fastify/rate-limit)
- didnt put protection on the /ws 


### changes in gameplay
- added authentication headers for match tournament and ai in utilities.js
- function to get token from localstorage


### changes in frontend
- logout needs auth token now



more testing needs to be done to see if there are some other paths that have not ben updated




