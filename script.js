const API_BASE_URL = "https://67751de992222241481aae28.mockapi.io/api";

// Fetch cars from API
async function fetchCars() {
  try {
    const response = await fetch(`${API_BASE_URL}/cars`);
    const cars = await response.json();
    return cars;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

// Render cars function (keeps the same UI)
async function renderCars() {
  const carsGrid = document.getElementById("carsGrid");
  if (!carsGrid) return;

  try {
    const cars = await fetchCars();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isAdmin = currentUser?.role === 1;

    const carsHTML = cars
      .map(
        (car) => `
      <div class="car-card" data-car-id="${car.id}">
        <img src="${car.image}" alt="${car.name}" />
        <div class="car-details">
          <h3>${car.name}</h3>
          <p class="price">PKR ${car.price} / Day</p>
          <div class="car-features">
            <span><i class="fas fa-calendar-alt"></i> Model ${car.model}</span>
            <span><i class="fas fa-cog"></i> ${car.transmission}</span>
            <span><i class="fas fa-tachometer-alt"></i> ${car.mileage}</span>
          </div>
          ${
            isAdmin
              ? `
            <div class="car-buttons">
              <button class="edit-btn" onclick="editCar(${car.id})">Edit</button>
              <button class="delete-btn" onclick="deleteCar(${car.id})">Delete</button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    carsGrid.innerHTML = carsHTML;
  } catch (error) {
    console.error("Error rendering cars:", error);
    carsGrid.innerHTML = "<p>Error loading cars. Please try again later.</p>";
  }
}

// Authentication functions
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const users = await response.json();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...userData,
        role: 2,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    return null;
  }
}

// Admin functions
async function editCar(carId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser?.role !== 1) return;

  try {
    const car = await fetch(`${API_BASE_URL}/cars/${carId}`).then((r) =>
      r.json()
    );
    openEditCarModal(car);
    alert("Edit the car details and save your changes");
  } catch (error) {
    console.error("Error fetching car details:", error);
    alert("Error loading car details. Please try again.");
  }
}

async function deleteCar(carId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser?.role !== 1) return;

  if (
    confirm(
      "Are you sure you want to delete this car? This action cannot be undone."
    )
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Car successfully deleted!");
        renderCars(); // Refresh the display
      } else {
        alert("Error deleting car. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      alert("Error deleting car. Please try again.");
    }
  }
}

// Add these functions at the beginning of script.js
function updateNavbar() {
  const nav = document.querySelector("nav ul");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    // Replace login link with user info and logout
    const loginLink = nav.querySelector('a[href="login.html"]').parentElement;
    loginLink.innerHTML = `
      <div class="user-nav">
        <span>Welcome, ${currentUser.name}</span>
        <a href="#" onclick="logout(event)">Logout</a>
      </div>
    `;
  }
}

function logout(event) {
  event.preventDefault();
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// Add this function to display random cars on home page
async function displayHotOffers() {
  const hotOffersGrid = document.getElementById("hotOffersGrid");
  if (!hotOffersGrid) return;

  try {
    const cars = await fetchCars();
    // Get 3 random cars
    const randomCars = cars.sort(() => 0.5 - Math.random()).slice(0, 3);

    const offersHTML = randomCars
      .map(
        (car) => `
      <div class="car-card">
        <img src="${car.image}" alt="${car.name}" />
        <div class="car-details">
          <h3>${car.name}</h3>
          <p class="price">PKR ${car.price} / Day</p>
          <div class="car-features">
            <span><i class="fas fa-calendar-alt"></i> Model ${car.model}</span>
            <span><i class="fas fa-cog"></i> ${car.transmission}</span>
            <span><i class="fas fa-tachometer-alt"></i> ${car.mileage}</span>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    hotOffersGrid.innerHTML = offersHTML;
  } catch (error) {
    console.error("Error displaying hot offers:", error);
    hotOffersGrid.innerHTML =
      "<p>Error loading hot offers. Please try again later.</p>";
  }
}

// Car management functions
function openAddCarModal() {
  const modal = document.getElementById("carModal");
  const form = document.getElementById("carForm");
  const modalTitle = document.getElementById("modalTitle");

  if (!modal || !form || !modalTitle) {
    console.error("Required modal elements not found");
    return;
  }

  modalTitle.textContent = "Add New Car";
  form.reset();
  document.getElementById("carId").value = ""; // Clear any existing ID
  modal.style.display = "block";
}

function openEditCarModal(car) {
  const modal = document.getElementById("carModal");
  const form = document.getElementById("carForm");
  const modalTitle = document.getElementById("modalTitle");

  if (!modal || !form || !modalTitle) {
    console.error("Required modal elements not found");
    return;
  }

  modalTitle.textContent = "Edit Car";

  // Fill form with car data
  document.getElementById("carId").value = car.id;
  document.getElementById("name").value = car.name;
  document.getElementById("price").value = car.price;
  document.getElementById("image").value = car.image;
  document.getElementById("model").value = car.model;
  document.getElementById("transmission").value = car.transmission;
  document.getElementById("mileage").value = car.mileage;

  modal.style.display = "block";
}

// Add function to show user details in About page
function showUserDetails() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userDetailsContainer = document.getElementById("userDetails");

  if (currentUser && userDetailsContainer) {
    userDetailsContainer.innerHTML = `
      <div class="user-profile">
        <h2>User Profile</h2>
        <div class="user-info">
          <p><strong>Name:</strong> ${currentUser.name}</p>
          <p><strong>Email:</strong> ${currentUser.email}</p>
          <p><strong>Phone:</strong> ${currentUser.phone}</p>
          <p><strong>Role:</strong> ${
            currentUser.role === 1 ? "Admin" : "User"
          }</p>
        </div>
      </div>
    `;
  }
}

// Function to add a new car
async function addCar(carData) {
  try {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: carData.name,
        price: carData.price,
        image: carData.image,
        model: carData.model,
        transmission: carData.transmission,
        mileage: carData.mileage,
      }),
    });

    if (response.ok) {
      alert("Car added successfully!");
      renderCars(); // Refresh the car list
      return true;
    } else {
      throw new Error("Failed to add car");
    }
  } catch (error) {
    console.error("Error adding car:", error);
    alert("Failed to add car. Please try again.");
    return false;
  }
}

// Function to update an existing car
async function updateCar(carId, carData) {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: carData.name,
        price: carData.price,
        image: carData.image,
        model: carData.model,
        transmission: carData.transmission,
        mileage: carData.mileage,
      }),
    });

    if (response.ok) {
      alert("Car updated successfully!");
      renderCars(); // Refresh the car list
      return true;
    } else {
      throw new Error("Failed to update car");
    }
  } catch (error) {
    console.error("Error updating car:", error);
    alert("Failed to update car. Please try again.");
    return false;
  }
}

// Update the car form submission handler
async function handleCarFormSubmit(event) {
  event.preventDefault();

  try {
    const carData = {
      name: document.getElementById("name").value,
      price: document.getElementById("price").value,
      image: document.getElementById("image").value,
      model: document.getElementById("model").value,
      transmission: document.getElementById("transmission").value,
      mileage: document.getElementById("mileage").value,
    };

    const carId = document.getElementById("carId").value;
    let response;

    if (carId) {
      // Update existing car
      response = await fetch(`${API_BASE_URL}/cars/${carId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });
    } else {
      // Add new car
      response = await fetch(`${API_BASE_URL}/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });
    }

    if (response.ok) {
      const action = carId ? "updated" : "added";
      alert(`Car successfully ${action}!`);
      document.getElementById("carModal").style.display = "none";
      renderCars(); // Refresh the car list
    } else {
      throw new Error(`Failed to ${carId ? "update" : "add"} car`);
    }
  } catch (error) {
    console.error("Error handling car form:", error);
    alert("Failed to save car. Please try again.");
  }
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isLoginPage = window.location.pathname.includes("login.html");

  // Redirect to login if not logged in (except for login/signup pages)
  if (
    !currentUser &&
    !isLoginPage &&
    !window.location.pathname.includes("signup.html")
  ) {
    window.location.href = "login.html";
    return;
  }

  // Update navbar
  updateNavbar();

  // Handle login form if on login page
  const loginForm = document.querySelector(".auth-form");
  if (loginForm && isLoginPage) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;
      const rememberMe = this.querySelector('input[type="checkbox"]').checked;

      const success = await loginUser(email, password);
      if (success) {
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert("Invalid email or password!");
      }
    });
  }

  // Handle signup form if on signup page
  const signupForm = document.querySelector(".auth-form");
  if (signupForm && window.location.pathname.includes("signup.html")) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const userData = {
        name: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        phone: this.querySelector('input[type="tel"]').value,
        password: this.querySelectorAll('input[type="password"]')[0].value,
      };

      const confirmPassword = this.querySelectorAll('input[type="password"]')[1]
        .value;

      if (userData.password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const newUser = await registerUser(userData);
      if (newUser) {
        alert("Signup successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert("Registration failed. Please try again.");
      }
    });
  }

  // Handle cars page functionality
  if (window.location.pathname.includes("cars.html")) {
    renderCars();

    const searchInput = document.getElementById("carSearch");
    if (searchInput) {
      searchInput.addEventListener("input", async (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const cars = await fetchCars();
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const isAdmin = currentUser?.role === 1;

        const filteredCars = cars.filter(
          (car) =>
            car.name.toLowerCase().includes(searchTerm) ||
            car.price.toString().includes(searchTerm) ||
            car.transmission.toLowerCase().includes(searchTerm) ||
            car.mileage.toLowerCase().includes(searchTerm)
        );

        const carsGrid = document.getElementById("carsGrid");
        if (filteredCars.length === 0) {
          showNoResultsMessage(true);
        } else {
          showNoResultsMessage(false);
          const filteredHTML = filteredCars
            .map(
              (car) => `
            <div class="car-card" data-car-id="${car.id}">
              <img src="${car.image}" alt="${car.name}" />
              <div class="car-details">
                <h3>${car.name}</h3>
                <p class="price">PKR ${car.price} / Day</p>
                <div class="car-features">
                  <span><i class="fas fa-calendar-alt"></i> Model ${
                    car.model
                  }</span>
                  <span><i class="fas fa-cog"></i> ${car.transmission}</span>
                  <span><i class="fas fa-tachometer-alt"></i> ${
                    car.mileage
                  }</span>
                </div>
                ${
                  isAdmin
                    ? `
                  <div class="car-buttons">
                    <button class="edit-btn" onclick="editCar(${car.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteCar(${car.id})">Delete</button>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `
            )
            .join("");

          carsGrid.innerHTML = filteredHTML;
        }
      });
    }
  }

  // Handle home page hot offers
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    displayHotOffers();
  }

  // Show admin controls if user is admin
  const adminControls = document.getElementById("adminControls");
  if (adminControls && currentUser?.role === 1) {
    adminControls.style.display = "block";
  }

  // Modal close button
  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.onclick = function () {
      document.getElementById("carModal").style.display = "none";
    };
  }

  // Car form handling
  const carForm = document.getElementById("carForm");
  if (carForm) {
    carForm.addEventListener("submit", handleCarFormSubmit);
    console.log("Car form handler attached");
  }

  // Close modal when clicking outside
  window.onclick = function (event) {
    const modal = document.getElementById("carModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Show user details if on about page
  if (window.location.pathname.includes("about.html")) {
    showUserDetails();
  }

  // Debug log
  console.log("Current user:", currentUser);
  console.log("Admin controls:", adminControls);
});
