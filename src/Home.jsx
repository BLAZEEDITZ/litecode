import React from "react";
import "tailwindcss/tailwind.css";
import './Home.css'
import codeditorimg from './codeeditor.jpeg'
import jsonditorimg from './jsoneditor.jpeg'
import Card from "./Card";
import { FaGithub, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

function Home() {
    return (
        <div
            className="home min-h-screen flex flex-col justify-center items-center">

            <div className="herobanner">
                <h1 className="font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">LiteCode</h1>
                <div className="flex flex-wrap justify-center gap-8 ">
                    <Card title="Code Editor" description="A powerful compiler supporting 40+ programming languages. Perfect for algorithmic problem solving and learning." image="https://user-images.githubusercontent.com/68281476/221411823-1e5222a1-dc0b-4f14-af09-eebb20c531c9.png" link="./codeeditor" />

                    <Card title="Web Editor" description="Build websites instantly with our live HTML, CSS, and JS preview environment. A perfect CodePen alternative." image="https://images.unsplash.com/photo-1627398240411-8bbeb1660d24?auto=format&fit=crop&w=400&q=80" link="./webeditor" />

                    <Card title="Json Editor" description="Format, validate, and convert JSON data to CSV, XML, and YAML seamlessly." image="https://user-images.githubusercontent.com/68281476/221411720-2b5bb125-e066-4cd9-9655-98d7a813f965.jpeg" link="./jsoneditor" />
                </div>

            </div>


            <div className="mt-8 flex justify-center flex-col items-center bannerdisplay">

                <div className="editor1display">
                    <article className="description">
                        <h1 className="text-4xl font-bold mb-8">Code Editor: The Ultimate Web App for Efficient Programming</h1>
                        <p className="font-normal text-gray-700 dark:text-gray-400 text-lg">
                            <strong>Code Editor</strong> is a web app that allows users to write and run code in multiple programming languages with custom input. With its user-friendly interface, <strong> multiple themes, and font sizes </strong>, along with convenient shortcuts for code execution, Code Editor is a valuable tool for programmers of all levels. The app also includes an <strong> internet status</strong> indicator to ensure users are always connected.
                        </p>
                    </article>
                    <div className="screenshot">
                        <img src={codeditorimg} alt="CodePad 1" className="w-1/2 mb-4" />
                    </div>
                </div>

                <div className="editor1display flex-row-reverse" style={{flexDirection: 'row-reverse'}}>
                    <article className="description">
                        <h1 className="text-4xl font-bold mb-8">Web Editor: Build UIs with Instant Feedback</h1>
                        <p className="font-normal text-gray-700 dark:text-gray-400 text-lg">
                            <strong>Web Editor</strong> is a dedicated workspace for front-end development. Seamlessly switch between HTML, CSS, and JavaScript files in the explorer and watch your creations come to life instantly in the <strong>Live Output window</strong>. A perfect environment for prototyping and learning web development.
                        </p>
                    </article>
                    <div className="screenshot">
                        <img src="https://images.unsplash.com/photo-1627398240411-8bbeb1660d24?auto=format&fit=crop&w=800&q=80" alt="Web Editor" className="w-1/2 mb-4" style={{borderRadius: '8px'}} />
                    </div>
                </div>

                <div className="editor2display">
                    <article className="description">
                        <h1 className="text-4xl font-bold mb-8">JsonEditor: A Versatile Tool for Converting, and Validating JSON Data</h1>
                        <p className="text-lg font-normal text-gray-700 dark:text-gray-400">
                            <strong>JsonEditor </strong>  is a powerful web application that can read JSON code from <strong>uploaded files </strong> and convert it into <strong> CSV, XML, and YAML formats.</strong> The app also includes a feature to easily <strong>Beautify JSON code </strong> and validate its syntax. With its diverse range of functions, JsonEditor is an essential tool for working with JSON data.
                        </p>


                    </article>
                    <div className="screenshot">
                        <img src={jsonditorimg} alt="CodePad 1" className="w-1/2 mb-4" />
                    </div>

                </div>


            </div>



            <footer className="bg-gray-800 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center">
                        <div className="w-full lg:w-6/12 px-4">
                            <h4 className="text-3xl font-semibold text-white">
                                Stay connected with us!
                            </h4>
                            <h5 className="text-lg mt-0 mb-2 text-gray-400">
                                Follow us on social media
                            </h5>
                            <div className="mt-6">
                                <a
                                    href="https://github.com/BLAZEEDITZ"
                                    className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 mr-2 mb-2"
                                    type="button"
                                    style={{ transition: 'all .15s ease' }}
                                >
                                    <FaGithub className="mr-1" /> Twitter
                                </a>


                                <a
                                    href="https://github.com/BLAZEEDITZ"
                                    className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 mr-2 mb-2"
                                    type="button"
                                    style={{ transition: 'all .15s ease' }}
                                >
                                    <FaTwitter className="mr-1" /> Twitter
                                </a>
                                <a
                                    href="https://www.instagram.com/yogesh_h4x/"
                                    className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 mr-2 mb-2"
                                    type="button"
                                    style={{ transition: 'all .15s ease' }}
                                >
                                    <FaInstagram className="mr-1" />   Instagram
                                </a>
                                <a
                                    href="https://www.instagram.com/yogesh_h4x/"
                                    className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-800 dark:bg-white dark:border-gray-700 dark:text-gray-900 dark:hover:bg-gray-200 mr-2 mb-2"
                                    type="button"
                                    style={{ transition: 'all .15s ease' }}
                                >
                                    <FaLinkedinIn className="mr-1" /> LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-gray-700" />
                    <div className="flex flex-wrap items-center md:justify-between justify-center">
                        <div className="w-full  px-4">
                            <div className="text-sm text-white font-semibold py-1">
                                © {new Date().getFullYear()} LiteCode
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </div >



    );
}

export default Home;
