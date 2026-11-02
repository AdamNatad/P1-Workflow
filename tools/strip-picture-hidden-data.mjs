#!/usr/bin/env node
// Removes the hidden data pictures carry (AGENTS.md, rule 13): C2PA content credentials, EXIF, XMP,
// IPTC, text chunks, comments and editor data, from PNG, JPEG, WebP and SVG files, in place.
//
//   node tools/strip-picture-hidden-data.mjs <file or folder>...           strip
//   node tools/strip-picture-hidden-data.mjs --check <file or folder>...   report only; exits 1 if any has hidden data
//   node tools/strip-picture-hidden-data.mjs --staged                      strip the pictures staged for the next commit
//   node tools/strip-picture-hidden-data.mjs --install-git-hook            run --staged before every commit
//
// Pixels and color profiles stay exactly as they were: a file is rewritten only after its image data
// is checked to be byte-identical, and it is written beside the original and then swapped in, so a
// failure never leaves a half-written picture. Folders are searched recursively, `test_trash/`
// included, skipping dependencies, builds and Git. Node.js only, no packages.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const stripPictureHiddenDataScriptPath = 'tools/strip-picture-hidden-data.mjs'
const stripPictureHiddenDataUsage = `Picture hidden-data remover

Usage:
  node ${stripPictureHiddenDataScriptPath} <file or folder>... [--check]
  node ${stripPictureHiddenDataScriptPath} --staged
  node ${stripPictureHiddenDataScriptPath} --install-git-hook

Removes C2PA content credentials, EXIF, XMP, IPTC, text chunks, comments and editor data from PNG,
JPEG, WebP and SVG files, in place. Pixels and color profiles are kept unchanged.

Options:
  --check             Report which files carry hidden data without changing them (exits 1 if any do)
  --staged            Strip the pictures staged for the next commit and stage the stripped files
  --install-git-hook  Install the Git pre-commit hook that runs --staged before every commit
  --help              Show this help
`

const pictureHiddenDataPreCommitHookText = `#!/bin/sh
# No picture enters Git with hidden data (C2PA, EXIF, XMP and the like): AGENTS.md, rule 13. Strips
# every staged PNG, JPEG, WebP and SVG and stages the stripped file. Installed by:
#   node ${stripPictureHiddenDataScriptPath} --install-git-hook

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found, so the pictures' hidden data could not be checked; commit refused." >&2
  exit 1
fi
exec node ${stripPictureHiddenDataScriptPath} --staged
`

const skippedFolderNames = new Set(['node_modules', '.git', '.next', 'out', 'dist', 'build', 'coverage', '.turbo'])
const pictureFormatByExtension = { '.png': 'png', '.jpg': 'jpeg', '.jpeg': 'jpeg', '.webp': 'webp', '.svg': 'svg' }
const unsupportedPictureExtensions = new Set(['.gif', '.ico', '.avif', '.heic', '.heif', '.tif', '.tiff', '.bmp'])

// ---------------------------------------------------------------- PNG

// Chunks that draw the picture or set its color; every other chunk (tEXt, zTXt, iTXt, eXIf, tIME,
// caBX for C2PA, and anything unknown) is hidden data.
const pngPictureChunkTypes = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'pHYs', 'bKGD', 'acTL', 'fcTL', 'fdAT'])

function readPngPictureData(pngFileBytes) {
  const pictureDataParts = []
  let chunkOffset = 8
  while (chunkOffset < pngFileBytes.length) {
    const chunkLength = pngFileBytes.readUInt32BE(chunkOffset)
    const chunkType = pngFileBytes.toString('latin1', chunkOffset + 4, chunkOffset + 8)
    if (chunkType === 'IDAT' || chunkType === 'fdAT') pictureDataParts.push(pngFileBytes.subarray(chunkOffset, chunkOffset + 12 + chunkLength))
    chunkOffset += 12 + chunkLength
  }
  return Buffer.concat(pictureDataParts)
}

function stripPngHiddenData(pngFileBytes) {
  const pngSignatureBytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (!pngFileBytes.subarray(0, 8).equals(pngSignatureBytes)) throw new Error('not a PNG file')
  const keptParts = [pngSignatureBytes]
  const removedHiddenDataNames = []
  const originalPictureDataParts = []
  let chunkOffset = 8
  while (chunkOffset < pngFileBytes.length) {
    const chunkLength = pngFileBytes.readUInt32BE(chunkOffset)
    const chunkType = pngFileBytes.toString('latin1', chunkOffset + 4, chunkOffset + 8)
    const wholeChunk = pngFileBytes.subarray(chunkOffset, chunkOffset + 12 + chunkLength)
    if (pngPictureChunkTypes.has(chunkType)) {
      keptParts.push(wholeChunk)
      if (chunkType === 'IDAT' || chunkType === 'fdAT') originalPictureDataParts.push(wholeChunk)
    } else {
      removedHiddenDataNames.push(chunkType === 'caBX' ? 'C2PA (caBX)' : chunkType)
    }
    chunkOffset += 12 + chunkLength
    if (chunkType === 'IEND') break
  }
  const strippedBytes = Buffer.concat(keptParts)
  return { strippedBytes, removedHiddenDataNames, isPictureDataUnchanged: () => readPngPictureData(strippedBytes).equals(Buffer.concat(originalPictureDataParts)) }
}

// ---------------------------------------------------------------- JPEG

// Segments before the scan are kept unless they are hidden data: APP1 (EXIF, XMP), APP11 (JUMBF,
// where C2PA lives), APP13 (IPTC), COM comments and other APPn. Kept APPn: JFIF/JFXX (APP0), the ICC
// color profile (APP2) and the Adobe color transform (APP14). Everything from the first scan on is
// copied as it is.
function isJpegAppSegmentPictureData(markerByte, segmentPayload) {
  const segmentSignature = segmentPayload.toString('latin1', 0, 12)
  if (markerByte === 0xe0) return segmentSignature.startsWith('JFIF\0') || segmentSignature.startsWith('JFXX\0')
  if (markerByte === 0xe2) return segmentSignature.startsWith('ICC_PROFILE\0')
  if (markerByte === 0xee) return segmentSignature.startsWith('Adobe')
  return false
}

function describeJpegHiddenDataSegment(markerByte, segmentPayload) {
  const segmentSignature = segmentPayload.toString('latin1', 0, 32)
  if (markerByte === 0xfe) return 'comment'
  if (markerByte === 0xe1 && segmentSignature.startsWith('Exif')) return 'EXIF'
  if (markerByte === 0xe1 && segmentSignature.includes('ns.adobe.com/xap')) return 'XMP'
  if (markerByte === 0xeb) return 'C2PA (JUMBF)'
  if (markerByte === 0xed) return 'IPTC'
  return `APP${markerByte - 0xe0}`
}

function stripJpegHiddenData(jpegFileBytes) {
  if (jpegFileBytes[0] !== 0xff || jpegFileBytes[1] !== 0xd8) throw new Error('not a JPEG file')
  const keptParts = [jpegFileBytes.subarray(0, 2)]
  const removedHiddenDataNames = []
  let segmentOffset = 2
  let scanStartOffset = -1
  while (segmentOffset < jpegFileBytes.length) {
    if (jpegFileBytes[segmentOffset] !== 0xff) throw new Error(`unexpected byte at ${segmentOffset}`)
    let markerOffset = segmentOffset
    while (jpegFileBytes[markerOffset + 1] === 0xff) markerOffset += 1 // fill bytes
    const markerByte = jpegFileBytes[markerOffset + 1]
    if (markerByte === 0xda) {
      scanStartOffset = markerOffset
      break
    }
    if (markerByte === 0xd9 || (markerByte >= 0xd0 && markerByte <= 0xd7) || markerByte === 0x01) {
      keptParts.push(jpegFileBytes.subarray(markerOffset, markerOffset + 2))
      segmentOffset = markerOffset + 2
      continue
    }
    const segmentLength = jpegFileBytes.readUInt16BE(markerOffset + 2)
    const wholeSegment = jpegFileBytes.subarray(markerOffset, markerOffset + 2 + segmentLength)
    const segmentPayload = jpegFileBytes.subarray(markerOffset + 4, markerOffset + 2 + segmentLength)
    const isHiddenDataSegment = markerByte === 0xfe || (markerByte >= 0xe0 && markerByte <= 0xef && !isJpegAppSegmentPictureData(markerByte, segmentPayload))
    if (isHiddenDataSegment) removedHiddenDataNames.push(describeJpegHiddenDataSegment(markerByte, segmentPayload))
    else keptParts.push(wholeSegment)
    segmentOffset = markerOffset + 2 + segmentLength
  }
  if (scanStartOffset < 0) throw new Error('no image scan found')
  const originalScanBytes = jpegFileBytes.subarray(scanStartOffset)
  keptParts.push(originalScanBytes)
  const strippedBytes = Buffer.concat(keptParts)
  return {
    strippedBytes,
    removedHiddenDataNames,
    isPictureDataUnchanged: () => strippedBytes.subarray(strippedBytes.length - originalScanBytes.length).equals(originalScanBytes),
  }
}

// ---------------------------------------------------------------- WebP

// RIFF chunks EXIF, XMP and C2PA are hidden data; the VP8X header's EXIF and XMP flags are cleared to
// match.
const webpPictureChunkTypes = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP'])

function stripWebpHiddenData(webpFileBytes) {
  if (webpFileBytes.toString('latin1', 0, 4) !== 'RIFF' || webpFileBytes.toString('latin1', 8, 12) !== 'WEBP') throw new Error('not a WebP file')
  const keptChunks = []
  const removedHiddenDataNames = []
  const originalPictureChunks = []
  let chunkOffset = 12
  while (chunkOffset + 8 <= webpFileBytes.length) {
    const chunkType = webpFileBytes.toString('latin1', chunkOffset, chunkOffset + 4)
    const chunkLength = webpFileBytes.readUInt32LE(chunkOffset + 4)
    const paddedChunkEnd = chunkOffset + 8 + chunkLength + (chunkLength % 2)
    const wholeChunk = Buffer.from(webpFileBytes.subarray(chunkOffset, paddedChunkEnd))
    if (webpPictureChunkTypes.has(chunkType)) {
      if (chunkType === 'VP8X') wholeChunk[8] &= ~(0x08 | 0x04)
      keptChunks.push(wholeChunk)
      if (chunkType !== 'VP8X') originalPictureChunks.push(wholeChunk)
    } else {
      removedHiddenDataNames.push(chunkType.trim())
    }
    chunkOffset = paddedChunkEnd
  }
  const riffHeader = Buffer.from(webpFileBytes.subarray(0, 12))
  const chunkBytes = Buffer.concat(keptChunks)
  riffHeader.writeUInt32LE(chunkBytes.length + 4, 4)
  const strippedBytes = Buffer.concat([riffHeader, chunkBytes])
  const keptPictureBytes = Buffer.concat(originalPictureChunks)
  return { strippedBytes, removedHiddenDataNames, isPictureDataUnchanged: () => strippedBytes.includes(keptPictureBytes) }
}

// ---------------------------------------------------------------- SVG

// The SVG data block (where C2PA, RDF and licenses-as-data sit), comments, and Inkscape and Sodipodi
// editor views. The drawing itself is left untouched.
function stripSvgHiddenData(svgFileBytes) {
  const svgText = svgFileBytes.toString('utf8')
  const removedHiddenDataNames = []
  const svgHiddenDataPatterns = [
    { hiddenDataName: 'data block', hiddenDataPattern: /<(?:m)etadata\b[^>]*\/>|<(?:m)etadata\b[\s\S]*?<\/(?:m)etadata>/gi },
    { hiddenDataName: 'comment', hiddenDataPattern: /<!--[\s\S]*?-->/g },
    { hiddenDataName: 'editor view', hiddenDataPattern: /<sodipodi:namedview\b[^>]*\/>|<sodipodi:namedview\b[\s\S]*?<\/sodipodi:namedview>/gi },
  ]
  let strippedText = svgText
  for (const { hiddenDataName, hiddenDataPattern } of svgHiddenDataPatterns) {
    strippedText = strippedText.replace(hiddenDataPattern, () => {
      removedHiddenDataNames.push(hiddenDataName)
      return ''
    })
  }
  const strippedBytes = Buffer.from(strippedText, 'utf8')
  return { strippedBytes, removedHiddenDataNames, isPictureDataUnchanged: () => /<svg\b/i.test(strippedText) }
}

const stripHiddenDataByPictureFormat = { png: stripPngHiddenData, jpeg: stripJpegHiddenData, webp: stripWebpHiddenData, svg: stripSvgHiddenData }

// ---------------------------------------------------------------- files

async function collectPicturePaths(inputPath, picturePaths, unsupportedPicturePaths) {
  const inputStat = await stat(inputPath)
  if (inputStat.isDirectory()) {
    for (const directoryEntry of await readdir(inputPath, { withFileTypes: true })) {
      if (directoryEntry.isDirectory() && skippedFolderNames.has(directoryEntry.name)) continue
      if (directoryEntry.isDirectory() || directoryEntry.isFile()) {
        await collectPicturePaths(path.join(inputPath, directoryEntry.name), picturePaths, unsupportedPicturePaths)
      }
    }
    return
  }
  const pictureExtension = path.extname(inputPath).toLowerCase()
  if (pictureFormatByExtension[pictureExtension]) picturePaths.push(inputPath)
  else if (unsupportedPictureExtensions.has(pictureExtension)) unsupportedPicturePaths.push(inputPath)
}

function summarizeHiddenDataNames(removedHiddenDataNames) {
  const hiddenDataCounts = new Map()
  for (const hiddenDataName of removedHiddenDataNames) hiddenDataCounts.set(hiddenDataName, (hiddenDataCounts.get(hiddenDataName) ?? 0) + 1)
  return [...hiddenDataCounts].map(([hiddenDataName, hiddenDataCount]) => (hiddenDataCount > 1 ? `${hiddenDataName} x${hiddenDataCount}` : hiddenDataName)).join(', ')
}

// ---------------------------------------------------------------- Git

function runGitCommand(gitArguments) {
  const gitResult = spawnSync('git', gitArguments, { encoding: 'utf8' })
  if (gitResult.status !== 0) throw new Error(`git ${gitArguments.join(' ')} failed: ${(gitResult.stderr || '').trim()}`)
  return gitResult.stdout
}

const splitGitPathList = (gitOutput) => gitOutput.split('\0').filter(Boolean)

// The pictures staged for the next commit (added, copied, modified or renamed), as repository paths.
function listStagedPicturePaths() {
  return splitGitPathList(runGitCommand(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']))
    .filter((stagedPath) => pictureFormatByExtension[path.extname(stagedPath).toLowerCase()])
}

async function installPictureHiddenDataGitHook() {
  const repositoryRoot = runGitCommand(['rev-parse', '--show-toplevel']).trim()
  const gitHooksFolder = path.resolve(repositoryRoot, runGitCommand(['-C', repositoryRoot, 'rev-parse', '--git-path', 'hooks']).trim())
  const preCommitHookPath = path.join(gitHooksFolder, 'pre-commit')
  if (existsSync(preCommitHookPath)) {
    const existingHookText = await readFile(preCommitHookPath, 'utf8')
    if (existingHookText === pictureHiddenDataPreCommitHookText) {
      console.log(`  already installed: ${preCommitHookPath}`)
      return
    }
    if (!existingHookText.includes(`${stripPictureHiddenDataScriptPath} --staged`)) {
      throw new Error(`${preCommitHookPath} already exists. Add this line to it instead: node ${stripPictureHiddenDataScriptPath} --staged`)
    }
  }
  await mkdir(gitHooksFolder, { recursive: true })
  await writeFile(preCommitHookPath, pictureHiddenDataPreCommitHookText, { mode: 0o755 })
  console.log(`  installed: ${preCommitHookPath}`)
}

// ---------------------------------------------------------------- run

async function runStripPictureHiddenData() {
  const commandLineArguments = process.argv.slice(2)
  const knownOptions = new Set(['--check', '--staged', '--install-git-hook', '--help', '-h'])
  const unknownOptions = commandLineArguments.filter((commandLineArgument) => commandLineArgument.startsWith('-') && !knownOptions.has(commandLineArgument))
  if (unknownOptions.length > 0) throw new Error(`Unknown option ${unknownOptions[0]}`)
  const isCheckOnly = commandLineArguments.includes('--check')
  const isStagedRun = commandLineArguments.includes('--staged')
  const inputPaths = commandLineArguments.filter((commandLineArgument) => !commandLineArgument.startsWith('-'))
  if (commandLineArguments.includes('--install-git-hook')) {
    await installPictureHiddenDataGitHook()
    return
  }
  if (commandLineArguments.includes('--help') || commandLineArguments.includes('-h') || (inputPaths.length === 0 && !isStagedRun)) {
    process.stdout.write(stripPictureHiddenDataUsage)
    process.exitCode = commandLineArguments.includes('--help') || commandLineArguments.includes('-h') ? 0 : 1
    return
  }

  const picturePaths = []
  const unsupportedPicturePaths = []
  if (isStagedRun) {
    // Staging a file again that has unstaged edits would commit those edits too, so it stops the commit.
    const unstagedPaths = new Set(splitGitPathList(runGitCommand(['diff', '--name-only', '-z'])))
    for (const stagedPicturePath of listStagedPicturePaths()) {
      if (unstagedPaths.has(stagedPicturePath)) {
        console.error(`  failed    ${stagedPicturePath}  (it also has unstaged changes; stage or undo them, then commit again)`)
        process.exitCode = 1
      } else {
        picturePaths.push(stagedPicturePath)
      }
    }
    if (process.exitCode === 1 || picturePaths.length === 0) return
  } else {
    for (const inputPath of inputPaths) await collectPicturePaths(inputPath, picturePaths, unsupportedPicturePaths)
  }

  const strippedPicturePaths = []
  let foundFileCount = 0
  let cleanFileCount = 0
  let failedFileCount = 0
  for (const picturePath of picturePaths) {
    const pictureFormat = pictureFormatByExtension[path.extname(picturePath).toLowerCase()]
    try {
      const originalBytes = await readFile(picturePath)
      const { strippedBytes, removedHiddenDataNames, isPictureDataUnchanged } = stripHiddenDataByPictureFormat[pictureFormat](originalBytes)
      if (removedHiddenDataNames.length === 0) {
        cleanFileCount += 1
        console.log(`  clean     ${picturePath}`)
        continue
      }
      const hiddenDataSummary = summarizeHiddenDataNames(removedHiddenDataNames)
      foundFileCount += 1
      if (isCheckOnly) {
        console.log(`  hidden    ${picturePath}  (${hiddenDataSummary})`)
        continue
      }
      if (!isPictureDataUnchanged()) throw new Error('the picture itself would change; left as it was')
      const temporaryPicturePath = `${picturePath}.strip-picture-hidden-data.tmp`
      await writeFile(temporaryPicturePath, strippedBytes)
      await rename(temporaryPicturePath, picturePath)
      strippedPicturePaths.push(picturePath)
      console.log(`  stripped  ${picturePath}  (removed ${hiddenDataSummary}; ${originalBytes.length.toLocaleString('en-US')} -> ${strippedBytes.length.toLocaleString('en-US')} bytes)`)
    } catch (stripError) {
      failedFileCount += 1
      console.error(`  failed    ${picturePath}  (${stripError.message})`)
    }
  }
  for (const unsupportedPicturePath of unsupportedPicturePaths) console.log(`  skipped   ${unsupportedPicturePath}  (format not supported)`)
  if (isStagedRun && strippedPicturePaths.length > 0) runGitCommand(['add', '--', ...strippedPicturePaths])
  const foundLabel = isCheckOnly ? 'with hidden data' : 'stripped'
  const runLabel = isStagedRun ? 'staged pictures' : 'pictures'
  console.log(`\n  ${picturePaths.length} ${runLabel}: ${foundFileCount} ${foundLabel}, ${cleanFileCount} clean, ${failedFileCount} failed, ${unsupportedPicturePaths.length} skipped`)
  if (failedFileCount > 0 || (isCheckOnly && foundFileCount > 0)) process.exitCode = 1
}

runStripPictureHiddenData().catch((stripPictureHiddenDataError) => {
  console.error(` [error] ${stripPictureHiddenDataError.message}`)
  process.exitCode = 1
})
