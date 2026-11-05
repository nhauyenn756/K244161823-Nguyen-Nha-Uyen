function cartKey(id, color, size) { return id + "_" + color + "_" + size; }

function addToCart(product, color, size) {
    if (!product) return;
    var key = cartKey(product.id, color, size);
    if (cart[key] != undefined) {
        if (cart[key].quantity >= product.stock) { showToast("Đã đạt số lượng tồn kho."); return; }
        cart[key].quantity++;
    } else {
        cart[key] = {id:product.id, name:product.title, price:Number(product.price),
            quantity:1, color:color, size:size, image:product.image, stock:product.stock};
    }
    saveCart(); updateCartView(); showToast("Đã thêm sản phẩm vào giỏ hàng.");
}

function changeCartQuantity(key, amount) {
    if (!cart[key]) return;
    cart[key].quantity += amount;
    if (cart[key].quantity <= 0) delete cart[key];
    else if (cart[key].quantity > cart[key].stock) { cart[key].quantity = cart[key].stock; showToast("Vượt quá tồn kho."); }
    saveCart(); updateCartView();
}
function removeCartItem(key) { delete cart[key]; saveCart(); updateCartView(); }
function getCartTotal() {
    var total = 0;
    for (var key in cart) total += cart[key].price * cart[key].quantity;
    return total;
}
function getCartQuantity() {
    var total = 0;
    for (var key in cart) total += cart[key].quantity;
    return total;
}
function saveCart() { localStorage.setItem("bw08_cart", JSON.stringify(cart)); }
function loadCart() {
    var saved = localStorage.getItem("bw08_cart");
    if (saved != null) { try { cart = JSON.parse(saved); } catch(e) { cart = {}; } }
}
function updateCartView() {
    var count = getCartQuantity();
    document.getElementById("cartCount").innerHTML = count;
    var html = "";
    for (var key in cart) {
        var item = cart[key];
        html += "<div class='mini-cart-row'><div><strong>" + item.name + "</strong><small>" + item.color + " / " + item.size + " · " + formatMoney(item.price) + "</small>";
        html += "<button class='btn btn-ghost' onclick=\"changeCartQuantity('" + key + "',-1)\">−</button> " + item.quantity + " <button class='btn btn-ghost' onclick=\"changeCartQuantity('" + key + "',1)\">+</button>";
        html += "</div><button class='icon-btn' onclick=\"removeCartItem('" + key + "')\">×</button></div>";
    }
    if (count == 0) html = "<p class='empty-state'>Giỏ hàng đang trống.</p>";
    document.getElementById("miniCartItems").innerHTML = html;
    document.getElementById("miniCartTotal").innerHTML = formatMoney(getCartTotal());
    document.getElementById("checkoutTotal").innerHTML = formatMoney(getCartTotal());
}
function toggleMiniCart() {
    document.getElementById("miniCart").classList.toggle("hidden");
}
function openCheckout() {
    if (getCartQuantity() == 0) { showToast("Giỏ hàng đang trống."); return; }
    document.getElementById("miniCart").classList.add("hidden");
    document.getElementById("checkoutModal").classList.remove("hidden");
}
function loadCartOnStart() { loadCart(); updateCartView(); }