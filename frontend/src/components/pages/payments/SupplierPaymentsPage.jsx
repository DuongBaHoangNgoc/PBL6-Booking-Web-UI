"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/useAuth";
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

import {
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

export default function SupplierPaymentsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // 💳 QR + SSE
  const [qrUrl, setQrUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  // ⏱ Countdown 5 phút
  const [timeLeft, setTimeLeft] = useState(0); // giây
  const [startTime, setStartTime] = useState(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newAccount, setNewAccount] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  const [banks, setBanks] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔁 Khôi phục QR từ localStorage khi reload (dùng key riêng cho supplier)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("supplierQrPayment");
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
        localStorage.removeItem("supplierQrPayment");
      }
    }
  }, []);

  // ========== FETCH ACCOUNT ==========
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
      console.error("❌ Lỗi khi lấy tài khoản supplier:", err);
      setMessage({ type: "error", text: "Không thể tải tài khoản!" });
    } finally {
      setIsFetching(false);
    }
  };

  // ========== FETCH TRANSACTIONS ==========
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
      setTotalPages(Math.ceil(total / 10));
      setCurrentPage(page);
    } catch (err) {
      console.error("❌ Lỗi khi lấy giao dịch supplier:", err);
      setMessage({ type: "error", text: "Không thể tải giao dịch!" });
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) fetchTransactions(1);
  }, [accounts]);

  useEffect(() => {
    const fetchBanks = async () => {
      const result = await getBanks();
      setBanks(result || []);
    };
    fetchBanks();
  }, []);

  // ========== ADD ACCOUNT (giống PaymentsPage, có validate & check trùng) ==========
  const handleAddAccount = async () => {
    const { accountNumber, accountName, bankName } = newAccount;

    if (!accountNumber || !accountName || !bankName) {
      return setMessage({
        type: "error",
        text: "Vui lòng nhập đủ thông tin!",
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

    // Kiểm tra trùng
    const exists = accounts.some(
      (acc) =>
        acc.accountNumber === accountNumber &&
        acc.bankName?.toLowerCase() === bankName.toLowerCase()
    );

    if (exists) {
      return setMessage({
        type: "error",
        text: "Tài khoản này đã tồn tại trong ví của bạn!",
      });
    }

    try {
      setLoading(true);
      const res = await createAccount({
        userId: user?.userId,
        accountNumber,
        accountName,
        bankName,
      });

      if (![200, 201].includes(res.statusCode)) {
        throw new Error(res.message || "Không thể thêm tài khoản!");
      }

      setMessage({ type: "success", text: "Thêm tài khoản thành công!" });
      setNewAccount({ accountNumber: "", accountName: "", bankName: "" });

      await fetchAccounts();

      // Đưa tài khoản mới lên đầu nếu backend trả về
      if (res.data) {
        setAccounts((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error("❌ Lỗi tạo tài khoản supplier:", err);
      setMessage({ type: "error", text: "Không thể thêm tài khoản!" });
    } finally {
      setLoading(false);
    }
  };

  // ========== SSE LISTENER ==========
  const startSseStream = (pid) => {
    if (eventSource) eventSource.close();

    const sseUrl = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
    }/transactions/stream/${pid}`;
    console.log("🔌 Supplier SSE connect:", sseUrl);

    const sse = new EventSource(sseUrl);
    setEventSource(sse);

    sse.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Supplier SSE event:", data);
      const newStatus = data.status;
      setPaymentStatus(newStatus);

      if (newStatus === "SUCCESS") {
        setMessage({ type: "success", text: "Giao dịch thành công ✅" });
        setBalance((prev) => prev + Number(data.amount || 0));
        await fetchTransactions();
        sse.close();
        localStorage.removeItem("supplierQrPayment");
      } else if (newStatus === "EXPIRED") {
        setMessage({ type: "error", text: "Giao dịch hết hạn ❌" });
        sse.close();
        localStorage.removeItem("supplierQrPayment");
      }
    };

    sse.onerror = (err) => {
      console.error("Supplier SSE Error:", err);
      setPaymentStatus("Lỗi kết nối SSE");
      sse.close();
    };
  };

  // ========== TOP UP (dùng API /transactions/InOutcoin + SSE + countdown) ==========
  const handleTopUp = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số tiền hợp lệ!" });
      return;
    }

    if (accounts.length === 0) {
      setMessage({
        type: "error",
        text: "Bạn cần thêm tài khoản ngân hàng trước khi nạp tiền!",
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

      // Lưu state QR vào localStorage (key riêng cho supplier)
      localStorage.setItem(
        "supplierQrPayment",
        JSON.stringify({
          paymentId: data.paymentId,
          qrUrl: qr,
          startTime: now,
          status: "PENDING",
        })
      );

      setMessage({
        type: "success",
        text: "Tạo giao dịch thành công, vui lòng quét mã QR để thanh toán.",
      });

      // Bật SSE
      startSseStream(data.paymentId);
    } catch (err) {
      console.error("❌ Lỗi nạp tiền supplier:", err);
      setMessage({
        type: "error",
        text: "Không thể nạp tiền, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== WITHDRAW ==========
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setMessage({ type: "error", text: "Vui lòng nhập số tiền muốn rút!" });
      return;
    }
    if (Number(withdrawAmount) > balance) {
      setMessage({ type: "error", text: "Số tiền rút vượt quá số dư!" });
      return;
    }
    if (accounts.length === 0) {
      setMessage({
        type: "error",
        text: "Bạn cần có tài khoản ngân hàng để rút tiền!",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await createTransaction({
        userWalletAccountId: accounts[0].id,
        amount: Number(withdrawAmount),
        type: "RUT_TIEN",
      });

      if (res?.statusCode === 201 || res?.status === "SUCCESS") {
        setBalance((prev) => prev - Number(withdrawAmount));
        setMessage({ type: "success", text: "Rút tiền thành công!" });
        setWithdrawAmount("");
        await fetchTransactions();
      } else {
        throw new Error(res?.message || "Rút tiền thất bại");
      }
    } catch (err) {
      console.error("❌ Lỗi rút tiền supplier:", err);
      setMessage({
        type: "error",
        text: "Không thể rút tiền, vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== COUNTDOWN EFFECT ==========
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus !== "PENDING") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // Cleanup SSE khi unmount
  useEffect(() => {
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [eventSource]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-bold">Thanh toán & Ví tiền (Supplier)</h1>
        <p className="text-gray-500 text-sm">
          Quản lý số dư – tài khoản ngân hàng – giao dịch nạp/rút.
        </p>
      </div>

      {/* NOTIFICATION */}
      {message.text && (
        <div
          className={`p-4 rounded-md flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      {/* NO ACCOUNT - ADD FORM */}
      {accounts.length === 0 && (
        <Card className="p-6 border-dashed border-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle size={18} /> Thêm tài khoản ngân hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                setNewAccount({
                  ...newAccount,
                  accountName: e.target.value,
                })
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
            className="mt-4"
            onClick={handleAddAccount}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Thêm tài khoản"}
          </Button>
        </Card>
      )}

      {/* MAIN UI WHEN HAVING BANK ACCOUNT */}
      {accounts.length > 0 && (
        <>
          {/* BALANCE + TOPUP + WITHDRAW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BALANCE */}
            <Card className="p-6 flex flex-col items-center">
              <Wallet className="text-yellow-500" size={40} />
              <p className="mt-2 text-gray-500 text-sm">Số dư hiện tại</p>
              <h2 className="text-3xl font-bold">
                {balance.toLocaleString("vi-VN")} đ
              </h2>

              <Button
                variant="outline"
                className="mt-4 flex items-center gap-2"
                onClick={fetchAccounts}
                disabled={isFetching}
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
                Làm mới
              </Button>
            </Card>

            {/* TOPUP */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ArrowDownCircle className="text-green-600" size={20} />
                Nạp tiền
              </h3>

              <div className="flex items-center gap-3 mt-4">
                <Input
                  placeholder="Nhập số tiền"
                  value={topupAmount}
                  type="number"
                  onChange={(e) => setTopupAmount(e.target.value)}
                />
                <Button onClick={handleTopUp} disabled={loading}>
                  {loading ? "Đang xử lý..." : "Nạp"}
                </Button>
              </div>

              {qrUrl && (
                <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-center">
                  <img
                    src={qrUrl}
                    className="w-40 mx-auto border rounded-md p-1"
                  />
                  {paymentStatus === "PENDING" && timeLeft > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
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
                  <p className="mt-1 text-sm text-gray-600">
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

            {/* WITHDRAW */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ArrowUpCircle className="text-red-600" size={20} />
                Rút tiền
              </h3>

              <div className="flex items-center gap-3 mt-4">
                <Input
                  placeholder="Nhập số tiền"
                  value={withdrawAmount}
                  type="number"
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Rút"}
                </Button>
              </div>
            </Card>
          </div>

          {/* TABLE */}
          <Card className="p-6 mt-8">
            <h2 className="text-lg font-bold mb-4">Lịch sử giao dịch</h2>

            {loadingTransactions ? (
              <p className="text-center text-sm text-gray-500 py-4">
                Đang tải giao dịch...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                Chưa có giao dịch nào.
              </p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Mã GD</th>
                      <th className="p-3 text-left">Loại</th>
                      <th className="p-3 text-left">Số tiền</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Ngày</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((t) => {
                      const isDeposit =
                        t.transaction_content?.includes("NAPTIEN");
                      const matchAmount = t.transaction_content?.match(
                        /(\d+)(?=\s*paymentCode)/
                      );
                      const amount = matchAmount ? Number(matchAmount[1]) : 0;

                      return (
                        <tr key={t.transactionId} className="border-b">
                          <td className="p-3">{t.transactionId}</td>
                          <td className="p-3">
                            {isDeposit ? "Nạp tiền" : "Rút tiền"}
                          </td>
                          <td
                            className={`p-3 font-semibold ${
                              isDeposit ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {amount.toLocaleString("vi-VN")} đ
                          </td>
                          <td
                            className={cn(
                              "p-3 font-medium",
                              t.status === "SUCCESS"
                                ? "text-green-600"
                                : t.status === "EXPIRED"
                                ? "text-red-600"
                                : "text-yellow-600"
                            )}
                          >
                            {t.status}
                          </td>
                          <td className="p-3 text-gray-500">
                            {new Date(t.transaction_date).toLocaleString(
                              "vi-VN"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* PAGINATION */}
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => fetchTransactions(currentPage - 1)}
                  >
                    Trang trước
                  </Button>

                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
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
        </>
      )}
    </div>
  );
}
