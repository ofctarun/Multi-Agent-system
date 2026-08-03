import axios from 'axios';
import { tool } from 'langchain';
import * as z from 'zod';

export const listFiles = tool(
    async ({ }) => {
        console.log("================================");
        console.log("using list files tool");
        console.log("================================");

        const response = await axios.get('http://019fc6bf-289d-753f-b34c-f12f51dd0a4c.agent.localhost/list-files')

        console.log("================================");
        console.log("response from list files tool", response.data.files);
        console.log("================================");
        return JSON.stringify(response.data.files);
    },
    {
        name: "list-files",
        description: "List all files in the project directory. This is useful for understanding what files are available to work with.",
        inputSchema: z.object({}),
    }
);

export const readFiles = tool(
    async ({ files: [] }) => {

        console.log("================================");
        console.log("using read files tool", files);
        console.log("================================");

        const response = await axios.get('http://019fc6bf-289d-753f-b34c-f12f51dd0a4c.agent.localhost/read-files?files=' + files.join(','));

        console.log("================================");
        console.log("response from read files tool", response.data);
        console.log("================================");

        return JSON.stringify(response.data);

    },
    {
        name: "read_files",
        description: "Read the content of the specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        inputSchema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later.")
        })
    }
);

export const updateFiles = tool(
    async ({ files }) => {
        console.log("================================");
        console.log("using update files tool");
        console.log("================================");

        const response = await axios.post('http://019fc6bf-289d-753f-b34c-f12f51dd0a4c.agent.localhost/update-files',
            { updates: files });

        console.log("================================");
        console.log("response from update files tool", response.data);
        console.log("================================");

        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the content of the specified files. This is useful for making changes to files based on the requiremnts of the task at hand.This tool can also be used to create new files if they do not already exist.",
        inputSchema: z.object({
            files: z.array(z.object({
                path: z.string().describe("The absolute path of the file to update."),
                content: z.string().describe("The new content for the file.")
            })).describe("The list of files to update with their new content.")
        })
    }
);

// export const createFiles = tool(
//     async({files}) => {
//         const response = await axios.post('http://019fc6bf-289d-753f-b34c-f12f51dd0a4c.agent.localhost/create-files',
//             { files: files });
//         return JSON.stringify(response.data.results);
//     },
//     {
//         name:"create_files",
//         description: "Create new files with the specified content. This is useful for adding new files to the project as needed.",
//         inputSchema: z.object({
//             files: z.array(z.object({
//                 path: z.string().describe("The absolute path where the file should be created."),
//                 content: z.string().describe("The content for the new file.")
//             })).describe("The list of files to create with their specified content.")
//         })
//     }
// );