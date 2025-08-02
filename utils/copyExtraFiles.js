import { readdir, stat, mkdir, copyFile, access } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Copies files with specified extensions from source to destination directory
 * while preserving the folder structure
 *
 * @param {string[]} extensions - Array of file extensions to copy (e.g., ['.yaml', '.yml'])
 * @param {string} sourceDir - Source directory to copy from (defaults to project root)
 * @param {string} destDir - Destination directory to copy to (defaults to './dist')
 * @param {string[]} excludeDirs - Directories to exclude from copying (defaults to ['node_modules', 'dist', '.git'])
 * @param {string[]} excludeFiles - Specific files to exclude from copying (e.g., ['pnpm-lock.yaml', 'package-lock.json'])
 */
async function copyExtraFiles(
  extensions = ['.yaml', '.yml'],
  sourceDir = join(__dirname, '..'),
  destDir = join(__dirname, '..', 'dist'),
  excludeDirs = ['node_modules', 'dist', '.git', 'tests', 'utils'],
  excludeFiles = ['pnpm-lock.yaml', 'package-lock.json']
) {
  try {
    // Guard clause: Check if dist directory exists
    try {
      await access(destDir);
    } catch (error) {
      throw new Error(
        `Destination directory '${destDir}' does not exist. Please run TypeScript compilation first.`
      );
    }

    console.log(`Using target directory: ${destDir}`);

    await copyFilesRecursive(
      sourceDir,
      destDir,
      extensions,
      excludeDirs,
      excludeFiles,
      sourceDir
    );
    console.log(
      `Successfully copied files with extensions: ${extensions.join(', ')}`
    );
  } catch (error) {
    console.error('Error copying extra files:', error);
    throw error;
  }
}

/**
 * Recursively copies files with specified extensions
 *
 * @param {string} currentDir - Current directory being processed
 * @param {string} destBaseDir - Base destination directory
 * @param {string[]} extensions - File extensions to copy
 * @param {string[]} excludeDirs - Directories to exclude
 * @param {string[]} excludeFiles - Specific files to exclude
 * @param {string} sourceBaseDir - Base source directory for relative path calculation
 */
async function copyFilesRecursive(
  currentDir,
  destBaseDir,
  extensions,
  excludeDirs,
  excludeFiles,
  sourceBaseDir
) {
  const items = await readdir(currentDir);

  for (const item of items) {
    const itemPath = join(currentDir, item);
    const itemStat = await stat(itemPath);

    if (itemStat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(item)) {
        continue;
      }

      // Recursively process subdirectories
      await copyFilesRecursive(
        itemPath,
        destBaseDir,
        extensions,
        excludeDirs,
        excludeFiles,
        sourceBaseDir
      );
    } else if (itemStat.isFile()) {
      // Skip excluded files
      if (excludeFiles.includes(item)) {
        continue;
      }

      // Check if file has one of the specified extensions
      const hasTargetExtension = extensions.some((ext) =>
        item.toLowerCase().endsWith(ext.toLowerCase())
      );

      if (hasTargetExtension) {
        // Calculate relative path from source base to maintain structure
        const relativePath = relative(sourceBaseDir, itemPath);
        const destPath = join(destBaseDir, relativePath);
        const destDirPath = dirname(destPath);

        // Create destination directory if it doesn't exist
        await mkdir(destDirPath, { recursive: true });

        // Copy the file
        await copyFile(itemPath, destPath);
        console.log(`Copied: ${relativePath}`);
      }
    }
  }
}

copyExtraFiles();

export { copyExtraFiles };
