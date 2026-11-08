import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { stdout } from 'node:process'
import boxen from 'boxen'
import cliProgress from 'cli-progress'
import Chafa from 'chafa-wasm'
import figlet from 'figlet'
import { cristal, fruit, rainbow } from 'gradient-string'
import ora, { type Spinner as OraSpinner } from 'ora'
import cliSpinners, { randomSpinner, type SpinnerName } from 'cli-spinners'

const spinnerArgument =
  process.argv.find(argument => argument.startsWith('--spinner='))?.slice('--spinner='.length) ??
  (() => {
    const spinnerArgumentIndex = process.argv.indexOf('--spinner')
    return spinnerArgumentIndex >= 0 ? process.argv[spinnerArgumentIndex + 1] : 'aesthetic'
  })()
const imageArgumentIndex = process.argv.indexOf('--image')
const imagePath =
  imageArgumentIndex >= 0
    ? process.argv[imageArgumentIndex + 1]
    : resolve(process.cwd(), 'scripts/terminal/assets/cyberpunk-banner.jpg')
const isInteractive = Boolean(stdout.isTTY) && !process.env.CI && !process.env.NO_COLOR
const imageHeight = 24
const visualTimeoutMs = 5000

const pixelFrames = [
  [
    '      ▄▄▄▄▄▄▄▄▄      ',
    '   ▄█▀░░░░░░░░░▀█▄   ',
    '  █░░  ◈ GENESIS ◈ ░░█  ',
    '   ▀█▄░░░░░░░░░▄█▀   ',
    '      ▀▀▀▀▀▀▀▀▀▀      ',
  ],
  [
    '      ▄▄▄▄▄▄▄▄▄      ',
    '   ▄█▀░░░░░░░░░▀█▄   ',
    '  █░░  ◆ GENESIS ◆ ░░█  ',
    '   ▀█▄░░░░░░░░░▄█▀   ',
    '      ▀▀▀▀▀▀▀▀▀▀      ',
  ],
]

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function isSpinnerName(value: string): value is SpinnerName {
  return Object.prototype.hasOwnProperty.call(cliSpinners, value)
}

function getSpinner(): OraSpinner {
  if (spinnerArgument === 'random') {
    return randomSpinner()
  }

  if (!spinnerArgument || !isSpinnerName(spinnerArgument)) {
    console.warn(`Unknown spinner "${spinnerArgument}". Falling back to "aesthetic".`)
    return cliSpinners.aesthetic
  }

  return cliSpinners[spinnerArgument]
}

function renderStaticFrame(frame: string[]): void {
  stdout.write(`${cristal(frame.join('\n'))}\n`)
}

function renderTitleBox(): void {
  const title = figlet.textSync('GENESIS', { font: 'Small' })
  const boxWidth = Math.max(...title.split('\n').map(line => line.length)) + 6
  const terminalWidth = stdout.columns ?? boxWidth
  const leftMargin = Math.max(0, Math.floor((terminalWidth - boxWidth) / 2))

  console.log(
    boxen(fruit(title), {
      borderStyle: 'round',
      borderColor: 'cyan',
      padding: 1,
      margin: { top: 1, right: 0, bottom: 1, left: leftMargin },
      title: 'terminal visual toolkit',
      titleAlignment: 'center',
    }),
  )
}

async function renderImage(): Promise<void> {
  if (!isInteractive || !imagePath || !existsSync(imagePath)) {
    renderStaticFrame(pixelFrames[0])
    return
  }

  try {
    const image = await withTimeout(readFile(imagePath), visualTimeoutMs, 'Image file loading timed out.')
    const chafa = await withTimeout(Chafa(), visualTimeoutMs, 'Image renderer initialization timed out.')
    const imageToAnsi = promisify(chafa.imageToAnsi)
    const imageWidth = Math.min(Math.max((stdout.columns ?? 100) - 4, 60), 110)
    const { ansi } = await withTimeout(
      imageToAnsi(image.buffer, {
        format: chafa.ChafaPixelMode.CHAFA_PIXEL_MODE_SYMBOLS.value,
        width: imageWidth,
        height: imageHeight,
        fontRatio: 0.5,
        colors: chafa.ChafaCanvasMode.CHAFA_CANVAS_MODE_TRUECOLOR.value,
        colorExtractor: chafa.ChafaColorExtractor.CHAFA_COLOR_EXTRACTOR_AVERAGE.value,
        colorSpace: chafa.ChafaColorSpace.CHAFA_COLOR_SPACE_RGB.value,
        symbols: 'block+border+space-wide-inverted',
        fill: 'none',
        fgOnly: false,
        dither: chafa.ChafaDitherMode.CHAFA_DITHER_MODE_NONE.value,
        preprocess: true,
        threshold: 0.5,
        optimize: 5,
        work: 5,
      }),
      visualTimeoutMs,
      'Image conversion timed out.',
    )

    stdout.write(`${ansi}\n`)
  } catch (error) {
    console.warn('Image rendering unavailable; using the static fallback.')
    if (error instanceof Error) console.warn(error.message)
    renderStaticFrame(pixelFrames[0])
  }
}

async function animateProgress(): Promise<void> {
  if (!isInteractive) {
    console.log('Quality gate visual demo ready.')
    return
  }

  let spinner: ReturnType<typeof ora> | undefined
  let progress: cliProgress.SingleBar | undefined

  try {
    spinner = ora({
      spinner: getSpinner(),
      text: 'preparing visual quality gate',
    }).start()

    await new Promise(resolve => setTimeout(resolve, 1200))
    spinner.text = 'rendering terminal experience'
    await new Promise(resolve => setTimeout(resolve, 900))
    spinner.succeed('Visual renderer ready')

    progress = new cliProgress.SingleBar({
      format: '{bar} {percentage}% | {task}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: isInteractive,
      clearOnComplete: false,
    })

    progress.start(100, 0, { task: 'preparing visual quality gate' })
    for (let value = 0; value <= 100; value += 10) {
      progress.update(value, {
        task: value < 100 ? 'rendering terminal experience' : 'ready for hooks',
      })
      await new Promise(resolve => setTimeout(resolve, 70))
    }
  } catch (error) {
    console.warn('Terminal animation unavailable; continuing without animation.')
    if (error instanceof Error) console.warn(error.message)
  } finally {
    if (progress?.isActive) progress.stop()
    if (spinner?.isSpinning) spinner.stopAndPersist()
  }
}

async function main(): Promise<void> {
  try {
    renderTitleBox()
    await withTimeout(renderImage(), visualTimeoutMs, 'Image rendering timed out.')
    await withTimeout(animateProgress(), visualTimeoutMs, 'Terminal animation timed out.')
    console.log(rainbow('  Visual foundation ready for future Git hooks.'))
  } catch (error) {
    console.warn('Terminal visual demo unavailable; continuing with the quality gate.')
    if (error instanceof Error) console.warn(error.message)
    renderStaticFrame(pixelFrames[0])
  }
}

void main()
