import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = (...parts) => path.join(__dirname, ...parts);
const read = (f) => fs.readFileSync(base(f), 'utf8');
const write = (f, c) => { fs.writeFileSync(base(f), c, 'utf8'); console.log('Updated: ' + f); };
const rep = (f, s, r) => { let c = read(f); let nc = c.replace(s, r); if (nc === c) { console.log('FAILED: ' + f); } else { write(f, nc); } };

// 1. AlarmContext
let ctx = read('app/contexts/AlarmContext.tsx');
ctx = ctx.replace(/  volume\?: number;\n  autoIncreaseDifficulty\?: boolean;/, '  volume?: number;');
const newIncrement = `  const incrementFailCount = (id: number) => {
    setAlarms(alarms.map(alarm => {
      if (alarm.id === id) {
        return {
          ...alarm,
          failCount: (alarm.failCount || 0) + 1,
        };
      }
      return alarm;
    }));
  };`;
ctx = ctx.replace(/const incrementFailCount[\s\S]*?};/, newIncrement);
write('app/contexts/AlarmContext.tsx', ctx);

// 2. AlarmFormContext
let fc = read('app/contexts/AlarmFormContext.tsx');
fc = fc.replace(/  challengeType: ChallengeType;\n  volume: number;\n  autoIncreaseDifficulty: boolean;/, '  challengeType: ChallengeType;\n  volume: number;');
fc = fc.replace(/  challengeType: "math",\n  volume: 80,\n  autoIncreaseDifficulty: true,/, '  challengeType: "math",\n  volume: 80,');
write('app/contexts/AlarmFormContext.tsx', fc);

// 3. AddAlarmPage
rep('app/pages/AddAlarmPage.tsx', /\s*autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,\n/, '');

// 4. AlarmDetailsPage
let ad = read('app/pages/AlarmDetailsPage.tsx');
ad = ad.replace(/\s*autoIncreaseDifficulty: alarm\.autoIncreaseDifficulty \?\? true,\n/, '');
ad = ad.replace(/\s*autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,\n/, '');
write('app/pages/AlarmDetailsPage.tsx', ad);

// 5. SmartModeSettingsPage
let sm = read('app/pages/SmartModeSettingsPage.tsx');
sm = sm.replace(/  const \[autoIncrease, setAutoIncrease\] = useState\(formState\.autoIncreaseDifficulty \?\? true\);\n  const \[increaseRate, setIncreaseRate\] = useState\(15\);\n/, '');
sm = sm.replace(/  const getIncreaseRateLabel = \(\) => \{[^}]*\}\n\n/, '');
sm = sm.replace(/\s*autoIncreaseDifficulty: autoIncrease,\n/, '');
sm = sm.replace(/\n  \/\* Auto Increase \*\/[\s\S]*?<\/div>\n  \/\*/m, '\n  /*');
sm = sm.replace(/<li>• Mỗi lần sai, độ khó tăng lên \{increaseRate\}%<\/li>\n/, '');
sm = sm.replace(/Độ khó: \{getDifficultyLabel\(\)\} → \{autoIncrease \? \$\{getDifficultyLabel\(\)\} \+\$\{increaseRate\}% : "Không đổi"\}/, 'Độ khó: {getDifficultyLabel()}');
write('app/pages/SmartModeSettingsPage.tsx', sm);

console.log('Done!');
