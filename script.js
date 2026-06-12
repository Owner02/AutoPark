// ------------------- Модели -------------------
class Vehicle {
    constructor(id, plate, model, year, mileage, status) {
        this.id = id; this.plate = plate; this.model = model; this.year = year; this.mileage = mileage; this.status = status;
    }
}
class Driver {
    constructor(id, name, licenseNum, experience, phone) {
        this.id = id; this.name = name; this.licenseNum = licenseNum; this.experience = experience; this.phone = phone;
    }
}
class Trip {
    constructor(id, date, driverId, vehicleId, purpose, distance, fuelUsed) {
        this.id = id; this.date = date; this.driverId = driverId; this.vehicleId = vehicleId; this.purpose = purpose; this.distance = distance; this.fuelUsed = fuelUsed;
    }
}

// ------------------- Глобальное состояние -------------------
let vehicles = [];
let drivers = [];
let trips = [];

// Состояние форм
let editingVehicleId = null;
let editingDriverId = null;
let editingTripId = null;

// DOM элементы
// Табы
const tabBtns = document.querySelectorAll('.tab-btn');
const tabs = { vehicles: document.getElementById('vehiclesTab'), drivers: document.getElementById('driversTab'), trips: document.getElementById('tripsTab') };

// Автомобили
const vehiclesBody = document.getElementById('vehiclesBody');
const searchVehicles = document.getElementById('searchVehicles');
const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleForm = document.getElementById('vehicleForm');
const vehicleFormTitle = document.getElementById('vehicleFormTitle');
const plateInput = document.getElementById('plate');
const modelInput = document.getElementById('model');
const yearInput = document.getElementById('year');
const mileageInput = document.getElementById('mileage');
const statusSelect = document.getElementById('status');
const saveVehicleBtn = document.getElementById('saveVehicleBtn');
const cancelVehicleForm = document.getElementById('cancelVehicleForm');
const vehicleFormError = document.getElementById('vehicleFormError');

// Водители
const driversBody = document.getElementById('driversBody');
const searchDrivers = document.getElementById('searchDrivers');
const addDriverBtn = document.getElementById('addDriverBtn');
const driverForm = document.getElementById('driverForm');
const driverFormTitle = document.getElementById('driverFormTitle');
const driverNameInput = document.getElementById('driverName');
const licenseNumInput = document.getElementById('licenseNum');
const experienceInput = document.getElementById('experience');
const driverPhoneInput = document.getElementById('driverPhone');
const saveDriverBtn = document.getElementById('saveDriverBtn');
const cancelDriverForm = document.getElementById('cancelDriverForm');
const driverFormError = document.getElementById('driverFormError');

// Поездки
const tripsBody = document.getElementById('tripsBody');
const searchTrips = document.getElementById('searchTrips');
const addTripBtn = document.getElementById('addTripBtn');
const tripForm = document.getElementById('tripForm');
const tripFormTitle = document.getElementById('tripFormTitle');
const tripDateInput = document.getElementById('tripDate');
const driverSelect = document.getElementById('driverSelect');
const carSelect = document.getElementById('carSelect');
const purposeInput = document.getElementById('purpose');
const distanceInput = document.getElementById('tripDistance');
const fuelInput = document.getElementById('fuelUsed');
const saveTripBtn = document.getElementById('saveTripBtn');
const cancelTripForm = document.getElementById('cancelTripForm');
const tripFormError = document.getElementById('tripFormError');
const tripStatsDiv = document.getElementById('tripStats');

// ------------------- Хранилище -------------------
function saveToLocalStorage() {
    localStorage.setItem('fleet_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('fleet_drivers', JSON.stringify(drivers));
    localStorage.setItem('fleet_trips', JSON.stringify(trips));
}

function loadData() {
    const storedVehicles = localStorage.getItem('fleet_vehicles');
    const storedDrivers = localStorage.getItem('fleet_drivers');
    const storedTrips = localStorage.getItem('fleet_trips');
    vehicles = storedVehicles ? JSON.parse(storedVehicles) : getDemoVehicles();
    drivers = storedDrivers ? JSON.parse(storedDrivers) : getDemoDrivers();
    trips = storedTrips ? JSON.parse(storedTrips) : getDemoTrips();
    syncVehicleSelects();
    syncDriverSelects();
    renderAll();
}

function getDemoVehicles() {
    return [
        new Vehicle(1, 'А777ВС199', 'Hyundai Solaris', 2021, 28450, 'В гараже'),
        new Vehicle(2, 'М123МР77', 'KIA Rio', 2020, 52300, 'В рейсе'),
        new Vehicle(3, 'Т456АА99', 'Lada Vesta', 2022, 12300, 'В гараже')
    ];
}
function getDemoDrivers() {
    return [
        new Driver(1, 'Алексей Сорокин', '77 02 123456', 8, '+7 (916) 111-22-33'),
        new Driver(2, 'Мария Коваль', '77 05 654321', 3, '+7 (903) 444-55-66')
    ];
}
function getDemoTrips() {
    return [
        new Trip(1, '2025-02-10', 1, 1, 'Складская доставка', 45, 4.2),
        new Trip(2, '2025-02-12', 2, 2, 'Встреча с клиентом', 28, 3.0)
    ];
}

// Обновление выпадающих списков в поездках
function syncVehicleSelects() {
    let options = '<option value="">-- Выберите авто --</option>';
    vehicles.forEach(v => { options += `<option value="${v.id}">${v.plate} (${v.model})</option>`; });
    carSelect.innerHTML = options;
}
function syncDriverSelects() {
    let options = '<option value="">-- Выберите водителя --</option>';
    drivers.forEach(d => { options += `<option value="${d.id}">${d.name}</option>`; });
    driverSelect.innerHTML = options;
}

// ------------------- Рендер -------------------
function renderVehicles() {
    const term = searchVehicles.value.trim().toLowerCase();
    let filtered = vehicles;
    if (term) {
        filtered = vehicles.filter(v => v.plate.toLowerCase().includes(term) || v.model.toLowerCase().includes(term) || v.status.toLowerCase().includes(term));
    }
    if (!filtered.length) { vehiclesBody.innerHTML = '<tr><td colspan="6">Нет автомобилей</td></tr>'; return; }
    let html = '';
    filtered.forEach(v => {
        html += `<tr>
            <td>${escapeHtml(v.plate)}</td><td>${escapeHtml(v.model)}</td><td>${v.year}</td><td>${v.mileage.toLocaleString()}</td>
            <td>${v.status}</td>
            <td><button class="btn btn-warning btn-sm" onclick="editVehicle(${v.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${v.id})">🗑️</button></td>
        </tr>`;
    });
    vehiclesBody.innerHTML = html;
}
function renderDrivers() {
    const term = searchDrivers.value.trim().toLowerCase();
    let filtered = drivers.filter(d => d.name.toLowerCase().includes(term) || d.licenseNum.includes(term));
    if (!filtered.length) { driversBody.innerHTML = '<tr><td colspan="5">Нет водителей</td></tr>'; return; }
    let html = '';
    filtered.forEach(d => {
        html += `<tr><td>${escapeHtml(d.name)}</td><td>${escapeHtml(d.licenseNum)}</td><td>${d.experience}</td><td>${escapeHtml(d.phone)}</td>
        <td><button class="btn btn-warning btn-sm" onclick="editDriver(${d.id})">✏️</button><button class="btn btn-danger btn-sm" onclick="deleteDriver(${d.id})">🗑️</button></td></tr>`;
    });
    driversBody.innerHTML = html;
}
function renderTrips() {
    const term = searchTrips.value.trim().toLowerCase();
    let filtered = trips.filter(t => t.purpose.toLowerCase().includes(term) ||
        (getDriverName(t.driverId) + '').toLowerCase().includes(term) ||
        (getVehiclePlate(t.vehicleId) + '').toLowerCase().includes(term));
    let totalDistance = 0, totalFuel = 0;
    filtered.forEach(t => { totalDistance += t.distance; totalFuel += t.fuelUsed; });
    const avgConsumption = totalDistance > 0 ? ((totalFuel / totalDistance) * 100).toFixed(1) : 0;
    tripStatsDiv.innerHTML = `📊 Общий пробег: ${totalDistance.toLocaleString()} км | Средний расход: ${avgConsumption} л/100км`;
    if (!filtered.length) { tripsBody.innerHTML = '<tr><td colspan="7">Нет поездок</td></tr>'; return; }
    let html = '';
    filtered.forEach(t => {
        html += `<tr>
            <td>${t.date}</td><td>${escapeHtml(getDriverName(t.driverId))}</td><td>${escapeHtml(getVehiclePlate(t.vehicleId))}</td>
            <td>${escapeHtml(t.purpose)}</td><td>${t.distance} км</td><td>${t.fuelUsed} л</td>
            <td><button class="btn btn-warning btn-sm" onclick="editTrip(${t.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTrip(${t.id})">🗑️</button></td>
        </tr>`;
    });
    tripsBody.innerHTML = html;
}
function getDriverName(id) { const d = drivers.find(drv => drv.id === id); return d ? d.name : '—'; }
function getVehiclePlate(id) { const v = vehicles.find(vh => vh.id === id); return v ? v.plate : '—'; }

function renderAll() { renderVehicles(); renderDrivers(); renderTrips(); }

// ------------------- Автомобили: CRUD -------------------
function resetVehicleForm() { editingVehicleId = null; plateInput.value = ''; modelInput.value = ''; yearInput.value = ''; mileageInput.value = ''; statusSelect.value = 'В гараже'; vehicleFormError.innerText = ''; }
function showVehicleForm(editMode = false, vehicle = null) {
    vehicleForm.classList.remove('hidden');
    if (editMode && vehicle) {
        vehicleFormTitle.innerText = 'Редактировать авто';
        plateInput.value = vehicle.plate; modelInput.value = vehicle.model; yearInput.value = vehicle.year; mileageInput.value = vehicle.mileage; statusSelect.value = vehicle.status;
        editingVehicleId = vehicle.id;
    } else { vehicleFormTitle.innerText = 'Добавить авто'; resetVehicleForm(); editingVehicleId = null; }
}
function hideVehicleForm() { vehicleForm.classList.add('hidden'); resetVehicleForm(); }
function saveVehicle() {
    const plate = plateInput.value.trim();
    if (!plate) { vehicleFormError.innerText = 'Госномер обязателен'; return; }
    const model = modelInput.value.trim() || 'Без модели';
    const year = parseInt(yearInput.value) || 2000;
    const mileage = parseInt(mileageInput.value) || 0;
    const status = statusSelect.value;
    if (editingVehicleId !== null) {
        const idx = vehicles.findIndex(v => v.id === editingVehicleId);
        if (idx !== -1) { vehicles[idx] = { ...vehicles[idx], plate, model, year, mileage, status }; saveToLocalStorage(); renderVehicles(); hideVehicleForm(); syncVehicleSelects(); }
    } else {
        const newId = vehicles.length ? Math.max(...vehicles.map(v => v.id)) + 1 : 1;
        vehicles.push(new Vehicle(newId, plate, model, year, mileage, status));
        saveToLocalStorage(); renderVehicles(); hideVehicleForm(); syncVehicleSelects();
    }
}
window.editVehicle = (id) => { const v = vehicles.find(vh => vh.id === id); if (v) showVehicleForm(true, v); };
window.deleteVehicle = (id) => { if (confirm('Удалить авто?')) { vehicles = vehicles.filter(v => v.id !== id); saveToLocalStorage(); renderVehicles(); syncVehicleSelects(); if (editingVehicleId === id) hideVehicleForm(); } };

// ------------------- Водители: CRUD -------------------
function resetDriverForm() { editingDriverId = null; driverNameInput.value = ''; licenseNumInput.value = ''; experienceInput.value = ''; driverPhoneInput.value = ''; driverFormError.innerText = ''; }
function showDriverForm(editMode = false, driver = null) {
    driverForm.classList.remove('hidden');
    if (editMode && driver) { driverFormTitle.innerText = 'Редактировать водителя'; driverNameInput.value = driver.name; licenseNumInput.value = driver.licenseNum; experienceInput.value = driver.experience; driverPhoneInput.value = driver.phone; editingDriverId = driver.id; }
    else { driverFormTitle.innerText = 'Добавить водителя'; resetDriverForm(); editingDriverId = null; }
}
function hideDriverForm() { driverForm.classList.add('hidden'); resetDriverForm(); }
function saveDriver() {
    const name = driverNameInput.value.trim();
    if (!name) { driverFormError.innerText = 'ФИО обязательно'; return; }
    const license = licenseNumInput.value.trim() || '—';
    const exp = parseInt(experienceInput.value) || 0;
    const phone = driverPhoneInput.value.trim() || '';
    if (editingDriverId !== null) {
        const idx = drivers.findIndex(d => d.id === editingDriverId);
        if (idx !== -1) { drivers[idx] = { ...drivers[idx], name, licenseNum: license, experience: exp, phone }; saveToLocalStorage(); renderDrivers(); hideDriverForm(); syncDriverSelects(); }
    } else {
        const newId = drivers.length ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
        drivers.push(new Driver(newId, name, license, exp, phone));
        saveToLocalStorage(); renderDrivers(); hideDriverForm(); syncDriverSelects();
    }
}
window.editDriver = (id) => { const d = drivers.find(drv => drv.id === id); if (d) showDriverForm(true, d); };
window.deleteDriver = (id) => { if (confirm('Удалить водителя? Все связанные поездки останутся, но имя пропадёт.')) { drivers = drivers.filter(d => d.id !== id); saveToLocalStorage(); renderDrivers(); syncDriverSelects(); if (editingDriverId === id) hideDriverForm(); } };

// ------------------- Поездки: CRUD -------------------
function resetTripForm() { editingTripId = null; tripDateInput.value = new Date().toISOString().slice(0,10); driverSelect.value = ''; carSelect.value = ''; purposeInput.value = ''; distanceInput.value = 0; fuelInput.value = 0; tripFormError.innerText = ''; }
function showTripForm(editMode = false, trip = null) {
    tripForm.classList.remove('hidden');
    if (editMode && trip) {
        tripFormTitle.innerText = 'Редактировать поездку';
        tripDateInput.value = trip.date; driverSelect.value = trip.driverId; carSelect.value = trip.vehicleId; purposeInput.value = trip.purpose; distanceInput.value = trip.distance; fuelInput.value = trip.fuelUsed;
        editingTripId = trip.id;
    } else { tripFormTitle.innerText = 'Новая поездка'; resetTripForm(); editingTripId = null; }
}
function hideTripForm() { tripForm.classList.add('hidden'); resetTripForm(); }
function saveTrip() {
    const date = tripDateInput.value;
    if (!date) { tripFormError.innerText = 'Выберите дату'; return; }
    const driverId = parseInt(driverSelect.value);
    const vehicleId = parseInt(carSelect.value);
    if (!driverId || !vehicleId) { tripFormError.innerText = 'Выберите водителя и автомобиль'; return; }
    const purpose = purposeInput.value.trim() || 'Без цели';
    const distance = parseFloat(distanceInput.value) || 0;
    const fuel = parseFloat(fuelInput.value) || 0;
    if (editingTripId !== null) {
        const idx = trips.findIndex(t => t.id === editingTripId);
        if (idx !== -1) { trips[idx] = { ...trips[idx], date, driverId, vehicleId, purpose, distance, fuelUsed: fuel }; saveToLocalStorage(); renderTrips(); hideTripForm(); }
    } else {
        const newId = trips.length ? Math.max(...trips.map(t => t.id)) + 1 : 1;
        trips.push(new Trip(newId, date, driverId, vehicleId, purpose, distance, fuel));
        saveToLocalStorage(); renderTrips(); hideTripForm();
    }
}
window.editTrip = (id) => { const t = trips.find(tr => tr.id === id); if (t) showTripForm(true, t); };
window.deleteTrip = (id) => { if (confirm('Удалить поездку?')) { trips = trips.filter(t => t.id !== id); saveToLocalStorage(); renderTrips(); if (editingTripId === id) hideTripForm(); } };

// ------------------- Переключение табов -------------------
function switchTab(tabId) {
    Object.values(tabs).forEach(tab => tab.classList.remove('active'));
    tabs[tabId].classList.add('active');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    renderAll(); // обновляем статистику
}
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => { switchTab(btn.dataset.tab); });
});

// ------------------- Инициализация событий -------------------
addVehicleBtn.onclick = () => showVehicleForm(false);
cancelVehicleForm.onclick = hideVehicleForm;
saveVehicleBtn.onclick = saveVehicle;

addDriverBtn.onclick = () => showDriverForm(false);
cancelDriverForm.onclick = hideDriverForm;
saveDriverBtn.onclick = saveDriver;

addTripBtn.onclick = () => showTripForm(false);
cancelTripForm.onclick = hideTripForm;
saveTripBtn.onclick = saveTrip;

searchVehicles.addEventListener('input', renderVehicles);
searchDrivers.addEventListener('input', renderDrivers);
searchTrips.addEventListener('input', renderTrips);

function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, function(m){ if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }

loadData();
