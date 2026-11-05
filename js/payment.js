function closeCheckout() { document.getElementById("checkoutModal").classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", function() {
    loadCartOnStart();
    document.getElementById("checkoutForm").addEventListener("submit", function(event) {
        event.preventDefault();
        if (!validateCheckout()) return;
        completePayment();
    });
});

function validateCheckout() {
    var name = document.getElementById("fullName").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var email = document.getElementById("email").value.trim();
    var address = document.getElementById("address").value.trim();
    var valid = true;
    document.getElementById("nameError").innerHTML = "";
    document.getElementById("phoneError").innerHTML = "";
    document.getElementById("emailError").innerHTML = "";
    document.getElementById("addressError").innerHTML = "";
    if (name.length < 2) { document.getElementById("nameError").innerHTML = "Vui lòng nhập họ tên hợp lệ."; valid = false; }
    if (!/^(0|\+84)[0-9]{9}$/.test(phone)) { document.getElementById("phoneError").innerHTML = "Số điện thoại cần có 10 số, bắt đầu bằng 0 hoặc +84."; valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById("emailError").innerHTML = "Email không đúng định dạng."; valid = false; }
    if (address.length < 5) { document.getElementById("addressError").innerHTML = "Vui lòng nhập địa chỉ chi tiết."; valid = false; }
    return valid;
}

function completePayment() {
    var details = [];
    for (var key in cart) {
        var item = cart[key];
        details.push({product_id:item.id, product_name:item.name, color:item.color, size:item.size,
            quantity:item.quantity, unit_price:item.price, subtotal:item.price * item.quantity});
    }
    var invoice = {
        invoice_id:"HD" + new Date().getTime(),
        created_date:new Date().toISOString(),
        employee_id:currentUser && currentUser.type == "employee" ? currentUser.employee_id : "ONLINE",
        customer_id:currentUser && currentUser.type == "customer" ? currentUser.customer_id : "GUEST",
        customer_name:document.getElementById("fullName").value.trim(),
        phone:document.getElementById("phone").value.trim(),
        email:document.getElementById("email").value.trim(),
        address:document.getElementById("address").value.trim(),
        details:details,
        total_amount:getCartTotal()
    };
    invoices.push(invoice);
    localStorage.setItem("bw08_invoices", JSON.stringify(invoices));
    cart = {};
    saveCart(); updateCartView();
    document.getElementById("checkoutForm").reset();
    closeCheckout();
    showToast("Thanh toán mô phỏng thành công! Mã đơn: " + invoice.invoice_id);
    renderAdmin();
}