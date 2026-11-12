# Crop Doctor

Crop Doctor is a small Flask web application for exploring crop-health checks. It provides a responsive crop-care page and an image-analysis endpoint that estimates common crop conditions from image color patterns.

> The image analysis uses simple color heuristics, not a trained diagnostic model. Treat its suggestions as informational and consult an agricultural professional before making crop-treatment decisions.

## Features

- Crop-care landing page with diagnosis and image-scanning sections.
- Image upload endpoint returning an issue estimate, details, suggested next steps, and a confidence label.
- Upload size limited to 16 MB.

## Requirements

- Python 3
- Dependencies listed in `requirements.txt`

## Run locally

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS or Linux
source .venv/bin/activate
```

Install dependencies and start the app:

```bash
python -m pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Image analysis API

Send a multipart `POST` request to `/api/analyze` with an image field named `image`:

```bash
curl -X POST -F "image=@leaf.jpg" http://127.0.0.1:5000/api/analyze
```

A successful response contains `issue`, `detail`, `fix`, and `confidence` fields. Missing, invalid, or empty image uploads return an error response.

## Tests

Run the unit tests with:

```bash
python -m unittest -v
```
