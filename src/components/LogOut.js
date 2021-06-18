import React, { forwardRef } from 'react';
import classes from '../styles/logOut.module.css';

import { logOutUser } from '../store/actions/userActions';
import { useDispatch } from 'react-redux';

import Button from '@material-ui/core/Button';

import PopUp from './PopUp';

const LogOut = forwardRef(({ flScreenBgRef, history }, ref) => {
    const dispatch = useDispatch();

    return (
        <PopUp ref={ref}>
            <p className={classes.content}>
                Do you want to log out?
            </p>
            <div className={classes.buttonsSection}>
                <Button color='primary' onClick={() => flScreenBgRef.current.click()}>No</Button>
                <Button color='primary' onClick={() => dispatch(logOutUser()).then(() => history.push('/register'))} >Yes</Button>
            </div>
        </PopUp>
    )
});

export default LogOut;
