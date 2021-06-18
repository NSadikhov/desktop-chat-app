import React from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import classes from '../styles/welcome.module.css';
import Button from '@material-ui/core/Button';

import { useSelector } from 'react-redux';

import icon from '../assets/images/icon_main_cope_no_background.svg';

export default function Welcome(props) {
    const history = useHistory();
    const user = useSelector(state => state.user);

    return (
        // TODO: change loading
        user.loading ?
            <div style={{ height: '100vh', width: '100%', display: 'grid', placeItems: 'center' }}>LOADING...</div>
            : (user.credentials ?
                <Redirect to='/home' />
                :
                <div className={classes.container}>
                    <div className={classes.top}>
                        <div className={classes.icon_container}>
                            <img src={icon} />
                        </div>
                    </div>
                    <div className={classes.bottom}>
                        <div className={classes.intro_container}>
                            <h1>Telex</h1>
                            <p>Click continue to start messaging</p>
                            <Button onClick={() => history.push('/register')}
                                className={classes.button} variant='contained'
                                color='primary' size='large'
                            >
                                Continue
                    </Button>
                        </div>
                    </div>
                </div>
            )
    )
}
