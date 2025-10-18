const { exec } = require("child_process");
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
const sqlFile = "./database_pbl6.sql";

// Lệnh tạo database nếu chưa có
const createDbCmd = `mysql -h ${DB_HOST} -u ${DB_USER} ${
  DB_PASS ? `-p${DB_PASS}` : ""
} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"`


// Lệnh import file SQL (dùng cmd /c để hoạt động trên Windows)
const importCmd = `cmd /c "mysql -h ${DB_HOST} -u ${DB_USER} ${
  DB_PASS ? `-p${DB_PASS}` : ""
} ${DB_NAME} < ${sqlFile}"`;

console.log("🔧 Đang kiểm tra và tạo database nếu cần...");

exec(createDbCmd, (err) => {
  if (err) {
    console.error("❌ Lỗi khi tạo database:", err.message);
    return;
  }

  console.log(`✅ Database '${DB_NAME}' sẵn sàng!`);
  console.log("🚀 Đang import dữ liệu từ file:", sqlFile);

  exec(importCmd, (importErr, stdout, stderr) => {
    if (importErr) {
      console.error("❌ Lỗi khi import dữ liệu:", importErr.message);
      return;
    }
    if (stderr) console.warn("⚠️ Cảnh báo:", stderr);
    console.log("✅ Import dữ liệu thành công!");
  });
});
