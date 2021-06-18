import React from 'react';
import classes from '../styles/emojiList.module.css';

import { emojiList } from '../utils/emojis';
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded';


function EmojiList({ inputRef }) {

    const handleClick = (e) => {
        inputRef.current.value += e.currentTarget.innerText;
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        inputRef.current.focus();
    };

    return (
        <>
            <SentimentSatisfiedRoundedIcon className={classes.emoji_icon} />
            <div className={classes.passage} />
            <div className={classes.emojiListBox}>
                {emojiList.map(emoji => <button key={emoji} onClick={handleClick}>{emoji}</button>)}
            </div>

        </>
    )
}

export default EmojiList
