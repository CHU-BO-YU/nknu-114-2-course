NKNU Course Data Scraper & Visualizer (114-2)

A data extraction and visualization tool designed for the National Kaohsiung Normal University (NKNU) course selection system. This project aims to liberate siloed campus data by transforming legacy HTML interfaces into structured, developer-friendly JSON formats.

Project Status

[Status: Active Refactoring & Archiving]
The frontend visualization was specifically deployed for the 114-2 (Spring 2026) semester. As the course selection period has concluded, the static web interface has been archived.

The current development focus is on the backend scraper.py. The goal is to refactor this single-semester script into a highly modular, semester-agnostic framework that can be utilized by the broader student developer community for future academic years.

Core Features

Automated Data Extraction: Python-based scraper navigating the legacy university system to extract course information.

Data Structuring: Converts unstructured web data into a clean, queryable courses.json format.

Static Visualization (Archived): A Vanilla JavaScript frontend that previously provided course filtering, searching, schedule generation, and conflict detection.

Future Roadmap (AI Integration)

This repository is currently preparing for a major architecture upgrade, planning to integrate Large Language Models (LLMs) to solve complex parsing issues inherent in legacy systems:

Refactor hardcoded extraction logic into a generalized, configuration-driven framework.

Implement OpenAI API to parse and structure complex, unstructured syllabus text and edge-case course notes into standardized fields.

Establish automated data validation and unit testing pipelines.

Quick Start

1. Data Scraping (Backend)

Ensure you have Python installed, then install the required dependencies:

pip install -r requirements.txt


Run the scraper to fetch and generate the latest course data:

python scraper.py


Note: The parsed data will be saved as courses.json in the output/ directory. Please move it to the data/ folder for frontend usage.

2. Local Frontend Preview

To view the archived static frontend with the generated data:

python -m http.server 8080


Navigate to http://localhost:8080 in your web browser.

Project Structure

nknu-114-2-course/
├── index.html          # Main interface (Archived)
├── style.css           # Stylesheet
├── app.js              # Core logic for search and schedule generation
├── data/
│   └── courses.json    # Structured course dataset
├── scraper.py          # Web scraping and data cleaning script
└── requirements.txt    # Python dependencies


Tech Stack

Data Engineering: Python, Selenium, BeautifulSoup4

Frontend: HTML5, CSS3, Vanilla JavaScript

Deployment: GitHub Pages

License & Disclaimer

This project is open-sourced for educational purposes and developer collaboration. All course data originates from the NKNU administrative systems.
