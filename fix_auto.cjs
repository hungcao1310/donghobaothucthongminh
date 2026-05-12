const fs = require("fs");
let content = fs.readFileSync("app/pages/SmartModeSettingsPage.tsx", "utf8");

// 1. Remove getIncreaseRateLabel function declaration (lines 74-79)
content = content.replace(
  "  const getIncreaseRateLabel = () => {\n    if (increaseRate <= 10) return \"Nhẹ nhàng\";\n    if (increaseRate <= 15) return \"Vừa phải\";\n    if (increaseRate <= 25) return \"Mạnh\";\n    return \"Cực mạnh\";\n  };\n\n",
  ""
);

// 2. Remove autoIncrease state lines
content = content.replace(
  "  const [autoIncrease, setAutoIncrease] = useState(formState.autoIncreaseDifficulty ?? true);\n  const [increaseRate, setIncreaseRate] = useState(15);\n",
  ""
);

// 3. Remove autoIncreaseDifficulty from handleSave
content = content.replace(
  "      challengeType,\n      autoIncreaseDifficulty: autoIncrease,",
  "      challengeType,"
);

// 4. Remove entire Auto Increase section (from comment to closing div before Additional Settings)
content = content.replace(
  "      /* Auto Increase */\n      <div className=\"bg-[#1a1a1a] rounded-xl p-5 mb-4 border border-white/10\">\n        <div className=\"flex items-center justify-between mb-3\">\n          <div>\n            <div className=\"font-medium mb-1\">Tự động tăng độ khó</div>\n            <div className=\"text-sm text-white/60\">Mỗi lần sai sẽ khó hơn</div>\n          </div>\n          <Switch.Root\n            checked={autoIncrease}\n            onCheckedChange={setAutoIncrease}\n            className=\"w-14 h-8 rounded-full bg-white/20 data-[state=checked]:bg-amber transition-colors relative\"\n          >\n            <Switch.Thumb className=\"block w-6 h-6 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-7\" />\n          </Switch.Root>\n        </div>\n\n        {autoIncrease && (\n          <div className=\"pt-3 border-t border-white/10\">\n            <div className=\"flex items-center justify-between mb-3\">\n              <span className=\"text-sm\">Tốc độ tăng</span>\n              <span className=\"text-sm text-amber\">{getIncreaseRateLabel()}</span>\n            </div>\n            <Slider.Root\n              value={[increaseRate]}\n              onValueChange={([value]) => setIncreaseRate(value)}\n              min={5}\n              max={30}\n              step={5}\n              className=\"relative flex items-center w-full h-8\"\n            >\n              <Slider.Track className=\"relative h-2 grow rounded-full bg-white/20\">\n                <Slider.Range className=\"absolute h-full rounded-full bg-amber\" />\n              </Slider.Track>\n              <Slider.Thumb className=\"block w-6 h-6 bg-amber rounded-full shadow-lg hover:scale-110 transition-transform\" />\n            </Slider.Root>\n            <div className=\"flex justify-between text-xs text-white/40 mt-2\">\n              <span>+5%/lần</span>\n              <span>+{increaseRate}%/lần</span>\n              <span>+30%/lần</span>\n            </div>\n          </div>\n        )}\n      </div>\n\n      /* Additional",
  "      /* Additional"
);

// 5. Remove increaseRate from warning list
content = content.replace(
  "              <li>• Mỗi lần sai, độ khó tăng lên {increaseRate}%</li>\n",
  ""
);

// 6. Fix preview line
content = content.replace(
  "            Độ khó: {getDifficultyLabel()} → {autoIncrease ? ${getDifficultyLabel()} +% : \"Không đổi\"}\n",
  "            Độ khó: {getDifficultyLabel()}\n"
);

fs.writeFileSync("app/pages/SmartModeSettingsPage.tsx", content, "utf8");
console.log("Done!");
