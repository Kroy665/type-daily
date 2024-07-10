import { useState, useEffect, useRef } from 'react';

import texts from "@/static/texts";
import { useStore } from '@/store';
import { useSession, signIn, signOut } from "next-auth/react";

const TypingSpeed = () => {

    const [text, setText] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [userText, setUserText] = useState("");
    const [selectedTime, setSelectedTime] = useState(60);
    const [time, setTime] = useState(60);
    const [isStart, setIsStart] = useState(false);
    const { data: session } = useSession();

    const { createResult } = useStore();

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

    const onStart = () => {
        // get random text from texts based on difficulty
        const filteredTexts = texts.filter((t) => t.difficulty === difficulty);
        const randomIndex = Math.floor(Math.random() * filteredTexts.length);
        setText(filteredTexts[randomIndex].text);
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


    return (
        <div className="relative flex flex-col items-center justify-center w-full px-5">
            {/* select, start */}
            <div className="flex items-center justify-between space-x-4 w-full">
                <div
                    className="flex gap-5"
                >
                    <select
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="border-2 border-gray-300 rounded-md p-2 w-48"
                    >
                        <option
                            value={"easy"}
                        >easy</option>
                        <option
                            value={"medium"}
                        >medium</option>
                        <option
                            value={"hard"}
                        >hard</option>
                    </select>

                    {/* select time 1min, 2mins, 5mins, 10mins, 15mins, 20mins */}
                    <select
                        className="border-2 border-gray-300 rounded-md p-2 w-48"
                        onChange={(e) => {
                            setSelectedTime(parseInt(e.target.value))
                            setTime(parseInt(e.target.value));
                        }}
                    >
                        <option
                            value={60}
                        >1 min</option>
                        <option
                            value={120}
                        >2 mins</option>
                        <option
                            value={300}
                        >5 mins</option>
                        <option
                            value={600}
                        >10 mins</option>
                        <option
                            value={900}
                        >15 mins</option>
                        <option
                            value={1200}
                        >20 mins</option>
                    </select>


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
                    className="w-32"
                >
                    <span
                        className="text-lg font-bold"
                    >
                        Time Left: {showTimeInMinutes(time)}
                    </span>
                </div>
            </div>
            <div className="w-full" >
                <div className="border-2 border-gray-300 rounded-md p-2 w-full min-h-64">
                    {text}
                </div>
                <div className="">
                    <textarea
                        className="w-full h-64 border-2 border-gray-300 rounded-md"
                        value={userText}
                        onChange={(e) => setUserText(e.target.value)}
                        disabled={!isStart}
                    />
                </div>
            </div>

            {/* result popup */}

            {result.show && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-5 rounded-md">
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