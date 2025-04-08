const fs = require('fs');
const path = require('path');

// Create a simple blue circle icon as a base64 string
const createCircleIcon = (size) => {
  // Simple SVG circle with blue color
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="#4285F4" stroke="#3367D6" stroke-width="2"/>
    <path d="M${size/3} ${size/2} L${size/2} ${size*2/3} L${size*2/3} ${size/3}" stroke="white" stroke-width="${size/10}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
  
  // Convert SVG to Base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

// Function to create PNG files from base64
const createPngFromBase64 = async (base64String, outputPath) => {
  // Remove the data URL prefix to get just the base64 data
  const base64Data = base64String.replace(/^data:image\/svg\+xml;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Write the buffer to the output file
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
};

// Create icon files
const createIcons = async () => {
  const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');
  
  // Ensure the directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generate different sized icons
  await createPngFromBase64(
    createCircleIcon(16),
    path.join(iconsDir, 'icon16.png')
  );
  
  await createPngFromBase64(
    createCircleIcon(48),
    path.join(iconsDir, 'icon48.png')
  );
  
  await createPngFromBase64(
    createCircleIcon(128),
    path.join(iconsDir, 'icon128.png')
  );
};

// Run the icon creation
createIcons()
  .then(() => console.log('Icons generated successfully'))
  .catch(err => console.error('Error generating icons:', err));
