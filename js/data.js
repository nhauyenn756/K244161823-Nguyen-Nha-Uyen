function loadJSON(url, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    callback(null, JSON.parse(this.responseText));
                } catch (error) {
                    callback(error, null);
                }
            } else {
                callback(new Error("Không đọc được " + url), null);
            }
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function loadLocalAccounts() {
    loadJSON(EMPLOYEE_JSON_URL, function(error, data) {
        if (!error) employees = data;
    });
    loadJSON(CUSTOMER_JSON_URL, function(error, data) {
        if (!error) customers = data;
    });
}

function showToast(message) {
    var toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.classList.remove("hidden");
    setTimeout(function() {
        toast.classList.add("hidden");
    }, 2500);
}

function formatMoney(value) {
    return Number(value).toLocaleString("vi-VN") + " đ";
}

function showSection(id) {
    document.getElementById("productsSection").classList.add("hidden");
    document.getElementById("adminSection").classList.add("hidden");
    document.getElementById(id).classList.remove("hidden");
    if (id == "adminSection") renderAdmin();
}

window.onload = function() {
    loadLocalAccounts();
    loadInvoices();
    loadProducts();
    updateCartView();
};