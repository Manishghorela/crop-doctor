import io
import unittest

from PIL import Image

import app as app_module


class CropAppTests(unittest.TestCase):
    def setUp(self):
        self.client = app_module.app.test_client()

    def test_homepage_loads(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Crop Doctor', response.data)

    def test_analyze_api_accepts_image(self):
        image = Image.new('RGB', (120, 120), color=(120, 200, 90))
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)

        response = self.client.post(
            '/api/analyze',
            data={'image': (buffer, 'test.png')},
            content_type='multipart/form-data',
        )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertIn('issue', payload)
        self.assertIn('detail', payload)
        self.assertIn('fix', payload)
        self.assertIn('confidence', payload)


if __name__ == '__main__':
    unittest.main()
