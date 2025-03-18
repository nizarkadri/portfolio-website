import fs from 'fs-extra';

import path from 'path';

const getIconFilenames =  async() =>{
  const iconsDirectory = path.join(process.cwd(), 'public/images/icons');
  
  try {
    // This returns a promise
    const files = await fs.readdir(iconsDirectory);
    return files;
  } catch (error) {
    console.error('Error reading icons directory:', error);
    return [];
  }
}

export default getIconFilenames;