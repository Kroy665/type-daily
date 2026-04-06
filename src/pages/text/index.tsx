import React, { use, useEffect } from 'react'
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { sessionType } from "@/types/sessionType";
import Layout from "@/components/Layout";
import { Difficulty } from ".prisma/client";
import { useStore } from '@/store';
import { Text } from ".prisma/client";
function TextComp({
    session
}: {
    session: sessionType
}) {

    const [difficulty, setDifficulty] = React.useState<Difficulty>("EASY");
    const [text, setText] = React.useState<string>("");
    const [selectedTime, setSelectedTime] = React.useState<number>(60);
    const [loading, setLoading] = React.useState<boolean>(false);

    const { saveText, getTexts, texts, deleteText } = useStore();


    useEffect(() => {
        const fetchTexts = async () => {
            await getTexts();
        }

        fetchTexts();
    }, [])

    const onSave = async () => {
        setLoading(true);
        const res = await saveText(text, difficulty, selectedTime);

        if (res) {
            setText("");
            await getTexts()
        }

        setLoading(false);
    }


    const secToMin = (sec: number) => {
        return Math.floor(sec / 60) + "m";
    }




    return (
        <Layout
            session={session}
        >
            <div className="max-w-6xl mx-auto px-5 py-6">
                <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Text Management</h1>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                        <select
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={"EASY"}>Easy</option>
                            <option value={"MEDIUM"}>Medium</option>
                            <option value={"HARD"}>Hard</option>
                        </select>

                        <select
                            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                                setSelectedTime(parseInt(e.target.value))
                            }}
                        >
                            <option value={60}>1 min</option>
                            <option value={300}>5 mins</option>
                            <option value={600}>10 mins</option>
                            <option value={900}>15 mins</option>
                        </select>

                        <button
                            className={`px-4 py-2 rounded text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors`}
                            onClick={onSave}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Text"}
                        </button>

                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            Words: <span className="font-semibold ml-1">{text.split(" ").filter(Boolean).length}</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-40 border border-gray-300 dark:border-gray-600 rounded p-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text for typing tests..."
                    />
                </div>

                {/* Texts Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    <table className="table-auto w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Text</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Difficulty</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Time</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Words</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {texts.map((text, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                                        {text.text.length > 60 ? text.text.slice(0, 60) + "..." : text.text}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                                            text.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                            text.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        }`}>
                                            {text.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                                        {secToMin(text.time)}
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{text.text.split(" ").filter(Boolean).length}</td>
                                    <td className='px-4 py-2.5'>
                                        <button
                                            className="bg-red-600 text-white text-xs font-medium py-1 px-3 rounded hover:bg-red-700 transition-colors"
                                            onClick={async () => {
                                                await deleteText(text.id);
                                                await getTexts();
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/auth/login',
                permanent: false
            }
        }
    }


    return {
        props: { session },
    };
}


export default TextComp
