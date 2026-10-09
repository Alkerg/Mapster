const {writeFileSync, mkdirSync} = require('fs');
require('dotenv').config({ quiet: true });


const targetPath = './src/environments/environment.ts';
const targetPathDev = './src/environments/environment.development.ts';

const mapboxKey = process.env.MAPBOX_KEY?.trim();

if(!mapboxKey){
    throw new Error('MAPBOX_KEY is not set');
}


const envFileContent = `

export const environment = {
    mapboxKey: "${mapboxKey}"
};

`


mkdirSync('./src/environments', { recursive: true });

writeFileSync(targetPath, envFileContent);
writeFileSync(targetPathDev, envFileContent);