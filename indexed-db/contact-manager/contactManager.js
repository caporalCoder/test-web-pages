// contactManager.js

let db;
const request = indexedDB.open('contactManagerDB', 2);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore;
    if (!db.objectStoreNames.contains('contacts')) {
        objectStore = db.createObjectStore('contacts', {keyPath: 'id', autoIncrement: true});
    } else {
        objectStore = request.transaction.objectStore('contacts');
    }
    objectStore.createIndex('name', 'name', {unique: false});
    objectStore.createIndex('phone', 'phone', {unique: true});
};

request.onsuccess = function(event) {
    db = event.target.result;
    fetchContacts();
};

request.onerror = function(event) {
    console.error('Database error: ', event.target.error);
};

function addContact(name = '', phone = '') {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    const contact = {
        name: name || document.getElementById('name').value,
        phone: phone || document.getElementById('phone').value
    };
    store.add(contact);

    transaction.oncomplete = function() {
        fetchContacts();
    };
}

function fetchContacts() {
    const start = performance.now();
    const transaction = db.transaction(['contacts'], 'readonly');
    const store = transaction.objectStore('contacts');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const contacts = event.target.result;
        const contactList = document.getElementById('contactList');
        contactList.innerHTML = '';
        contacts.forEach(contact => {
            const li = document.createElement('li');
            li.textContent = `${contact.name} - ${contact.phone}`;
            contactList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `Contacts loaded in ${(end - start).toFixed(2)} milliseconds.`;
    };
}

function generateRandomContacts() {
    const count = document.getElementById('randomCount').value || 1;
    for (let i = 0; i < count; i++) {
        const name = `RandomName ${Math.random().toString(36).substring(7)}`;
        const phone = `+1${Math.floor(Math.random() * 1000000000)}`;
        addContact(name, phone);
    }
}

function deleteAllContacts() {
    const transaction = db.transaction(['contacts'], 'readwrite');
    const store = transaction.objectStore('contacts');
    // Clears all contacts from the store.
    store.clear(); 

    transaction.oncomplete = function() {
        console.log('All contacts deleted.');
        // Update the UI after deleting all contacts.
        fetchContacts(); 
    };

    transaction.onerror = function(event) {
        console.error('Transaction error: ', event.target.error);
    };
}
