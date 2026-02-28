import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDD4PDJ-2dGabACe5Tn1y4L62KRqQY2_2E",
  authDomain: "cims-project-a2ab9.firebaseapp.com",
  projectId: "cims-project-a2ab9",
  storageBucket: "cims-project-a2ab9.firebasestorage.app",
  messagingSenderId: "88316003268",
  appId: "1:88316003268:web:658e5cac8459c8b6785a91",
  measurementId: "G-J36LJTNLX9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 Set Admin Email
const adminEmail = "yennisaikumar5@gmail.com";


// 🔥 Check Admin Access
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (user.email !== adminEmail) {
    alert("Access Denied ❌");
    window.location.href = "dashboard.html";
    return;
  }

  // ✅ Load dashboard + complaints
  loadDashboardCounts();
  loadAllComplaints();
});


// 📊 Load Dashboard Counts (ALL complaints)
async function loadDashboardCounts() {

  const snapshot = await getDocs(collection(db, "complaints"));

  let total = 0;
  let pending = 0;
  let resolved = 0;

  snapshot.forEach((docItem) => {
    total++;

    if (docItem.data().status === "Pending") pending++;
    if (docItem.data().status === "Resolved") resolved++;
  });

  // Update dashboard UI
  document.getElementById("totalCount").innerText = total;
  document.getElementById("pendingCount").innerText = pending;
  document.getElementById("resolvedCount").innerText = resolved;
}


// 📋 Load ALL Complaints
async function loadAllComplaints() {

  const snapshot = await getDocs(collection(db, "complaints"));
  const container = document.getElementById("complaintsContainer");

  container.innerHTML = "";

  snapshot.forEach((docItem) => {

    const data = docItem.data();

    const buttonHTML = data.status === "Pending"
      ? `<button onclick="updateStatus('${docItem.id}')">
           Mark Resolved
         </button>`
      : "";

    container.innerHTML += `
      <div class="card">
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <p><strong>User:</strong> ${data.userEmail}</p>
        <p><strong>Building:</strong> ${data.building}</p>
        <p><strong>Room:</strong> ${data.room}</p>
        <p><strong>Priority:</strong> ${data.priority}</p>

        <p class="status ${data.status === "Resolved" ? "resolved" : "pending"}">
          ${data.status}
        </p>

        ${buttonHTML}
      </div>
    `;
  });
}


// 🔄 Update Status to Resolved
window.updateStatus = async function(id) {

  const complaintRef = doc(db, "complaints", id);

  await updateDoc(complaintRef, {
    status: "Resolved"
  });

  alert("Status Updated ✅");

  // Reload everything
  loadDashboardCounts();
  loadAllComplaints();
};