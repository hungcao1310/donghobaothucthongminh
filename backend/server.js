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

// ========== API Endpoints ==========

// Đăng ký người dùng
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Validate
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
      // Kiểm tra email đã tồn tại chưa
      const checkResult = await pool
        .request()
        .input("Email", sql.VarChar(150), email)
        .query("SELECT COUNT(*) as count FROM dbo.users WHERE email = @Email");

      if (checkResult.recordset[0].count > 0) {
        return res.status(409).json({
          success: false,
          message: "Email đã được đăng ký",
        });
      }

      // Thêm user vào SQL Server
      const result = await pool
        .request()
        .input("UserName", sql.NVarChar(100), username)
        .input("Email", sql.VarChar(150), email)
        .input("PasswordHash", sql.NVarChar(255), password)
        .query(`
          INSERT INTO dbo.users (username, email, password_hash, created_at)
          OUTPUT INSERTED.user_id
          VALUES (@UserName, @Email, @PasswordHash, GETDATE())
        `);

      const userId = result.recordset[0].user_id;

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công!",
        user: { id: userId, username, email, fullName: fullName || username },
      });
    } else {
      // Fallback: in-memory
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
        .input("Email", sql.VarChar(150), email)
        .input("PasswordHash", sql.NVarChar(255), password)
        .query("SELECT user_id, username, email FROM dbo.users WHERE email = @Email AND password_hash = @PasswordHash");

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
          id: user.user_id,
          username: user.username,
          email: user.email,
          fullName: user.username,
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

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: pool ? "connected" : "disconnected (in-memory mode)",
    users: pool ? "SQL Server" : `${memoryUsers.length} users in memory`,
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log("🚀 Server chạy tại http://localhost:" + PORT);
  connectDB();
});
