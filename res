ai        | INFO:     Started server process [1]
ai        | INFO:     Waiting for application startup.
ai        | INFO:     Application startup complete.
ai        | INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
gameplay  | Starting up http-server, serving ./
gameplay  | 
gameplay  | http-server version: 14.1.1
gameplay  | 
frontend  | 
gameplay  | http-server settings: 
frontend  | > ts_frontend@0.0.0 dev
frontend  | > vite --host 0.0.0.0
gameplay  | CORS: disabled
gameplay  | Cache: 3600 seconds
gameplay  | Connection Timeout: 120 seconds
gameplay  | Directory Listings: visible
gameplay  | AutoIndex: visible
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
gameplay  | Serve GZIP Files: false
gameplay  | Serve Brotli Files: false
gameplay  | Default File Extension: none
frontend  | 
frontend  | 
frontend  |   VITE v6.3.5  ready in 1106 ms
gameplay  | 
frontend  | 
gameplay  | Available on:
gameplay  |   http://127.0.0.1:8000
gameplay  |   http://172.18.0.2:8000
gameplay  | Hit CTRL-C to stop the server
gameplay  | 
backend   | }
nginx     | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
nginx     | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
frontend  |   ➜  Local:   http://localhost:5173/
frontend  |   ➜  Network: http://172.19.0.3:5173/
nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
nginx     | 10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
nginx     | 10-listen-on-ipv6-by-default.sh: info: /etc/nginx/conf.d/default.conf differs from the packaged version
nginx     | /docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
nginx     | /docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
backend   | 
backend   | Node.js v18.20.8
backend   | node:internal/errors:496
backend   |     ErrorCaptureStackTrace(err);
backend   |     ^
backend   | 
backend   | Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library' imported from /app/srcs/controllers/google-auth.js
backend   |     at new NodeError (node:internal/errors:405:5)
nginx     | /docker-entrypoint.sh: Configuration complete; ready for start up
nginx     | 2025/08/30 09:59:43 [notice] 1#1: using the "epoll" event method
nginx     | 2025/08/30 09:59:43 [notice] 1#1: nginx/1.29.0
nginx     | 2025/08/30 09:59:43 [notice] 1#1: built by gcc 14.2.0 (Alpine 14.2.0) 
nginx     | 2025/08/30 09:59:43 [notice] 1#1: OS: Linux 6.14.0-28-generic
backend   |     at packageResolve (node:internal/modules/esm/resolve:916:9)
backend   |     at moduleResolve (node:internal/modules/esm/resolve:973:20)
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
nginx     | 2025/08/30 09:59:43 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker processes
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 29
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 30
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 31
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 32
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 33
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 34
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 35
nginx     | 2025/08/30 09:59:43 [notice] 1#1: start worker process 36
nginx     | 2025/08/30 09:59:48 [error] 32#32: *4 connect() failed (111: Connection refused) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 09:59:48 [error] 31#31: *3 connect() failed (111: Connection refused) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:48 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:48 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
backend   | }
backend   | 
backend   | Node.js v18.20.8
backend   | node:internal/errors:496
backend   |     ErrorCaptureStackTrace(err);
backend   |     ^
backend   | 
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:51 +0000] "GET / HTTP/1.1" 200 610 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:51 +0000] "GET /src/main.ts HTTP/1.1" 304 0 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:51 +0000] "GET /@vite/client HTTP/1.1" 200 182737 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:51 +0000] "GET /src/App.ts HTTP/1.1" 304 0 "https://localhost/src/main.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /node_modules/vite/dist/client/env.mjs HTTP/1.1" 304 0 "https://localhost/@vite/client" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/utils/dom.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/Navbar.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   | Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library' imported from /app/srcs/controllers/google-auth.js
backend   |     at new NodeError (node:internal/errors:405:5)
backend   |     at packageResolve (node:internal/modules/esm/resolve:916:9)
backend   |     at moduleResolve (node:internal/modules/esm/resolve:973:20)
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/AuthGuard.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/pages/HomePage.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/pages/PlayPage.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/router/router.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/styles.css HTTP/1.1" 200 27626 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/state/auth.ts HTTP/1.1" 304 0 "https://localhost/src/App.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/ProfileModal.ts HTTP/1.1" 304 0 "https://localhost/src/components/Navbar.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/SocialModal.ts HTTP/1.1" 304 0 "https://localhost/src/components/Navbar.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/AuthModal.ts HTTP/1.1" 304 0 "https://localhost/src/components/AuthGuard.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/styles.css HTTP/1.1" 200 29312 "https://localhost/src/main.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "\x16\x03\x01\x06\xE6\x01\x00\x06\xE2\x03\x03\x1B\x1B\x99c\xCF\x1A\xE5oK\x13\x22QP\xB9\xF0\x12\xD6\x13\xD1\x1C6\xD9\xB0)6\x12c." 400 157 "-" "-" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/services/api.ts HTTP/1.1" 304 0 "https://localhost/src/state/auth.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/components/ProfileImageUpload.ts HTTP/1.1" 304 0 "https://localhost/src/components/ProfileModal.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/services/googleAuth.ts HTTP/1.1" 304 0 "https://localhost/src/components/AuthModal.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "\x16\x03\x01\x06\xA6\x01\x00\x06\xA2\x03\x03\x9E\xA1\xDBb\x98\xD8\x85\x9D\x98|\x90\xBE\xB6\x1Bz\x01H\xA3\x93\x90\xEF=J\xBC\x8Fm\x05?\x0Fu\xDD\xFA  \xD4\xAB\xE0=z\xC5\xE51j\xD5~\x98\x94\x87\xD0@O\xD8\xD4\x0Fi\xCD-\x9A]\xE5\xAC\x04dg%\x00 " 400 157 "-" "-" "-"
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
backend   | }
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /src/services/imageUpload.ts HTTP/1.1" 304 0 "https://localhost/src/components/ProfileImageUpload.ts" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:09:59:52 +0000] "GET /vite.svg HTTP/1.1" 200 1497 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 2025/08/30 10:00:28 [error] 32#32: *4 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:28 [error] 34#34: *11 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:28 [error] 29#29: *26 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:28 [error] 30#30: *24 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:28 [error] 31#31: *3 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 2025/08/30 10:00:28 [error] 31#31: *25 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:28 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 2025/08/30 10:00:31 [error] 29#29: *26 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:31 [error] 31#31: *3 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:31 [error] 32#32: *4 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
backend   | 
backend   | Node.js v18.20.8
backend   | node:internal/errors:496
backend   |     ErrorCaptureStackTrace(err);
backend   |     ^
backend   | 
nginx     | 2025/08/30 10:00:31 [error] 34#34: *11 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
backend   | Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library' imported from /app/srcs/controllers/google-auth.js
nginx     | 2025/08/30 10:00:31 [error] 30#30: *24 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
backend   |     at new NodeError (node:internal/errors:405:5)
backend   |     at packageResolve (node:internal/modules/esm/resolve:916:9)
backend   |     at moduleResolve (node:internal/modules/esm/resolve:973:20)
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
backend   | }
backend   | 
backend   | Node.js v18.20.8
backend   | node:internal/errors:496
backend   |     ErrorCaptureStackTrace(err);
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 2025/08/30 10:00:31 [error] 31#31: *25 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:31 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
nginx     | 2025/08/30 10:00:34 [error] 30#30: *24 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 2025/08/30 10:00:34 [error] 31#31: *3 connect() failed (113: Host is unreachable) while connecting to upstream, client: 172.18.0.1, server: localhost, request: "POST /api/register HTTP/1.1", upstream: "http://172.19.0.2:3000/register", host: "localhost", referrer: "https://localhost/"
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:34 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   |     ^
backend   | 
backend   | Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library' imported from /app/srcs/controllers/google-auth.js
backend   |     at new NodeError (node:internal/errors:405:5)
backend   |     at packageResolve (node:internal/modules/esm/resolve:916:9)
backend   |     at moduleResolve (node:internal/modules/esm/resolve:973:20)
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
nginx     | 172.18.0.1 - - [30/Aug/2025:10:00:34 +0000] "POST /api/register HTTP/1.1" 502 559 "https://localhost/" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" "-"
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
backend   | }
backend   | 
backend   | Node.js v18.20.8
backend   | node:internal/errors:496
backend   |     ErrorCaptureStackTrace(err);
backend   |     ^
backend   | 
backend   | Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library' imported from /app/srcs/controllers/google-auth.js
backend   |     at new NodeError (node:internal/errors:405:5)
backend   |     at packageResolve (node:internal/modules/esm/resolve:916:9)
backend   |     at moduleResolve (node:internal/modules/esm/resolve:973:20)
backend   |     at defaultResolve (node:internal/modules/esm/resolve:1206:11)
backend   |     at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:404:12)
backend   |     at ModuleLoader.resolve (node:internal/modules/esm/loader:373:25)
backend   |     at ModuleLoader.getModuleJob (node:internal/modules/esm/loader:250:38)
backend   |     at ModuleWrap.<anonymous> (node:internal/modules/esm/module_job:76:39)
backend   |     at link (node:internal/modules/esm/module_job:75:36) {
backend   |   code: 'ERR_MODULE_NOT_FOUND'
backend   | }
backend   | 
backend   | Node.js v18.20.8
