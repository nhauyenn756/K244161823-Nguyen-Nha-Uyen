var API_URL = "https://fakestoreapi.com/products";
var PRODUCT_XML_URL = "data/products.xml";
var REVIEW_XML_URL = "data/reviews.xml";
var EMPLOYEE_JSON_URL = "data/employees.json";
var CUSTOMER_JSON_URL = "data/customers.json";
var CART_XML_URL = "data/carts.xml";

var products = [];
var cart = {};
var employees = [];
var customers = [];
var currentUser = null;
var invoices = [];
var reviewRatings = {};var productReviews = {};
