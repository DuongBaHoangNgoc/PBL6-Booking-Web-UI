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
import { getBanks } from "@/api/banks";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ NEW: API lịch sử thanh toán (transactions-coins)
import { getTransactionsCoinsFilterPaginationUser } from "@/api/transaction_coins";

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

  // 🧾 Pagination lịch sử giao dịch
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [banks, setBanks] = useState([]);

  // ✅ NEW: states cho Lịch sử thanh toán (transactions-coins)
  const [paymentCoins, setPaymentCoins] = useState([]);
  const [paymentCoinsPage, setPaymentCoinsPage] = useState(1);
  const [paymentCoinsTotalPages, setPaymentCoinsTotalPages] = useState(1);
  const [loadingPaymentCoins, setLoadingPaymentCoins] = useState(false);

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
  const fetchTransactions = async (page = 1) => {
    if (!user || accounts.length === 0) return;

    try {
      setLoadingTransactions(true);

      const res = await getTransactions({
        accountId: accounts[0]?.id,
        limit: 10,
        page,
      });

      const data = res?.data?.transactions || [];
      setTransactions(Array.isArray(data) ? data : []);

      const total = res?.data?.countTransaction || 0;
      setTotalPages(Math.max(1, Math.ceil(total / 10)));

      setCurrentPage(page);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch sử giao dịch:", err);
      setMessage({
        type: "error",
        text: "Không thể tải lịch sử giao dịch!",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  // ✅ NEW: Lấy lịch sử thanh toán (transactions-coins)
  const fetchPaymentCoins = async (page = 1) => {
    if (!user) return;

    try {
      setLoadingPaymentCoins(true);

      // Backend yêu cầu userId
      const res = await getTransactionsCoinsFilterPaginationUser({
        userId: user.userId,
        limit: 10,
        page,
      });

      const payload = res?.data || {};
      const rows = payload?.TransactionData || [];
      const total = payload?.countTransactionData || 0;

      setPaymentCoins(Array.isArray(rows) ? rows : []);
      setPaymentCoinsTotalPages(Math.max(1, Math.ceil(total / 10)));
      setPaymentCoinsPage(page);
    } catch (err) {
      console.error("❌ Lỗi khi tải lịch sử thanh toán:", err);
      setMessage({
        type: "error",
        text: "Không thể tải lịch sử thanh toán!",
      });
    } finally {
      setLoadingPaymentCoins(false);
    }
  };

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

  // ✅ Khi user có dữ liệu → fetch tài khoản + payment coins
  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchPaymentCoins(1); // ✅ load bảng lịch sử thanh toán
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  useEffect(() => {
    const fetchBanks = async () => {
      const result = await getBanks();
      setBanks(result);
    };
    fetchBanks();
  }, []);

  // 🟣 Thêm tài khoản mới
  const handleAddAccount = async () => {
    const { accountNumber, accountName, bankName } = newAccount;

    if (!accountNumber || !accountName || !bankName) {
      return setMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ thông tin thẻ!",
      });
    }

    if (!/^\d+$/.test(accountNumber)) {
      return setMessage({
        type: "error",
        text: "Số tài khoản phải là số!",
      });
    }

    if (accountNumber.length < 6 || accountNumber.length > 20) {
      return setMessage({
        type: "error",
        text: "Số tài khoản không hợp lệ!",
      });
    }

    try {
      setLoading(true);

      const exists = accounts.some(
        (acc) =>
          acc.accountNumber === accountNumber &&
          acc.bankName.toLowerCase() === bankName.toLowerCase()
      );

      if (exists) {
        return setMessage({
          type: "error",
          text: "Tài khoản này đã tồn tại trong ví của bạn!",
        });
      }

      const res = await createAccount({
        userId: user.userId,
        accountNumber,
        bankName,
        accountName,
      });

      if (![200, 201].includes(res.statusCode)) {
        throw new Error(res.message || "Không thể thêm tài khoản!");
      }

      setMessage({
        type: "success",
        text: "Thêm tài khoản thành công!",
      });

      setNewAccount({ accountNumber: "", bankName: "", accountName: "" });

      await fetchAccounts();

      setAccounts((prev) => {
        const newList = [...prev];
        const added = res.data;
        return [added, ...newList];
      });
    } catch (err) {
      console.error("❌ Lỗi khi tạo tài khoản mới:", err);
      setMessage({
        type: "error",
        text: "Không thể thêm tài khoản mới!",
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

      const qr = `https://qr.sepay.vn/img?acc=96247H06JB&bank=BIDV&amount=${amount}&des=${data.transaction_content}`;
      setQrUrl(qr);
      setPaymentId(data.paymentId);
      setPaymentStatus("PENDING");

      const now = Date.now();
      setTimeLeft(300);
      setStartTime(now);

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

        await fetchTransactions(currentPage);
        await fetchPaymentCoins(paymentCoinsPage); // ✅ refresh bảng thanh toán (nếu có liên quan)
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

        await fetchTransactions(currentPage);
        await fetchPaymentCoins(paymentCoinsPage); // ✅ refresh bảng thanh toán
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

  // helper: map type/status
  const formatCoinType = (t) => {
    switch (t) {
      case "NAP":
        return "Nạp";
      case "RUT":
        return "Rút";
      case "THANH_TOAN":
        return "Thanh toán";
      case "HOAN_TIEN":
        return "Hoàn tiền";
      default:
        return t || "-";
    }
  };

  const statusClass = (s) => {
    if (s === "SUCCESS") return "text-green-600";
    if (s === "FAILED") return "text-red-600";
    if (s === "PENDING") return "text-yellow-600";
    return "text-muted-foreground";
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

        {/* ------------------------------------------------------------ */}
        {/* 🟢 NẾU KHÔNG CÓ TÀI KHOẢN → HIỂN THỊ FORM TẠO TÀI KHOẢN */}
        {/* ------------------------------------------------------------ */}
        {accounts.length === 0 && (
          <Card className="p-6 border-2 border-dashed border-gray-300 bg-muted/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Bạn chưa có tài khoản ngân hàng
            </h2>

            <p className="text-muted-foreground mb-4">
              Hãy thêm một tài khoản ngân hàng để có thể nạp - rút xu.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Số tài khoản"
                value={newAccount.accountNumber}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    accountNumber: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Tên chủ tài khoản"
                value={newAccount.accountName}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, accountName: e.target.value })
                }
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {newAccount.bankName
                      ? banks.find((b) => b.shortName === newAccount.bankName)
                          ?.shortName
                      : "Chọn ngân hàng"}
                    <ChevronsUpDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm ngân hàng..." />
                    <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                    <CommandGroup>
                      {banks.map((bank) => (
                        <CommandItem
                          key={bank.bin}
                          value={bank.shortName}
                          onSelect={() =>
                            setNewAccount({
                              ...newAccount,
                              bankName: bank.shortName,
                            })
                          }
                        >
                          <img
                            src={bank.logo}
                            alt={bank.shortName}
                            className="w-5 h-5 rounded mr-2"
                          />

                          <span>
                            {bank.shortName} - {bank.name}
                          </span>

                          <Check
                            className={cn(
                              "ml-auto w-4 h-4",
                              newAccount.bankName === bank.shortName
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleAddAccount}
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Thêm tài khoản mới"}
            </Button>
          </Card>
        )}

        {/* ------------------------------------------------------------ */}
        {/* 🟢 NẾU ĐÃ CÓ TÀI KHOẢN → HIỂN THỊ TRANG PAYMENTS BÌNH THƯỜNG */}
        {/* ------------------------------------------------------------ */}
        {accounts.length > 0 && (
          <>
            {/* Số dư – Nạp – Rút */}
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
              <h2 className="text-xl font-semibold mb-6">Lịch sử giao dịch</h2>

              {loadingTransactions ? (
                <p className="text-center py-4 text-muted-foreground">
                  Đang tải...
                </p>
              ) : transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  Chưa có giao dịch nào.
                </p>
              ) : (
                <>
                  <div className="overflow-y-scroll max-h-80 rounded-md border border-border scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background z-10 border-b border-border">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">
                            Mã GD
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Mã Thanh Toán
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Loại
                          </th>
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
                          <th className="py-3 px-4 text-left font-semibold">
                            Ngày
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {transactions.map((t) => {
                          const isDeposit =
                            t.transaction_content?.includes("NAPTIEN");
                          const typeText = isDeposit ? "Nạp tiền" : "Rút tiền";

                          const matchAmount = t.transaction_content?.match(
                            /(\d+)(?=\s*paymentCode)/
                          );
                          const amount = matchAmount
                            ? Number(matchAmount[1])
                            : 0;

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
                                {new Date(t.transaction_date).toLocaleString(
                                  "vi-VN"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* PHÂN TRANG */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => fetchTransactions(currentPage - 1)}
                    >
                      Trang trước
                    </Button>

                    <span className="text-sm">
                      Trang <strong>{currentPage}</strong> / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => fetchTransactions(currentPage + 1)}
                    >
                      Trang sau
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* ✅ NEW: Lịch sử thanh toán (transactions-coins) */}
            <Card className="p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Lịch sử thanh toán</h2>
                <Button
                  variant="outline"
                  onClick={() => fetchPaymentCoins(paymentCoinsPage)}
                  disabled={loadingPaymentCoins}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      loadingPaymentCoins ? "animate-spin" : ""
                    }`}
                  />
                  Làm mới
                </Button>
              </div>

              {loadingPaymentCoins ? (
                <p className="text-center py-4 text-muted-foreground">
                  Đang tải...
                </p>
              ) : paymentCoins.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  Chưa có thanh toán nào.
                </p>
              ) : (
                <>
                  <div className="overflow-y-scroll max-h-80 rounded-md border border-border scrollbar-thin">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background z-10 border-b border-border">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">
                            ID
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Số tiền
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Loại
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Trạng thái
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Mô tả
                          </th>
                          <th className="py-3 px-4 text-left font-semibold">
                            Ngày tạo
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paymentCoins.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4">{p.id}</td>
                            <td className="py-3 px-4 font-semibold">
                              {Number(p.amount || 0).toLocaleString("vi-VN")}
                            </td>
                            <td className="py-3 px-4">
                              {formatCoinType(p.type)}
                            </td>
                            <td
                              className={`py-3 px-4 font-semibold ${statusClass(
                                p.status
                              )}`}
                            >
                              {p.status || "-"}
                            </td>
                            <td className="py-3 px-4">
                              {p.description || "-"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleString("vi-VN")
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PHÂN TRANG - bảng thanh toán */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      disabled={paymentCoinsPage === 1}
                      onClick={() => fetchPaymentCoins(paymentCoinsPage - 1)}
                    >
                      Trang trước
                    </Button>

                    <span className="text-sm">
                      Trang <strong>{paymentCoinsPage}</strong> /{" "}
                      {paymentCoinsTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={paymentCoinsPage === paymentCoinsTotalPages}
                      onClick={() => fetchPaymentCoins(paymentCoinsPage + 1)}
                    >
                      Trang sau
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
