/**
 * Image Optimization Script
 * Optimizes blog images by:
 * - Resizing to optimal dimensions
 * - Compressing to reduce file size
 * - Generating WebP versions
 * 
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp is not installed');
  console.error('   Run: npm install --save-dev sharp');
  process.exit(1);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Maximum dimensions for featured images
  maxWidth: 1200,
  maxHeight: 630,
  
  // Quality settings
  jpegQuality: 85,
  pngQuality: 85,
  webpQuality: 85,
  
  // File size warning threshold (in MB)
  warningSizeThreshold: 500 * 1024, // 500KB
};

// ============================================================================
// PURE FUNCTIONS
// ============================================================================

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Calculate dimensions maintaining aspect ratio
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Object} - { width, height }
 */
function calculateDimensions(width, height, maxWidth, maxHeight) {
  const aspectRatio = width / height;
  
  let newWidth = width;
  let newHeight = height;
  
  // Scale down if too wide
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = Math.round(newWidth / aspectRatio);
  }
  
  // Scale down if too tall
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = Math.round(newHeight * aspectRatio);
  }
  
  return { width: newWidth, height: newHeight };
}

// ============================================================================
// IMAGE PROCESSING
// ============================================================================

/**
 * Optimize a single image
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output image path (optional, defaults to input)
 * @returns {Promise<Object>} - Optimization results
 */
async function optimizeImage(inputPath, outputPath = null) {
  if (!outputPath) {
    outputPath = inputPath;
  }
  
  const ext = path.extname(inputPath).toLowerCase();
  const originalSize = fs.statSync(inputPath).size;
  
  console.log(`\nOptimizing: ${path.basename(inputPath)}`);
  console.log(`  Original size: ${formatFileSize(originalSize)}`);
  
  try {
    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`  Dimensions: ${metadata.width}x${metadata.height}`);
    
    // Calculate new dimensions
    const newDimensions = calculateDimensions(
      metadata.width,
      metadata.height,
      CONFIG.maxWidth,
      CONFIG.maxHeight
    );
    
    const needsResize = 
      newDimensions.width !== metadata.width || 
      newDimensions.height !== metadata.height;
    
    if (needsResize) {
      console.log(`  Resizing to: ${newDimensions.width}x${newDimensions.height}`);
    }
    
    // Prepare image pipeline
    let pipeline = image;
    
    if (needsResize) {
      pipeline = pipeline.resize(newDimensions.width, newDimensions.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Optimize based on format
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: CONFIG.jpegQuality, progressive: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality: CONFIG.pngQuality, compressionLevel: 9 });
    }
    
    // Save optimized image
    await pipeline.toFile(outputPath + '.tmp');
    
    // Replace original with optimized
    fs.renameSync(outputPath + '.tmp', outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    const savings = originalSize - newSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    console.log(`  ✓ Optimized size: ${formatFileSize(newSize)}`);
    console.log(`  ✓ Saved: ${formatFileSize(savings)} (${savingsPercent}%)`);
    
    // Generate WebP version
    const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    await sharp(outputPath)
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    console.log(`  ✓ Generated WebP: ${formatFileSize(webpSize)}`);
    
    // Warning if still too large
    if (newSize > CONFIG.warningSizeThreshold) {
      console.log(`  ⚠️  Warning: File is still large (>${formatFileSize(CONFIG.warningSizeThreshold)})`);
    }
    
    return {
      originalSize,
      newSize,
      webpSize,
      savings,
      savingsPercent: parseFloat(savingsPercent)
    };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * Optimize all images in a directory
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} - Array of results
 */
async function optimizeDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`\nFound ${imageFiles.length} images in ${dirPath}`);
  
  const results = [];
  
  for (const file of imageFiles) {
    const filePath = path.join(dirPath, file);
    try {
      const result = await optimizeImage(filePath);
      results.push({ file, ...result });
    } catch (error) {
      results.push({ file, error: error.message });
    }
  }
  
  return results;
}

// ============================================================================
// REPORTING
// ============================================================================

/**
 * Print summary report
 * @param {Array} results - Array of optimization results
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);
  
  if (successful.length > 0) {
    const totalOriginal = successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = successful.reduce((sum, r) => sum + r.newSize, 0);
    const totalSavings = totalOriginal - totalNew;
    const avgSavings = (totalSavings / totalOriginal * 100).toFixed(1);
    
    console.log(`\n✅ Successfully optimized: ${successful.length} images`);
    console.log(`   Total original size: ${formatFileSize(totalOriginal)}`);
    console.log(`   Total optimized size: ${formatFileSize(totalNew)}`);
    console.log(`   Total savings: ${formatFileSize(totalSavings)} (${avgSavings}%)`);
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length} images`);
    failed.forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node optimize-images.js <file-or-directory>');
    console.log('');
    console.log('Examples:');
    console.log('  node optimize-images.js images/blog/my-post/image.png');
    console.log('  node optimize-images.js images/blog/my-post/');
    console.log('  node optimize-images.js images/blog/');
    process.exit(1);
  }
  
  const target = args[0];
  const targetPath = path.resolve(target);
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Error: Path not found: ${targetPath}`);
    process.exit(1);
  }
  
  const stats = fs.statSync(targetPath);
  let results = [];
  
  if (stats.isDirectory()) {
    results = await optimizeDirectory(targetPath);
  } else if (stats.isFile()) {
    const result = await optimizeImage(targetPath);
    results = [{ file: path.basename(targetPath), ...result }];
  } else {
    console.error(`❌ Error: Invalid path type`);
    process.exit(1);
  }
  
  printSummary(results);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { optimizeImage, optimizeDirectory };

