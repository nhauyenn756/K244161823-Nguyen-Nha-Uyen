function loadProducts() {
    var grid = document.getElementById("productGrid");
    var html = "";
    for (var i = 0; i < 8; i++) html += "<div class='skeleton-card'></div>";
    grid.innerHTML = html;
    document.getElementById("resultMessage").innerHTML = "Đang tải dữ liệu sản phẩm...";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    products = JSON.parse(this.responseText);
                    addProductInformation();
                    loadReviewXML();
                    renderProducts();
                    buildCategoryOptions();
                    document.getElementById("resultMessage").innerHTML =
                        "Đã tải thành công " + products.length + " sản phẩm từ Fake Store API.";
                } catch (error) {
                    document.getElementById("resultMessage").innerHTML = "Dữ liệu API không hợp lệ.";
                    grid.innerHTML = "";
                }
            } else {
                document.getElementById("resultMessage").innerHTML =
                    "Không kết nối được API. Hãy kiểm tra Internet rồi tải lại.";
                grid.innerHTML = "";
            }
        }
    };
    xhttp.open("GET", API_URL, true);
    xhttp.send();
}

function addProductInformation() {
    var colors = ["Black", "White", "Blue", "Gray", "Brown", "Red"];
    for (var i = 0; i < products.length; i++) {
        products[i].color = colors[i % colors.length];
        products[i].stock = 10 + (i * 5);
        products[i].averageRating = products[i].rating ? products[i].rating.rate : 0;
    }
}

function buildCategoryOptions() {
    var select = document.getElementById("searchCategory");
    var categories = [];
    for (var i = 0; i < products.length; i++) {
        if (categories.indexOf(products[i].category) == -1) categories.push(products[i].category);
    }
    var html = "<option value=''>Tất cả danh mục</option>";
    for (var j = 0; j < categories.length; j++) {
        html += "<option value='" + categories[j] + "'>" + categories[j] + "</option>";
    }
    select.innerHTML = html;
}

function renderProducts() {
    var list = products.slice();
    var name = document.getElementById("searchName").value.toLowerCase().trim();
    var category = document.getElementById("searchCategory").value;
    var color = document.getElementById("searchColor").value;
    var minRating = document.getElementById("searchRating").value;
    var min = document.getElementById("minPrice").value;
    var max = document.getElementById("maxPrice").value;
    if (name != "") list = list.filter(function(p) { return p.title.toLowerCase().indexOf(name) != -1; });
    if (category != "") list = list.filter(function(p) { return p.category == category; });
    if (color != "") list = list.filter(function(p) { return p.color == color; });
    if (minRating != "") list = list.filter(function(p) { return p.averageRating >= Number(minRating); });
    if (min != "") list = list.filter(function(p) { return p.price >= Number(min); });
    if (max != "") list = list.filter(function(p) { return p.price <= Number(max); });
    var sort = document.getElementById("sortProducts").value;
    if (sort == "priceAsc") list.sort(function(a,b) { return a.price-b.price; });
    if (sort == "priceDesc") list.sort(function(a,b) { return b.price-a.price; });
    if (sort == "rating") list.sort(function(a,b) { return b.averageRating-a.averageRating; });
    var html = "";
    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        html += "<article class='product-card'>";
        html += "<div class='product-image'><img src='" + p.image + "' alt='Product'>";
        html += "<span class='image-rating'>" + String.fromCharCode(9733) + " " + Number(p.averageRating).toFixed(1) + "</span></div>";
        html += "<div class='product-info'><span class='category'>" + p.category + "</span>";
        html += "<h3 class='product-title'>" + p.title + "</h3>";
        html += "<div class='rating'>" + String.fromCharCode(9733) + " " + Number(p.averageRating).toFixed(1) + " (" + (productReviews[p.id] ? productReviews[p.id].length : (p.rating ? p.rating.count : 0)) + ")</div>";
        html += "<button type='button' class='rating-detail-btn' data-id='" + p.id + "'>Rating Detail</button>";
        html += "<div class='product-price'>" + formatMoney(p.price) + "</div>";
        html += "<div class='product-extra'>Màu: " + p.color + " · Tồn kho: " + p.stock + "</div>";
        html += "<div class='product-actions'><button class='btn btn-primary btn-buy' data-id='" + p.id + "' data-variant='" + p.color + "|M'>Thêm giỏ</button>";
        html += "<button class='btn btn-outline btn-view' data-id='" + p.id + "' data-variant='" + p.color + '|M' + "'>Xem nhanh</button></div></div></article>";
    }
    document.getElementById("productGrid").innerHTML = html;
    document.getElementById("emptyMessage").classList.toggle("hidden", list.length != 0);
    document.getElementById("resultMessage").innerHTML = "Hiển thị " + list.length + " / " + products.length + " sản phẩm";
}

function resetSearch() {
    document.getElementById("searchForm").reset();
    document.getElementById("searchError").innerHTML = "";
    renderProducts();
}

document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("searchForm");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        var min = document.getElementById("minPrice").value;
        var max = document.getElementById("maxPrice").value;
        var email = document.getElementById("searchEmail").value;
        var error = "";
        if (min != "" && Number(min) < 0) error = "Giá thấp nhất không được âm.";
        else if (max != "" && Number(max) < 0) error = "Giá cao nhất không được âm.";
        else if (min != "" && max != "" && Number(min) > Number(max)) error = "Giá từ phải nhỏ hơn hoặc bằng giá đến.";
        else if (email != "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = "Email chưa đúng định dạng.";
        document.getElementById("searchError").innerHTML = error;
        if (error == "") renderProducts();
    });

    // Q4: Một Event Listener trên container xử lý các nút sản phẩm được tạo động.
    document.getElementById("productGrid").addEventListener("click", function(event) {
        var target = event.target;
        if (target.classList.contains("rating-detail-btn")) {
            showRatingDetails(Number(target.getAttribute("data-id")));
            return;
        }
        if (target.classList.contains("btn-buy") || target.classList.contains("btn-view")) {
            var id = Number(target.getAttribute("data-id"));
            var variant = target.getAttribute("data-variant").split("|");
            var product = findProduct(id);
            if (!product) return;
            if (target.classList.contains("btn-buy")) {
                addToCart(product, variant[0], variant[1]);
            } else {
                quickView(id, variant[0], variant[1]);
            }
        }
    });
});

function findProduct(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id == id) return products[i];
    return null;
}

function quickView(id, color, size) {
    var p = findProduct(id);
    if (!p) return;
    var html = "<div class='quick-view'><div><img src='" + p.image + "'></div><div>";
    html += "<span class='category'>" + p.category + "</span><h2>" + p.title + "</h2>";
    html += "<strong class='product-price'>" + formatMoney(p.price) + "</strong>";
    html += "<p>" + p.description + "</p><p>Đánh giá: ★ " + p.averageRating + " · Tồn kho: " + p.stock + "</p>";
    html += "<label>Màu sắc</label><select id='quickColor'><option>Black</option><option>White</option><option>Blue</option><option>Gray</option><option>Brown</option><option>Red</option></select>";
    html += "<label>Kích thước</label><select id='quickSize'><option>S</option><option selected>M</option><option>L</option><option>XL</option></select>";
    html += "<button class='btn btn-primary btn-block' onclick='addQuickProduct(" + p.id + ")'>Thêm vào giỏ hàng</button></div></div>";
    document.getElementById("quickViewContent").innerHTML = html;
    document.getElementById("quickColor").value = color || p.color;
    document.getElementById("quickSize").value = size || "M";
    document.getElementById("quickViewModal").classList.remove("hidden");
}
function addQuickProduct(id) {
    var p = findProduct(id);
    addToCart(p, document.getElementById("quickColor").value, document.getElementById("quickSize").value);
    closeQuickView();
}
function closeQuickView() { document.getElementById("quickViewModal").classList.add("hidden"); }

function loadReviewXML() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) return;

            var reviewNodes = xmlDoc.getElementsByTagName("review");
            var totals = {};
            productReviews = {};
            for (var i = 0; i < reviewNodes.length; i++) {
                var reviewNode = reviewNodes[i];
                var id = reviewNode.getElementsByTagName("product_id")[0].textContent;
                var rating = Number(reviewNode.getElementsByTagName("rating")[0].textContent);
                var nameNode = reviewNode.getElementsByTagName("customer_name")[0];
                var commentNode = reviewNode.getElementsByTagName("comment")[0];
                if (!isFinite(rating)) continue;
                if (totals[id] == undefined) totals[id] = {sum:0, count:0};
                if (productReviews[id] == undefined) productReviews[id] = [];
                totals[id].sum += rating;
                totals[id].count++;
                productReviews[id].push({
                    customerName: nameNode ? nameNode.textContent : "Customer",
                    rating: rating,
                    comment: commentNode ? commentNode.textContent : ""
                });
            }
            reviewRatings = {};
            for (var key in totals) reviewRatings[key] = totals[key].sum / totals[key].count;
            for (var j = 0; j < products.length; j++) {
                if (reviewRatings[products[j].id] != undefined) products[j].averageRating = reviewRatings[products[j].id];
            }
            renderProducts();
        }
    };
    xhttp.open("GET", REVIEW_XML_URL, true);
    xhttp.send();
}

function showRatingDetails(id) {
    var product = findProduct(id);
    if (!product) return;
    var title = document.getElementById("ratingDetailTitle");
    var content = document.getElementById("ratingDetailContent");
    var reviews = productReviews[id] || [];
    title.textContent = "Rating Detail - " + product.title;
    content.innerHTML = "";
    if (reviews.length == 0) {
        var empty = document.createElement("p");
        empty.textContent = "No customer reviews are available for this product.";
        content.appendChild(empty);
    }
    for (var i = 0; i < reviews.length; i++) {
        var entry = document.createElement("article");
        entry.className = "review-entry";
        var head = document.createElement("div");
        head.className = "review-entry-head";
        var customer = document.createElement("strong");
        customer.textContent = reviews[i].customerName;
        var rating = document.createElement("span");
        rating.className = "review-entry-rating";
        rating.textContent = String.fromCharCode(9733) + " " + reviews[i].rating + " / 5";
        var comment = document.createElement("p");
        comment.textContent = reviews[i].comment;
        head.appendChild(customer);
        head.appendChild(rating);
        entry.appendChild(head);
        entry.appendChild(comment);
        content.appendChild(entry);
    }
    document.getElementById("ratingDetailModal").classList.remove("hidden");
}

function closeRatingDetails() {
    document.getElementById("ratingDetailModal").classList.add("hidden");
}

function exportProductsXML() {
    if (products.length == 0) { showToast("Hãy tải sản phẩm trước khi xuất XML."); return; }
    var xmlDoc = document.implementation.createDocument("", "products", null);
    var root = xmlDoc.documentElement;
    function addNode(parent, name, value) {
        var node = xmlDoc.createElement(name);
        node.textContent = value == undefined ? "" : value;
        parent.appendChild(node);
        return node;
    }
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var node = xmlDoc.createElement("product");
        addNode(node,"id",p.id); addNode(node,"title",p.title); addNode(node,"price",p.price);
        addNode(node,"description",p.description); addNode(node,"category",p.category);
        addNode(node,"image",p.image); addNode(node,"color",p.color); addNode(node,"stock",p.stock);
        var rating = xmlDoc.createElement("rating");
        addNode(rating,"rate",p.averageRating); addNode(rating,"count",p.rating ? p.rating.count : 0);
        node.appendChild(rating); root.appendChild(node);
    }
    var xmlString = new XMLSerializer().serializeToString(xmlDoc);
    var blob = new Blob(["<?xml version='1.0' encoding='UTF-8'?>\n" + xmlString], {type:"application/xml"});
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a"); link.href = url; link.download = "products.xml";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Đã xuất products.xml. Hãy chuyển file vào thư mục data nếu cần lưu trong project.");
}