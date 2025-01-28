exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("vendors")
    .del()
    .then(function () {
      return knex("vendors").insert([
        {
          vendor_name: "Zepto ",
          contact_name: "sai",
          address: "hyderabad",
          city: "nampally",
          postal_code: "500000",
          country: "india",
          phone: "1234567890",
          status: "1",
        },
        {
          vendor_name: "Blinkit ",
          contact_name: "dhoni",
          address: "hyderabad",
          city: "madhapur",
          postal_code: "509876",
          country: "India",
          phone: "9876543210",
          status: "1",
        },
        {
          vendor_name: "Swiggy ",
          contact_name: "Patel",
          address: "Hyderabad",
          city: "miyapur",
          postal_code: "345671",
          country: "India",
          phone: "1112223333",
          status: "1",
        },
        {
          vendor_name: "Groceries ",
          contact_name: "xyz",
          address: "345 hjk",
          city: "xb",
          postal_code: "73301",
          country: "India",
          phone: "5555555555",
          status: "1",
        },
      ]);
    });
};
