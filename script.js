// สร้างตัวแปรเก็บสินค้าทั้งหมด
let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

// ฟังก์ชันเพิ่มสินค้าใหม่
function addProduct(productData) {
    productData.id = Date.now().toString(); // สร้าง ID สินค้า
    productData.totalSales = 0; // กำหนดยอดขายเริ่มต้น
    inventory.push(productData);
    saveToLocalStorage();
    renderProducts(); // อัปเดตตาราง
  }

  document.getElementById("addProductForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const newProduct = {
      name: document.getElementById("productName").value,
      price: parseFloat(document.getElementById("productPrice").value),
      stock: parseInt(document.getElementById("productStock").value),
      minStock: parseInt(document.getElementById("productMinStock").value),
      category: document.getElementById("productCategory").value
    };
  
    addProduct(newProduct);
  
    // ล้างค่าในฟอร์ม
    this.reset();
  });
  
  

// ฟังก์ชันอัปเดตจำนวนสินค้า
function updateStock(productId, quantity) {
  const product = inventory.find(item => item.id === productId);
  if (product) {
    product.stock += quantity;

    // ตรวจสอบว่า stock ไม่ติดลบ
    if (product.stock < 0) {
      alert(`สินค้า ${product.name} มีจำนวนไม่พอในสต็อก!`);
      product.stock -= quantity; // ยกเลิกการอัปเดต
    } else {
      // หากขายสินค้า เพิ่มจำนวนใน totalSales
      if (quantity < 0) {
        product.totalSales += Math.abs(quantity);
      }
    }

    saveToLocalStorage(); // บันทึกข้อมูลใน Local Storage
    renderProducts(); // อัปเดตตารางสินค้า
  }
}

// ฟังก์ชันตรวจสอบสินค้าสต็อกต่ำ
function checkLowStock() {
    const alertDiv = document.getElementById("lowStockAlert");
    alertDiv.innerHTML = ""; // ล้างข้อความเก่า
  
    let lowStockItems = inventory.filter(product => product.stock <= product.minStock);
    
    if (lowStockItems.length > 0) {
      alertDiv.innerHTML = "<p>⚠️ สินค้าต่อไปนี้ใกล้หมดสต็อก:</p><ul>" + 
        lowStockItems.map(item => `<li>${item.name} (เหลือ ${item.stock})</li>`).join('') +
        "</ul>";
    }
  }
  

// ฟังก์ชันสร้างรายงานยอดขาย
function generateSalesReport() {
  console.log("รายงานยอดขาย:");
  inventory.forEach(product => {
    console.log(`${product.name}: ยอดขายรวม ${product.totalSales}`);
  });
}

// ฟังก์ชันบันทึกข้อมูลใน Local Storage
function saveToLocalStorage() {
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

// ฟังก์ชันโหลดข้อมูลจาก Local Storage
function loadFromLocalStorage() {
  inventory = JSON.parse(localStorage.getItem("inventory")) || [];
}

// ฟังก์ชันแสดงสินค้าในตาราง
function renderProducts() {
    const tableBody = document.getElementById("productTableBody");
    tableBody.innerHTML = "";
  
    inventory.forEach((product) => {
      const totalRevenue = (product.totalSales || 0) * product.price; // คำนวณราคารวมของยอดขาย
  
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price} บาท</td>
        <td>${product.stock}</td>
        <td>${product.category}</td>
        <td>${product.totalSales || 0} ชิ้น / ${totalRevenue} บาท</td>
        <td>
          <input type="number" id="sellQty-${product.id}" min="1" placeholder="จำนวน">
          <button class="sell" onclick="sellProduct('${product.id}', parseInt(document.getElementById('sellQty-${product.id}').value))">ขาย</button>
        </td>
        <td>
          <input type="number" id="addQty-${product.id}" min="1" placeholder="จำนวน">
          <button class="add-stock" onclick="addStock('${product.id}', parseInt(document.getElementById('addQty-${product.id}').value))">เพิ่มสต็อก</button>
        </td>
        <td>
          <button class="delete" onclick="deleteProduct('${product.id}')">🗑 ลบ</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  
    checkLowStock();
  }
  
  
  
  
  

// ฟังก์ชันขายสินค้า
function sellProduct(productId, quantity) {
    const product = inventory.find(item => item.id === productId);
    if (product) {
      if (product.stock >= quantity) {
        product.stock -= quantity;
        product.totalSales += quantity;
        saveToLocalStorage();
        renderProducts();
        checkLowStock();
        generateBestSellers(); // อัปเดตรายงานสินค้าขายดี
      } else {
        alert(`สินค้า ${product.name} มีจำนวนไม่พอในสต็อก!`);
      }
    }
  }
  
  

  function addStock(productId, quantity) {
    const product = inventory.find(item => item.id === productId);
    if (product) {
      product.stock += quantity;
      saveToLocalStorage();
      renderProducts();
      checkLowStock(); // เช็คสินค้าสต็อกต่ำ
    }
  }

  function generateBestSellers() {
    const bestSellersList = document.getElementById("bestSellersList");
    bestSellersList.innerHTML = ""; // ล้างข้อมูลเก่า
  
    // เรียงสินค้าตามยอดขายจากมากไปน้อย
    const sortedProducts = [...inventory].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
  
    sortedProducts.forEach(product => {
      if (product.totalSales > 0) {
        const item = document.createElement("div");
        item.classList.add("best-seller-item");
        item.innerHTML = `
          🏅 <b>${product.name}</b><br>
          <span>ขายแล้ว: ${product.totalSales} ชิ้น</span><br>
          <span>รวมเป็นเงิน: ${(product.totalSales * product.price).toLocaleString()} บาท</span>
        `;
        bestSellersList.appendChild(item);
      }
    });
  
    if (bestSellersList.innerHTML === "") {
      bestSellersList.innerHTML = "<p>ยังไม่มีสินค้าขายดี</p>";
    }
  }
  

  function deleteProduct(productId) {
    inventory = inventory.filter(product => product.id !== productId);
    saveToLocalStorage();
    renderProducts();
  }
  
  
  
  
// โหลดข้อมูลเมื่อเริ่มต้น
loadFromLocalStorage();
renderProducts();
