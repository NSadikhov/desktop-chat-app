import { db, auth, storage, firebase } from '../../db';
import { SET_CREDENTIALS, SET_PROFILE_PHOTO, SET_PROFILE_INFO, SET_UNAUTHENTICATED, SET_CHATS, UPDATE_CHAT, SET_NEW_MESSAGE, DELETE_CHAT } from '../types';
import { getAllChats, getOnlineUsers } from './dataActions';

export const registerNewUser = (userInfo) => dispatch =>
    auth.currentUser.updateProfile({ displayName: `${userInfo.first_name} ${userInfo.last_name}` })
        .then(() => bridge.cryptoApi.generateKeys())
        .then((key) =>
            db.collection('Users')
                .doc(userInfo.uid)
                .set({
                    first_name: userInfo.first_name,
                    last_name: userInfo.last_name,
                    phone_number: auth.currentUser.phoneNumber,
                    photoURL: null,
                    public_key: key
                }))
        .then(() => db.doc(`/Status/${auth.currentUser.uid}`).set({ online: true }))
        .catch(err => console.log(err));

export const isAccountInUse = (phoneNumber) => dispatch =>
    db.collection('Users')
        .where('phone_number', '==', phoneNumber).limit(1).get()
        .then(snapshot => {
            if (snapshot.empty) return false;
            else
                // dispatch({
                //     type: SET_CREDENTIALS,
                //     payload: { ...snapshot.docs[0].data(), id: snapshot.docs[0].id }
                // });
                return true;
        })
        .catch(err => console.log(err));

export const logOutUser = () => dispatch => auth.signOut();

// * Check out
// auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

export const onAuthStateChange = (data) => dispatch => auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('authenticated');
        console.log(user);
        dispatch({ type: SET_CREDENTIALS, payload: user });
        dispatch(setUserStatus(true));
        dispatch(getOnlineUsers());
        data?.chats ?? dispatch(getAllChats());
    }
    else {
        console.log('unauthenticated');
        dispatch({ type: SET_UNAUTHENTICATED });
        // TODO: find better way
        // localStorage.getItem('unsubscribeChats')();
        localStorage.removeItem('unsubscribeChats');
    }
});

export const setUserStatus = (_status) => dispatch => auth.currentUser &&
    db.doc(`/Status/${auth.currentUser.uid}`).update(_status ? { online: _status } : {
        online: _status,
        lastSeen: firebase.firestore.Timestamp.now()
    }).catch(err => console.log(err));

const editChatUserDetails = async (field, value) => {
    return new Promise((res) => {
        res(db.collection('Chats').where('userIDs', 'array-contains', auth.currentUser.uid).get());
    }).then((snapshot) => !snapshot.empty &&
        snapshot.forEach(doc => doc.ref.update({ [`${auth.currentUser.uid}.${field}`]: value })))
}

export const uploadProfilePhoto = (file) => dispatch => storage.ref(`ProfilePhotos/${auth.currentUser.uid}`).put(file)
    .then(result => result.ref.getDownloadURL())
    .then(async url => {
        await auth.currentUser.updateProfile({ photoURL: url });
        await db.doc(`/Users/${auth.currentUser.uid}`).update({ photoURL: url });
        return dispatch({ type: SET_PROFILE_PHOTO, payload: url });
    })
    .then(() => editChatUserDetails('photoURL', auth.currentUser.photoURL))
    .catch(err => console.log(err));


export const editProfileInfo = ({ first_name, last_name }) => async dispatch => {
    const newDisplayName = `${first_name} ${last_name}`;
    return auth.currentUser.updateProfile({ displayName: newDisplayName })
        .then(() => db.doc(`/Users/${auth.currentUser.uid}`).update({ first_name, last_name }))
        .then(() => dispatch({ type: SET_PROFILE_INFO, payload: newDisplayName }))
        .then(() => editChatUserDetails('displayName', auth.currentUser.displayName))
        .catch(err => console.log(err));
}

export const deleteContact = (chatId) => dispatch =>
    db.doc(`/Chats/${chatId}`).get()
        .then(docRef => {
            if (docRef.exists) {
                let data = docRef.data();
                let userIDs = data.userIDs.map(each => each === auth.currentUser.uid ? null : each);
                docRef.ref.update({ userIDs: userIDs });
            }
        })
        .then(() => dispatch({
            type: DELETE_CHAT,
            id: chatId
        }))
        .catch(err => console.log(err));


export const addNewContact = (phoneNumber) => dispatch => {
    let dataDetails;
    db.collection('Users').where('phone_number', '==', phoneNumber).limit(1).get()
        .then((snapshot) => (snapshot.empty) ? null : { ...snapshot.docs[0].data(), uid: snapshot.docs[0].id })
        .then(async (data) => {
            dataDetails = data;
            return data?.public_key ? await bridge.cryptoApi.computeSharedKey(data.public_key) : null;
        })
        .then(sharedKey =>
            db.collection('Chats').add({
                type: 'private',
                userIDs: [auth.currentUser.uid, dataDetails?.uid ?? null],
                [auth.currentUser.uid]: {
                    displayName: auth.currentUser.displayName,
                    photoURL: auth.currentUser.photoURL,
                    phoneNumber: auth.currentUser.phoneNumber
                },
                [dataDetails?.uid ?? null]: {
                    displayName: dataDetails?.first_name ? dataDetails.first_name + (dataDetails?.last_name ? ' ' + dataDetails.last_name : '') : null,
                    photoURL: dataDetails?.photoURL ?? null,
                    phoneNumber
                },
                shared_key: sharedKey,
                createdAt: firebase.firestore.Timestamp.now()
            })
        )
        .then((docRef) => {
            let isFirst = true;
            docRef.onSnapshot({ includeMetadataChanges: false }, async snapshot => {
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
                            id: docRef.id,
                            toId: dataObj.userIDs.find(each => each !== auth.currentUser.uid)
                        };

                        dispatch({
                            type: isFirst ? SET_CHATS : UPDATE_CHAT,
                            payload: [result]
                        });

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
                }
                else {
                    dispatch({
                        type: DELETE_CHAT,
                        id: snapshot.id
                    });
                }
            }, err => console.log(err))
        })
        .then(() => dataDetails?.uid && db.doc(`/Status/${auth.currentUser.uid}`).update({
            allowedUserIds: firebase.firestore.FieldValue.arrayUnion(dataDetails.uid)
        }))
        .then(() => dataDetails?.uid && db.doc(`/Status/${dataDetails.uid}`).update({
            allowedUserIds: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
        }))
        .catch(err => console.log(err));
}