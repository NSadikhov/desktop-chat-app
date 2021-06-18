const request = require('request');
const fs = require('fs');
const path = require('path');
const { shell } = require('electron')

export const downloadFile = ({ url, FolderToSave, file_name }) =>
    new Promise((resolve, reject) => {
        const req = request({
            method: 'GET',
            uri: url,
        });

        if (!fs.existsSync(FolderToSave)) fs.mkdirSync(FolderToSave);

        const pathToSave = path.join(FolderToSave, file_name);
        const out = fs.createWriteStream(pathToSave);
        req.pipe(out);

        req.on('end', () => { shell.openPath(pathToSave); resolve(pathToSave); });
        req.on('error', (err) => reject(err.message));

    });
