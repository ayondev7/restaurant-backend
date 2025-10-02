const ImageKit = require('imagekit');
const sharp = require('sharp');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function processAndUploadImage(buffer, filename) {
    let processedBuffer = buffer;
    let uploadFilename = filename;
    const metadata = await sharp(buffer).metadata();

    if (metadata.format !== 'webp') {
        processedBuffer = await sharp(buffer).webp({ lossless: true }).toBuffer();
        uploadFilename = filename.replace(/\.[^/.]+$/, ".webp");
    }

    const result = await imagekit.upload({
        file: processedBuffer,
        fileName: uploadFilename,
        folder: '/restaurant/dishes'
    });

    return result.url;
}

module.exports = { processAndUploadImage };