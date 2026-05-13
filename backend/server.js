import express from "express";
import cors from "cors";
import sql from "mssql";

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Cấu hình kết nối SQL Server
const dbConfig = {
  user: "appuser",
  password: "123456",
  server: "localhost",
  port: 1433,
  database: "SmartAlarmDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Kết nối đến SQL Server
let pool = null;

async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Kết nối SQL Server thành công!");
  } catch (err) {
    console.error("❌ Kết nối SQL Server thất bại:", err);
    console.log("⚠️  Server vẫn chạy nhưng không có DB - dùng dữ liệu tạm (in-memory)");
  }
}

// ========== IN-MEMORY FALLBACK (khi không có SQL Server) ==========

let memoryUsers = [];
let memoryUserIdCounter = 1;
let memoryAlarms = [];
let memoryAlarmIdCounter = 1;
let memorySleepRecords = [];
let memorySleepIdCounter = 1;
let memoryStopwatchRecords = [];
let memoryStopwatchIdCounter = 1;

// ========== HELPER: Lấy UserID từ request headers ==========
function getUserId(req) {
  const uid = req.headers["x-user-id"];
  return uid ? parseInt(uid, 10) : null;
}

// ========== API Endpoints ==========

// ─── AUTH ────────────────────────────────────────────────────────────────────

// Đăng ký người dùng
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc (Tên đăng nhập, Email, Mật khẩu)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ",
      });
    }

    if (pool) {
      const checkResult = await pool
        .request()
        .input("Email", sql.NVarChar(150), email)
        .query("SELECT COUNT(*) as count FROM dbo.Users WHERE Email = @Email");

      if (checkResult.recordset[0].count > 0) {
        return res.status(409).json({
          success: false,
          message: "Email đã được đăng ký",
        });
      }

      const result = await pool
        .request()
        .input("UserName", sql.NVarChar(100), username)
        .input("Email", sql.NVarChar(150), email)
        .input("Password", sql.NVarChar(255), password)
        .input("FullName", sql.NVarChar(200), fullName || username)
        .input("Phone", sql.NVarChar(20), phone || "")
        .query(`
          INSERT INTO dbo.Users (UserName, Email, Password, FullName, Phone, CreatedAt)
          OUTPUT INSERTED.UserID
          VALUES (@UserName, @Email, @Password, @FullName, @Phone, GETDATE())
        `);

      const userId = result.recordset[0].UserID;

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công!",
        user: { id: userId, username, email, fullName: fullName || username },
      });
    } else {
      const existing = memoryUsers.find((u) => u.Email === email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email đã được đăng ký",
        });
      }

      const newUser = {
        UserID: memoryUserIdCounter++,
        UserName: username,
        Email: email,
        Password: password,
        FullName: fullName || username,
        Phone: phone || "",
        CreatedAt: new Date().toISOString(),
      };
      memoryUsers.push(newUser);

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công!",
        user: { id: newUser.UserID, username, email, fullName: fullName || username },
      });
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
});

// Đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    if (pool) {
      const result = await pool
        .request()
        .input("Email", sql.NVarChar(150), email)
        .input("Password", sql.NVarChar(255), password)
        .query("SELECT UserID, UserName, Email, FullName FROM dbo.Users WHERE Email = @Email AND Password = @Password");

      if (result.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      const user = result.recordset[0];
      res.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: {
          id: user.UserID,
          username: user.UserName,
          email: user.Email,
          fullName: user.FullName,
        },
      });
    } else {
      const user = memoryUsers.find((u) => u.Email === email && u.Password === password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      res.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: {
          id: user.UserID,
          username: user.UserName,
          email: user.Email,
          fullName: user.FullName,
        },
      });
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
});

// ─── ALARMS ──────────────────────────────────────────────────────────────────

// Lấy danh sách báo thức theo UserID
app.get("/api/alarms", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    if (pool) {
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .query(`
          SELECT a.AlarmID, a.UserID, a.RingtoneID, a.ChallengeID, 
                 CONVERT(VARCHAR(5), a.AlarmTime, 108) AS AlarmTimeStr, 
                 a.IsEnabled, a.RepeatDays, a.Label, a.SnoozeInterval, a.SnoozeLimit,
                 ISNULL(r.Name, N'Nhạc chuông mặc định') AS RingtoneName,
                 r.FilePath
          FROM dbo.Alarms a
          LEFT JOIN dbo.Ringtones r ON a.RingtoneID = r.RingtoneID
          WHERE a.UserID = @UserID 
          ORDER BY a.AlarmTime
        `);

      const alarms = result.recordset.map(a => {
        const timeStr = a.AlarmTimeStr || "00:00";
        const [hour, minute] = timeStr.split(":").map(Number);
        const days = a.RepeatDays ? a.RepeatDays.split(",").filter(d => d.trim()) : [];
        return {
          id: a.AlarmID,
          time: timeStr,
          hour,
          minute,
          days,
          enabled: a.IsEnabled === true || a.IsEnabled === 1,
          label: a.Label || "",
          ringtone: a.RingtoneName || "",
          ringtoneId: a.RingtoneID,
          filePath: a.FilePath || "",
          smartMode: a.ChallengeID !== null && a.ChallengeID !== undefined,
          challengeType: "math",
          difficulty: 50,
          volume: 80,
          snoozeInterval: a.SnoozeInterval || 5,
          snoozeLimit: a.SnoozeLimit || 3,
        };
      });

      res.json({ success: true, alarms });
    } else {
      const userAlarms = memoryAlarms.filter(a => a.UserID === userId);
      res.json({
        success: true,
        alarms: userAlarms.map(a => ({
          id: a.AlarmID,
          time: a.AlarmTime,
          hour: parseInt(a.AlarmTime.split(":")[0]),
          minute: parseInt(a.AlarmTime.split(":")[1]),
          days: a.RepeatDays || [],
          enabled: a.IsEnabled,
          label: a.Label || "",
          ringtone: "",
          smartMode: a.smartMode || false,
          challengeType: a.challengeType || "math",
          difficulty: a.difficulty || 50,
          volume: a.volume || 80,
        }))
      });
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách báo thức:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Thêm báo thức mới
app.post("/api/alarms", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const { time, label, days, enabled, smartMode, challengeType, difficulty, volume, ringtoneId, snoozeInterval, snoozeLimit } = req.body;

    if (pool) {
      const repeatDays = (days && Array.isArray(days)) ? days.join(",") : "";
      const alarmTime = time || "07:00";
      const isEnabled = enabled !== undefined ? (enabled ? 1 : 0) : 1;
      const challengeId = smartMode ? 1 : null;

      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .input("RingtoneID", sql.Int, ringtoneId || null)
        .input("ChallengeID", sql.Int, challengeId)
        .input("AlarmTime", sql.NVarChar(5), alarmTime)
        .input("IsEnabled", sql.Bit, isEnabled)
        .input("RepeatDays", sql.NVarChar(20), repeatDays)
        .input("Label", sql.NVarChar(100), label || "")
        .input("SnoozeInterval", sql.Int, snoozeInterval || 5)
        .input("SnoozeLimit", sql.Int, snoozeLimit || 3)
        .query(`
          INSERT INTO dbo.Alarms (UserID, RingtoneID, ChallengeID, AlarmTime, IsEnabled, RepeatDays, Label, SnoozeInterval, SnoozeLimit)
          OUTPUT INSERTED.AlarmID
          VALUES (@UserID, @RingtoneID, @ChallengeID, @AlarmTime, @IsEnabled, @RepeatDays, @Label, @SnoozeInterval, @SnoozeLimit)
        `);

      const newId = result.recordset[0].AlarmID;
      res.status(201).json({ success: true, message: "Thêm báo thức thành công!", alarmId: newId });
    } else {
      const newAlarm = {
        AlarmID: memoryAlarmIdCounter++,
        UserID: userId,
        AlarmTime: time || "07:00",
        IsEnabled: enabled !== undefined ? enabled : true,
        RepeatDays: (days && Array.isArray(days)) ? days : [],
        Label: label || "",
        smartMode: smartMode || false,
        challengeType: challengeType || "math",
        difficulty: difficulty || 50,
        volume: volume || 80,
      };
      memoryAlarms.push(newAlarm);
      res.status(201).json({ success: true, message: "Thêm báo thức thành công!", alarmId: newAlarm.AlarmID });
    }
  } catch (error) {
    console.error("Lỗi thêm báo thức:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Cập nhật báo thức
app.put("/api/alarms/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const alarmId = parseInt(req.params.id);
    const { time, label, days, enabled, smartMode, challengeType, difficulty, volume, ringtoneId, snoozeInterval, snoozeLimit } = req.body;

    if (pool) {
      const repeatDays = (days && Array.isArray(days)) ? days.join(",") : "";
      const alarmTime = time || "07:00";
      const isEnabled = enabled !== undefined ? (enabled ? 1 : 0) : 1;
      const challengeId = smartMode ? 1 : null;

      await pool
        .request()
        .input("AlarmID", sql.Int, alarmId)
        .input("UserID", sql.Int, userId)
        .input("RingtoneID", sql.Int, ringtoneId || null)
        .input("ChallengeID", sql.Int, challengeId)
        .input("AlarmTime", sql.NVarChar(5), alarmTime)
        .input("IsEnabled", sql.Bit, isEnabled)
        .input("RepeatDays", sql.NVarChar(20), repeatDays)
        .input("Label", sql.NVarChar(100), label || "")
        .input("SnoozeInterval", sql.Int, snoozeInterval || 5)
        .input("SnoozeLimit", sql.Int, snoozeLimit || 3)
        .query(`
          UPDATE dbo.Alarms
          SET RingtoneID = @RingtoneID, ChallengeID = @ChallengeID, AlarmTime = @AlarmTime,
              IsEnabled = @IsEnabled, RepeatDays = @RepeatDays, Label = @Label,
              SnoozeInterval = @SnoozeInterval, SnoozeLimit = @SnoozeLimit
          WHERE AlarmID = @AlarmID AND UserID = @UserID
        `);

      res.json({ success: true, message: "Cập nhật báo thức thành công!" });
    } else {
      const idx = memoryAlarms.findIndex(a => a.AlarmID === alarmId && a.UserID === userId);
      if (idx === -1) return res.status(404).json({ success: false, message: "Không tìm thấy báo thức" });
      memoryAlarms[idx] = { ...memoryAlarms[idx], AlarmTime: time, IsEnabled: enabled, RepeatDays: days, Label: label };
      res.json({ success: true, message: "Cập nhật báo thức thành công!" });
    }
  } catch (error) {
    console.error("Lỗi cập nhật báo thức:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Xóa báo thức
app.delete("/api/alarms/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const alarmId = parseInt(req.params.id);

    if (pool) {
      await pool
        .request()
        .input("AlarmID", sql.Int, alarmId)
        .input("UserID", sql.Int, userId)
        .query("DELETE FROM dbo.Alarms WHERE AlarmID = @AlarmID AND UserID = @UserID");

      res.json({ success: true, message: "Xóa báo thức thành công!" });
    } else {
      memoryAlarms = memoryAlarms.filter(a => !(a.AlarmID === alarmId && a.UserID === userId));
      res.json({ success: true, message: "Xóa báo thức thành công!" });
    }
  } catch (error) {
    console.error("Lỗi xóa báo thức:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Bật/tắt báo thức (toggle enabled)
app.patch("/api/alarms/:id/toggle", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const alarmId = parseInt(req.params.id);

    if (pool) {
      const result = await pool
        .request()
        .input("AlarmID", sql.Int, alarmId)
        .input("UserID", sql.Int, userId)
        .query("SELECT IsEnabled FROM dbo.Alarms WHERE AlarmID = @AlarmID AND UserID = @UserID");

      if (result.recordset.length === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy báo thức" });
      }

      const current = result.recordset[0].IsEnabled;
      await pool
        .request()
        .input("AlarmID", sql.Int, alarmId)
        .input("UserID", sql.Int, userId)
        .input("IsEnabled", sql.Bit, current ? 0 : 1)
        .query("UPDATE dbo.Alarms SET IsEnabled = @IsEnabled WHERE AlarmID = @AlarmID AND UserID = @UserID");

      res.json({ success: true, message: "Đã chuyển trạng thái báo thức!", enabled: !current });
    } else {
      const alarm = memoryAlarms.find(a => a.AlarmID === alarmId && a.UserID === userId);
      if (!alarm) return res.status(404).json({ success: false, message: "Không tìm thấy báo thức" });
      alarm.IsEnabled = !alarm.IsEnabled;
      res.json({ success: true, message: "Đã chuyển trạng thái báo thức!", enabled: alarm.IsEnabled });
    }
  } catch (error) {
    console.error("Lỗi toggle báo thức:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ─── SLEEP HEALTH ────────────────────────────────────────────────────────────

// Lấy danh sách SleepHealth theo UserID
app.get("/api/sleep", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    if (pool) {
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .query("SELECT SleepID, UserID, BedTime, WakeTime, SleepQuality, LogDate FROM dbo.SleepHealth WHERE UserID = @UserID ORDER BY LogDate DESC");

      const records = result.recordset.map(r => ({
        id: r.SleepID,
        userId: r.UserID,
        bedtime: r.BedTime ? r.BedTime.toISOString() : null,
        wakeTime: r.WakeTime ? r.WakeTime.toISOString() : null,
        quality: r.SleepQuality,
        logDate: r.LogDate ? r.LogDate.toISOString().split("T")[0] : null,
      }));

      res.json({ success: true, records });
    } else {
      const userRecords = memorySleepRecords.filter(r => r.UserID === userId);
      res.json({ success: true, records: userRecords });
    }
  } catch (error) {
    console.error("Lỗi lấy dữ liệu giấc ngủ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Thêm SleepHealth record
app.post("/api/sleep", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const { bedtime, wakeTime, quality, logDate } = req.body;

    if (pool) {
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .input("BedTime", sql.DateTime, bedtime || new Date())
        .input("WakeTime", sql.DateTime, wakeTime || new Date())
        .input("SleepQuality", sql.Int, quality || 3)
        .input("LogDate", sql.Date, logDate || new Date().toISOString().split("T")[0])
        .query(`
          INSERT INTO dbo.SleepHealth (UserID, BedTime, WakeTime, SleepQuality, LogDate)
          OUTPUT INSERTED.SleepID
          VALUES (@UserID, @BedTime, @WakeTime, @SleepQuality, @LogDate)
        `);

      const newId = result.recordset[0].SleepID;
      res.status(201).json({ success: true, message: "Thêm dữ liệu giấc ngủ thành công!", sleepId: newId });
    } else {
      const newRecord = {
        SleepID: memorySleepIdCounter++,
        UserID: userId,
        BedTime: bedtime || new Date().toISOString(),
        WakeTime: wakeTime || new Date().toISOString(),
        SleepQuality: quality || 3,
        LogDate: logDate || new Date().toISOString().split("T")[0],
      };
      memorySleepRecords.push(newRecord);
      res.status(201).json({ success: true, message: "Thêm dữ liệu giấc ngủ thành công!", sleepId: newRecord.SleepID });
    }
  } catch (error) {
    console.error("Lỗi thêm dữ liệu giấc ngủ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ─── STOPWATCH HISTORY ────────────────────────────────────────────────────────

// Lấy danh sách StopwatchHistory theo UserID
app.get("/api/stopwatch", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    if (pool) {
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .query("SELECT StopwatchID, UserID, TotalTimeSeconds, RecordedAt FROM dbo.StopwatchHistory WHERE UserID = @UserID ORDER BY RecordedAt DESC");

      const records = result.recordset.map(r => ({
        id: r.StopwatchID,
        userId: r.UserID,
        totalTimeSeconds: r.TotalTimeSeconds,
        recordedAt: r.RecordedAt ? r.RecordedAt.toISOString() : null,
      }));

      res.json({ success: true, records });
    } else {
      const userRecords = memoryStopwatchRecords.filter(r => r.UserID === userId);
      res.json({ success: true, records: userRecords });
    }
  } catch (error) {
    console.error("Lỗi lấy lịch sử bấm giờ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Thêm StopwatchHistory record
app.post("/api/stopwatch", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(400).json({ success: false, message: "Thiếu UserID" });

    const { totalTimeSeconds } = req.body;

    if (pool) {
      const result = await pool
        .request()
        .input("UserID", sql.Int, userId)
        .input("TotalTimeSeconds", sql.Decimal(10, 2), totalTimeSeconds || 0)
        .query(`
          INSERT INTO dbo.StopwatchHistory (UserID, TotalTimeSeconds, RecordedAt)
          OUTPUT INSERTED.StopwatchID
          VALUES (@UserID, @TotalTimeSeconds, GETDATE())
        `);

      const newId = result.recordset[0].StopwatchID;
      res.status(201).json({ success: true, message: "Lưu lịch sử bấm giờ thành công!", stopwatchId: newId });
    } else {
      const newRecord = {
        StopwatchID: memoryStopwatchIdCounter++,
        UserID: userId,
        TotalTimeSeconds: totalTimeSeconds || 0,
        RecordedAt: new Date().toISOString(),
      };
      memoryStopwatchRecords.push(newRecord);
      res.status(201).json({ success: true, message: "Lưu lịch sử bấm giờ thành công!", stopwatchId: newRecord.StopwatchID });
    }
  } catch (error) {
    console.error("Lỗi lưu lịch sử bấm giờ:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ─── RINGTONES ────────────────────────────────────────────────────────────────

// Lấy danh sách nhạc chuông
app.get("/api/ringtones", async (_req, res) => {
  try {
    if (pool) {
      const result = await pool
        .request()
        .query("SELECT RingtoneID, Name, FilePath FROM dbo.Ringtones ORDER BY RingtoneID");

      const ringtones = result.recordset.map(r => ({
        id: r.RingtoneID,
        name: r.Name,
        filePath: r.FilePath,
      }));

      res.json({ success: true, ringtones });
    } else {
      // Fallback: dữ liệu mẫu
      const fallback = [
        { id: 1, name: "Báo thức 1 - Nhẹ nhàng", filePath: "music/bao thuc 1.mp3" },
        { id: 2, name: "Báo thức 2 - Thức giấc", filePath: "music/bao thuc 2.mp3" },
        { id: 3, name: "Báo thức 3 - Vui nhộn", filePath: "music/bao thuc 3.mp3" },
        { id: 4, name: "Báo thức 4 - Hát vang", filePath: "music/bao thuc 4.mp3" },
        { id: 5, name: "Báo thức 5 - Rap", filePath: "music/bao thuc 5.mp3" },
        { id: 6, name: "Báo thức 6 - Áp lực", filePath: "music/bao thuc 6.mp3" },
        { id: 7, name: "Báo thức 7 - Sôi động", filePath: "music/bao thuc 7.mp3" },
        { id: 8, name: "Báo thức 8 - Remix", filePath: "music/bao thuc 8.mp3" },
        { id: 9, name: "Báo thức 9 - Chill", filePath: "music/bao thuc 9.mp3" },
        { id: 10, name: "Báo thức 10 - Truyền thống", filePath: "music/bao thuc 10.mp3" },
      ];
      res.json({ success: true, ringtones: fallback });
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách nhạc chuông:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: pool ? "connected" : "disconnected (in-memory mode)",
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log("🚀 Server chạy tại http://localhost:" + PORT);
  connectDB();
});