import React, { forwardRef } from 'react';
import classes from '../styles/popUp.module.css';

const PopUp = forwardRef(({ children }, ref) => {
    return (
        <div className={classes.container} ref={ref}>
            {children}
        </div>
    )
});

export default PopUp;