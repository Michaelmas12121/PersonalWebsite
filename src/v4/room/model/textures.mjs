/** Original portfolio textures. No reference-site photographs or copy are used. */
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const out = resolve(root, 'docs/local/room-builder/tex');
await mkdir(out, { recursive: true });

async function svg(name, width, height, body, background = '#f2eadb') {
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${background}"/>${body}</svg>`)).png().toFile(resolve(out, name));
}
const text = (x, y, size, value, fill = '#272d2b', weight = 400) => `<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${value}</text>`;
async function photo(path, width, height) {
  return `data:image/png;base64,${(await sharp(resolve(root, path)).resize(width, height, { fit: 'inside' }).png().toBuffer()).toString('base64')}`;
}
const gallery = (await readdir(resolve(root, 'src/assets/gallery'))).filter(p => p.endsWith('.webp')).sort();
const photographs = await Promise.all(gallery.slice(0, 3).map(p => photo(`src/assets/gallery/${p}`, 400, 350)));
for (let i = 0; i < 3; i++) {
  await svg(`polaroid_${'abc'[i]}.png`, 300, 360, `<image href="${photographs[i]}" x="14" y="16" width="272" height="280" preserveAspectRatio="xMidYMid meet"/>` + text(20, 336, 13, 'THROUGH MY LENS'));
}
let grain = '';
for (let i = 0; i < 80; i++) {
  const y = i * 8;
  grain += `<path d="M0 ${y} Q300 ${y + Math.sin(i) * 7} 600 ${y} T1200 ${y + 2}" fill="none" stroke="${i % 3 ? '#9c805f' : '#d5c2a2'}" stroke-opacity=".18" stroke-width="${i % 5 + 1}"/>`;
}
await svg('wood.png', 1200, 640, grain, '#b49b79');
let bricks = '';
for (let y = 0; y < 512; y += 64) for (let x = -128; x < 768; x += 128) bricks += `<rect x="${x + (y % 128 ? 64 : 0)}" y="${y}" width="124" height="60" fill="${y % 3 ? '#ded5c6' : '#e6ddce'}"/>`;
await svg('brick.png', 768, 512, bricks, '#c8bdad');
for (let k = 0; k < 4; k++) {
  let windows = '';
  for (let y = 8; y < 256; y += 18) for (let x = 5; x < 128; x += 16) windows += `<rect x="${x}" y="${y}" width="9" height="11" fill="${(x + y + k) % 7 === 0 ? '#f4cc83' : '#9eafba'}" opacity=".6"/>`;
  await svg(`facade_${k}.png`, 128, 256, windows, ['#596574', '#70808b', '#485260', '#8b969c'][k]);
}
await svg('screen.png', 800, 500,
  `<circle cx="700" cy="400" r="230" fill="#a9c7b7" opacity=".3"/>` + text(48, 64, 17, 'YANLANG / WORKSPACE', '#adc3bc') + text(48, 142, 53, 'Continue', '#fff4dc', 600) + text(50, 183, 19, 'Always a work in progress.', '#c7d5cc') +
  `<rect x="48" y="256" width="308" height="140" rx="12" fill="#f3ddae"/><rect x="378" y="256" width="374" height="140" rx="12" fill="#91b7af"/>` + text(68, 300, 15, '01', '#43655a') + text(68, 354, 31, 'Games') + text(398, 300, 15, '02', '#43655a') + text(398, 354, 31, 'Cycling'), '#253f3b');
const project = await photo('src/content/activities/eldercare-robot/prototype-overview.webp', 500, 350);
await svg('board.png', 1100, 540,
  text(40, 65, 33, 'THINGS I HAVE MADE', '#423a2b', 600) +
  `<rect x="36" y="98" width="450" height="350" fill="#faf3e5"/><image href="${project}" x="48" y="110" width="426" height="275" preserveAspectRatio="xMidYMid meet"/>` + text(58, 423, 23, 'ElderGo') +
  `<rect x="520" y="98" width="535" height="152" fill="#e7e9d8"/><rect x="520" y="272" width="535" height="176" fill="#ead4b3"/>` + text(548, 145, 20, 'EXPLORE / BUILD / SHARE') + text(548, 206, 38, 'Projects', '#2c4841', 600) + text(548, 321, 21, 'From an idea to something useful.') + text(548, 391, 29, 'A collection of work.'), '#bb9666');
await svg('notebook.png', 700, 490,
  `<path d="M350 0V490" stroke="#c4baa6" stroke-width="4"/>` + text(34, 66, 18, 'A FEW WORDS ABOUT ME') + text(34, 137, 42, 'Yanlang', '#233e36', 600) + text(34, 187, 42, 'Liu', '#233e36', 600) + text(34, 252, 17, 'Notes, questions, possibilities.') +
  Array.from({length: 9}, (_, i) => `<path d="M385 ${75 + i * 37}H665" stroke="#c7cfca" stroke-width="2"/>`).join('') + text(390, 65, 20, 'Keep exploring.'), '#f7f0df');
for (const [name, title, subtitle, color] of [
  ['zine_echo', 'ELDERGO', 'DESIGNING FOR CARE', '#b87a50'],
  ['zine_roundtable', 'TURING', 'LEARNING TOGETHER', '#365a52'],
  ['zine_athena', 'FIELD STUDIES', 'FROM IDEA TO REALITY', '#bd9750'],
  ['zine_preuni', 'ACTIVITIES', 'BEYOND THE DESK', '#586d85'],
  ['newspaper', 'FIELD NOTES', 'PROJECTS / ACTIVITIES / IDEAS', '#555c50'],
]) {
  await svg(`${name}.png`, 410, 560, text(28, 56, 15, 'YANLANG LIU', '#f8ecd5') + text(28, 155, 44, title, '#fff4df', 700) + text(28, 193, 14, subtitle, '#f8ecd5') + `<circle cx="310" cy="430" r="175" fill="#f5e6c6" opacity=".2"/><path d="M28 240H380M28 247H380" stroke="#f5e6c6"/>` + text(28, 524, 20, 'A WORK IN PROGRESS', '#f8ecd5'), color);
}
for (const [i, title] of ['MAKE SOMETHING.', 'ASK WHY.', 'TRY AGAIN.'].entries()) await svg(`sticky_${i}.png`, 240, 200, text(15, 90, 24, title, '#3b4b38', 600), '#e7d8a2');
for (const [i, title] of ['CURIOSITY', 'CREATIVITY', 'COMMUNITY', 'EXPLORATION'].entries()) await svg(`clip_${i}.png`, 260, 340, text(20, 50, 14, 'YANLANG / NOTES') + text(20, 110, 28, title, '#2c4841', 600) + `<image href="${photographs[i % 3]}" x="20" y="140" width="220" height="175" preserveAspectRatio="xMidYMid meet"/>`);
await svg('poster.png', 260, 366, text(20, 50, 14, 'IN THE MAKING', '#f5e7cd') + text(20, 130, 38, 'BUILD.', '#f5e7cd', 600) + text(20, 185, 38, 'LEARN.', '#f5e7cd', 600) + text(20, 240, 38, 'REPEAT.', '#f5e7cd', 600), '#3c635c');
await svg('phone.png', 240, 480, text(20, 60, 26, 'CYCLING', '#f6ecd7') + '<path d="M40 400Q160 330 80 260T170 120" stroke="#dab778" stroke-width="7" fill="none"/>', '#294d46');
await svg('bizcard.png', 420, 240, text(25, 85, 42, 'Yanlang Liu', '#2c4841', 600) + text(25, 145, 20, 'Projects. Questions. Possibilities.'));
console.log(`Prepared original room textures in ${out}`);
