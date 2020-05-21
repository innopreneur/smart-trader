import fs from 'fs'

export function saveFile(filename, data) {
    fs.writeFileSync(filename, data)
}