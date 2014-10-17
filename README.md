## Overview ##
`propfind` runs on Cloud Foundry environments. It tests the [WebDAV](http://en.wikipedia.org/wiki/WebDAV) compatibility
of your CF fabric. WebDAV is an interesting case because the protocol uses a number of extension HTTP methods
beyond the usual GET, POST, etc, which can sometimes cause problems with routers.

## How it works ##
propfind performs HTTP requests using WebDAV methods (`PROPFIND`, `MKCOL`, etc) against its own user-facing URL.
If the requests make it back to the app unmangled, it's counted as a pass. Both `http://` and `https://` URLs are
tested.

## Usage ##
1. Checkout the [propfind repo](https://github.com/mamacdon/propfind) from GitHub.
2. Edit the `manifest.yml` file as needed for your target Cloud Foundry environment.
 * In particular, you'll probably need to change the `host` field to a unique value.
3. Push the app.
4. Visit `https://{your_app_url}` in a web browser to see the test results. If all is well, it shows a results
   page full of lovely green &#x2714; checkmarks. If something went wrong, you'll get a bunch of &#x2718;'s.

Read about [deploying apps to Cloud Foundry](http://docs.cloudfoundry.org/devguide/deploy-apps/manifest.html) if
any of these steps are unclear.
