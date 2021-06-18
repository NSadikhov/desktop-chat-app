import React, { forwardRef, useState } from 'react';
import classes from '../styles/addContact.module.css';

import { useDispatch } from 'react-redux';
import { addNewContact } from '../store/actions/userActions';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import PhoneTwoToneIcon from '@material-ui/icons/PhoneTwoTone';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';

import PopUp from './PopUp';

const AddContact = forwardRef((props, ref) => {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('+48');
    const handleClick = () => {
        inputValue.length > 3 && dispatch(addNewContact(inputValue));
    }
    return (
        <PopUp ref={ref}>
            <div className={classes.header}>
                <h1>New Contact</h1>
                <CloseRoundedIcon
                    onClick={() => props.flScreenBgRef.current.click()}
                    color='action'
                    className={classes.close_icon}
                />
            </div>
            <div className={classes.phoneNumberField}>
                <PhoneTwoToneIcon action='action' />
                <TextField spellCheck={false} onChange={(e) => {
                    if (e.currentTarget.value.length !== 0) setInputValue(e.currentTarget.value);
                }} value={inputValue} autoFocus label='Phone number' variant='standard' color='primary' fullWidth size='medium' />

            </div>
            <Button onClick={handleClick} color='primary' variant='contained' size='small'>
                Add
            </Button>
        </PopUp>
    )
});

export default AddContact
