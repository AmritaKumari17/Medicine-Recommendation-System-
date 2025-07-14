// Global Variables
let medicineData = [];
let filteredData = [];
let currentView = 'grid';
let isVoiceSearchActive = false;

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const medicineSearch = document.getElementById('medicineSearch');
const searchSuggestions = document.getElementById('searchSuggestions');
const categoryFilter = document.getElementById('categoryFilter');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const totalMedicines = document.getElementById('totalMedicines');
const totalCategories = document.getElementById('totalCategories');
const voiceSearch = document.getElementById('voiceSearch');

// Modal Elements
const medicineModal = document.getElementById('medicineModal');
const addMedicineModal = document.getElementById('addMedicineModal');
const aboutModal = document.getElementById('aboutModal');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadMedicineData();
});

// Initialize Application
function initializeApp() {
    // Hide loading screen after a delay
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Initialize navigation
    setupNavigation();
    
    // Initialize voice search if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setupVoiceSearch();
    } else {
        voiceSearch.style.display = 'none';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Search functionality
    medicineSearch.addEventListener('input', handleSearchInput);
    medicineSearch.addEventListener('focus', showSuggestions);
    medicineSearch.addEventListener('blur', hideSuggestions);
    
    // Category filter
    categoryFilter.addEventListener('change', filterByCategory);
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', toggleView);
    });
    
    // Modal close events
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeModals);
    });
    
    // Add medicine form
    document.getElementById('addMedicineForm').addEventListener('submit', handleAddMedicine);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Database actions
    document.getElementById('addMedicineBtn').addEventListener('click', () => openAddMedicineModal());
    document.getElementById('exportDataBtn').addEventListener('click', exportDatabase);
    document.getElementById('importDataBtn').addEventListener('click', importDatabase);
}

// Setup Navigation
function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

// Update Active Navigation Link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Handle Navigation
function handleNavigation(e) {
    e.preventDefault();
    const target = e.target.getAttribute('href');
    if (target.startsWith('#')) {
        const section = document.querySelector(target);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Load Medicine Data
async function loadMedicineData() {
    try {
        // Use sample data as primary source
        medicineData = getSampleMedicineData();
        
        // Process and display data
        processData();
        updateStats();
        populateCategoryFilter();
        displayAllMedicines();
        
        showToast('Sample database loaded. Upload your Excel file to add more medicines.', 'info');
    } catch (error) {
        console.error('Error loading medicine data:', error);
        medicineData = getSampleMedicineData();
        processData();
        updateStats();
        populateCategoryFilter();
        displayAllMedicines();
        
        showToast('Sample data loaded. Upload your Excel file for full database.', 'info');
    }
}

// Get Sample Medicine Data
function getSampleMedicineData() {
    return [
        {
            Drug_Name: "Paracetamol",
            Category: "Analgesic",
            Overview: "Paracetamol is a widely used over-the-counter pain reliever and fever reducer. It's one of the most commonly used medications worldwide and is considered safe when used as directed.",
            Usage: "Take orally with or without food. Can be used for headaches, muscle aches, arthritis, backaches, toothaches, colds, and fevers.",
            Dosage: "Adults: 500-1000mg every 4-6 hours. Maximum 4000mg per day. Children: 10-15mg/kg every 4-6 hours.",
            Side_Effects: "Generally well tolerated. Rare side effects include skin rash, blood disorders, and liver damage with overdose."
        },
        {
            Drug_Name: "Aspirin",
            Category: "Analgesic",
            Overview: "Aspirin is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation. It also has blood-thinning properties.",
            Usage: "Used for pain relief, fever reduction, and cardiovascular protection. Take with food to reduce stomach irritation.",
            Dosage: "Pain relief: 325-650mg every 4 hours. Cardiovascular protection: 75-100mg daily. Maximum 4000mg per day.",
            Side_Effects: "Stomach irritation, bleeding, allergic reactions. Not suitable for children due to Reye's syndrome risk."
        },
        {
            Drug_Name: "Amoxicillin",
            Category: "Antibiotic",
            Overview: "Amoxicillin is a penicillin-type antibiotic used to treat various bacterial infections. It works by stopping the growth of bacteria.",
            Usage: "Used to treat infections of the ear, nose, throat, urinary tract, and skin. Must complete full course even if feeling better.",
            Dosage: "Adults: 250-500mg every 8 hours or 500-875mg every 12 hours. Children: 20-40mg/kg/day divided into doses.",
            Side_Effects: "Nausea, vomiting, diarrhea, stomach pain, allergic reactions. Serious allergic reactions require immediate medical attention."
        },
        {
            Drug_Name: "Ibuprofen",
            Category: "Anti-inflammatory",
            Overview: "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that reduces pain, fever, and inflammation by blocking certain enzymes.",
            Usage: "Effective for headaches, dental pain, menstrual cramps, muscle aches, and arthritis. Take with food or milk.",
            Dosage: "Adults: 200-400mg every 4-6 hours. Maximum 1200mg per day for OTC use. Prescription doses may be higher.",
            Side_Effects: "Stomach upset, heartburn, dizziness, increased blood pressure. Long-term use may cause kidney or heart problems."
        },
        {
            Drug_Name: "Metformin",
            Category: "Antidiabetic",
            Overview: "Metformin is the first-line medication for type 2 diabetes. It helps control blood sugar levels by improving insulin sensitivity.",
            Usage: "Used to treat type 2 diabetes, often combined with diet and exercise. May also be used for PCOS treatment.",
            Dosage: "Starting dose: 500mg twice daily with meals. May increase gradually to maximum 2000-2500mg daily.",
            Side_Effects: "Nausea, diarrhea, stomach upset, metallic taste. Rare but serious: lactic acidosis. Regular monitoring required."
        },
        {
            Drug_Name: "Lignocaine HCl injection I.P 1%",
            Category: "Anaesthetics",
            Overview: "Local anesthetic used to numb tissues during minor surgeries or procedures.",
            Usage: "Administered by healthcare professionals for local anesthesia during medical procedures.",
            Dosage: "Dosage varies based on procedure and patient weight. Maximum safe dose is 4.5mg/kg body weight.",
            Side_Effects: "Local reactions at injection site, allergic reactions, systemic toxicity if overdosed."
        },
        {
            Drug_Name: "Cetirizine",
            Category: "Antihistamine",
            Overview: "Second-generation antihistamine used to treat allergic reactions and hay fever.",
            Usage: "Take once daily for seasonal allergies, hives, and allergic rhinitis.",
            Dosage: "Adults: 10mg once daily. Children 6-12 years: 5-10mg once daily.",
            Side_Effects: "Drowsiness, dry mouth, fatigue, dizziness. Less sedating than first-generation antihistamines."
        },
        {
            Drug_Name: "Omeprazole",
            Category: "Proton Pump Inhibitor",
            Overview: "Reduces stomach acid production to treat acid reflux, ulcers, and GERD.",
            Usage: "Take before meals, preferably in the morning. Used for acid-related stomach conditions.",
            Dosage: "Adults: 20-40mg once daily. Treatment duration varies by condition.",
            Side_Effects: "Headache, nausea, diarrhea, stomach pain. Long-term use may affect nutrient absorption."
        },
        {
            Drug_Name: "Atorvastatin",
            Category: "Statin",
            Overview: "Cholesterol-lowering medication that reduces risk of heart disease and stroke.",
            Usage: "Take once daily, with or without food. Used to lower cholesterol and prevent cardiovascular events.",
            Dosage: "Starting dose: 10-20mg daily. May increase to maximum 80mg daily based on response.",
            Side_Effects: "Muscle pain, liver enzyme elevation, digestive issues. Regular monitoring required."
        },
        {
            Drug_Name: "Salbutamol",
            Category: "Bronchodilator",
            Overview: "Fast-acting bronchodilator used to treat asthma and COPD symptoms.",
            Usage: "Inhaled medication for quick relief of breathing difficulties and bronchospasm.",
            Dosage: "2 puffs every 4-6 hours as needed. Maximum 8 puffs in 24 hours.",
            Side_Effects: "Tremor, increased heart rate, headache, muscle cramps. Overuse can worsen asthma."
        }
    ];
}

// Process Data
function processData() {
    // Clean and standardize data
    medicineData = medicineData.map(medicine => ({
        Drug_Name: medicine.Drug_Name || medicine['Medicine Name'] || medicine.name || '',
        Category: medicine.Category || medicine.category || 'Other',
        Overview: medicine.Overview || medicine.overview || medicine.description || '',
        Usage: medicine.Usage || medicine.usage || medicine.uses || '',
        Dosage: medicine.Dosage || medicine.dosage || '',
        Side_Effects: medicine.Side_Effects || medicine['Side Effects'] || medicine.sideEffects || ''
    })).filter(medicine => medicine.Drug_Name.trim() !== '');
    
    filteredData = [...medicineData];
}

// Update Statistics
function updateStats() {
    const categories = [...new Set(medicineData.map(m => m.Category))];
    totalMedicines.textContent = medicineData.length;
    totalCategories.textContent = categories.length;
}

// Populate Category Filter
function populateCategoryFilter() {
    const categories = [...new Set(medicineData.map(m => m.Category))].sort();
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Handle Search Input
function handleSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length === 0) {
        displayAllMedicines();
        hideSuggestions();
        return;
    }
    
    // Filter medicines based on search query
    filteredData = medicineData.filter(medicine => 
        medicine.Drug_Name.toLowerCase().includes(query) ||
        medicine.Category.toLowerCase().includes(query) ||
        medicine.Overview.toLowerCase().includes(query)
    );
    
    displaySearchResults();
    updateSuggestions(query);
}

// Update Search Suggestions
function updateSuggestions(query) {
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    const suggestions = medicineData
        .filter(medicine => medicine.Drug_Name.toLowerCase().includes(query))
        .slice(0, 5)
        .map(medicine => medicine.Drug_Name);
    
    if (suggestions.length > 0) {
        searchSuggestions.innerHTML = suggestions
            .map(suggestion => `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`)
            .join('');
        showSuggestions();
    } else {
        hideSuggestions();
    }
}

// Show/Hide Suggestions
function showSuggestions() {
    searchSuggestions.style.display = 'block';
}

function hideSuggestions() {
    setTimeout(() => {
        searchSuggestions.style.display = 'none';
    }, 200);
}

// Select Suggestion
function selectSuggestion(suggestion) {
    medicineSearch.value = suggestion;
    hideSuggestions();
    handleSearchInput({ target: { value: suggestion } });
}

// Filter by Category
function filterByCategory() {
    const selectedCategory = categoryFilter.value;
    
    if (selectedCategory === '') {
        filteredData = [...medicineData];
    } else {
        filteredData = medicineData.filter(medicine => medicine.Category === selectedCategory);
    }
    
    displaySearchResults();
}

// Toggle View
function toggleView(e) {
    const viewType = e.target.closest('.view-btn').dataset.view;
    currentView = viewType;
    
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    e.target.closest('.view-btn').classList.add('active');
    
    resultsGrid.className = `results-grid ${viewType === 'list' ? 'list-view' : ''}`;
}

// Display All Medicines
function displayAllMedicines() {
    filteredData = [...medicineData];
    displaySearchResults();
}

// Display Search Results
function displaySearchResults() {
    const count = filteredData.length;
    resultsCount.textContent = count === 0 ? 'No medicines found' : 
                              count === 1 ? '1 medicine found' : 
                              `${count} medicines found`;
    
    if (count === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                <h3>No medicines found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button class="btn btn-primary" onclick="openAddMedicineModal()" style="margin-top: 1rem;">
                    <i class="fas fa-plus"></i>
                    Add New Medicine
                </button>
            </div>
        `;
        return;
    }
    
    resultsGrid.innerHTML = filteredData.map(medicine => createMedicineCard(medicine)).join('');
}

// Create Medicine Card
function createMedicineCard(medicine) {
    const truncatedOverview = medicine.Overview.length > 150 ? 
                             medicine.Overview.substring(0, 150) + '...' : 
                             medicine.Overview;
    
    return `
        <div class="medicine-card" onclick="openMedicineModal('${medicine.Drug_Name}')">
            <div class="medicine-card-header">
                <div class="medicine-card-icon">
                    <i class="fas fa-pills"></i>
                </div>
                <div>
                    <div class="medicine-card-title">${medicine.Drug_Name}</div>
                    <span class="medicine-card-category">${medicine.Category}</span>
                </div>
            </div>
            <div class="medicine-card-content">
                ${truncatedOverview}
            </div>
            <div class="medicine-card-actions">
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openMedicineModal('${medicine.Drug_Name}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); shareMedicine('${medicine.Drug_Name}')">
                    <i class="fas fa-share"></i>
                    Share
                </button>
            </div>
        </div>
    `;
}

// Open Medicine Modal
function openMedicineModal(medicineName) {
    const medicine = medicineData.find(m => m.Drug_Name === medicineName);
    if (!medicine) return;
    
    // Populate modal content
    document.getElementById('modalMedicineName').textContent = medicine.Drug_Name;
    document.getElementById('detailMedicineName').textContent = medicine.Drug_Name;
    document.getElementById('detailMedicineCategory').textContent = medicine.Category;
    document.getElementById('medicineOverview').textContent = medicine.Overview;
    document.getElementById('medicineUsage').textContent = medicine.Usage;
    document.getElementById('medicineDosage').textContent = medicine.Dosage;
    document.getElementById('medicineSideEffects').textContent = medicine.Side_Effects;
    
    // Setup tabs
    setupModalTabs();
    
    // Show modal
    medicineModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Setup Modal Tabs
function setupModalTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Close Medicine Modal
function closeMedicineModal() {
    medicineModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open Add Medicine Modal
function openAddMedicineModal() {
    addMedicineModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Add Medicine Modal
function closeAddMedicineModal() {
    addMedicineModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('addMedicineForm').reset();
}

// Handle Add Medicine
function handleAddMedicine(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newMedicine = {
        Drug_Name: document.getElementById('newMedicineName').value.trim(),
        Category: document.getElementById('newMedicineCategory').value,
        Overview: document.getElementById('newMedicineOverview').value.trim(),
        Usage: document.getElementById('newMedicineUsage').value.trim(),
        Dosage: document.getElementById('newMedicineDosage').value.trim(),
        Side_Effects: document.getElementById('newMedicineSideEffects').value.trim()
    };
    
    // Validate required fields
    if (!newMedicine.Drug_Name || !newMedicine.Category || !newMedicine.Overview) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Check if medicine already exists
    if (medicineData.some(m => m.Drug_Name.toLowerCase() === newMedicine.Drug_Name.toLowerCase())) {
        showToast('Medicine already exists in database', 'error');
        return;
    }
    
    // Add to database
    medicineData.push(newMedicine);
    processData();
    updateStats();
    populateCategoryFilter();
    displayAllMedicines();
    
    closeAddMedicineModal();
    showToast(`${newMedicine.Drug_Name} added successfully!`, 'success');
}

// Open About Modal
function openAboutModal() {
    aboutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close About Modal
function closeAboutModal() {
    aboutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close All Modals
function closeModals(e) {
    if (e.target.classList.contains('modal-overlay')) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
}

// Setup Voice Search
function setupVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    voiceSearch.addEventListener('click', () => {
        if (isVoiceSearchActive) {
            recognition.stop();
            return;
        }
        
        isVoiceSearchActive = true;
        voiceSearch.innerHTML = '<i class="fas fa-stop"></i>';
        voiceSearch.style.background = 'var(--error-color)';
        
        recognition.start();
        showToast('Listening... Speak the medicine name', 'info');
    });
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        medicineSearch.value = transcript;
        handleSearchInput({ target: { value: transcript } });
        showToast(`Searched for: ${transcript}`, 'success');
    };
    
    recognition.onend = () => {
        isVoiceSearchActive = false;
        voiceSearch.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceSearch.style.background = 'var(--primary-color)';
    };
    
    recognition.onerror = (event) => {
        isVoiceSearchActive = false;
        voiceSearch.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceSearch.style.background = 'var(--primary-color)';
        showToast('Voice search error. Please try again.', 'error');
    };
}

// Share Medicine
function shareMedicine(medicineName) {
    if (navigator.share) {
        navigator.share({
            title: `${medicineName} - Medicine Information`,
            text: `Check out information about ${medicineName} on MediSuggest`,
            url: window.location.href
        });
    } else {
        // Fallback to clipboard
        const text = `${medicineName} - Medicine Information\nCheck out: ${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Medicine information copied to clipboard!', 'success');
        });
    }
}

// Print Medicine
function printMedicine() {
    window.print();
}

// Export Database
function exportDatabase() {
    const worksheet = XLSX.utils.json_to_sheet(medicineData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines');
    
    const fileName = `medicine_database_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    showToast('Database exported successfully!', 'success');
}

// Import Database
function importDatabase() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        showToast('Processing file...', 'info');
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const importedData = XLSX.utils.sheet_to_json(worksheet);
                
                if (importedData.length === 0) {
                    showToast('No data found in the file. Please check the file format.', 'error');
                    return;
                }
                
                // Merge with existing data
                const newMedicines = importedData.filter(imported => 
                    !medicineData.some(existing => 
                        existing.Drug_Name.toLowerCase() === (imported.Drug_Name || imported['Medicine Name'] || '').toLowerCase()
                    )
                );
                
                if (newMedicines.length > 0) {
                    medicineData.push(...newMedicines);
                } else {
                    // If no new medicines, replace existing data
                    medicineData = [...importedData];
                }
                
                processData();
                updateStats();
                populateCategoryFilter();
                displayEmptyState();
                
                if (newMedicines.length > 0) {
                    showToast(`Successfully imported ${newMedicines.length} new medicines!`, 'success');
                } else {
                    showToast(`Successfully loaded ${importedData.length} medicines from file!`, 'success');
                }
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing file. Please check the format.', 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };
    
    input.click();
}

// Scroll to Search
function scrollToSearch() {
    document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        medicineSearch.focus();
    }, 500);
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        medicineSearch.focus();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}