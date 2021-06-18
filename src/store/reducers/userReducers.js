import * as actionTypes from '../types';

const initialState = {
    loading: true,
    credentials: undefined,
}

export default function (state = initialState, action) {
    switch (action.type) {
        // case actionTypes.SET_LOADING:
        //     return { loading: true };
        case actionTypes.SET_CREDENTIALS:
            return {
                ...state,
                credentials: action.payload,
                loading: false
            };
        case actionTypes.SET_PROFILE_PHOTO:
            return {
                ...state,
                credentials: { ...state.credentials, photoURL: action.payload },
            };
        case actionTypes.SET_PROFILE_INFO:
            return {
                ...state,
                credentials: { ...state.credentials, displayName: action.payload },
            };
        case actionTypes.SET_UNAUTHENTICATED:
            return { ...state, credentials: undefined, loading: false };
        default:
            return state;
    }
}
