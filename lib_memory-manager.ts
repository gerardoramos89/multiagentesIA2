```typescript
import { writeFile, readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { join } from 'path';

/**
 * @description: Interfaz que define la estructura de un sprint.
 */
interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

/**
 * @description: Interfaz que define la estructura de una tarea.
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  dueDate: Date;
}

/**
 * @description: Función para leer un sprint desde un archivo JSON.
 * @param {string} filePath - Ruta del archivo donde se encuentra el sprint.
 * @returns {Promise<Sprint | null>} - Retorna el sprint si existe, de lo contrario null.
 */
async function readSprint(filePath: string): Promise<Sprint | null> {
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data) as Sprint;
  } catch (error) {
    console.error('Error reading sprint file:', error);
    return null;
  }
}

/**
 * @description: Función para escribir un sprint en un archivo JSON.
 * @param {Sprint} sprint - El sprint a escribir en el archivo.
 * @param {string} filePath - Ruta donde se guardará el archivo.
 * @returns {Promise<void>}
 */
async function writeSprint(sprint: Sprint, filePath: string): Promise<void> {
  try {
    await writeFile(filePath, JSON.stringify(sprint, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing sprint file:', error);
  }
}

/**
 * @description: Función para extraer skills de un texto.
 * @param {string} text - Texto del cual se extraerán las skills.
 * @returns {string[]} - Lista de skills extraídas.
 */
function extractSkills(text: string): string[] {
  // Implementación simplificada para extraer skills de un texto.
  const skillsRegex = /\b(?:skill|capability|ability|talent)\b/gi;
  const matches = text.match(skillsRegex);
  return matches ? matches.map(match => match.toLowerCase()) : [];
}

/**
 * @description: Función para realizar un commit automático a Git.
 * @param {string} message - Mensaje del commit.
 * @returns {Promise<void>}
 */
async function commitToGit(message: string): Promise<void> {
  try {
    exec(`git add . && git commit -m "${message}" && git push`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing git command: ${stderr}`);
        return;
      }
      console.log(stdout);
    });
  } catch (error) {
    console.error('Error committing to Git:', error);
  }
}

export { readSprint, writeSprint, extractSkills, commitToGit };
```