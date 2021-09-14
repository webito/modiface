const domain = window.location.hostname;
const portNumber = window.location.port;
const { pathname } = window.location;

window.MFE_VTO.init({
    config: {
        // libraryInfo object could be configured alternatively
        // based on your library hosting location. Example:
        libraryInfo: {
            domain: domain + (portNumber ? `:${portNumber}` : ''),
            path: pathname + (pathname[pathname.length - 1] === '/' ? '../../' : '/../../../'),
            version: '',
            maskPrefix: '../../mask_images/',
            assetPrefix: '../../dist/assets/',
        },
        moduleMode: 'Makeup',
    },
});