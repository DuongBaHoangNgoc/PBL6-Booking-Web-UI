import { useState, useEffect, useMemo } from "react";
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
  UserX,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { filterUsers, updateUser, deleteUser } from "@/api/user";
import { useDebounce } from "@/hook/useDebounce"; // ✅ thêm debounce

// Hàm tiện ích viết hoa chữ cái đầu
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  // ✅ localFilters để nhập realtime
  const [localFilters, setLocalFilters] = useState({
    fullName: "",
    email: "",
    role: "all",
    isActive: "all",
  });

  // ✅ filters đã debounce
  const debouncedFilters = useDebounce(localFilters, 500);

  // State cho dialog xác nhận xóa
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
  });

  // Hàm gọi API chính
  const fetchUsers = async (
    page = pagination.page,
    currentFilters = debouncedFilters
  ) => {
    try {
      setLoading(true);
      setError(null);

      const isActiveParam =
        currentFilters.isActive === "all"
          ? undefined
          : currentFilters.isActive === "y"
          ? "y"
          : currentFilters.isActive === "n"
          ? "n"
          : undefined;

      const params = {
        page,
        limit: pagination.limit,
        fullName: currentFilters.fullName || undefined,
        email: currentFilters.email || undefined,
        role: currentFilters.role === "all" ? undefined : currentFilters.role,
        isActive: isActiveParam,
      };

      const data = await filterUsers(params);

      setUsers(data.items || []);
      setPagination((prev) => ({
        ...prev,
        page,
        totalItems: data.totalItems || 0,
      }));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ debounce thay nút lọc: cứ đổi debouncedFilters hoặc page => fetch
  useEffect(() => {
    fetchUsers(pagination.page, debouncedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedFilters]);

  // ✅ đổi filter => auto về trang 1
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedFilters]);

  // Xử lý khi thay đổi filter input
  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Xử lý phân trang
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Xử lý các Action (Khóa, Đổi quyền, Xóa)
  const handleToggleActive = async (user) => {
    try {
      const newStatus = user.isActive === "y" ? "n" : "y";
      await updateUser(user.userId, { isActive: newStatus });
      fetchUsers(); // tải lại
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    try {
      await updateUser(user.userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Failed to change user role:", err);
      alert("Thay đổi quyền thất bại.");
    }
  };

  const openDeleteDialog = (userId) => {
    setDeleteDialog({ isOpen: true, userId });
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(deleteDialog.userId);
      setDeleteDialog({ isOpen: false, userId: null });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Xóa người dùng thất bại.";
      alert(errorMessage);
      setDeleteDialog({ isOpen: false, userId: null });
    }
  };

  return (
    <div className="p-6 md:p-14">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Quản lý Người dùng
      </h1>

      {/* ✅ --- Thanh Filter (bỏ nút Lọc) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Tìm theo Tên..."
          value={localFilters.fullName}
          onChange={(e) => handleFilterChange("fullName", e.target.value)}
        />
        <Input
          placeholder="Tìm theo Email..."
          value={localFilters.email}
          onChange={(e) => handleFilterChange("email", e.target.value)}
        />
        <Select
          value={localFilters.role}
          onValueChange={(value) => handleFilterChange("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo Quyền" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Quyền</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={localFilters.isActive}
          onValueChange={(value) => handleFilterChange("isActive", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Trạng thái</SelectItem>
            <SelectItem value="y">Đã Kích hoạt (Verified)</SelectItem>
            <SelectItem value="n">Đã Khóa (Locked)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Bảng Dữ liệu --- */}
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

      {!loading && !error && users.length === 0 && (
        <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
          Không tìm thấy người dùng nào.
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Quyền</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isActive === "y" ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        Đã Kích hoạt
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Đã Khóa</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={user.role === "admin" ? "bg-primary" : ""}
                    >
                      {capitalize(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                  <TableCell>
                    {user.createDate
                      ? format(new Date(user.createDate), "dd/MM/yyyy")
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
                        {user.role === "user" ? (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "admin")}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Nâng lên Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "user")}
                          >
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Hạ xuống User
                          </DropdownMenuItem>
                        )}
                        {user.isActive === "y" ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Mở khóa tài khoản
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(user.userId)}
                        >
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- Phân trang --- */}
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
            Trang {pagination.page} trên {totalPages}
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

      {/* --- Dialog Xóa --- */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog({ ...deleteDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh
              viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteUser}
            >
              Xác nhận Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
