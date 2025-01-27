let tableData = [];
let filteredData = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("data.csv")
    .then(response => response.text())
    .then(data => {
      tableData = parseCSV(data);
      filteredData = [...tableData]; // Copia inicial
      displayTable(filteredData);
      setupFilterEventListeners();
    })
    .catch(error => console.error("Error al cargar el archivo CSV:", error));
});

// Función para parsear CSV
function parseCSV(data) {
  const rows = data.split("\n").map(row => row.split(","));
  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index]?.trim() || "";
    });
    return obj;
  });
}

// Función para mostrar la tabla
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
// Crear encabezados
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
  "Correo electrónico",
  "Correo electrónico 2",
  "Nombre Ejecutivo DC"
];

const headerRow = document.createElement("tr");
headers.forEach(header => {
  const th = document.createElement("th");
  th.textContent = header;
  headerRow.appendChild(th);
});
thead.appendChild(headerRow);

// Crear filas
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


// Configurar eventos de filtro
function setupFilterEventListeners() {
  const filters = {};

  document.querySelectorAll(".filters fieldset").forEach(fieldset => {
    const legend = fieldset.querySelector("legend").textContent.trim();
    filters[legend] = [];

    fieldset.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          filters[legend].push(checkbox.value);
        } else {
          filters[legend] = filters[legend].filter(val => val !== checkbox.value);
        }
        filteredData = filterData(tableData, filters);
        displayTable(filteredData);
      });
    });
  });
}

// Filtrar datos
function filterData(data, filters) {
  return data.filter(row => {
    return Object.keys(filters).every(filterKey => {
      if (!filters[filterKey].length) return true;
      return filters[filterKey].includes(row[filterKey]);
    });
  });
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




// Resetear filtros
function resetFilters() {
  filteredData = [...tableData]; // Restaurar datos originales
  displayTable(filteredData);

  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
}
function aplicarFiltro() {
  const filtro = document.querySelector("#filtroNombre").value.toLowerCase();
  const filas = document.querySelectorAll("#tabla tbody tr");

  filas.forEach((fila) => {
    const nombre = fila.querySelector("td").innerText.toLowerCase();
    if (nombre.includes(filtro)) {
      fila.style.display = ""; // Mostrar fila
    } else {
      fila.style.display = "none"; // Ocultar fila
    }
  });
}
