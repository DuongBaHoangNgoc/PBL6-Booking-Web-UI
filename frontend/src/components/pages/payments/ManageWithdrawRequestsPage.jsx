import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hook/useDebounce";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

import {
  getTransactions,
  confirmWithdrawAndUpdateBalance,
  cancelWithdrawTransaction, // ✅ thêm api hủy
} from "@/api/transactions";

const formatMoney = (n) =>
  Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const extractAmountFromContent = (content) => {
  const m = content?.match(/RUTTIEN\s+(\d+)\s+paymentCode/i);
  if (!m) return 0;
  return Number(m[1]);
};

export function ManageWithdrawRequestsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  // Filters (UI typing)
  const [filters, setFilters] = useState({
    accountId: "",
    accountNumber: "",
    accountName: "",
    bankName: "",
    status: "PENDING",
  });

  // ✅ Debounced filters (thay nút Lọc + Làm mới)
  const debouncedFilters = useDebounce(filters, 450);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    transactionId: null,
    type: null, // "APPROVE" | "CANCEL"
  });

  const handleFilterChange = (key, value) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchWithdrawRequests = async (page, currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit,
        type: "RUTTIEN",
        status:
          currentFilters.status === "all" ? undefined : currentFilters.status,
        accountId: currentFilters.accountId
          ? Number(currentFilters.accountId)
          : undefined,
      };

      const res = await getTransactions(params);

      const txs = res?.data?.transactions || [];
      const total = res?.data?.countTransaction || 0;

      // Client-side filter thêm cho các field API chưa hỗ trợ
      const normalized = txs.filter((t) => {
        const acc = t.account || {};
        const okAccountNumber = currentFilters.accountNumber
          ? String(acc.accountNumber || "")
              .toLowerCase()
              .includes(currentFilters.accountNumber.toLowerCase())
          : true;

        const okAccountName = currentFilters.accountName
          ? String(acc.accountName || "")
              .toLowerCase()
              .includes(currentFilters.accountName.toLowerCase())
          : true;

        const okBankName = currentFilters.bankName
          ? String(acc.bankName || "")
              .toLowerCase()
              .includes(currentFilters.bankName.toLowerCase())
          : true;

        return okAccountNumber && okAccountName && okBankName;
      });

      setItems(normalized);
      setPagination((prev) => ({
        ...prev,
        totalItems: total,
      }));
    } catch (err) {
      console.error("Failed to fetch withdraw requests:", err);
      setError("Không thể tải danh sách yêu cầu rút tiền. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tự fetch khi: page thay đổi hoặc debouncedFilters thay đổi
  useEffect(() => {
    fetchWithdrawRequests(pagination.page, debouncedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedFilters]);

  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit) || 1;
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const openConfirmDialog = (transactionId, type) => {
    setConfirmDialog({ isOpen: true, transactionId, type });
  };

  const handleConfirmAction = async () => {
    const { transactionId, type } = confirmDialog;
    if (!transactionId) return;

    try {
      setActionLoadingId(transactionId);

      if (type === "APPROVE") {
        const res = await confirmWithdrawAndUpdateBalance(transactionId);
        if (![200, 201].includes(res?.statusCode)) {
          throw new Error(res?.message || "Xác nhận rút tiền thất bại");
        }
      }

      if (type === "CANCEL") {
        const res = await cancelWithdrawTransaction(transactionId);
        if (![200, 201].includes(res?.statusCode)) {
          throw new Error(res?.message || "Hủy yêu cầu rút tiền thất bại");
        }
      }

      setConfirmDialog({ isOpen: false, transactionId: null, type: null });
      await fetchWithdrawRequests(pagination.page, debouncedFilters);
    } catch (err) {
      console.error("Action failed:", err);
      alert(
        err?.response?.data?.message || err?.message || "Thao tác thất bại."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "SUCCESS")
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          SUCCESS
        </Badge>
      );
    if (status === "FAILED") return <Badge variant="destructive">FAILED</Badge>;
    if (status === "EXPIRED")
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          EXPIRED
        </Badge>
      );
    if (status === "CANCELLED")
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-600">
          CANCELLED
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        PENDING
      </Badge>
    );
  };

  return (
    <div className="p-6 md:p-14">
      <div className="flex items-center justify-between gap-3 mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Quản lý yêu cầu rút tiền
        </h1>

        <div className="text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `Tổng: ${pagination.totalItems} yêu cầu`}
        </div>
      </div>

      {/* --- Filters (auto debounce) --- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Account ID (vd: 210002)"
          value={filters.accountId}
          onChange={(e) => handleFilterChange("accountId", e.target.value)}
        />
        <Input
          placeholder="Số tài khoản ngân hàng..."
          value={filters.accountNumber}
          onChange={(e) => handleFilterChange("accountNumber", e.target.value)}
        />
        <Input
          placeholder="Tên chủ tài khoản..."
          value={filters.accountName}
          onChange={(e) => handleFilterChange("accountName", e.target.value)}
        />
        <Input
          placeholder="Ngân hàng (VCB/BIDV...)"
          value={filters.bankName}
          onChange={(e) => handleFilterChange("bankName", e.target.value)}
        />

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="SUCCESS">SUCCESS</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
            <SelectItem value="EXPIRED">EXPIRED</SelectItem>
            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Loading / Error / Empty --- */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
          Không có yêu cầu rút tiền phù hợp.
        </div>
      )}

      {/* --- Table --- */}
      {!loading && !error && items.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Ví</TableHead>
                <TableHead>Ngân hàng</TableHead>
                <TableHead>Số TK</TableHead>
                <TableHead>Chủ TK</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((t) => {
                const acc = t.account || {};
                const amount =
                  extractAmountFromContent(t.transaction_content) ||
                  Math.abs(Number(t.amount_in || 0));

                const isPending = t.status === "PENDING";
                const isActionLoading = actionLoadingId === t.transactionId;

                return (
                  <TableRow key={t.transactionId}>
                    <TableCell className="font-medium">
                      {t.transactionId}
                      <div className="text-xs text-muted-foreground">
                        {t.paymentId}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium">#{acc.id || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        Balance: {formatMoney(acc.balance)} đ
                      </div>
                    </TableCell>

                    <TableCell>{acc.bankName || "N/A"}</TableCell>
                    <TableCell>{acc.accountNumber || "N/A"}</TableCell>
                    <TableCell>{acc.accountName || "N/A"}</TableCell>

                    <TableCell className="font-semibold text-red-600">
                      {formatMoney(amount)} đ
                    </TableCell>

                    <TableCell>{getStatusBadge(t.status)}</TableCell>

                    <TableCell>
                      {t.transaction_date
                        ? format(
                            new Date(t.transaction_date),
                            "dd/MM/yyyy HH:mm"
                          )
                        : t.created_at
                        ? format(new Date(t.created_at), "dd/MM/yyyy HH:mm")
                        : "N/A"}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            disabled={!isPending || isActionLoading}
                            onClick={() =>
                              openConfirmDialog(t.transactionId, "APPROVE")
                            }
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                            Xác nhận rút (Approve)
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            disabled={!isPending || isActionLoading}
                            onClick={() =>
                              openConfirmDialog(t.transactionId, "CANCEL")
                            }
                          >
                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                            Hủy yêu cầu (Cancel)
                          </DropdownMenuItem>

                          {isActionLoading && (
                            <div className="px-2 py-2 text-xs text-muted-foreground flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang xử lý...
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- Pagination --- */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {pagination.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
          >
            Trang sau
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* --- Dialog Confirm Action --- */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "APPROVE"
                ? "Xác nhận yêu cầu rút tiền?"
                : "Hủy yêu cầu rút tiền?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "APPROVE"
                ? "Hệ thống sẽ trừ số dư ví và chuyển trạng thái sang SUCCESS."
                : "Hệ thống sẽ chuyển trạng thái transaction sang CANCELLED (không trừ số dư)."}
              <div className="mt-2 text-xs text-muted-foreground">
                Transaction ID: <b>{confirmDialog.transactionId}</b>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.type === "APPROVE"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
