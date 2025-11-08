import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coins,
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function PaymentsPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ✅ Dữ liệu tĩnh
  const balance = 150000;
  const history = [
    {
      id: 1,
      type: "NAP_TIEN",
      amount: 50000,
      description: "Nạp xu từ thẻ ngân hàng",
      createdAt: "2025-11-08T09:45:00.000Z",
    },
    {
      id: 2,
      type: "THANH_TOAN",
      amount: 30000,
      description: "Thanh toán tour Đà Lạt",
      createdAt: "2025-11-06T14:21:00.000Z",
    },
    {
      id: 3,
      type: "HOAN_TIEN",
      amount: 20000,
      description: "Hoàn tiền do tour bị hủy",
      createdAt: "2025-11-05T10:10:00.000Z",
    },
  ];

  // Giả lập nạp xu (không API)
  const handleTopUp = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập số tiền hợp lệ!",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    setTimeout(() => {
      setLoading(false);
      setAmount("");
      setMessage({
        type: "success",
        text: `Đã nạp thành công ${Number(amount).toLocaleString("vi-VN")} xu!`,
      });
    }, 1000);
  };

  return (
    <section className="min-h-screen my-20 pb-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payments & Coins
        </h1>

        {/* Hiển thị thông báo */}
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

        {/* Tổng quan tài khoản */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <Card className="p-6 flex flex-col items-center justify-center">
            <Coins className="w-10 h-10 text-yellow-500 mb-3" />
            <p className="text-muted-foreground text-sm">Current Balance</p>
            <h2 className="text-4xl font-bold text-foreground">
              {balance.toLocaleString("vi-VN")} xu
            </h2>
            <Button
              variant="outline"
              className="mt-4 flex items-center gap-2"
              onClick={() =>
                setMessage({
                  type: "success",
                  text: "Đã làm mới số dư (demo)",
                })
              }
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </Card>

          {/* Form nạp xu */}
          <Card className="p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4">Top Up Coins</h2>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Input
                type="number"
                placeholder="Nhập số xu muốn nạp (VD: 50000)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleTopUp}
                disabled={loading}
              >
                {loading ? "Processing..." : "Nạp Ngay"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Lịch sử giao dịch */}
        <Card className="p-6 overflow-y-auto max-h-[450px]">
          <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">
                  Mã giao dịch
                </th>
                <th className="text-left py-3 px-4 font-semibold">Loại</th>
                <th className="text-left py-3 px-4 font-semibold">Số xu</th>
                <th className="text-left py-3 px-4 font-semibold">Mô tả</th>
                <th className="text-left py-3 px-4 font-semibold">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">{t.id}</td>
                  <td className="py-3 px-4 capitalize">
                    {t.type === "NAP_TIEN"
                      ? "Nạp tiền"
                      : t.type === "THANH_TOAN"
                      ? "Thanh toán"
                      : "Hoàn tiền"}
                  </td>
                  <td className="py-3 px-4 text-foreground font-semibold">
                    {Number(t.amount).toLocaleString("vi-VN")} xu
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {t.description || "-"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}
