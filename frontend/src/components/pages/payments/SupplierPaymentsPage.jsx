import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/useAuth";

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
  const [message, setMessage] = useState({ type: "", text: "" });

  const [qrUrl, setQrUrl] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [newAccount, setNewAccount] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ========== FETCH ACCOUNT ==========
  const fetchAccounts = async () => {
    try {
      setIsFetching(true);
      const res = await getAccountsFilterPagination({
        userId: user.userId,
        limit: 10,
        page: 1,
      });

      const data = res.accounts || [];
      setAccounts(data);
      if (data[0]?.balance) setBalance(Number(data[0].balance));
    } catch {
      setMessage({ type: "error", text: "Không thể tải tài khoản!" });
    } finally {
      setIsFetching(false);
    }
  };

  // ========== FETCH TRANSACTIONS ==========
  const fetchTransactions = async (page = 1) => {
    try {
      const res = await getTransactions({
        accountId: accounts[0]?.id,
        limit: 10,
        page,
      });

      setTransactions(res.data.transactions || []);
      setTotalPages(Math.ceil(res.data.countTransaction / 10));
      setCurrentPage(page);
    } catch {
      setMessage({ type: "error", text: "Không thể tải giao dịch!" });
    }
  };

  useEffect(() => {
    if (user) fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) fetchTransactions(1);
  }, [accounts]);

  // ========== ADD ACCOUNT ==========
  const handleAddAccount = async () => {
    const { accountNumber, accountName, bankName } = newAccount;

    if (!accountNumber || !accountName || !bankName)
      return setMessage({
        type: "error",
        text: "Vui lòng nhập đủ thông tin!",
      });

    try {
      setLoading(true);
      const res = await createAccount({
        userId: user.userId,
        accountNumber,
        accountName,
        bankName,
      });

      if (![200, 201].includes(res.statusCode))
        throw new Error("Lỗi tạo tài khoản");

      setMessage({ type: "success", text: "Thêm tài khoản thành công!" });
      setNewAccount({ accountNumber: "", accountName: "", bankName: "" });
      fetchAccounts();
    } catch {
      setMessage({ type: "error", text: "Không thể thêm tài khoản!" });
    } finally {
      setLoading(false);
    }
  };

  // ========== TOP UP ==========
  const handleTopUp = async () => {
    if (!topupAmount) return;

    setLoading(true);
    try {
      const res = await createTransaction({
        userWalletAccountId: accounts[0].id,
        amount: Number(topupAmount),
        type: "NAP_TIEN",
      });

      const data = res.data;
      const qr = `https://qr.sepay.vn/img?acc=96247H06JB&bank=BIDV&amount=${topupAmount}&des=${data.transaction_content}`;
      setQrUrl(qr);
      setPaymentId(data.paymentId);
      setPaymentStatus("PENDING");

      setMessage({
        type: "success",
        text: "Tạo giao dịch thành công, vui lòng quét QR!",
      });
    } catch {
      setMessage({ type: "error", text: "Không thể nạp tiền!" });
    } finally {
      setLoading(false);
    }
  };

  // ========== WITHDRAW ==========
  const handleWithdraw = async () => {
    if (!withdrawAmount) return;

    try {
      setLoading(true);
      const res = await createTransaction({
        userWalletAccountId: accounts[0].id,
        amount: Number(withdrawAmount),
        type: "RUT_TIEN",
      });

      if (res.statusCode === 201) {
        setBalance((prev) => prev - Number(withdrawAmount));
        setMessage({ type: "success", text: "Rút tiền thành công!" });
        fetchTransactions();
      }
    } catch {
      setMessage({ type: "error", text: "Không thể rút tiền!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-bold">Thanh toán & Ví tiền</h1>
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

            <Input
              placeholder="Ngân hàng"
              value={newAccount.bankName}
              onChange={(e) =>
                setNewAccount({
                  ...newAccount,
                  bankName: e.target.value,
                })
              }
            />
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
              >
                <RefreshCw size={16} />
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
                  onChange={(e) => setTopupAmount(e.target.value)}
                />
                <Button onClick={handleTopUp} disabled={loading}>
                  Nạp
                </Button>
              </div>

              {qrUrl && (
                <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-center">
                  <img src={qrUrl} className="w-40 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">
                    Trạng thái: {paymentStatus}
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
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  Rút
                </Button>
              </div>
            </Card>
          </div>

          {/* TABLE */}
          <Card className="p-6 mt-8">
            <h2 className="text-lg font-bold mb-4">Lịch sử giao dịch</h2>

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
                  const isDeposit = t.transaction_content.includes("NAPTIEN");
                  const amount = Number(
                    t.transaction_content.match(
                      /(\d+)(?=\s*paymentCode)/
                    )?.[1] || 0
                  );

                  return (
                    <tr key={t.transactionId} className="border-b">
                      <td className="p-3">{t.transactionId}</td>
                      <td className="p-3">
                        {isDeposit ? "Nạp tiền" : "Rút tiền"}
                      </td>
                      <td className="p-3 font-semibold">
                        {amount.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-3">{t.status}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(t.transaction_date).toLocaleString("vi-VN")}
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
          </Card>
        </>
      )}
    </div>
  );
}
