import { db, auth, storage, firebase } from '../../db';
import { READ_MESSAGES, SET_CHATS, SET_CLOUD, SET_LOCAL_FILE_PATH, SET_MESSAGES, SET_NEW_MESSAGE, SET_USER_ONLINE, UPDATE_CHAT, DELETE_CHAT } from '../types';

export const getAllChats = () => async (dispatch) => {

    const query = await db.collection('Chats').where('userIDs', 'array-contains', auth.currentUser.uid).get();

    if (!query.empty) {
        query.forEach(each => {
            let isFirst = true;
            each.ref.onSnapshot({ includeMetadataChanges: false }, async snapshot => {
                if (snapshot.exists) {
                    const dataObj = snapshot.data();
                    if (isFirst || dataObj.nonSeenMessages !== 0) {
                        const doc = (await snapshot.ref.collection('Messages').orderBy('time', 'desc').limit(1).get());
                        const docDetails = !doc.empty && { ...doc.docs[0].data(), id: doc.docs[0].id };
                        const result = {
                            ...dataObj,
                            lastMessageInfo: docDetails ? (docDetails.message ? {
                                ...docDetails,
                                message: dataObj.shared_key ? await bridge.cryptoApi.decryptMessage(docDetails.message, dataObj.shared_key) : docDetails.message
                            } : docDetails) : null,
                            id: each.id,
                            toId: dataObj.userIDs.find(each => each !== auth.currentUser.uid)
                        };

                        dispatch({
                            type: isFirst ? SET_CHATS : UPDATE_CHAT,
                            payload: [result]
                        });

                        console.log(isFirst);
                        !isFirst && dispatch({
                            type: SET_NEW_MESSAGE,
                            id: result.id,
                            payload: [result.lastMessageInfo]
                        })
                        isFirst = false;
                    } else {
                        dispatch({
                            type: READ_MESSAGES,
                            id: each.id
                        });
                    }
                } else {
                    dispatch({
                        type: DELETE_CHAT,
                        id: snapshot.id
                    });
                }
            }, err => console.log(err))
        });

    }
}

export const getOnlineUsers = () => dispatch => {
    return db.collection('Status').where('allowedUserIds', 'array-contains', auth.currentUser.uid)
        .onSnapshot(snapshot => {
            if (!snapshot.empty) {
                let obj = {};
                snapshot.docs.forEach(each => (obj[each.id] = each.data()));
                dispatch({
                    type: SET_USER_ONLINE,
                    payload: obj
                });
            }
        }, err => console.log(err));
}

export const getCloudContent = () => dispatch => {
    return db.collection(`Clouds/${auth.currentUser.uid}/Messages`).orderBy('time', 'desc').onSnapshot //.limit(50).get()
        (snapshot => {
            let result = [];
            snapshot.docs.forEach(each => {
                const dataObj = each.data();
                result.push({ ...dataObj, id: each.id });
            });

            return result.length > 0 && dispatch({
                type: SET_CLOUD,
                payload: result,
            });
        }, err => console.log(err));
}


export const getChatMessages = (id, sharedKey) => async dispatch => {
    return db.collection(`Chats/${id}/Messages`).orderBy('time', 'desc').get() //.limit(50).get()
        .then(async snapshot => {
            const result = snapshot.docs.map(each => {
                const dataObj = each.data();
                return dataObj.message ? (sharedKey ? bridge.cryptoApi.decryptMessage(dataObj.message, sharedKey).then(message => ({
                    ...dataObj,
                    message,
                    id: each.id
                })) : { ...dataObj, id: each.id }) : { ...dataObj, id: each.id };
            });
            return result.length > 0 && Promise.all(result).then(res => dispatch({
                type: SET_MESSAGES,
                id: id,
                payload: res,
                // lastMessage: snapshot.docs[0]?.ref
            }))
        })
        .catch(err => console.log(err));
}

export const sendMessageOrFile = ({ id, message, file, lastMessageInfo, nonSeenMessages, sharedKey }) => async dispatch => {
    if (id === "Cloud") {

        let messageFileOBJ = message ? { message } : { file };

        messageFileOBJ = {
            ...messageFileOBJ,
            sentBy: auth.currentUser.uid,
            seen: true,
            time: firebase.firestore.FieldValue.serverTimestamp()
        }

        return db.collection(`/Clouds/${auth.currentUser.uid}/Messages`).add(messageFileOBJ)
            .catch(err => console.log(err));
    }
    else {
        let messageFileOBJ = message ? {
            message: sharedKey ? await bridge.cryptoApi.encryptMessage(message, sharedKey) : message,
        } : { file };

        messageFileOBJ = {
            ...messageFileOBJ,
            sentBy: auth.currentUser.uid,
            seen: false,
            time: firebase.firestore.FieldValue.serverTimestamp()
        }

        console.log(messageFileOBJ);

        let counter = 1;
        if (lastMessageInfo &&
            lastMessageInfo.sentBy === auth.currentUser.uid &&
            !lastMessageInfo.seen) counter = nonSeenMessages + 1;

        return db.collection(`/Chats/${id}/Messages`).add(messageFileOBJ)
            .then(() => db.doc(`/Chats/${id}`).update({ nonSeenMessages: counter }))
            .catch(err => console.log(err));
    }
}

export const readMessages = (id) => dispatch =>
    db.collection(`/Chats/${id}/Messages`).where('sentBy', '!=', auth.currentUser.uid).where('seen', '==', false).get()
        .then(snapshot => {
            console.log(snapshot);
            if (!snapshot.empty) {
                console.log(id);
                const batch = db.batch();
                snapshot.forEach(each => batch.update(each.ref, { seen: true }));
                batch.update(db.doc(`/Chats/${id}`), { nonSeenMessages: 0 });
                return batch.commit();
            }
        })
        .catch(err => console.log(err));


export const uploadFiles = (files, chatId, lastMessageInfo, nonSeenMessages) => dispatch => {
    if (chatId === "Cloud") {
        Promise.all(files.map(each => storage.ref(`Files/${auth.currentUser.uid}/${each.name}`).put(each)))
            .then(result => result.forEach(async each => dispatch(sendMessageOrFile({
                id: chatId,
                file: {
                    url: await each.ref.getDownloadURL(), name: each.metadata.name
                },
            }))))
            .catch(err => console.log(err));
    }
    else {
        Promise.all(files.map(each => storage.ref(`Files/${chatId}/${each.name}`).put(each)))
            .then(result => result.forEach(async each => dispatch(sendMessageOrFile({
                id: chatId,
                file: {
                    url: await each.ref.getDownloadURL(), name: each.metadata.name
                },
                lastMessageInfo,
                nonSeenMessages
            }))))
            .catch(err => console.log(err));
    }
}

export const downloadFile = (url, file_name, id, index) => dispatch => bridge.fileApi.downloadFile(url, file_name).then(path => dispatch({
    type: SET_LOCAL_FILE_PATH,
    id,
    index,
    payload: path
}))
