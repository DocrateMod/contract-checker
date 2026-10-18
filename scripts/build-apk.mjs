// Сборка debug APK: node scripts/build-apk.mjs  (или: npm run build:apk)
// Нужны: Node 20+, JDK 21, Android SDK (переменная ANDROID_HOME / ANDROID_SDK_ROOT).
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const run = (cmd, opts = {}) => { console.log('\n> ' + cmd); execSync(cmd, { stdio: 'inherit', ...opts }); };
const win = process.platform === 'win32';

if (!existsSync('node_modules')) run('npm install');
try { run('npm run icons'); } catch (e) { console.warn('Иконки не сгенерированы, будет иконка по умолчанию'); }
if (!existsSync('android')) run('npx cap add android');

// Только вертикальная ориентация
const manifest = join('android', 'app', 'src', 'main', 'AndroidManifest.xml');
let m = readFileSync(manifest, 'utf8');
if (!m.includes('screenOrientation')) {
  m = m.replace('<activity', '<activity\n            android:screenOrientation="portrait"');
  writeFileSync(manifest, m);
}

run('npx cap sync android');
run(win ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug', { cwd: 'android' });

const apk = join('android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!existsSync(apk) || statSync(apk).size === 0) { console.error('APK не создан'); process.exit(1); }
mkdirSync('dist', { recursive: true });
copyFileSync(apk, join('dist', 'Проверка-договоров.apk'));
console.log('\nГОТОВО: dist/Проверка-договоров.apk (' + statSync(apk).size + ' байт)');
