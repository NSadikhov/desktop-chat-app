import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// *Reducers
import userReducer from './reducers/userReducers';
import dataReducer from './reducers/dataReducers';

const middleware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    data: dataReducer
})

const composeEnhancers = (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(reducers,
    composeEnhancers(
        applyMiddleware(...middleware)
    )
);

export default store;