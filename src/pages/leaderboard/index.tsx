import React, { useEffect, useState } from 'react'
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import Layout from '@/components/Layout';
import { useStore, LeaderboardUser } from '@/store';
import Image from 'next/image';

function Leaderboard({
    session
}: {
    session: sessionType;
}) {
    const { getLeaderboard, getUserRank } = useStore();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orderBy, setOrderBy] = useState('bestWpm');

    useEffect(() => {
        fetchLeaderboard();
    }, [orderBy]);

    const fetchLeaderboard = async () => {
        try {
            setIsLoading(true);
            const [leaderboardData, userRankData] = await Promise.all([
                getLeaderboard(orderBy, 100),
                getUserRank()
            ]);
            setLeaderboard(leaderboardData);
            setUserRank(userRankData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    return (
        <Layout session={session}>
            <div className="max-w-6xl mx-auto px-5 py-10">
                <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">🏆 Leaderboard</h1>

                {/* User's Rank Card */}
                {userRank && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl font-bold">#{userRank.rank}</div>
                                <div>
                                    <p className="text-sm opacity-80">Your Rank</p>
                                    <p className="text-2xl font-bold">{userRank.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Best WPM</p>
                                <p className="text-3xl font-bold">{userRank.bestWpm}</p>
                                <p className="text-sm opacity-80 mt-2">Accuracy: {userRank.bestAccuracy}%</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm opacity-80">Total Tests</p>
                                <p className="text-xl font-bold">{userRank.totalTests}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Current Streak</p>
                                <p className="text-xl font-bold">{userRank.currentStreak} 🔥</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Longest Streak</p>
                                <p className="text-xl font-bold">{userRank.longestStreak}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sort Options */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <p className="text-sm font-semibold mb-2 dark:text-gray-200">Sort by:</p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setOrderBy('bestWpm')}
                            className={`px-4 py-2 rounded-md ${orderBy === 'bestWpm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                        >
                            Best WPM
                        </button>
                        <button
                            onClick={() => setOrderBy('bestAccuracy')}
                            className={`px-4 py-2 rounded-md ${orderBy === 'bestAccuracy' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                        >
                            Best Accuracy
                        </button>
                        <button
                            onClick={() => setOrderBy('currentStreak')}
                            className={`px-4 py-2 rounded-md ${orderBy === 'currentStreak' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                        >
                            Current Streak
                        </button>
                        <button
                            onClick={() => setOrderBy('totalTests')}
                            className={`px-4 py-2 rounded-md ${orderBy === 'totalTests' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                        >
                            Total Tests
                        </button>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Player</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">WPM</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Accuracy</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tests</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Streak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {leaderboard.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`${user.id === session?.user?.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getRankBadge(user.rank)}</span>
                                                <span className="text-lg font-semibold dark:text-gray-200">#{user.rank}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                        <Image
                                                            src={user.image}
                                                            alt={user.name || 'User'}
                                                            fill
                                                            className="object-cover"
                                                            sizes="40px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                        <span className="text-gray-600 dark:text-gray-200 font-bold">
                                                            {user.name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <span className="font-medium dark:text-gray-200">{user.name || 'Anonymous'}</span>
                                                {user.id === session?.user?.id && (
                                                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{user.bestWpm}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm dark:text-gray-300">{user.bestAccuracy}%</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm dark:text-gray-300">{user.totalTests}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm dark:text-gray-300">{user.currentStreak} 🔥</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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

export default Leaderboard;
