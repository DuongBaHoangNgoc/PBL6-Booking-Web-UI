"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/useAuth";
import {
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
  PlusCircle,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import {
  getAccountsFilterPagination,
  createAccount,
} from "@/api/wallet_accounts";
import { createTransaction, getTransactions } from "@/api/transactions";

export default function PaymentsPage() {
  const { user } = useAuth();

  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 💳 SSE states
  const [paymentStatus, setPaymentStatus] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  // ⏱️ Đồng hồ đếm ngược (giữ lại qua reload)
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // 🧾 Thông tin thẻ mới
  const [newAccount, setNewAccount] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  // 💰 Form nạp & rút xu
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // 🟢 Lấy danh sách tài khoản
  const fetchAccounts = async () => {
    if (!user) return;
    try {
      setIsFetching(true);
      const res = await getAccountsFilterPagination({
        userId: user.userId,
        limit: 10,
        page: 1,
      });
      const data = res.accounts || [];
      setAccounts(data);
      if (data[0]?.balance) setBalance(Number(data[0].balance || 0));
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách account:", err);
      setMessage({
        type: "error",
        text: "Không thể tải danh sách tài khoản!",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // 📜 Lấy lịch sử giao dịch
  const fetchTransactions = async () => {
    if (!user || accounts.length === 0) return;
    try {
      setIsFetching(true);
      const res = await getTransactions({
        accountId: accounts[0]?.id,
        limit: 10,
        page: 1,
      });
      const data =
        res?.data?.transactions || res?.transactions || res?.data || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch sử giao dịch:", err);
      setMessage({
        type: "error",
        text: "Không thể tải lịch sử giao dịch!",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ 1. Khôi phục QR khi load trang (chỉ chạy 1 lần)
  useEffect(() => {
    const saved = localStorage.getItem("qrPayment");
    if (saved) {
      const parsed = JSON.parse(saved);
      const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
      const remaining = 300 - elapsed;

      if (remaining > 0 && parsed.status === "PENDING") {
        setPaymentId(parsed.paymentId);
        setQrUrl(parsed.qrUrl);
        setPaymentStatus("PENDING");
        setTimeLeft(remaining);
        setStartTime(parsed.startTime);
        startSseStream(parsed.paymentId);
      } else {
        localStorage.removeItem("qrPayment");
      }
    }
  }, []);

  // ✅ 2. Khi user có dữ liệu → fetch tài khoản
  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) fetchTransactions();
  }, [accounts]);

  // 🟣 Thêm tài khoản mới
  const handleAddAccount = async () => {
    const { accountNumber, accountName, bankName } = newAccount;
    if (!accountNumber || !accountName || !bankName) {
      setMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ thông tin thẻ!",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await createAccount({
        userId: user.userId,
        accountNumber,
        bankName,
        accountName,
      });

      if (res.statusCode === 201 || res.status === "SUCCESS") {
        setMessage({
          type: "success",
          text: "Đã thêm thẻ ngân hàng mới thành công!",
        });
        setNewAccount({ accountNumber: "", accountName: "", bankName: "" });
        fetchAccounts();
      } else {
        throw new Error(res?.message || "Không thể thêm tài khoản");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo tài khoản:", err);
      setMessage({
        type: "error",
        text: "Lỗi khi tạo tài khoản. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 💸 Nạp xu có SSE realtime
  const handleTopUp = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số xu hợp lệ!" });
      return;
    }
    if (accounts.length === 0) {
      setMessage({
        type: "error",
        text: "Bạn cần thêm tài khoản ngân hàng trước khi nạp xu!",
      });
      return;
    }

    setLoading(true);
    try {
      const account = accounts[0];
      const amount = Number(topupAmount);

      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
        }/transactions/InOutcoin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userWalletAccountId: account.id,
            amount,
            type: "NAP_TIEN",
          }),
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      const data = result.data;

      // ✅ Hiển thị QR thanh toán
      const qr = `https://qr.sepay.vn/img?acc=96247H06JB&bank=BIDV&amount=${amount}&des=${data.transaction_content}`;
      setQrUrl(qr);
      setPaymentId(data.paymentId);
      setPaymentStatus("PENDING");

      // Bắt đầu đếm ngược 5 phút (300 giây)
      const now = Date.now();
      setTimeLeft(300);
      setStartTime(now);

      // Lưu vào localStorage để giữ khi reload
      localStorage.setItem(
        "qrPayment",
        JSON.stringify({
          paymentId: data.paymentId,
          qrUrl: qr,
          startTime: now,
          status: "PENDING",
        })
      );

      setMessage({
        type: "success",
        text: "Giao dịch được tạo, vui lòng quét mã QR để thanh toán.",
      });

      // 🔹 Lắng nghe SSE
      startSseStream(data.paymentId);
    } catch (err) {
      console.error("❌ Lỗi khi nạp xu:", err);
      setMessage({
        type: "error",
        text: "Không thể tạo giao dịch. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 💵 Rút xu (không cần QR)
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số xu muốn rút!" });
      return;
    }
    if (Number(withdrawAmount) > balance) {
      setMessage({ type: "error", text: "Số xu rút vượt quá số dư!" });
      return;
    }
    if (accounts.length === 0) {
      setMessage({
        type: "error",
        text: "Bạn cần có tài khoản ngân hàng để rút tiền!",
      });
      return;
    }

    setLoading(true);
    try {
      const account = accounts[0];
      const amount = Number(withdrawAmount);

      const res = await createTransaction({
        userWalletAccountId: account.id,
        amount,
        type: "RUT_TIEN",
      });

      if (res?.statusCode === 201 || res?.status === "SUCCESS") {
        setMessage({
          type: "success",
          text: `Đã rút ${amount.toLocaleString("vi-VN")} xu thành công!`,
        });
        setBalance((prev) => prev - amount);
        await fetchTransactions();
      } else {
        throw new Error(res?.message || "Rút xu thất bại");
      }

      setWithdrawAmount("");
    } catch (err) {
      console.error("❌ Lỗi khi rút xu:", err);
      setMessage({
        type: "error",
        text: "Không thể rút xu. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔄 SSE stream listener
  const startSseStream = (paymentId) => {
    if (eventSource) eventSource.close();

    const sseUrl = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
    }/transactions/stream/${paymentId}`;
    console.log("🔌 SSE connect:", sseUrl);

    const sse = new EventSource(sseUrl);
    setEventSource(sse);

    sse.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 SSE event:", data);
      const newStatus = data.status;
      setPaymentStatus(newStatus);

      if (newStatus === "SUCCESS") {
        setMessage({ type: "success", text: "Giao dịch thành công ✅" });
        setBalance((prev) => prev + Number(data.amount || 0));
        await fetchTransactions();
        sse.close();
      } else if (newStatus === "EXPIRED") {
        setMessage({ type: "error", text: "Giao dịch hết hạn ❌" });
        sse.close();
      }
    };

    sse.onerror = (err) => {
      console.error("SSE Error:", err);
      setPaymentStatus("Lỗi kết nối SSE");
      sse.close();
    };
  };

  // ⏱️ Đếm ngược thời gian QR
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus !== "PENDING") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  useEffect(() => {
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventSource]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải thông tin người dùng...
      </div>
    );

  return (
    <section className="min-h-screen my-20 pb-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payments & Wallet
        </h1>

        {/* Thông báo */}
        {message.text && (
          <div
            className={`flex items-center gap-2 mb-6 p-4 rounded-md border text-sm ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Số dư, nạp, rút */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Số dư */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <Wallet className="w-10 h-10 text-yellow-500 mb-3" />
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <h2 className="text-4xl font-bold text-foreground">
              {balance.toLocaleString("vi-VN")} xu
            </h2>
            <Button
              variant="outline"
              className="mt-4 flex items-center gap-2"
              onClick={fetchAccounts}
              disabled={isFetching}
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </Card>

          {/* Nạp xu */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-green-600" /> Nạp xu
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Input
                type="number"
                placeholder="Nhập số xu muốn nạp"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleTopUp}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Nạp Ngay"}
              </Button>
            </div>

            {/* QR hiển thị khi nạp tiền */}
            {qrUrl && (
              <div className="mt-6 text-center border p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-2">
                  Quét mã QR để thanh toán
                </h3>
                <img
                  src={qrUrl}
                  alt="QR thanh toán"
                  className="mx-auto w-48 border p-2 rounded-md mb-2"
                />
                {paymentStatus === "PENDING" && timeLeft > 0 && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Còn lại:{" "}
                    <span
                      className={`font-semibold ${
                        timeLeft < 30
                          ? "text-red-500 animate-pulse"
                          : "text-blue-600"
                      }`}
                    >
                      {Math.floor(timeLeft / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Trạng thái:{" "}
                  <span
                    className={
                      paymentStatus === "SUCCESS"
                        ? "text-green-600 font-semibold"
                        : paymentStatus === "EXPIRED"
                        ? "text-red-600 font-semibold"
                        : "text-yellow-600"
                    }
                  >
                    {paymentStatus || "Chờ quét QR..."}
                  </span>
                </p>
              </div>
            )}
          </Card>

          {/* Rút xu */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-red-600" /> Rút xu
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Input
                type="number"
                placeholder="Nhập số xu muốn rút"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Rút Ngay"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Lịch sử giao dịch */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>

          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Chưa có giao dịch nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left font-semibold">Mã GD</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Mã Thanh Toán
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Loại</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Số Tiền
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Trạng Thái
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Ngân Hàng
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Số Tài Khoản
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    // 🔍 Xác định loại giao dịch từ nội dung
                    const isDeposit =
                      t.transaction_content?.includes("NAPTIEN");
                    const typeText = isDeposit ? "Nạp tiền" : "Rút tiền";

                    // 🔍 Lấy số tiền từ nội dung (ví dụ: “NAPTIEN 50000”)
                    const matchAmount = t.transaction_content?.match(
                      /(\d+)(?=\s*paymentCode)/
                    );
                    const amount = matchAmount ? Number(matchAmount[1]) : 0;

                    return (
                      <tr
                        key={t.transactionId}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">{t.transactionId}</td>
                        <td className="py-3 px-4">{t.paymentId}</td>
                        <td className="py-3 px-4">{typeText}</td>
                        <td
                          className={`py-3 px-4 font-semibold ${
                            isDeposit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {amount.toLocaleString("vi-VN")} VND
                        </td>
                        <td
                          className={`py-3 px-4 font-semibold ${
                            t.status === "SUCCESS"
                              ? "text-green-600"
                              : t.status === "EXPIRED"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {t.status}
                        </td>
                        <td className="py-3 px-4">
                          {t.account?.bankName || "-"}
                        </td>
                        <td className="py-3 px-4">
                          {t.account?.accountNumber || "-"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(t.transaction_date).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
