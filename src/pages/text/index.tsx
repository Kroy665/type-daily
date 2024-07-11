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
        return Math.floor(sec / 60) + " mins";
    }




    return (
        <Layout
            session={session}
        >
            <div className="relative flex flex-col items-center justify-center w-full px-5">
                {/* select, start */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 w-full">
                    <div
                        className="flex flex-col md:flex-row gap-5"
                    >
                        <select
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="border-2 border-gray-300 rounded-md p-2 w-48"
                        >
                            <option
                                value={"EASY"}
                            >
                                Easy
                            </option>
                            <option
                                value={"MEDIUM"}
                            >
                                Medium
                            </option>
                            <option
                                value={"HARD"}
                            >
                                Hard
                            </option>
                        </select>

                        {/* select time 1min, 2mins, 5mins, 10mins, 15mins, 20mins */}
                        <select
                            className="border-2 border-gray-300 rounded-md p-2 w-48"
                            onChange={(e) => {
                                setSelectedTime(parseInt(e.target.value))
                            }}
                        >
                            <option
                                value={60}
                            >
                                1 min
                            </option>
                            <option
                                value={300}
                            >
                                5 mins
                            </option>
                            <option
                                value={600}
                            >
                                10 mins
                            </option>
                            <option
                                value={900}
                            >
                                15 mins
                            </option>

                        </select>
                        <button
                            className={`py-2 px-4 rounded-md text-white bg-green-500`}
                            onClick={onSave}
                        >
                            {loading ? "Loading..." : "Save"}
                        </button>

                        <div
                            className="w-full md:w-32 text-center md:text-left"
                        >
                            <span
                                className="text-lg font-bold"
                            >
                                Word Count: {text.split(" ").length}
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    className="w-full flex flex-col gap-2 mt-2"
                >
                    <div className="">
                        <textarea
                            className="w-full h-64 border-2 border-gray-300 rounded-md p-2 text-sm"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                </div>

                {/* texts */}
                <div className="w-full mt-5">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th
                                    className="px-4 py-2 text-left"
                                >Text</th>
                                <th className="px-4 py-2 text-left">Difficulty</th>
                                <th className="px-4 py-2 text-left">Time</th>
                                <th className="px-4 py-2 text-left">Word Count</th>
                                <th className="px-4 py-2 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {texts.map((text, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">
                                        {text.text.length > 50 ? text.text.slice(0, 50) + "..." : text.text}
                                    </td>
                                    <td className="border px-4 py-2">{text.difficulty}</td>
                                    <td className="border px-4 py-2">
                                        {secToMin(text.time)}
                                    </td>
                                    <td className="border px-4 py-2">{text.text.split(" ").length}</td>
                                    <td className='border px-4 py-2'>
                                        <button
                                            className="bg-red-500 text-white py-1 px-2 rounded-md"
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