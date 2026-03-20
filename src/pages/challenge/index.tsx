import React, { useEffect, useState } from 'react'
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import Layout from '@/components/Layout';
import { useStore } from '@/store';
import Image from 'next/image';

function DailyChallenge({
    session
}: {
    session: sessionType;
}) {
    const { getTodayChallenge, submitChallenge } = useStore();
    const [challenge, setChallenge] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userText, setUserText] = useState('');
    const [time, setTime] = useState(60);
    const [isStart, setIsStart] = useState(false);

    useEffect(() => {
        fetchChallenge();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isStart && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 1) {
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isStart, time]);

    useEffect(() => {
        if (time === 0 && isStart) {
            handleComplete();
        }
    }, [time, isStart]);

    const fetchChallenge = async () => {
        try {
            setIsLoading(true);
            const data = await getTodayChallenge();
            setChallenge(data.challenge);
            setLeaderboard(data.leaderboard);
            setTime(data.challenge.timeLimit);
        } catch (error) {
            console.error('Error fetching challenge:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = () => {
        setIsStart(true);
        setUserText('');
    };

    const handleComplete = async () => {
        setIsStart(false);

        if (!challenge || !challenge.text) return;

        // Calculate results
        const words = userText.trim().split(' ');
        const textWords = challenge.text.split(' ');
        const correctWords = words.filter((word, index) => word === textWords[index]);
        const wrongWords = words.length - correctWords.length;
        const wpm = Math.round(correctWords.length / (challenge.timeLimit / 60));
        const accuracy = Math.round((correctWords.length / words.length) * 100) || 0;

        try {
            await submitChallenge(challenge.id, wpm, accuracy, wrongWords);
            // Refresh challenge data to show updated leaderboard
            await fetchChallenge();
        } catch (error) {
            console.error('Error submitting challenge:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Layout session={session}>
            <div className="max-w-6xl mx-auto px-5 py-10">
                <h1 className="text-4xl font-bold dark:text-white text-center mb-2">Daily Challenge</h1>
                {challenge && (
                    <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                        {formatDate(challenge.date)}
                    </p>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : challenge ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Challenge Area */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                {challenge.completed ? (
                                    <div className="text-center py-10">
                                        <div className="text-6xl mb-4">🎉</div>
                                        <h2 className="text-2xl font-bold dark:text-white mb-2">Challenge Completed!</h2>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">You've already completed today's challenge</p>
                                        <div className="bg-indigo-50 rounded-lg p-4 inline-block">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Your Score</p>
                                            <p className="text-3xl font-bold text-indigo-600">{challenge.userResult.wpm} WPM</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Accuracy: {challenge.userResult.accuracy}%</p>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Come back tomorrow for a new challenge!</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <span className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                                                    {challenge.difficulty}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold dark:text-white">
                                                {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>

                                        {!isStart ? (
                                            <div className="text-center py-10">
                                                <h3 className="text-xl font-semibold mb-4">Ready to start?</h3>
                                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                                    You have {challenge.timeLimit} seconds to type the text
                                                </p>
                                                <button
                                                    onClick={handleStart}
                                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
                                                >
                                                    Start Challenge
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4 h-40 overflow-y-auto text-sm">
                                                    {challenge.text}
                                                </div>

                                                <textarea
                                                    className="w-full h-40 border-2 border-gray-300 rounded-lg p-4 text-sm"
                                                    value={userText}
                                                    onChange={(e) => setUserText(e.target.value)}
                                                    disabled={!isStart || time === 0}
                                                    placeholder="Start typing here..."
                                                    autoFocus
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold mb-4">Today's Leaderboard</h3>
                                {leaderboard.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                        No one has completed this challenge yet. Be the first!
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {leaderboard.map((entry) => (
                                            <div
                                                key={entry.rank}
                                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                                    entry.isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'
                                                }`}
                                            >
                                                <div className="text-xl font-bold w-8">
                                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                                </div>
                                                <div className="flex items-center gap-2 flex-1">
                                                    {entry.user.image ? (
                                                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                            <Image
                                                                src={entry.user.image}
                                                                alt={entry.user.name || 'User'}
                                                                fill
                                                                className="object-cover"
                                                                sizes="32px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                            {entry.user.name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium truncate">{entry.user.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.accuracy}% accuracy</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-indigo-600">{entry.wpm}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">WPM</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-600 dark:text-gray-300">No challenge available</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
}

export default DailyChallenge;
