/*********************************************************************************
* WEB422 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Amirreza Allahdad Student ID: 139974182 Date: Jan 31, 2020
*
*
********************************************************************************/
const perPage = 10;
let saleData = [];
let page = 1;
//Template for the main table
const saleTableTemplate = _.template(`
    <% _.forEach(saleData, function(data) { %>
        <tr data-id=<%- data._id %>>
            <td><%- data.customer.email %></td>
            <td><%- data.storeLocation %></td>
            <td><%- data.items.length %></td>
            <td><%- moment.utc(data.saleDate).local().format("LLLL") %></td>
        </tr>
    <% }); %>`
);
//Template for the modal window
const saleModelBodyTemplate = _.template(`
    <h4>Customer</h4>
    <strong>email: </strong> <%- obj.customer.email %><br>
    <strong>age: </strong> <%- obj.customer.age %><br>
    <strong>satisfaction: </strong> <%- obj.customer.satisfaction %> / 5
    <br><br>
    <h4>Items: $<%- obj.total.toFixed(2) %></h4>
    <table class="table">
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            <% _.forEach(obj.items, function(data) { %>
                <tr data-id=<%- data._id %>>
                    <td><%- data.name %></td>
                    <td><%- data.quantity %></td>
                    <td>$<%- data.price %></td>
                </tr>
            <% }); %>
        </tbody>
    </table>`
);

function loadSaleData() {
    fetch(`http://salty-brook-46260.herokuapp.com/api/sales?page=${page}&perPage=${perPage}`)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            saleData = data;
            let saleTable = saleTableTemplate(saleData);
            $("#sale-table tbody").html(saleTable);
            $("#current-page").html(page);
        })
}

$(function() {
    loadSaleData();
    $("#sale-table tbody").on("click","tr",function() {
        let clickedId  = $(this).attr("data-id");
        let clickedSale = _.find(saleData, function (data) {
            return data._id == clickedId;
        })
        clickedSale.total = 0;

        for (let i = 0; i < clickedSale.items.length; i++) {
            clickedSale.total += clickedSale.items[i].price * clickedSale.items[i].quantity;
        }
        $("#sale-modal h4").html(`Sale: ${clickedSale._id}`);
        $("#modal-body").html(saleModelBodyTemplate(clickedSale));
        $('#sale-modal').modal( {keyboard: false, backdrop: 'static'});
    });

    $("#previous-page").on("click", function(e) {
        if (page > 1) {
            page--;
            loadSaleData();
        } 
    });

    $("#next-page").on("click", function(e) {
        page++;
        loadSaleData();
    });
    
});


