const fs = require('fs');
const path = require('path');

function fixFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  for (const [search, replacement] of replacements) {
    const newContent = content.replace(search, replacement);
    if (newContent === content) {
      console.log('NO MATCH in ' + path.basename(filePath));
    } else {
      content = newContent;
      console.log('OK: ' + path.basename(filePath));
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('app/contexts/AlarmContext.tsx', [
  [/  volume\?: number;(\r\n|\n)  autoIncreaseDifficulty\?: boolean;/g, '  volume?: number;'],
]);

fixFile('app/contexts/AlarmFormContext.tsx', [
  [/  challengeType: ChallengeType;(\r\n|\n)  volume: number;(\r\n|\n)  autoIncreaseDifficulty: boolean;/g, '  challengeType: ChallengeType;\n  volume: number;'],
  [/  challengeType: "math",(\r\n|\n)  volume: 80,(\r\n|\n)  autoIncreaseDifficulty: true,/g, '  challengeType: "math",\n  volume: 80,'],
]);

fixFile('app/pages/AddAlarmPage.tsx', [
  [/[ \t]*autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,(\r\n|\n)/g, '']
]);

fixFile('app/pages/AlarmDetailsPage.tsx', [
  [/[ \t]*autoIncreaseDifficulty: alarm\.autoIncreaseDifficulty \?\? true,(\r\n|\n)/g, ''],
  [/[ \t]*autoIncreaseDifficulty: formState\.autoIncreaseDifficulty,(\r\n|\n)/g, '']
]);

fixFile('app/pages/SmartModeSettingsPage.tsx', [
  [/  const \[autoIncrease, setAutoIncrease\] = useState\(formState\.autoIncreaseDifficulty \?\? true\);(\r\n|\n)  const \[increaseRate, setIncreaseRate\] = useState\(15\);(\r\n|\n)/g, ''],
  [/  const getIncreaseRateLabel = \(\) => \{[^}]*\}(\r\n|\n)(\r\n|\n)/g, ''],
  [/[ \t]*autoIncreaseDifficulty: autoIncrease,(\r\n|\n)/g, ''],
]);

console.log('DONE');
