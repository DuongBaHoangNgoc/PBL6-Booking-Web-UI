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

  // 🧾 Form thêm thẻ mới
  const [newAccount, setNewAccount] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  // 💰 Form nạp & rút xu
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // 🟢 Lấy danh sách thẻ ngân hàng & số dư
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

  // 📜 Lấy lịch sử giao dịch thực tế
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setIsFetching(true);
      const res = await getTransactions({
        accountId: accounts[0]?.id, // ✅ đúng theo API
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

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  // Khi danh sách account thay đổi thì load giao dịch tương ứng
  useEffect(() => {
    if (accounts.length > 0) {
      fetchTransactions();
    }
  }, [accounts]);

  // 🟣 Tạo tài khoản mới
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
        setMessage({
          type: "error",
          text: res?.message || "Không thể thêm tài khoản.",
        });
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

  // 💸 Nạp xu
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

      const res = await createTransaction({
        userWalletAccountId: account.id,
        amount,
        type: "NAP_TIEN",
      });

      if (res?.statusCode === 201 || res?.status === "SUCCESS") {
        setMessage({
          type: "success",
          text: `Đã nạp ${amount.toLocaleString("vi-VN")} xu thành công!`,
        });
        setBalance((prev) => prev + amount);
        await fetchTransactions();
      } else {
        throw new Error(res?.message || "Nạp xu thất bại");
      }

      setTopupAmount("");
    } catch (err) {
      console.error("❌ Lỗi khi nạp xu:", err);
      setMessage({
        type: "error",
        text: "Không thể nạp xu. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // 💵 Rút xu
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Mã</th>
                  <th className="text-left py-3 px-4 font-semibold">Loại</th>
                  <th className="text-left py-3 px-4 font-semibold">Số xu</th>
                  <th className="text-left py-3 px-4 font-semibold">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.transactionId || t.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {t.transactionId || t.id || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {t.type === "NAP_TIEN"
                        ? "Nạp xu"
                        : t.type === "RUT_TIEN"
                        ? "Rút xu"
                        : "Khác"}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        t.type === "RUT_TIEN"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {Number(t.amount).toLocaleString("vi-VN")} xu
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(t.createDate || t.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </section>
  );
}
