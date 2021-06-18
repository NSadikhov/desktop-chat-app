import React, { useEffect } from 'react'
import classes from '../styles/bubbles.module.css';

export default function Bubbles() {
    const createBubbles = () => {
        const bubblesContainer = document.getElementById('bubbles-container');
        for (let i = 0; i < 25; i++) {
            function setProperties(node) {
                if (node) node.remove();
                const newNode = document.createElement('div');
                newNode.tabIndex = 0;
                const size = Math.random() * 91 + 40;
                newNode.style.width = size + 'px';
                newNode.style.height = size + 'px';
                newNode.style.left = Math.random() * 101 - 20 + '%';
                newNode.style.animationDuration = Math.ceil(size / 10) * 1.2 + 's';
                newNode.style.animationDelay = Math.random() * 2 + 's';
                bubblesContainer.appendChild(newNode);
                newNode.onclick = () => {
                    newNode.style.filter = 'blur(15px)';
                }
                newNode.onanimationend = () => setProperties(newNode);

            }
            setProperties();
        }
    }

    useEffect(() => {
        createBubbles();
    }, [])

    return <div id='bubbles-container' className={classes.bubbles} />
}
