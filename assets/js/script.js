
const apiURL = "https://mindicador.cl/api/";
const inputMonto = document.getElementById("monto");
const selectMoneda = document.getElementById("moneda");
const btnConvertir = document.getElementById("convertir");
const resultado = document.getElementById("resultado");
const grafico = document.getElementById("grafico");
let loading = '<img src="./assets/img/spinner.gif" alt="Cargando..." width="220" height="150">';
let myChart;

btnConvertir.addEventListener('click', function() {
    if (inputMonto.value == "" || selectMoneda.value == ""){
        alert("Debe rellenar los campos.");
    } else {
        resultado.innerHTML = loading;
        grafico.innerHTML = loading;
        getConversion(selectMoneda.value);
    }
});

async function getMonedas() {

    try {
        const res = await fetch(apiURL);
        const monedas = await res.json();

        for (let tipo_cambio in monedas) {
            let objeto = monedas[tipo_cambio];

            if (objeto.codigo && ["uf", "ivp", "dolar", "dolar_intercambio"].includes(objeto.codigo)) {
                var newOption = document.createElement("option");
                newOption.value = objeto.codigo;
                newOption.innerHTML = objeto.nombre;
                selectMoneda.options.add(newOption);
            }
        }
    } catch (e) {
        console.log("Error ocurrido: ", e.message);
        resultado.innerHTML = "Error intentando obtener datos externos.";
    }
}

async function getConversion(moneda) {
    try {
        const endpoint = apiURL + moneda;
        const res = await fetch(endpoint);
        const montos = await res.json();

        let total = (montos.serie[0].valor) * parseInt(inputMonto.value);

        let ultimosMontos = montos.serie.slice(0, 10);
        let fechas = ultimosMontos.map((objetoMonto) => {
            return (objetoMonto.fecha).slice(0,10);
        }).reverse();
        let valores = ultimosMontos.map((objetoMonto) => {
            return objetoMonto.valor;
        }).reverse();

        resultado.innerHTML = "Resultado: $" + total.toLocaleString();
        renderGrafica(fechas, valores);
    } catch (e) {
        console.log("Error ocurrido: ", e.message);
        resultado.innerHTML = "Error intentando obtener datos externos.";
    }
}

function renderGrafica(labels, values) {

    const config = {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Historial últimos 10 días",
                    borderColor: "rgb(255, 99, 132)",
                    data: values
                },
            ]
        }
    };

    grafico.style.backgroundColor = "white";
    if (myChart) {
        myChart.destroy();
    }
    myChart = new Chart(grafico, config);
}

getMonedas();