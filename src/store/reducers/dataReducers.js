import * as actionTypes from '../types';

const initialState = {
    loading: false,
    chats: undefined,
    cloud: undefined,
    onlineUsers: undefined
}

export default function (state = initialState, action) {
    switch (action.type) {
        // case actionTypes.SET_LOADING:
        //     return { loading: true };
        case actionTypes.SET_CHATS:
            {
                console.log(action.payload);
                const data = state.chats ? state.chats.concat(action.payload) : action.payload;
                data.sort((x, y) => {
                    const _y = y.lastMessageInfo ? y.lastMessageInfo.time : y.createdAt;
                    const _x = x.lastMessageInfo ? x.lastMessageInfo.time : x.createdAt;
                    return _y - _x;
                });
                return {
                    ...state,
                    chats: data,
                    // loading: false
                };
            }
        case actionTypes.UPDATE_CHAT:
            {
                console.log(action.payload);
                const data = state.chats.map(each => each.id === action.payload[0].id ? (each = action.payload[0]) : each);
                data.sort((x, y) => y.lastMessageInfo?.time - x.lastMessageInfo?.time);
                return {
                    ...state,
                    chats: data
                };
            }
        case actionTypes.DELETE_CHAT:
            {
                console.log(action.payload);
                const data = state.chats.filter(each => each.id !== action.id);
                return {
                    ...state,
                    chats: data
                };
            }
        case actionTypes.SET_MESSAGES:
            console.log(action.payload);
            return {
                ...state,
                [action.id]: {
                    data: action.payload,
                    // lastMessage: action.lastMessage
                }
            };
        case actionTypes.SET_CLOUD:
            console.log(action.payload);
            return {
                ...state,
                Cloud: {
                    data: action.payload,
                    // lastMessage: action.lastMessage
                }
            };
        case actionTypes.SET_NEW_MESSAGE:
            console.log(action.payload);
            return {
                ...state,
                [action.id]: {
                    data: action.payload.concat(state[action.id]?.data ?? []),
                    // lastMessage: action.lastMessage
                }
            };
        case actionTypes.SET_USER_ONLINE:
            return {
                ...state,
                onlineUsers: action.payload
            }
        case actionTypes.SET_LOCAL_FILE_PATH: {
            state[action.id].data[action.index].localPath = action.payload;
            console.log(state);
            return state;
        }
        case actionTypes.READ_MESSAGES:
            {
                const index = state.chats.findIndex(each => each.id === action.id);
                state.chats[index].lastMessageInfo.seen = true;
                state.chats[index].nonSeenMessages = 0;
                state[action.id]?.data.filter(each => !each.seen).forEach(each => each = true);
                return state;
            }
        default:
            return state;
    }
}
