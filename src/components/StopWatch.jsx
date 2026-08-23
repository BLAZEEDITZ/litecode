import React from 'react'
import { AiOutlineReload, AiOutlinePauseCircle, AiOutlinePlayCircle } from 'react-icons/ai';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'
const StopWatch = () => {

    const [isActive, setIsActive] = React.useState(false);
    const [isPaused, setIsPaused] = React.useState(true);
    const [show, setShow] = React.useState(true)
    const [time, setTime] = React.useState(0);
    React.useEffect(() => {
        let interval = null;

        if (isActive && isPaused === false) {
            interval = setInterval(() => {
                setTime((time) => time + 10); // donot do time+10 inside setTime , use prev time in argumen then add in it
            }, 10);

        } else {
            clearInterval(interval);
        }
        return () => {
            clearInterval(interval);
        };
    }, [isActive, isPaused]);

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };
    const handleReset = () => {
        setIsActive(false);
        setIsPaused(true);
        setTime(0);
    };

    return (
        <div className="stopwatch-container">
            {
                show && <>
                    <Timer time={time} />
                    <ButtonController
                        show={show}
                        active={isActive}
                        isPaused={isPaused}
                        handleStart={handleStart}
                        handlePauseResume={handlePauseResume}
                        handleReset={handleReset}
                    />
                </>
            }
            {show 
                ? <FaRegEye className="sw-eye-btn" onClick={() => setShow((prev) => !prev)} />
                : <FaRegEyeSlash className="sw-eye-btn" onClick={() => setShow((prev) => !prev)} />
            }
        </div>
    )
}

function ButtonController(props) {
    return (
        <div className="stopwatch-controls">
            {
                props.isPaused
                    ? <AiOutlinePlayCircle className="sw-btn sw-play" onClick={props.handleStart} />
                    : <AiOutlinePauseCircle className="sw-btn sw-pause" onClick={props.handlePauseResume} />
            }
            <AiOutlineReload className="sw-btn sw-reset" onClick={props.handleReset} />
        </div>
    )
}

function Timer(props) {
    return (
        <div className="stopwatch-timer">
            <span>{("0" + Math.floor((props.time / 360000) % 60)).slice(-2)}</span>
            <span className="timer-sep">:</span>
            <span>{("0" + Math.floor((props.time / 60000) % 60)).slice(-2)}</span>
            <span className="timer-sep">:</span>
            <span>{("0" + Math.floor((props.time / 1000) % 60)).slice(-2)}</span>
        </div>
    );
}

export default StopWatch