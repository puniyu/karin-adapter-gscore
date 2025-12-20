import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { requireFileSync } from 'node-karin'


const filePath = fileURLToPath(import.meta.url).replace(/\\/g, '/')
const dirPath = path.resolve(filePath, '../../').replace(/\\/g, '/')
const basename = path.basename(dirPath)

const pkg = requireFileSync(`${dirPath}/package.json`)

export const isPackaged = Object.freeze(dirPath.includes('node_modules'))

export const adapterName = isPackaged || process.env.NODE_ENV === 'development'
      ? pkg.name
      : basename

export const adapterVersion = pkg.version

export const adapterPath = dirPath

