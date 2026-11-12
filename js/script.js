const cropImageInput = document.getElementById('cropImage');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const issueTitle = document.getElementById('issueTitle');
const issueDetail = document.getElementById('issueDetail');
const fixAdvice = document.getElementById('fixAdvice');
const confidenceText = document.getElementById('confidenceText');

cropImageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) {
    imagePreview.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    imagePreview.src = event.target.result;
    imagePreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

analyzeBtn.addEventListener('click', function () {
  const file = cropImageInput.files[0];

  if (!file) {
    issueTitle.textContent = 'No image selected';
    issueDetail.textContent = 'Please upload a crop photo to begin AI diagnosis.';
    fixAdvice.textContent = 'Choose a crop image from your device to get a diagnosis.';
    confidenceText.textContent = 'Waiting';
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';

  const formData = new FormData();
  formData.append('image', file);

  fetch('/api/analyze', {
    method: 'POST',
    body: formData
  })
    .then(async function (response) {
      const text = await response.text();
      let data = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      return data;
    })
    .then(function (diagnosis) {
      issueTitle.textContent = diagnosis.issue;
      issueDetail.textContent = diagnosis.detail;
      fixAdvice.textContent = diagnosis.fix;
      confidenceText.textContent = diagnosis.confidence;
    })
    .catch(function (error) {
      issueTitle.textContent = 'Analysis failed';
      issueDetail.textContent = error.message || 'The uploaded file could not be processed. Please try another crop image.';
      fixAdvice.textContent = 'Use a clearer photo with visible leaves and good lighting for better diagnosis.';
      confidenceText.textContent = 'N/A';
    })
    .finally(function () {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze crop';
    });
});

const consultForm = document.getElementById('consultForm');
consultForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const nameInput = document.querySelector('input[aria-label="Your name"]');
  const emailInput = document.querySelector('input[aria-label="Email address"]');
  const cropTypeInput = document.querySelector('input[aria-label="Crop type"]');
  const issueInput = document.querySelector('textarea[aria-label="Describe the issue"]');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const cropType = cropTypeInput.value.trim();
  const issueText = issueInput.value.trim();

  if (!name || !email || !cropType || !issueText) {
    alert('Please fill in all consultation details before sending the email.');
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert('Please enter a valid email address.');
    emailInput.focus();
    return;
  }

  const subject = encodeURIComponent(`Consultation request from ${name}`);
  const body = encodeURIComponent(
    `Farmer name: ${name}\nEmail: ${email}\nCrop type: ${cropType}\nIssue details: ${issueText}`
  );

  window.location.href = `mailto:mailproject838@gmail.com?subject=${subject}&body=${body}`;
});

const weatherLocation = document.getElementById('weatherLocation');
const weatherStatus = document.getElementById('weatherStatus');
const tempValue = document.getElementById('tempValue');
const humidityValue = document.getElementById('humidityValue');
const rainValue = document.getElementById('rainValue');
const windValue = document.getElementById('windValue');
const locationBtn = document.getElementById('locationBtn');

function getWeatherCondition(code) {
  const conditions = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Cloudy',
    45: 'Fog',
    48: 'Fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Heavy showers',
    95: 'Thunderstorm'
  };

  return conditions[code] || 'Weather update';
}

function updateWeather(lat, lon, label) {
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`;

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Weather fetch failed');
      return response.json();
    })
    .then(function (data) {
      const current = data.current;
      const condition = getWeatherCondition(current.weather_code);

      weatherLocation.textContent = label || 'Current field weather';
      weatherStatus.textContent = condition;
      tempValue.textContent = `${Math.round(current.temperature_2m)}°C`;
      humidityValue.textContent = `${Math.round(current.relative_humidity_2m)}%`;
      rainValue.textContent = `${current.precipitation} mm`;
      windValue.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    })
    .catch(function () {
      weatherLocation.textContent = 'Weather unavailable';
      weatherStatus.textContent = 'Unable to load real-time data';
      tempValue.textContent = '--°C';
      humidityValue.textContent = '--%';
      rainValue.textContent = '-- mm';
      windValue.textContent = '-- km/h';
    });
}

function useDefaultWeather() {
  updateWeather(12.9716, 77.5946, 'Bengaluru, India');
}

locationBtn.addEventListener('click', function () {
  if (!navigator.geolocation) {
    useDefaultWeather();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      updateWeather(lat, lon, 'My farm location');
    },
    function () {
      useDefaultWeather();
    }
  );
});

useDefaultWeather();
