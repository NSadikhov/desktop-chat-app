import React, { useEffect } from 'react';
import {
    HashRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import './trial.css';

import { Provider } from 'react-redux';
import store from './store';

import { onAuthStateChange } from './store/actions/userActions';

// * Views
import Welcome from './views/welcome';
import Register from './views/register';
import Home from './views/home';

const App = () => {

    useEffect(() => {
        store.dispatch(onAuthStateChange(store.getState().data));
    }, [])

    // bridge.notificationApi.send('Message');

    // To debug
    // debugger
    return (
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route path='/' exact>
                        <Welcome />
                    </Route>
                    <Route path='/register'>
                        <Register />
                    </Route>
                    <Route path='/home'>
                        <Home />
                    </Route>
                </Switch>
            </Router>
        </Provider>
    )
}

export default App;
