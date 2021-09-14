Please see documentation.pdf for getting started with this SDK.

To run a demo project to see the SDK working, a localhost environment is required.
The demo cannot be deployed to a domain. You can drop the entire sdk download
folder into localhost, and then visit each demo index.html.
Please start by looking into our main demo project here: http://localhost/path/to/sdk/demo/example/integratedDemo/index.html.

To run on localhost, you will need to add a line into your Apache mime.types file.
If you do not have Apache, please make sure you have it downloaded.

To add the specified line on your Mac linux, do the following:

1. Find your AP_TYPES_CONFIG_FILE (likely /etc/apache2/mime.types)
   by typing:

		sudo apachectl -V

2. Edit this file to include the line:

		application/wasm                wasm

3. Restart Apache

		sudo apachectl restart

Then, make sure to copy all files inside the SDK package to any location
under the root of Apache Document.

Assuming that the path between your root of Apache Document and
the unzipped sdk package is: /path/to/sdk/, all makeup library files will
be in /path/to/sdk/dist/*.

This demo project should now run on your localhost via a URL such
as http://localhost/path/to/sdk/demo/example/singleCapture/index.html.
To run outside of localhost, please reach out to your ModiFace contact to have your
domain approved.

To download library files from your own dev/staging/production
environment (non-localhost), update the config.libraryInfo object in the window.MFE_VTO.init
function call (either in the init.js, functions.js or created.js file within a demo folder)
to match your domain:

```
libraryInfo: {
    domain: 'your-domain.com',
    path: 'path/to/sdk/',
    version: '',
    maskPrefix: 'http://your-domain.com/path/to/sdk/mask_images/'
}
```
