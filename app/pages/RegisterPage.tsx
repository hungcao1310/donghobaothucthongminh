import { useState } from "react";
import { useNavigation } from "../components/SimpleRouter";
import { register, login, checkHealth, isLoggedIn, getUserFromLocal } from "../services/database";
import { User, Mail, Lock, Eye, EyeOff, Smartphone, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type AuthMode = "login" | "register";

export function RegisterPage() {
  const { navigate } = useNavigation();
  const [mode, setMode] = useState<AuthMode>("register");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useState(() => {
    checkHealth().then(setServerOnline);
  });

  const resetForm = () => {
    setUsername(""); setFullName(""); setEmail("");
    setPassword(""); setPhone("");
    setError(""); setSuccess("");
  };

  const switchMode = () => {
    resetForm();
    setMode(mode === "login" ? "register" : "login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "register") {
        if (!username || !email || !password) {
          setError("Vui lòng điền đầy đủ Tên đăng nhập, Email và Mật khẩu");
          setLoading(false); return;
        }
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự");
          setLoading(false); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError("Email không hợp lệ");
          setLoading(false); return;
        }
        const result = await register({ username, email, password, fullName, phone });
        if (result.success) {
          setSuccess("Đăng ký thành công! Đang chuyển hướng...");
          setTimeout(() => navigate("home"), 1500);
        } else setError(result.message);
      } else {
        if (!email || !password) {
          setError("Vui lòng nhập email và mật khẩu");
          setLoading(false); return;
        }
        const result = await login({ email, password });
        if (result.success) {
          setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
          setTimeout(() => navigate("home"), 1500);
        } else setError(result.message);
      }
    } catch { setError("Có lỗi xảy ra, vui lòng thử lại sau"); }
    finally { setLoading(false); }
  };

  if (isLoggedIn()) {
    const user = getUserFromLocal();
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-2xl text-amber mb-2">Xin chào, {user?.fullName || user?.username}!</h1>
          <p className="text-white/60 mb-6">Bạn đã đăng nhập rồi. Tiếp tục sử dụng ứng dụng!</p>
          <button onClick={() => navigate("home")} className="px-8 py-3 rounded-xl bg-amber text-black font-medium hover:bg-amber/90 transition-all">Vào ứng dụng</button>
          <button onClick={() => { localStorage.removeItem("currentUser"); window.location.reload(); }} className="block mx-auto mt-4 text-sm text-white/40 hover:text-white/60">Đăng xuất</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("home")} className="text-white/60 hover:text-white p-2"><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex items-center gap-2">
          <div className={"w-2 h-2 rounded-full " + (serverOnline === null ? "bg-yellow-400 animate-pulse" : serverOnline ? "bg-green-400" : "bg-red-400")} />
          <span className="text-xs text-white/40">{serverOnline === null ? "Đang kết nối..." : serverOnline ? "Server online" : "Server offline"}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-center mb-8">
          <div className="text-6xl mb-4">{mode === "register" ? "🔐" : "🔑"}</div>
          <h1 className="text-3xl text-amber font-bold mb-2">{mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}</h1>
          <p className="text-white/60 text-sm">{mode === "register" ? "Đăng ký để sử dụng báo thức thông minh" : "Đăng nhập để tiếp tục sử dụng"}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div key="username-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" placeholder="Tên đăng nhập *" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-amber/50 transition-colors" />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" placeholder="Họ và tên (tùy chọn)" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-amber/50 transition-colors" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-amber/50 transition-colors" />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu *" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-amber/50 transition-colors pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div key="phone-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="tel" placeholder="Số điện thoại (tùy chọn)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-amber/50 transition-colors" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/15 border border-green-500/30 rounded-xl px-4 py-3">
              <p className="text-green-400 text-sm text-center">{success}</p>
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-amber text-black font-medium hover:bg-amber/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{mode === "register" ? "Đang đăng ký..." : "Đang đăng nhập..."}</>
            ) : (
              <><ShieldCheck className="w-5 h-5"/>{mode === "register" ? "Đăng ký" : "Đăng nhập"}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            {mode === "register" ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            <button onClick={switchMode} className="text-amber hover:text-amber/80 font-medium transition-colors">
              {mode === "register" ? "Đăng nhập" : "Đăng ký ngay"}
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("home")} className="text-xs text-white/30 hover:text-white/50 transition-colors">Bỏ qua, dùng thử</button>
        </div>
      </div>

      <div className="mt-auto pt-8 text-center">
        <p className="text-xs text-white/20">Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng</p>
      </div>
    </div>
  );
}
