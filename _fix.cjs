const fs = require('fs');
const basedir = __dirname;

function fix(f, changes) {
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;
  changes.forEach(([s, r]) => { c = c.replace(s, r); });
  if (c !== orig) { fs.writeFileSync(f, c, 'utf8'); console.log('Fixed: ' + f); }
  else { console.log('No change: ' + f); }
}

// 1. AlarmFormContext.tsx
fix('app/contexts/AlarmFormContext.tsx', [
  [/  volume: number;\r\n  autoIncreaseDifficulty: boolean;/, '  volume: number;'],
  [/  challengeType: "math",\r\n  volume: 80,\r\n  autoIncreaseDifficulty: true,/, '  challengeType: "math",\r\n  volume: 80,'],
]);

// 2. AddAlarmPage.tsx
fix('app/pages/AddAlarmPage.tsx', [
  [/  autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,\r\n/, ''],
]);

// 3. AlarmDetailsPage.tsx
fix('app/pages/AlarmDetailsPage.tsx', [
  [/  autoIncreaseDifficulty: alarm\.autoIncreaseDifficulty \?\? true,\r\n/, ''],
  [/  autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,\r\n/, ''],
]);

// 4. SmartModeSettingsPage.tsx
fix('app/pages/SmartModeSettingsPage.tsx', [
  [/  const \[autoIncrease, setAutoIncrease\] = useState\(formState\.autoIncreaseDifficulty \?\? true\);\r\n  const \[increaseRate, setIncreaseRate\] = useState\(15\);\r\n/, ''],
  [/  const getIncreaseRateLabel = \(\) => \{[^}]*\}\r\n\r\n/, ''],
  [/  autoIncreaseDifficulty: autoIncrease,\r\n/, ''],
  [/\r\n      \/\* Auto Increase \*\/[\s\S]*?<\/div>/, ''],
  [/<li>• Mỗi lần sai, độ khó tăng lên \{increaseRate\}%<\/li>\r\n/, ''],
  [/Độ khó: \{getDifficultyLabel\(\)\} → \{autoIncrease \? \\$\{getDifficultyLabel\(\)\} \+\$\{increaseRate\}%\ : "Không đổi"\}/, 'Độ khó: {getDifficultyLabel()}'],
]);

console.log('All done!');
