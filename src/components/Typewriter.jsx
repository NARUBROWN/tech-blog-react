import { useState, useEffect } from 'react';
import './Typewriter.css';

const Typewriter = ({ phrases, typeSpeed = 100, deleteSpeed = 50, pauseDuration = 2000 }) => {
    const [index, setIndex] = useState(0); // Current phrase index
    const [subIndex, setSubIndex] = useState(0); // Current character index
    const [reverse, setReverse] = useState(false); // Typing or deleting
    const [blink, setBlink] = useState(true); // Cursor blinking

    // Blinking cursor effect
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    useEffect(() => {
        if (phrases.length === 0) return;

        // Current phrase
        const currentPhrase = phrases[index];

        // Handle typing logic
        if (subIndex === currentPhrase.length + 1 && !reverse) {
            // Finished typing, wait before deleting
            const timeout = setTimeout(() => {
                setReverse(true);
            }, pauseDuration);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            // Finished deleting, move to next phrase
            setReverse(false);
            setIndex((prev) => (prev + 1) % phrases.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, phrases, typeSpeed, deleteSpeed, pauseDuration]);

    return (
        <span className="typewriter">
            {phrases[index].substring(0, subIndex)}
            <span className={`cursor ${blink ? 'blink' : ''}`}>|</span>
        </span>
    );
};

export default Typewriter;
