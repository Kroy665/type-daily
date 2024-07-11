import React, { useState, useEffect, useRef } from 'react';

import { useStore } from '@/store';
import { useSession, signIn, signOut } from "next-auth/react";
import { Difficulty } from ".prisma/client";

const TypingSpeed = () => {

    const [text, setText] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
    const [userText, setUserText] = useState("");
    const [selectedTime, setSelectedTime] = useState(60);
    const [time, setTime] = useState(60);
    const [isStart, setIsStart] = useState(false);
    const { data: session } = useSession();

    const { createResult, getRandomText } = useStore();

    const [result, setResult] = useState({
        wpm: 0,
        accuracy: 0,
        wrongWords: 0,
        show: false
    });


    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isStart) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime > 0 ? prevTime - 1 : 0);
            }, 1000);
        } else if (!isStart && time !== 0) {
            clearInterval(interval!);
        }

        if (time === 0) {
            calculateResult();
            setIsStart(false);

            if (session && session.user && session.user.email) {
                if (result.wpm > 0 && result.accuracy > 0) createResult({
                    difficulty,
                    selectedTime,
                    wpm: result.wpm,
                    accuracy: result.accuracy,
                    wrongWords: result.wrongWords
                });
            }
        }

        return () => clearInterval(interval!);
    }, [isStart, time]);

    const onStart = async () => {
        // get random text from texts based on difficulty
        
        const randomText = await getRandomText(difficulty, selectedTime);
        console.log("🚀 ~ onStart ~ randomText:", randomText)
        setText(randomText.text);

        // reset userText
        setUserText("");

        // reset result
        setResult({
            wpm: 0,
            accuracy: 0,
            wrongWords: 0,
            show: false
        });
    }

    const showTimeInMinutes = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }


    const calculateResult = () => {
        // calculate wpm and accuracy
        const words = userText.trim().split(" ");
        const timeInMinutes = selectedTime - time / 60;

        const correctWords = words.filter((word, index) => word === text.split(" ")[index]);
        const wrongWords = words.length - correctWords.length;

        const wpm = Math.round(correctWords.length / (selectedTime / 60));
        const accuracy = Math.round((correctWords.length / words.length) * 100);

        setResult({
            wpm,
            accuracy,
            wrongWords,
            show: true
        });
    }


    const [isHelperOn, setIsHelperOn] = useState(false);


    const textColor = (word: string, i: number, j: number) : string => {
        if (isHelperOn) {
            return ""
        }

        return "";
    }


    return (
        <div className="relative flex flex-col items-center justify-center w-full px-5">
            {/* select, start */}
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 w-full">
                <div
                    className="flex flex-col md:flex-row gap-5"
                >
                    <select
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="border-2 border-gray-300 rounded-md p-2 w-48"
                        disabled={isStart}
                    >
                        <option
                            value={"EASY"}
                        >easy</option>
                        <option
                            value={"MEDIUM"}
                        >medium</option>
                        <option
                            value={"HARD"}
                        >hard</option>
                    </select>

                    {/* select time 1min, 2mins, 5mins, 10mins, 15mins, 20mins */}
                    <select
                        className="border-2 border-gray-300 rounded-md p-2 w-48"
                        onChange={(e) => {
                            setSelectedTime(parseInt(e.target.value))
                            setTime(parseInt(e.target.value));
                        }}
                        disabled={isStart}
                    >
                        <option
                            value={60}
                        >1 min</option>
                        <option
                            value={300}
                        >5 mins</option>
                        <option
                            value={900}
                        >15 mins</option>
                        
                    </select>

                    {/* helper */}
                    {/* <button
                        className={`py-2 px-4 rounded-md ${isHelperOn ? 'bg-red-500' : 'bg-green-500'} text-white`}
                        onClick={() => setIsHelperOn(!isHelperOn)}
                        disabled={isStart}
                    >
                        {isHelperOn ? "Without Helper" : "With Helper"}
                    </button> */}


                    <button
                        className={`py-2 px-4 rounded-md ${isStart ? 'bg-red-500' : 'bg-green-500'} text-white`}
                        onClick={() => {
                            setIsStart(!isStart);
                            if (!isStart) {
                                onStart();
                                setTime(selectedTime);
                            }
                        }}
                    >
                        {isStart ? "Stop" : "Start"}
                    </button>
                </div>
                <div
                    className="w-full md:w-32 text-center md:text-left"
                >
                    <span
                        className="text-lg font-bold"
                    >
                        Time Left:{showTimeInMinutes(time)}
                    </span>
                </div>
            </div>
            <div
                className="w-full flex flex-col gap-2 mt-2"
            >
                <div
                    className="w-full h-64 border-2 border-gray-300 rounded-md p-2 flex flex-col overflow-y-auto text-sm"
                    // prevent copy from this section
                    style={{ userSelect: "none" }}
                >
                    {text ? text.split(/[\n]+/).map((t, i) => (
                        <p key={i}>
                            {t}
                            {/* {t ? t.split(/[\s]+/).map((word, j) => {
                                return (
                                    <React.Fragment key={j}>
                                        <span
                                            className={isHelperOn ? textColor(word, i, j) : ""}
                                        >
                                            {word}({i},{j})
                                        </span> {" "}
                                    </React.Fragment>
                                )
                            }) : null} */}
                        </p>
                    )): (
                        <p
                            className="text-gray-500"
                        >
                            Click on start button to start typing. You can select difficulty and time from above.
                        </p>
                    )}
                </div>
                <div className="">
                    <textarea
                        className="w-full h-64 border-2 border-gray-300 rounded-md p-2 text-sm"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        disabled={!isStart}
                    />
                </div>
            </div>

            {/* result popup */}

            {result.show && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div 
                        className="bg-white w-64 p-5 rounded-md flex flex-col gap-2"
                    >
                        <h2 className="text-2xl font-bold">Result</h2>
                        <p>WPM: {result.wpm}</p>
                        <p>Accuracy: {result.accuracy}%</p>
                        <p>Wrong Words: {result.wrongWords}</p>
                        <button
                            className="py-2 px-4 rounded-md bg-green-500 text-white"
                            onClick={() => {
                                setResult({
                                    wpm: 0,
                                    accuracy: 0,
                                    wrongWords: 0,
                                    show: false
                                });
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
};

export default TypingSpeed