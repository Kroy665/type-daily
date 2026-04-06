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
            <div className="max-w-6xl mx-auto px-5 py-6">
                <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Leaderboard</h1>

                {/* User's Rank Card */}
                {userRank && (
                    <div className="bg-blue-600 dark:bg-blue-700 text-white rounded border border-blue-700 dark:border-blue-600 p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold">#{userRank.rank}</div>
                                <div>
                                    <p className="text-xs opacity-80">Your Rank</p>
                                    <p className="text-lg font-semibold">{userRank.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs opacity-80">Best WPM</p>
                                <p className="text-2xl font-bold">{userRank.bestWpm}</p>
                                <p className="text-xs opacity-80 mt-1">Accuracy: {userRank.bestAccuracy}%</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-center border-t border-blue-500 pt-3">
                            <div>
                                <p className="text-xs opacity-80">Total Tests</p>
                                <p className="text-base font-semibold">{userRank.totalTests}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-80">Current Streak</p>
                                <p className="text-base font-semibold">{userRank.currentStreak}</p>
                            </div>
                            <div>
                                <p className="text-xs opacity-80">Longest Streak</p>
                                <p className="text-base font-semibold">{userRank.longestStreak}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sort Options */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
                    <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Sort by:</p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setOrderBy('bestWpm')}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${orderBy === 'bestWpm' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            Best WPM
                        </button>
                        <button
                            onClick={() => setOrderBy('bestAccuracy')}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${orderBy === 'bestAccuracy' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            Best Accuracy
                        </button>
                        <button
                            onClick={() => setOrderBy('currentStreak')}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${orderBy === 'currentStreak' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            Current Streak
                        </button>
                        <button
                            onClick={() => setOrderBy('totalTests')}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${orderBy === 'totalTests' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            Total Tests
                        </button>
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Rank</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Player</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">WPM</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Accuracy</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Tests</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Streak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {leaderboard.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`${user.id === session?.user?.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors`}
                                    >
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                {getRankBadge(user.rank) && <span className="text-lg">{getRankBadge(user.rank)}</span>}
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">#{user.rank}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {user.image ? (
                                                    <div className="relative w-7 h-7 rounded-full overflow-hidden">
                                                        <Image
                                                            src={user.image}
                                                            alt={user.name || 'User'}
                                                            fill
                                                            className="object-cover"
                                                            sizes="28px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                        {user.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{user.name || 'Anonymous'}</span>
                                                {user.id === session?.user?.id && (
                                                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{user.bestWpm}</span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{user.bestAccuracy}%</span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{user.totalTests}</span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{user.currentStreak}</span>
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
