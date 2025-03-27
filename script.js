const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const checkButton = document.getElementById('check');
const solveButton = document.getElementById('solve'); // Add a "Solve" button in HTML

// --- Helper Functions ---
function store(key, value) {
  localStorage.setItem(key, value);
}

function retrieve(key) {
  return localStorage.getItem(key);
}

function clearStorage() {
  localStorage.clear();
}

function getRandom3DigitNumber() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

// --- SHA256 Hashing ---
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getStoredOrNewHash() {
  let cachedHash = retrieve('sha256');
  if (!cachedHash) {
    const randomNum = getRandom3DigitNumber();
    cachedHash = await sha256(randomNum.toString());
    store('sha256', cachedHash);
  }
  return cachedHash;
}

// --- UI Updates ---
async function updateHashDisplay() {
  sha256HashView.textContent = 'Calculating...';
  const hash = await getStoredOrNewHash();
  sha256HashView.textContent = hash;
}

// --- Guess Validation ---
async function checkGuess() {
  const pin = pinInput.value.trim();

  if (pin.length !== 3 || !/^\d+$/.test(pin)) {
    resultView.textContent = '💡 Enter a 3-digit number!';
    resultView.className = 'error';
    resultView.classList.remove('hidden');
    return;
  }

  const targetHash = sha256HashView.textContent;
  const hashedPin = await sha256(pin);

  if (hashedPin === targetHash) {
    resultView.textContent = '🎉 Success!';
    resultView.className = 'success';
  } else {
    resultView.textContent = '❌ Failed. Try again!';
    resultView.className = 'error';
  }
  resultView.classList.remove('hidden');
}

// --- Brute-Force Solver (Educational) ---
async function bruteForceSolve() {
  const targetHash = sha256HashView.textContent;
  resultView.textContent = '🔍 Solving...';
  resultView.className = '';
  resultView.classList.remove('hidden');

  for (let i = MIN; i <= MAX; i++) {
    const currentHash = await sha256(i.toString());
    if (currentHash === targetHash) {
      resultView.textContent = `✅ Solved! Number: ${i}`;
      resultView.className = 'success';
      pinInput.value = i; // Auto-fill the solution
      return;
    }
  }

  resultView.textContent = '❌ No solution found (unlikely!)';
  resultView.className = 'error';
}

// --- Event Listeners ---
pinInput.addEventListener('input', (e) => {
  pinInput.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

checkButton.addEventListener('click', checkGuess);
solveButton?.addEventListener('click', bruteForceSolve); // Optional: Add a "Solve" button

// --- Initialize ---
updateHashDisplay();