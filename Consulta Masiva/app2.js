let tableData = [];
let filteredData = [];
let customerNames = [];
let fullNames = [];
let branchCustomerNumbers = [];
let customerNameFilter = "";
let fullNameFilter = "";
let branchCustomerNumberFilter = "";
let phoneNumbers = [];
let emails = [];
let phoneFilter = "";
let emailFilter = "";
let activeFilters = {}; // Para filtros adicionales

document.addEventListener("DOMContentLoaded", () => {
    fetch("data.csv")
        .then(response => response.text())
        .then(data => {
            tableData = parseCSV(data);

            if (tableData.length > 0) {
                // Extraer valores únicos para autocompletar
                customerNames = [...new Set(tableData.map(row => row['Customer Name']))].filter(Boolean);
                fullNames = [...new Set(tableData.map(row => row['Nombre completo']))].filter(Boolean);
                branchCustomerNumbers = [...new Set(tableData.map(row => row['Branch Customer Number']))].filter(Boolean);
                phoneNumbers = [...new Set(tableData.map(row => row['Teléfono']))].filter(Boolean);
                emails = [...new Set(tableData.map(row => row['Correo electrónico']))].filter(Boolean);

                filteredData = tableData;

                displayTable(filteredData);
                setupAutocomplete();
            } else {
                document.getElementById("table-container").innerHTML = "<p>No se pudieron cargar los datos del CSV o el archivo está vacío.</p>";
            }
        })
        .catch(error => {
            console.error("Error al cargar o procesar el archivo CSV:", error);
            document.getElementById("table-container").innerHTML = "<p>Ocurrió un error al cargar los datos.</p>";
        });
});

function parseCSV(data) {
    const rows = data.split("\n").map(row => row.split(","));
    const headers = rows[0];
    return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = row[index]?.trim() || "";
        });
        return obj;
    });
}

function displayTable(data) {
    const container = document.getElementById("table-container");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headers = [
        "Marca - Proyecto", "Branch Customer Number",
        "BranchName", "Customer Name", "Nombre completo", "Puesto", "Teléfono",
        "Correo electrónico"
    ];

    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = row[header] || "";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

function setupAutocomplete() {
    // Configurar autocompletado para todos los filtros
    setupAutocompleteForField(document.getElementById('searchInput'), document.getElementById('suggestions'), customerNames, value => customerNameFilter = value);
    setupAutocompleteForField(document.getElementById('contactInput'), document.getElementById('contactSuggestions'), fullNames, value => fullNameFilter = value);
    setupAutocompleteForField(document.getElementById('branchCustomerNumberInput'), document.getElementById('branchCustomerNumberSuggestions'), branchCustomerNumbers, value => branchCustomerNumberFilter = value);
    setupAutocompleteForField(document.getElementById('phoneInput'), document.getElementById('phoneSuggestions'), phoneNumbers, value => phoneFilter = value);
    setupAutocompleteForField(document.getElementById('emailInput'), document.getElementById('emailSuggestions'), emails, value => emailFilter = value);

    // Botones para búsqueda y limpieza
    document.getElementById('searchButton').addEventListener('click', applyFilters);
    document.getElementById('clearSearchButton').addEventListener('click', resetFilters);
}


function setupAutocompleteForField(input, suggestionsDiv, data, filterSetter) {
    input.addEventListener('input', () => {
        const searchTerm = input.value.toLowerCase();
        let suggestions = [];

        if (searchTerm.length > 0) {
            suggestions = data.filter(item => item.toLowerCase().startsWith(searchTerm));
        }

        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = suggestions.length > 0 && input.value.length > 0 ? 'block' : 'none';

        suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.textContent = suggestion;
            suggestionDiv.addEventListener('click', () => {
                input.value = suggestion;
                suggestionsDiv.style.display = 'none';
                filterSetter(suggestion); // Establece el valor del filtro
                applyFilters(); // Aplica los filtros inmediatamente
            });
            suggestionsDiv.appendChild(suggestionDiv);
        });
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsDiv.style.display = 'none';
        }, 200);
    });
}



function applyFilters() {
    filteredData = tableData.filter(row => {
        const customerNameMatch = !customerNameFilter || (row['Customer Name'] && row['Customer Name'].toLowerCase().includes(customerNameFilter.toLowerCase()));
        const fullNameMatch = !fullNameFilter || (row['Nombre completo'] && row['Nombre completo'].toLowerCase().includes(fullNameFilter.toLowerCase()));
        const branchCustomerNumberMatch = !branchCustomerNumberFilter || (row['Branch Customer Number'] && row['Branch Customer Number'].toLowerCase().includes(branchCustomerNumberFilter.toLowerCase()));
        const phoneMatch = !phoneFilter || (row['Teléfono'] && row['Teléfono'].toLowerCase().includes(phoneFilter.toLowerCase()));
        const emailMatch = !emailFilter || (row['Correo electrónico'] && row['Correo electrónico'].toLowerCase().includes(emailFilter.toLowerCase()));

        return customerNameMatch && fullNameMatch && branchCustomerNumberMatch && phoneMatch && emailMatch;
    });

    displayTable(filteredData);
}


function filterByDropdown(field, value) {
    if (value) {
        activeFilters[field] = value;
    } else {
        delete activeFilters[field];
    }
    applyFilters();
}

function exportToExcel() {
  const headers = [
    "Desarrollo de Partners - UF",
    "Marca - Proyecto",
    "Categoría",
    "Branch Customer Number",
    "BranchName",
    "Customer Name",
    "Nombre completo",
    "Puesto",
    "Teléfono",
    "Extensión 1",
    "Teléfono 2",
    "Extensión 2",
    "Teléfono 3",
    "Correo electrónico",
    "Correo electrónico 2",
    "Nombre Ejecutivo DC"
  ];

  // Crear un array con los datos
  const data = [headers]; // Agregar encabezados como la primera fila
  filteredData.forEach(row => {
    data.push(headers.map(header => row[header] || "")); // Agregar cada fila de datos
  });

  // Crear un libro y una hoja con SheetJS
  const worksheet = XLSX.utils.aoa_to_sheet(data); // Convertir el array en una hoja
  const workbook = XLSX.utils.book_new(); // Crear un nuevo libro
  XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados"); // Agregar la hoja al libro

  // Exportar el libro como archivo Excel
  XLSX.writeFile(workbook, "filtered_results.xlsx");
}


function resetFilters() {
    customerNameFilter = "";
    fullNameFilter = "";
    branchCustomerNumberFilter = "";
    phoneFilter = "";
    emailFilter = "";

    document.getElementById('searchInput').value = '';
    document.getElementById('contactInput').value = '';
    document.getElementById('branchCustomerNumberInput').value = '';
    document.getElementById('phoneInput').value = '';
    document.getElementById('emailInput').value = '';

    document.querySelectorAll('.suggestions').forEach(div => div.style.display = 'none');
    filteredData = tableData;
    displayTable(filteredData);
}