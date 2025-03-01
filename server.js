import express from 'express'; // Default import
import {join, dirname} from 'path';   // Named import
import {fileURLToPath} from 'url'; // Import fileURLToPath
import * as fs from 'fs';      // Import everything as a namespace
import fetch from 'node-fetch';

const app = express();

const generativeService = "http://localhost:11434/api/generate";
const port = 3000;


const __filename = fileURLToPath(import.meta.url); // Get the filename
const __dirname = dirname(__filename); // Get the directory name

// Serve static files from specific directories
app.use('/js', express.static(join('js')));
app.use('/css', express.static(join('css')));
app.use('/webfonts', express.static(join('webfonts')));
app.use('/img', express.static(join('img')));

app.use(express.json()); // Add this middleware to parse JSON request bodies
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname)); // Serve static files from root.

app.post('/api', async (req, res) => {
    try {
        // const prompt = req.body;

        // House is of type [houseType], Built in the year [year], the heating system is of type [heating], the renovation measures are [renovation1, renovation2, renovationN...], my estimated budget is [euros], and the household gross income combined is [householdGross].

        const prompt = `I have a house of type ${req.body.questionTypeOfProperty} which was built in year ${req.body.questionYearConstruction} and has the heating type using ${req.body.heatingSystem}. I want to renovate it, mostly ${req.body.renovationMeasure.join(", ")}, but for that I need to check which German government subsidy I am entitled to receive in Germany. My household gross income is around ${req.body.householdIncome} and my renovation budget is ${req.body.renovationBudget}.`;
        const schema = {
            "type": "object",
            "properties": {
                "programs": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "url": {"type": "string", "format": "url"},
                            "reason": {"type": "string"}
                        },
                        "required": ["name", "description", "url"]
                    }
                }
            },
            "required": ["programs"]
        };

        const requestBody = {
            "model": "llama3.2",
            "prompt": prompt,
            "format": schema,
            // "options": {}, // temperature
            "system": "We want to evaluate if the customer is eligible to German government's funds to subside renovation of real estate property. The funding program must be active as of 2025, so don't include any program that will end or has ended before March 2025. The program has to available for Berlin, Germany. Any program not available for Berlin should be discarded. The customer will provide basic information about type of property, year it was built, type of heating system, type of renovation measures he or she desires, among other personal information. You will check if his assessment meets the requirement of German government subsidies, and if they meet, you will return only a JSON structure with the program name, the program URL, and a brief description of the program, and a reason why you suggest the program as a good match. Return a maximum of the best 10 programs with most relevant eligibility for the customer.",
            // "template": prompt,
            "stream": false,
            "raw": false,
            "keep_alive": "1m"
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        };

        const response = await fetch(generativeService, requestOptions);

        if (!response.ok) {
            const errorData = await response.json(); // Try to get error details if available.
            console.error("Ollama Error:", response.status, errorData); // Log the error details received from Ollama
            throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({error: 'Failed to fetch data from external service'});
    }
});

// Serve index.html for the root path, or any other files if they exist
app.get('*', (req, res) => {
    const filePath = join(req.path);

    // Check if file exists and if it's a directory - If so, then look for index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {

        const indexHtmlPath = join(filePath, "index.html");

        if (fs.existsSync(indexHtmlPath)) {
            res.sendFile(indexHtmlPath);
            return;
        } else {
            // If it's a directory but index.html doesn't exist, you might want to list
            // the contents of the directory, or handle it as a 404 if access to a
            // raw directory listing should be restricted.  I'll handle as 403 here.
            res.status(403).send("Directory listing forbidden");
            return;
        }
    }

    // If it's not a directory or a directory with index.html, then it's a file request.
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);

    } else {
        res.status(404).send('Not Found');
    }


});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
