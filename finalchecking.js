const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Define paths
const testFolder = path.join(__dirname, "test");
const outputFolder = path.join(__dirname, "MODEL/urban-octo-eureka/output_results");

// API to get images with their JSON
app.get("/files", (req, res) => {
    let responseData = [];

    // Read images from the test folder
    fs.readdir(testFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read test folder" });
        }

        let imageFiles = files.filter(file => file.endsWith(".png")); // Filter only .png images

        imageFiles.forEach(image => {
            let jsonFile = `${image}.json`; // Corresponding JSON file name
            let jsonPath = path.join(outputFolder, jsonFile);

            let jsonData = { image }; // Default structure

            if (fs.existsSync(jsonPath)) {
                try {
                    jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8")); // Read JSON file
                } catch (error) {
                    jsonData = { image, error: "Invalid JSON format" };
                }
            }

            responseData.push(jsonData);
        });

        res.json(responseData);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});