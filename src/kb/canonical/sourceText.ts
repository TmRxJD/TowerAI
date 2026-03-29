import path from 'node:path'

const PACKAGE_ROOT = path.resolve(__dirname, '../../..')

export function getCanonicalSourcePath(fileName: string): string {
  return path.resolve(PACKAGE_ROOT, 'src/kb/source-data/knowledge', fileName)
}