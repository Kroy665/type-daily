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

const accuracyColor = 'rgb(255, 99, 132)';
const wpmColor = 'rgb(54, 162, 235)';

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

                // Sort results by date
                const sortedResults = results.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());

                // Extract accuracy, WPM, and date
                const accuracyData = sortedResults.map(result => result.accuracy);
                const wpmData = sortedResults.map(result => result.wpm);

                // only show the 20 most recent results with date and month
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
                            borderColor: 'rgba(255, 99, 132, 0.5)',
                        },
                        {
                            label: 'WPM',
                            data: wpmData,
                            fill: false,
                            backgroundColor: wpmColor,
                            borderColor: 'rgba(54, 162, 235, 0.5)',
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

        return `${hours}h ${minutes}m ${seconds}s`;
    }


    return (
        <Layout
            session={session}
        >
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
                    </div>
                </div>
            ) : (
            <div
                className="flex flex-col gap-5 mx-5 md:mx-0 mt-10 md:mt-20"
            >
                {/* user data Card */}
                <div
                    className="flex gap-5 flex-col md:flex-row w-full md:w-3/4 mx-auto"
                >
                    {/* profile Card */}

                    <div
                        className="flex gap-5 bg-white p-5 rounded-lg shadow-md items-center"
                    >
                        <div
                            className="w-20 h-20 rounded-full overflow-hidden relative"
                        >
                            {session?.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt="profile"
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            )}
                        </div>
                        <div
                            className="flex flex-col gap-2"
                        >
                            <h1
                                className="text-2xl"
                            >
                                {session?.user?.name}
                            </h1>
                            <p
                                className="text-sm"
                            >
                                {session?.user?.email}
                            </p>
                            {/* Total Time spent */}
                            <p
                                className="text-sm"
                            >
                                {calculateTimeSpent(results.reduce((acc, result) => acc + result.selectedTime, 0))}
                            </p>
                        </div>
                    </div>

                    {/* total results, total correct, total incorrect Card */}
                    <div
                        className="flex gap-5 bg-white p-5 rounded-lg shadow-md w-full md:w-1/2 justify-between"
                    >
                        <div
                            className="flex flex-col gap-5"
                        >
                            <h1
                                className="text-md"
                            >
                                Total Results
                            </h1>
                            <p
                                className="text-sm"
                            >
                                {results.length}
                            </p>
                        </div>
                        <div
                            className="flex flex-col gap-5"
                        >
                            <h1
                                className="text-md"
                            >
                                Avarage accuracy
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: accuracyColor }}
                            >
                                {results.filter(result => result.accuracy).length > 0 ? (results.reduce((acc, result) => acc + result.accuracy, 0) / results.length).toFixed(2) : 0}%
                            </p>
                        </div>
                        <div
                            className="flex flex-col gap-5"
                        >
                            <h1
                                className="text-md"
                            >
                                Avarage WPM
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: wpmColor }}
                            >
                                {results.filter(result => result.wpm).length > 0 ? (results.reduce((acc, result) => acc + result.wpm, 0) / results.length).toFixed(2) : 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="w-full md:w-3/4 mx-auto mb-10">
                    <h2 className="text-2xl font-bold dark:text-white mb-4">Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`p-4 rounded-lg ${
                                    achievement.unlocked
                                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400'
                                        : 'bg-gray-100 border-2 border-gray-300 opacity-50'
                                }`}
                            >
                                <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                                <h3 className="font-bold text-sm text-center">{achievement.name}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-1">{achievement.description}</p>
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <p className="text-xs text-yellow-700 text-center mt-2">
                                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Graph Section */}
                <div
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md w-full mb-10 md:mb-20"
                >
                    <Line
                        data={data}
                        className='w-full h-96'
                        // with smooth curve
                        options={{
                            elements: {
                                line: {
                                    tension: 0.4
                                },
                                point:{
                                    radius: 1
                                }
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'bottom', // or 'bottom', 'left', 'right'
                                },
                            },
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