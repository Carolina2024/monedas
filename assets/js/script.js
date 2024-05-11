//en prueba se solicita trabajar con el metodo fetch con try catch
//es lenta la API, pero el resultado y el grafico entrega la información que corresponde para cada moneda

//conectar con la api, con funcion asincrona async, con try catch para capturar error
async function getApi() {
  try {
    const res = await fetch("https://mindicador.cl/api"); //solicitud a la api con las distintas monedas
    const data = await res.json(); //lo transforma a objeto JSON
    console.log("datos api: ", data);
    return data; //devuelve el objeto JSON con datos de la API
  } catch (e) {
    alert("ERROR EN LA API", e); //muestra una alerta con un mensaje de error
  }
}

//para actualizar el grafico, con funcioon asincrona, recibe un parametro variable
async function renderGrafica(variable) {
  console.log("Renderizando grafico"); //para ocupar la consola y ver errores
  const config = await prepararConfiguracionParaLaGrafica(variable); //llama a la funcion con su parametro, config obtiene los datos para el grafico
  const chartDom = document.getElementById("myChart"); //donde ira el grafico
  chartDom.style.backgroundColor = "white"; //color de fondo donde va el grafico
  //si hay un grafico lo destruye para nuevo grafico
  if (chartDom) {
    if (chartDom.myChart) {
      chartDom.myChart.destroy();
    }
  }
  const ctx = chartDom.getContext("2d"); //contexto de dibujoo en 2d sobre lienzo HTML5 canvas
  chartDom.myChart = new Chart(ctx, config); //crea un nuevo grafico con ctx y config
}

//realizar el calculo con valor ingresado y moneda seleccionada
document.getElementById("calculo").addEventListener("click", convertir); //boton con id calculo escucha el click y convierte
async function convertir() {
  const montoIngresado = parseFloat(document.getElementById("monto").value); //obtiene el valor del input, a valor decimal
  const monedaSeleccion = document.getElementById("moneda").value; //obtiene el valor del select de la moneda

  if (isNaN(montoIngresado) || montoIngresado < 0) {
    alert("Ingrese un monto no vacío y mayor o igual a 0"); //entrega mensaje cuando el valor esta vacio o es número negativo
    return;
  }

  const data = await getApi(); //llama a la funcion getApi para obtener datos de la API, await para esperar recibir los datos
  let resultado; //para almacenar el resultado
  if (monedaSeleccion === "dolar") {
    resultado = montoIngresado / data.dolar.valor; //division del monto ingresado en el imput dividido  por valor dolar que esta en la API
    console.log("resultado: ", resultado);
  } else if (monedaSeleccion === "euro") {
    resultado = montoIngresado / data.euro.valor; //division del monto ingresado en el imput dividido  por valor euro que esta en la API
  }
  obtenerResultado(resultado, monedaSeleccion); //se obtiene el resultado respecto a moneda seleccionada al llamar la funcion
  renderGrafica(monedaSeleccion); //se actualiza el grafico
}

//funcion para obtener resultado en la conversion de moneda con dos argumentos
function obtenerResultado(resultado, moneda) {
  document.getElementById(
    "resultado"
  ).innerHTML = `Resultado: $${resultado.toFixed(2)} ${moneda.toUpperCase()}`; //resultado a 2 decimales y moneda en mayuscula
}

//para el grafico con datos historicos, para obtener y preparar los datos para configurar el grafico
const prepararConfiguracionParaLaGrafica = async (variable) => {
  const res = await fetch(`https://mindicador.cl/api/${variable}`); //solicitud a la API con la variable dependiendo si es dolar o euro
  const data = await res.json(); //espera que los datos se conviertan en JSON
  const tipoDeGrafica = "line"; //tipo de brafico
  const diash = data.serie.slice(0, 10); //obtiene los primeros 10 elementos de la serie datos
  diash.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); //ordena los datos por fecha ascendente
  //fecha en año, mes, dia
  const nombresDeLasMonedas = diash.map((dia) => {
    const fecha = new Date(dia.fecha);
    return `${fecha.getFullYear()}-${("0" + (fecha.getMonth() + 1)).slice(
      -2
    )}-${("0" + fecha.getDate()).slice(-2)}`;
  });

  const valores = diash.map((dia) => dia.valor); //datos historicos
  const titulo = "Historial últimos 10 días";//titulo del grafico
  const colorDeLinea = "red";//color de la linea
  const colorFondo = "white";//color de fondo

  const config = {
    type: tipoDeGrafica,
    data: {
      labels: nombresDeLasMonedas,
      datasets: [
        {
          label: titulo,
          borderColor: colorDeLinea,
          backgroundColor: colorFondo,
          data: valores,
        },
      ],
    },
  };
  return config; //devuelve config utilizado para dibujar el grafico
};
