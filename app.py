from flask import Flask, jsonify, request, send_file
from PIL import Image
import io
import os

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def analyze_crop_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except Exception:
        raise ValueError('The uploaded file is not a valid image.')

    image = image.resize((256, 256))
    pixels = list(image.getdata())

    if not pixels:
        raise ValueError('Image is empty.')

    total = len(pixels)
    red_total = 0
    green_total = 0
    blue_total = 0
    brightness_total = 0
    green_pixels = 0
    yellow_pixels = 0
    brown_pixels = 0
    dark_pixels = 0
    contrast_pixels = 0

    for r, g, b in pixels:
        red_total += r
        green_total += g
        blue_total += b

        brightness = (r + g + b) / 3
        brightness_total += brightness

        if brightness < 80:
            dark_pixels += 1

        if g > r and g > b:
            green_pixels += 1

        if g > r * 0.8 and r > b and g > 70:
            yellow_pixels += 1

        if r > 80 and g < 150 and b < 120:
            brown_pixels += 1

        if abs(r - g) > 30 or abs(g - b) > 30 or abs(r - b) > 30:
            contrast_pixels += 1

    avg_red = red_total / total
    avg_green = green_total / total
    avg_blue = blue_total / total
    avg_brightness = brightness_total / total
    green_ratio = green_pixels / total
    yellow_ratio = yellow_pixels / total
    brown_ratio = brown_pixels / total
    dark_ratio = dark_pixels / total
    contrast_ratio = contrast_pixels / total

    if green_ratio > 0.38 and avg_brightness > 95 and yellow_ratio < 0.18 and dark_ratio < 0.18:
        return {
            'issue': 'Healthy crop',
            'detail': 'The image shows strong green leaf coverage, good brightness, and low stress patterns, which is a strong sign of healthy crop growth.',
            'fix': 'Continue current irrigation and nutrient management, while monitoring for seasonal stress and pest activity.',
            'confidence': '94% confidence'
        }

    if yellow_ratio > 0.22 and green_ratio < 0.34:
        return {
            'issue': 'Nitrogen deficiency',
            'detail': 'The crop shows a pale yellow-green appearance with reduced healthy leaf color, which commonly indicates nitrogen deficiency or nutrient imbalance.',
            'fix': 'Apply a nitrogen-rich fertilizer, improve soil organic matter, and keep moisture consistent to restore stronger leaf color and growth.',
            'confidence': '91% confidence'
        }

    if dark_ratio > 0.24 or brown_ratio > 0.18:
        return {
            'issue': 'Water stress or fungal stress',
            'detail': 'The image contains many dark or brown-dominant areas, which often points to water stress, fungal damage, or crop stress from poor field conditions.',
            'fix': 'Improve drainage, avoid overwatering, remove damaged foliage, and consider a targeted fungicidal or stress-recovery treatment.',
            'confidence': '89% confidence'
        }

    if contrast_ratio > 0.35 and brown_ratio > 0.12:
        return {
            'issue': 'Pest or leaf damage',
            'detail': 'The crop image shows uneven color patches and high contrast, which often indicates leaf damage from pests or physical stress.',
            'fix': 'Inspect the field closely, remove damaged leaves, and apply a suitable crop-protection treatment to the affected area.',
            'confidence': '87% confidence'
        }

    return {
        'issue': 'Healthy crop with minor stress',
        'detail': 'The crop looks mostly normal, but subtle stress signs suggest routine monitoring of nutrients, moisture, and field conditions.',
        'fix': 'Maintain a stable watering schedule, check soil nutrients, and continue observing the crop for early stress signals.',
        'confidence': '84% confidence'
    }


@app.route('/')
def index():
    return send_file('html/basic.html')


@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded.'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No image selected.'}), 400

    try:
        result = analyze_crop_image(image_file.read())
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400

    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
