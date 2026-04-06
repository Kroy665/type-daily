import React, { useEffect } from 'react'
import Image from 'next/image'
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import Layout from '@/components/Layout';
import { useStore, Achievement } from '@/store';
import { Chart as ChartJS } from 'chart.js';
import { CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale);
ChartJS.register(LinearScale);
ChartJS.register(PointElement);
ChartJS.register(LineElement);

type DataType = {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        fill: boolean;
        backgroundColor: string;
        borderColor: string;
    }[];
};

const accuracyColor = 'rgb(239, 68, 68)';
const wpmColor = 'rgb(59, 130, 246)';

function Profile({
    session
}: {
    session: sessionType;
}) {

    const { getResults, results, getAchievements, getUserRank } = useStore();

    const [isLoading, setIsLoading] = React.useState(true);
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const [userRank, setUserRank] = React.useState<any>(null);
    const [data, setData] = React.useState<DataType>({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsLoading(true);
                const [results, achievementsData, rankData] = await Promise.all([
                    getResults(),
                    getAchievements(),
                    getUserRank()
                ]);

                setAchievements(achievementsData);
                setUserRank(rankData);

                const sortedResults = results.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

                const accuracyData = sortedResults.map(result => result.accuracy);
                const wpmData = sortedResults.map(result => result.wpm);

                const dateLabels = sortedResults.slice(Math.max(sortedResults.length - 20, 0)).map(result => {
                    const date = new Date(result.created);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                });

                const data = {
                    labels: dateLabels,
                    datasets: [
                        {
                            label: 'Accuracy',
                            data: accuracyData,
                            fill: false,
                            backgroundColor: accuracyColor,
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                        },
                        {
                            label: 'WPM',
                            data: wpmData,
                            fill: false,
                            backgroundColor: wpmColor,
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                        },
                    ],
                };

                setData(data);
            } catch (error) {
                console.error('Error fetching results:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchResults();
    }, [])

    const calculateTimeSpent = (sec: number) => {
        const hours = Math.floor(sec / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = Math.floor(sec % 60);
        if(hours === 0 && minutes === 0)
            return `${seconds}s`;
        if(hours === 0)
            return `${minutes}m ${seconds}s`;

        return `${hours}h ${minutes}m`;
    }


    return (
        <Layout
            session={session}
        >
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Loading profile...</p>
                    </div>
                </div>
            ) : (
            <div
                className="flex flex-col gap-4 mx-5 md:mx-0 mt-6 md:mt-8 max-w-6xl mx-auto px-5"
            >
                {/* User Stats Grid */}
                <div
                    className="grid md:grid-cols-2 gap-4"
                >
                    {/* Profile Card */}
                    <div
                        className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded items-center"
                    >
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                        >
                            {session?.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt="profile"
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            )}
                        </div>
                        <div
                            className="flex flex-col gap-1 min-w-0"
                        >
                            <h1
                                className="text-lg font-semibold text-gray-900 dark:text-white truncate"
                            >
                                {session?.user?.name}
                            </h1>
                            <p
                                className="text-xs text-gray-600 dark:text-gray-400 truncate"
                            >
                                {session?.user?.email}
                            </p>
                            <p
                                className="text-xs text-gray-600 dark:text-gray-400"
                            >
                                Total time: {calculateTimeSpent(results.reduce((acc, result) => acc + result.selectedTime, 0))}
                            </p>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div
                        className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded justify-between"
                    >
                        <div
                            className="flex flex-col gap-1"
                        >
                            <h2
                                className="text-xs text-gray-600 dark:text-gray-400"
                            >
                                Total Tests
                            </h2>
                            <p
                                className="text-xl font-semibold text-gray-900 dark:text-white"
                            >
                                {results.length}
                            </p>
                        </div>
                        <div
                            className="flex flex-col gap-1"
                        >
                            <h2
                                className="text-xs text-gray-600 dark:text-gray-400"
                            >
                                Avg Accuracy
                            </h2>
                            <p
                                className="text-xl font-semibold"
                                style={{ color: accuracyColor }}
                            >
                                {results.filter(result => result.accuracy).length > 0 ? (results.reduce((acc, result) => acc + result.accuracy, 0) / results.length).toFixed(1) : 0}%
                            </p>
                        </div>
                        <div
                            className="flex flex-col gap-1"
                        >
                            <h2
                                className="text-xs text-gray-600 dark:text-gray-400"
                            >
                                Avg WPM
                            </h2>
                            <p
                                className="text-xl font-semibold"
                                style={{ color: wpmColor }}
                            >
                                {results.filter(result => result.wpm).length > 0 ? (results.reduce((acc, result) => acc + result.wpm, 0) / results.length).toFixed(1) : 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`p-3 rounded border text-center ${
                                    achievement.unlocked
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'
                                }`}
                            >
                                <div className="text-2xl mb-1">{achievement.icon}</div>
                                <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100">{achievement.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{achievement.description}</p>
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Graph Section */}
                <div
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded"
                >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance History</h2>
                    <Line
                        data={data}
                        className='w-full'
                        style={{ maxHeight: '300px' }}
                        options={{
                            elements: {
                                line: {
                                    tension: 0.4
                                },
                                point:{
                                    radius: 2
                                }
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                },
                            },
                            maintainAspectRatio: true,
                            responsive: true,
                        }}
                    />
                </div>


            </div>
            )}
        </Layout>
    )
}


export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    if(!session)
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false,
            },
        }



    return {
        props: { session },
    };
}

export default Profile
