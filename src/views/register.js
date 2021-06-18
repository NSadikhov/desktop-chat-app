import React, { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import classes from '../styles/register.module.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Grid from '@material-ui/core/Grid';

import { firebase, auth } from '../db';
import { isAccountInUse, registerNewUser } from '../store/actions/userActions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import KeyboardBackspaceRoundedIcon from '@material-ui/icons/KeyboardBackspaceRounded';

const countryCodes = [
    { country: 'Azerbaijan', code: 994 },
    { country: 'Germany', code: 49 },
    { country: 'Italy', code: 38 },
    { country: 'Poland', code: 48 },
    { country: 'Turkey', code: 90 },
    { country: 'Ukraine', code: 380 },
    { country: 'Uzbekistan', code: 998 },
];

// TODO: use useRef instead of onChange/onBlur, if possible

function Register(props) {
    const history = useHistory();

    const defaultCode = countryCodes.find(val => val.country === 'Poland');

    const [prefix, setPrefix] = useState(defaultCode.code);
    const [number, setNumber] = useState('');
    const [index, setIndex] = useState(0);

    const [errors, setErrors] = useState({
        number: false
    })

    const [userId, setUserId] = useState('');

    const [confirmationResult, setConfirmationResult] = useState('');
    const [verifCode, setVerifCode] = useState('');

    const requestVerificationCode = (numberWithPrefix) => {
        const applicationVerifier = new firebase.auth.RecaptchaVerifier(
            'recaptcha-container', { 'size': 'invisible' });

        //   var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/
        //   return regexp.test(this.state.phone);

        auth.signInWithPhoneNumber(numberWithPrefix, applicationVerifier)
            .then((_confirmationResult) => {
                setConfirmationResult(_confirmationResult);
            })
            .catch(err => console.log(err));
    }

    const handleNext = (e) => {
        e.preventDefault();
        if (index === 0) {
            if (number === '') {
                setErrors({ ...errors, number: true });
            }
            else {
                let numberWithPrefix = `+${prefix}${number}`;
                // setUserInfo(prevState => ({ ...prevState, phone_number: numberWithPrefix }))

                // props.isNumberInUse(numberWithPrefix)
                //     .then(inUse => {
                //         if (inUse) history.push('/home');
                //         else {
                requestVerificationCode(numberWithPrefix);
                setIndex((prevState) => (++prevState));
                if (errors.number) setErrors({ ...errors, number: false });
                //     }
                // })
            }
        }
        else if (index === 1) {
            confirmationResult.confirm(verifCode)
                .then(result => {
                    props.isAccountInUse(result.user.phoneNumber).then(response => {
                        if (response) history.push('/home');
                        else {
                            setIndex((prevState) => (++prevState));
                            setUserId(result.user.uid);
                        }
                    })
                }
                )
                .catch(err => console.log(err));
        }
    }

    const handlePrev = () => setIndex((prevState) => (--prevState));

    const handleSubmit = (e) => {
        e.preventDefault(); props.registerNewUser({
            uid: userId,
            first_name: firstNameRef.current.value,
            last_name: lastNameRef.current.value
        }).then(() => history.push('/home'))
    };

    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);

    return (
        <div className={classes.container}>
            <div id='recaptcha-container'></div>
            {index === 0 ?
                <form noValidate onSubmit={handleNext} className={classes.form_1} >
                    <h1>Add Your Phone Number</h1>
                    <Autocomplete
                        spellCheck={false}
                        closeIcon={false}
                        options={countryCodes}
                        getOptionLabel={(option) => option.country}
                        defaultValue={defaultCode}
                        onChange={(_, value) => {
                            setPrefix(value.code);
                        }}
                        renderInput={(params) => <TextField {...params} label="Country" variant="standard" />}
                    />
                    <Grid container spacing={3}>
                        <Grid item xs={3}>
                            <TextField spellCheck={false} InputProps={{ readOnly: true }} value={`+${prefix}`} label='Code' variant='standard' color='primary' fullWidth size='medium' />
                        </Grid>
                        <Grid item xs={9}>
                            <TextField spellCheck={false} onChange={(e) => {
                                setNumber(e.currentTarget.value);
                            }} autoFocus label='Phone number' variant='standard' color='primary' fullWidth size='medium' error={errors.number} />
                        </Grid>
                    </Grid>
                    <Button type='submit' className={classes.next} size='large' variant='contained' color='primary' fullWidth>
                        Next
                    </Button>
                    <button onClick={() => history.push('/')} className={classes.return}>
                        Back to Welcome View
                </button>
                </form>
                : index === 1 ?
                    <form noValidate onSubmit={handleNext} className={classes.form_2} >
                        <h1>Input The Verification Code</h1>
                        <TextField spellCheck={false} onChange={(e) => {
                            setVerifCode(e.currentTarget.value);
                        }} autoFocus label='Verification code' variant='standard' color='primary' fullWidth size='medium' />
                        <Button type='submit' className={classes.next} size='large' variant='contained' color='primary' fullWidth>
                            Next
                        </Button>

                        <Button onClick={handlePrev} variant='outlined' className={classes.prev} size='medium'>
                            <KeyboardBackspaceRoundedIcon color='primary' />
                        </Button>
                    </form>
                    :
                    <form noValidate onSubmit={handleSubmit} className={classes.form_3} >
                        <h1>Input Your Personal Data</h1>
                        <TextField spellCheck={false} defaultValue='' inputRef={firstNameRef} label='First Name' variant='standard' color='primary' fullWidth size='medium' />
                        <TextField spellCheck={false} defaultValue='' inputRef={lastNameRef} label='Last Name' variant='standard' color='primary' fullWidth size='medium' />
                        <Button type='submit' className={classes.next} size='large' variant='contained' color='primary' fullWidth>
                            Complete
                        </Button>

                        <Button onClick={handlePrev} variant='outlined' className={classes.prev} size='medium'>
                            <KeyboardBackspaceRoundedIcon color='primary' />
                        </Button>
                    </form>
            }
        </div>
    )
}

const mapStateToProps = (state) => ({
    user: state.user
})

const mapActionsToProps = { registerNewUser, isAccountInUse };

Register.propTypes = {
    user: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapActionsToProps)(Register)
