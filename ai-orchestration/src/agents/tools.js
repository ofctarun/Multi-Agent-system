import axios from 'axios';
import { tool } from 'langchain';
import * as z from 'zod';

// const SANDBOX_ID = "01a01d48-f3e0-77ee-950c-a27ab9c265bb";

// Talk to the sandbox's K8s Service directly — no router-service, no Host
// header. This works because ai-server is a pod in the same cluster/namespace
// as the sandbox, so CoreDNS resolves `sandbox-service-<id>` for us. The
// router-service + Host-header trick is only needed for traffic coming from
// outside the cluster (browsers hitting *.preview.localhost), which can't do
// K8s DNS lookups.
// const sandboxApi = axios.create({
//     baseURL: `http://sandbox-service-${SANDBOX_ID}:3000`,
// });

export const listFiles = tool(
    async ({ }, config) => {
        
        const writer = config.writer;
        writer("Listing files in the project directory...\n");

        try {
            const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/list-files`);
            console.log("response from list files tool", response.data.files);
            writer("Files listed successfully.\n");
            return JSON.stringify(response.data.files);
        } catch (err) {
            console.error("list-files tool failed:", err.message);
            writer("Failed to list files.\n");
            return JSON.stringify({ error: `list-files failed: ${err.message}` });
        }
    },
    {
        name: "list-files",
        description: "List all files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({}),
    }
);

export const readFiles = tool(
    async ({ files }, config) => {

        const writer = config.writer;
        writer(`Reading content of files: ${files.join(', ')}...\n`);

        try {
            const response = await axios.get(`http://sandbox-service-${config.context.projectId}:3000/read-files?files=` + files.join(','));
            console.log("response from read files tool", response.data);
            writer("Files read successfully.\n");
            return JSON.stringify(response.data);
        } catch (err) {
            console.error("read-files tool failed:", err.message);
            writer("Failed to read files.\n");
            return JSON.stringify({ error: `read-files failed: ${err.message}` });
        }
    },
    {
        name: "read_files",
        description: "Read the content of the specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later.")
        })
    }
);

export const updateFiles = tool(
    async ({ files }, config) => {

        const writer = config.writer;
        writer("Updating files...\n");

        // Sandbox agent's /update-files route expects each item shaped
        // { file, content } — not { path, content }. Translate here so the
        // tool schema (which the model sees) can keep the clearer "path" name.
        const updates = files.map(({ path, content }) => ({ file: path, content }));

        try {
            const response = await axios.patch(`http://sandbox-service-${config.context.projectId}:3000/update-files`, { updates });
            writer("Files updated successfully.\n");
            return JSON.stringify(response.data.results);
        } catch (err) {
            console.error("update-files tool failed:", err.message);
            writer("Failed to update files.\n");
            return JSON.stringify({ error: `update-files failed: ${err.message}` });
        }
    },
    {
        name: "update_files",
        description: "Update the content of the specified files. This is useful for making changes to files based on the requiremnts of the task at hand.This tool can also be used to create new files if they do not already exist.",
        schema: z.object({
            files: z.array(z.object({
                path: z.string().describe("The absolute path of the file to update."),
                content: z.string().describe("The new content for the file.")
            })).describe("The list of files to update with their new content.")
        })
    }
);

// export const createFiles = tool(
//     async({files}) => {
//         const response = await sandboxApi.post('/create-files', { files });
//         return JSON.stringify(response.data.results);
//     },
//     {
//         name:"create_files",
//         description: "Create new files with the specified content. This is useful for adding new files to the project as needed.",
//         schema: z.object({
//             files: z.array(z.object({
//                 path: z.string().describe("The absolute path where the file should be created."),
//                 content: z.string().describe("The content for the new file.")
//             })).describe("The list of files to create with their specified content.")
//         })
//     }
// );