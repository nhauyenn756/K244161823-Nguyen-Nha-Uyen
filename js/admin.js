function loadInvoices() {
    var saved = localStorage.getItem("bw08_invoices");
    invoices = saved ? JSON.parse(saved) : [];
}
function openLogin() { document.getElementById("loginModal").classList.remove("hidden"); }
function closeLogin() { document.getElementById("loginModal").classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        var username = document.getElementById("loginUsername").value.trim();
        var password = document.getElementById("loginPassword").value;
        var found = null;
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].username == username && employees[i].password == password) {
                found = employees[i]; currentUser = found; currentUser.type = "employee"; break;
            }
        }
        if (found == null) {
            for (var j = 0; j < customers.length; j++) {
                if (customers[j].username == username && customers[j].password == password) {
                    found = customers[j]; currentUser = found; currentUser.type = "customer"; break;
                }
            }
        }
        if (found == null) {
            document.getElementById("loginError").innerHTML = "Tên đăng nhập hoặc mật khẩu không đúng.";
        } else {
            document.getElementById("loginError").innerHTML = "";
            document.getElementById("userStatus").innerHTML = found.full_name;
            closeLogin(); showToast("Đăng nhập thành công.");
            if (currentUser.type == "employee" && currentUser.position == "Sales Manager") {
                document.getElementById("adminAccess").innerHTML = "Sales Manager";
                renderAdmin();
            }
        }
    });
});

function renderAdmin() {
    var allowed = currentUser && currentUser.type == "employee" && currentUser.position == "Sales Manager";
    document.getElementById("adminLoginHint").classList.toggle("hidden", allowed);
    document.getElementById("adminDashboard").classList.toggle("hidden", !allowed);
    document.getElementById("adminAccess").innerHTML = allowed ? "Sales Manager · Được phép" : "Không có quyền";
    if (!allowed) return;
    loadInvoices();
    var revenue = 0, units = 0, sales = {};
    var html = "";
    for (var i = invoices.length - 1; i >= 0; i--) {
        var inv = invoices[i]; revenue += Number(inv.total_amount);
        html += "<tr><td>" + inv.invoice_id + "</td><td>" + new Date(inv.created_date).toLocaleDateString("vi-VN") + "</td><td>" + inv.customer_name + "</td><td>" + formatMoney(inv.total_amount) + "</td></tr>";
        for (var j = 0; j < inv.details.length; j++) {
            var d = inv.details[j]; units += Number(d.quantity);
            if (sales[d.product_name] == undefined) sales[d.product_name] = 0;
            sales[d.product_name] += Number(d.quantity);
        }
    }
    document.getElementById("statOrders").innerHTML = invoices.length;
    document.getElementById("statRevenue").innerHTML = formatMoney(revenue);
    document.getElementById("statUnits").innerHTML = units;
    document.getElementById("ordersTable").innerHTML = html || "<tr><td colspan='4'>Chưa có đơn hàng.</td></tr>";
    var names = Object.keys(sales).sort(function(a,b) { return sales[b]-sales[a]; });
    var best = "";
    for (var k = 0; k < names.length; k++) best += "<div class='best-row'><span>" + names[k] + "</span><strong>" + sales[names[k]] + " đã bán</strong></div>";
    document.getElementById("bestSellerList").innerHTML = best || "<p>Chưa có dữ liệu bán hàng.</p>";
}