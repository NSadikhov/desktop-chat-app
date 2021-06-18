const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
    notificationApi: {
        send(message) {
            ipcRenderer.send('notify', message);
        }
    },
    batteryApi: {

    },
    fileApi: {
        async downloadFile(url, file_name) {
            return await ipcRenderer.invoke('download', url, file_name);
        },
        openFile(path) {
            ipcRenderer.send('open-file', path);
        }
    },
    windowApi: {
        setListener(onFocus, onBlur) {
            ipcRenderer.on('ping', (_, message) => message.isFocused ? onFocus() : onBlur())
        }
    },
    cryptoApi: {
        async generateKeys() {
            return await ipcRenderer.invoke('generateKeys');
        },
        async computeSharedKey(publicKey) {
            return await ipcRenderer.invoke('computeSharedKey', publicKey);
        },
        async encryptMessage(message, sharedKey) {
            return await ipcRenderer.invoke('encryptMessage', { message, sharedKey });
        },
        async decryptMessage(payload64, sharedKey) {
            return await ipcRenderer.invoke('decryptMessage', { payload64, sharedKey });
        }
    }
})

// ! Not Safe
// window.sendNotification = (message) => {
//     ipcRenderer.send('Notify', message);
// }